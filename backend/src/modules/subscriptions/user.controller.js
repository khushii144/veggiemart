import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { Product, Subscription, connectDB } from './service.js'; // Product import ensures populate works.

export async function GET(req) {
  try {
    const session = await getBackendSession(req);
    if (!session) {
      return json({ message: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    await connectDB();

    const subscriptions = await Subscription.find({ userId: session.user.id })
      .populate('productId')
      .sort({ createdAt: -1 });

    return json(subscriptions, { status: 200 });

  } catch (error) {
    console.error('Fetch Subscription API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
