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
    const { subscriptionId, status } = await req.json();

    if (!subscriptionId) return json({ message: 'Subscription ID is required.' }, { status: 400 });

    if (!status || !['active', 'paused'].includes(status)) {
      return json({ message: 'Status must be either "active" or "paused".' }, { status: 400 });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, userId: session.user.id },
      { status },
      { new: true }
    ).populate('productId');

    if (!subscription) {
      return json({ message: 'Subscription not found or access denied.' }, { status: 404 });
    }

    const productName = subscription.productId?.name || 'wholesale vegetables';
    if (status === 'paused') {
      await createNotification({
        userId: session.user.id,
        title: 'Subscription Paused ⏸',
        message: `Your wholesale subscription for ${productName} has been paused. Deliveries are temporarily suspended.`,
        type: 'paused'
      });
    } else {
      await createNotification({
        userId: session.user.id,
        title: 'Subscription Resumed ▶',
        message: `Your wholesale subscription for ${productName} has been resumed and is active again!`,
        type: 'resumed'
      });
    }

    return json({ message: `Subscription status updated to ${status} successfully!`, subscription }, { status: 200 });

  } catch (error) {
    console.error('Subscription Status Update API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
