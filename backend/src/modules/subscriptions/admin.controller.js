import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { Product, Subscription, User, connectDB } from './service.js';

export async function GET(req) {
  try {
    const session = await getBackendSession(req);
    if (!session || session.user.role !== 'admin') {
      return json({ message: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    await connectDB();

    const subscriptions = await Subscription.find()
      .populate('userId', 'name email')
      .populate('productId')
      .sort({ createdAt: -1 });

    return json(subscriptions, { status: 200 });

  } catch (error) {
    console.error('Admin Fetch Subscriptions API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
