import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { Subscription, User, connectDB } from './service.js';

function getSubscriptionSummary(subscriptions = []) {
  if (subscriptions.some((subscription) => subscription.status === 'active')) return 'Active';
  if (subscriptions.some((subscription) => subscription.status === 'paused')) return 'Paused';
  if (subscriptions.some((subscription) => subscription.status === 'inactive')) return 'Pending';
  if (subscriptions.some((subscription) => subscription.status === 'cancelled')) return 'Cancelled';
  return 'None';
}

export async function GET(req) {
  try {
    const session = await getBackendSession(req);
    if (!session || session.user.role !== 'admin') {
      return json({ message: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    await connectDB();

    const [users, subscriptions] = await Promise.all([
      User.find()
        .select('name email role createdAt updatedAt lastLoginAt')
        .sort({ lastLoginAt: -1, createdAt: -1 })
        .lean(),
      Subscription.find()
        .select('userId status verificationStatus')
        .lean(),
    ]);

    const subscriptionsByUser = subscriptions.reduce((map, subscription) => {
      const userId = subscription.userId?.toString();
      if (!userId) return map;
      if (!map.has(userId)) map.set(userId, []);
      map.get(userId).push(subscription);
      return map;
    }, new Map());

    const customers = users.map((user) => {
      const userSubscriptions = subscriptionsByUser.get(user._id.toString()) || [];

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        joined: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        subscriptionStatus: getSubscriptionSummary(userSubscriptions),
        subscriptionCount: userSubscriptions.length,
      };
    });

    return json(customers, { status: 200 });
  } catch (error) {
    console.error('Admin Customers API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
