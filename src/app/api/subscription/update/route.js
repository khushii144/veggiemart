import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createNotification } from '@/lib/notifications';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    await connectDB();
    const { subscriptionId, quantity, frequency, deliveryDate } = await req.json();

    // 1. Validation
    if (!subscriptionId) {
      return NextResponse.json({ message: 'Subscription ID is required.' }, { status: 400 });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ message: 'Quantity must be a positive number.' }, { status: 400 });
    }

    if (!frequency || !['weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json({ message: 'Frequency must be either "weekly" or "monthly".' }, { status: 400 });
    }

    if (!deliveryDate) {
      return NextResponse.json({ message: 'Delivery date/day is required.' }, { status: 400 });
    }

    // 2. Find and update subscription, validating user ownership
    const subscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, userId: session.user.id },
      { quantity: qty, frequency, deliveryDate },
      { new: true }
    ).populate('productId');

    if (!subscription) {
      return NextResponse.json({ message: 'Subscription not found or access denied.' }, { status: 404 });
    }

    // 3. Create user notification
    const productName = subscription.productId?.name || 'wholesale vegetables';
    await createNotification({
      userId: session.user.id,
      title: 'Subscription Updated ✏️',
      message: `Your subscription details for ${productName} have been updated (Qty: ${qty}, Frequency: ${frequency}, Day: ${deliveryDate}).`,
      type: 'renewal_reminder' // fits as a general subscription terms reminder
    });

    return NextResponse.json({
      message: 'Subscription updated successfully!',
      subscription
    }, { status: 200 });

  } catch (error) {
    console.error('Subscription Update API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
