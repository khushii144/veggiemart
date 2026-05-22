/**
 * VeggieMart Recurring Orders Engine
 * -----------------------------------
 * Core logic for processing active subscriptions and generating recurring orders.
 * Called by the cron endpoint and the admin manual trigger.
 */

import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { createNotification } from '@/lib/notifications';

// ---------------------------------------------------------------------------
// Date utility: parse the deliveryDate string into a day-of-week number (0-6)
// or a day-of-month number (1-31).
// ---------------------------------------------------------------------------

const WEEKDAY_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const MONTHDAY_MAP = {
  '1st of the month': 1,
  '10th of the month': 10,
  '20th of the month': 20,
};

/**
 * Given a subscription, compute the *next* delivery Date after `fromDate`.
 * @param {Object} sub - Mongoose Subscription document (plain JS object is fine too)
 * @param {Date}   fromDate - reference date (defaults to today UTC midnight)
 * @returns {Date} - the next delivery date
 */
export function calculateNextDeliveryDate(sub, fromDate = null) {
  const base = fromDate ? new Date(fromDate) : new Date();
  // Normalise to UTC midnight so we compare only dates, not times
  base.setUTCHours(0, 0, 0, 0);

  const deliveryKey = (sub.deliveryDate || '').toLowerCase().trim();

  if (sub.frequency === 'weekly') {
    const targetDay = WEEKDAY_MAP[deliveryKey];
    if (targetDay === undefined) {
      throw new Error(`Unknown weekly deliveryDate: "${sub.deliveryDate}"`);
    }

    // Find the next occurrence of targetDay strictly AFTER base
    const next = new Date(base);
    next.setUTCDate(base.getUTCDate() + 1); // start from tomorrow
    while (next.getUTCDay() !== targetDay) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    return next;

  } else if (sub.frequency === 'monthly') {
    const targetDOM = MONTHDAY_MAP[deliveryKey];
    if (!targetDOM) {
      throw new Error(`Unknown monthly deliveryDate: "${sub.deliveryDate}"`);
    }

    // Try the target day in the current month first; if it's already passed, use next month
    const next = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), targetDOM));
    if (next <= base) {
      // Advance to next month same day
      next.setUTCMonth(next.getUTCMonth() + 1);
    }
    return next;

  } else {
    throw new Error(`Unknown frequency: "${sub.frequency}"`);
  }
}

// ---------------------------------------------------------------------------
// Main processing engine
// ---------------------------------------------------------------------------

/**
 * Process all active subscriptions. Generates recurring orders for any
 * subscription whose nextDeliveryDate is today or in the past.
 * Returns a summary object with counts and per-subscription logs.
 */
export async function processRecurringOrders() {
  await connectDB();

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const logs = [];
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  // Fetch all active + verified subscriptions that have a nextDeliveryDate due
  const dueSubs = await Subscription.find({
    status: 'active',
    verificationStatus: 'verified',
    $or: [
      { nextDeliveryDate: { $lte: todayUTC } },   // overdue or due today
      { nextDeliveryDate: null },                   // never processed yet
    ],
  }).populate('productId').populate('userId', 'name email');

  logs.push(`[${new Date().toISOString()}] Found ${dueSubs.length} subscription(s) due for processing.`);

  for (const sub of dueSubs) {
    try {
      const product = sub.productId;
      const user = sub.userId;

      if (!product || !user) {
        logs.push(`  ⚠ SKIP sub ${sub._id}: missing product or user reference.`);
        skipped++;
        continue;
      }

      // -----------------------------------------------------------------------
      // Duplicate-order guard: did we already create an order today for this sub?
      // -----------------------------------------------------------------------
      if (sub.lastOrderDate) {
        const lastOrder = new Date(sub.lastOrderDate);
        lastOrder.setUTCHours(0, 0, 0, 0);
        if (lastOrder.getTime() === todayUTC.getTime()) {
          logs.push(`  ⏭ SKIP sub ${sub._id} (${product.name}): order already placed today.`);
          skipped++;
          continue;
        }
      }

      // -----------------------------------------------------------------------
      // Calculate recurring price with subscription discount
      // -----------------------------------------------------------------------
      const discountRate = sub.frequency === 'weekly' ? 0.10 : 0.15;
      const unitPrice = product.price * (1 - discountRate);
      const totalAmount = Math.round(unitPrice * sub.quantity * 100) / 100;

      // -----------------------------------------------------------------------
      // Create recurring order
      // -----------------------------------------------------------------------
      const order = await Order.create({
        userId: user._id,
        items: [
          {
            productId: product._id,
            name: product.name,
            price: unitPrice,
            quantity: sub.quantity,
            image: product.image,
          },
        ],
        totalAmount,
        shippingAddress: 'Subscription delivery — address on file',
        status: 'Processing',
        isRecurring: true,
        subscriptionId: sub._id,
      });

      // -----------------------------------------------------------------------
      // Calculate the *next* delivery date (one cycle ahead of today)
      // -----------------------------------------------------------------------
      const nextDelivery = calculateNextDeliveryDate(sub, todayUTC);

      // -----------------------------------------------------------------------
      // Update subscription tracking fields
      // -----------------------------------------------------------------------
      await Subscription.findByIdAndUpdate(sub._id, {
        lastOrderDate: todayUTC,
        lastOrderId: order._id,
        nextDeliveryDate: nextDelivery,
      });

      // Notify customer of new recurring order
      await createNotification({
        userId: user._id,
        title: 'Recurring Order Processed! 📦',
        message: `Your recurring subscription delivery order for ${product.name} (x${sub.quantity}) has been successfully processed. Order Total: ₹${totalAmount}.`,
        type: 'recurring_created'
      });

      logs.push(
        `  ✓ sub ${sub._id} | ${user.email} | ${product.name} x${sub.quantity}` +
        ` → Order ${order._id} created. Next delivery: ${nextDelivery.toDateString()}`
      );
      processed++;

    } catch (err) {
      logs.push(`  ✗ FAILED sub ${sub._id}: ${err.message}`);
      console.error(`[Recurring] Failed for sub ${sub._id}:`, err);
      failed++;

      // Alert admins of recurring order processing failure
      try {
        const userEmail = sub.userId?.email || 'Unknown customer';
        await createNotification({
          isAdmin: true,
          title: 'Subscription Auto-Order Failed 🚨',
          message: `Failed to process auto-order for subscription ${sub._id} (${userEmail}): ${err.message}`,
          type: 'recurring_failed'
        });
      } catch (notifyAdminErr) {
        console.error('Failed to notify admin of subscription failure:', notifyAdminErr);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Upcoming Delivery Reminders Scan (tomorrow's deliveries)
  // -------------------------------------------------------------------------
  try {
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);

    const upcomingSubs = await Subscription.find({
      status: 'active',
      verificationStatus: 'verified',
      nextDeliveryDate: tomorrowUTC
    }).populate('productId').populate('userId', 'name email');

    for (const upcomingSub of upcomingSubs) {
      if (upcomingSub.productId && upcomingSub.userId) {
        await createNotification({
          userId: upcomingSub.userId._id,
          title: 'Upcoming Delivery Tomorrow 🚛',
          message: `Friendly reminder: your recurring delivery of ${upcomingSub.productId.name} (${upcomingSub.quantity} pack(s)) is scheduled for tomorrow!`,
          type: 'delivery_reminder'
        });
      }
    }
  } catch (remindErr) {
    console.error('[Upcoming Delivery Reminders] Failed to scan:', remindErr);
  }

  logs.push(
    `[${new Date().toISOString()}] Done. Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`
  );

  return { processed, skipped, failed, logs };
}
