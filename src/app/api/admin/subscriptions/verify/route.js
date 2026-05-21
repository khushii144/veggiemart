import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { createNotification } from '@/lib/notifications';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    await connectDB();
    const { subscriptionId, action } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ message: 'Subscription ID is required.' }, { status: 400 });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ message: 'Invalid action. Must be "approve" or "reject".' }, { status: 400 });
    }

    // Determine target fields
    const updates = action === 'approve' 
      ? { verificationStatus: 'verified', status: 'active' }
      : { verificationStatus: 'rejected', status: 'cancelled' };

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      updates,
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('productId');

    if (!subscription) {
      return NextResponse.json({ message: 'Subscription not found.' }, { status: 404 });
    }

    // 4. Create customer notification
    const productName = subscription.productId?.name || 'wholesale vegetables';
    if (action === 'approve') {
      await createNotification({
        userId: subscription.userId._id || subscription.userId,
        title: 'Subscription Approved 🎉',
        message: `Your wholesale subscription for ${productName} (${subscription.quantity} pack(s)) has been approved by the admin and is now active!`,
        type: 'approved'
      });
    } else {
      await createNotification({
        userId: subscription.userId._id || subscription.userId,
        title: 'Subscription Rejected ❌',
        message: `Your wholesale subscription for ${productName} has been rejected by the admin.`,
        type: 'rejected'
      });
    }

    return NextResponse.json({
      message: `Subscription successfully ${action}d!`,
      subscription
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Verify Subscription API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
