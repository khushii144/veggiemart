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
    const { subscriptionId } = await req.json();

    if (!subscriptionId) return json({ message: 'Subscription ID is required.' }, { status: 400 });

    const subscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, userId: session.user.id },
      { status: 'cancelled' },
      { new: true }
    ).populate('productId');

    if (!subscription) {
      return json({ message: 'Subscription not found or access denied.' }, { status: 404 });
    }

    const productName = subscription.productId?.name || 'wholesale vegetables';
    await createNotification({
      userId: session.user.id,
      title: 'Subscription Cancelled ❌',
      message: `Your wholesale subscription for ${productName} has been successfully cancelled.`,
      type: 'cancelled'
    });

    return json({ message: 'Subscription cancelled successfully!', subscription }, { status: 200 });

  } catch (error) {
    console.error('Subscription Cancel API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
