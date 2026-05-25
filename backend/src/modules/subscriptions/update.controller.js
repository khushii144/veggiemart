import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { Subscription, connectDB, createNotification } from './service.js';

export async function POST(req) {
  try {
    const session = await getBackendSession(req);
    if (!session) {
      return json({ message: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    await connectDB();
    const { subscriptionId, quantity, frequency, deliveryDate } = await req.json();

    if (!subscriptionId) return json({ message: 'Subscription ID is required.' }, { status: 400 });

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return json({ message: 'Quantity must be a positive number.' }, { status: 400 });

    if (!frequency || !['weekly', 'monthly'].includes(frequency)) {
      return json({ message: 'Frequency must be either "weekly" or "monthly".' }, { status: 400 });
    }

    if (!deliveryDate) return json({ message: 'Delivery date/day is required.' }, { status: 400 });

    const subscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, userId: session.user.id },
      { quantity: qty, frequency, deliveryDate },
      { new: true }
    ).populate('productId');

    if (!subscription) {
      return json({ message: 'Subscription not found or access denied.' }, { status: 404 });
    }

    const productName = subscription.productId?.name || 'wholesale vegetables';
    await createNotification({
      userId: session.user.id,
      title: 'Subscription Updated ✏️',
      message: `Your subscription details for ${productName} have been updated (Qty: ${qty}, Frequency: ${frequency}, Day: ${deliveryDate}).`,
      type: 'renewal_reminder'
    });

    return json({ message: 'Subscription updated successfully!', subscription }, { status: 200 });

  } catch (error) {
    console.error('Subscription Update API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
