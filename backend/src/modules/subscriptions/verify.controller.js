import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { Product, Subscription, User, connectDB, createNotification } from './service.js';

export async function POST(req) {
  try {
    const session = await getBackendSession(req);
    if (!session || session.user.role !== 'admin') {
      return json({ message: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    await connectDB();
    const { subscriptionId, action } = await req.json();

    if (!subscriptionId) return json({ message: 'Subscription ID is required.' }, { status: 400 });

    if (!action || !['approve', 'reject'].includes(action)) {
      return json({ message: 'Invalid action. Must be "approve" or "reject".' }, { status: 400 });
    }

    const updates = action === 'approve'
      ? { verificationStatus: 'verified', status: 'active' }
      : { verificationStatus: 'rejected', status: 'cancelled' };

    const subscription = await Subscription.findByIdAndUpdate(subscriptionId, updates, { new: true })
      .populate('userId', 'name email')
      .populate('productId');

    if (!subscription) {
      return json({ message: 'Subscription not found.' }, { status: 404 });
    }

    const productName = subscription.productId?.name || 'wholesale vegetables';
    if (action === 'approve') {
      await createNotification({
        userId: subscription.userId._id || subscription.userId,
        title: 'Subscription Approved 🎉',
        message: `Your wholesale subscription for ${productName} (${subscription.quantity} pack(s)) has been approved by the admin and is now active!`,
        type: 'approved'
      });
      await createNotification({
        isAdmin: true,
        title: 'Subscription Approved',
        message: `${subscription.userId?.name || subscription.userId?.email || 'Customer'} was approved for ${productName}.`,
        type: 'approved',
      });
    } else {
      await createNotification({
        userId: subscription.userId._id || subscription.userId,
        title: 'Subscription Rejected ❌',
        message: `Your wholesale subscription for ${productName} has been rejected by the admin.`,
        type: 'rejected'
      });
      await createNotification({
        isAdmin: true,
        title: 'Subscription Rejected',
        message: `${subscription.userId?.name || subscription.userId?.email || 'Customer'} was rejected for ${productName}.`,
        type: 'rejected',
      });
    }

    return json({ message: `Subscription successfully ${action}d!`, subscription }, { status: 200 });

  } catch (error) {
    console.error('Admin Verify Subscription API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
