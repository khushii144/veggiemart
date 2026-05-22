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
    const { subscriptionId, status } = await req.json();

    // 1. Validation
    if (!subscriptionId) {
      return NextResponse.json({ message: 'Subscription ID is required.' }, { status: 400 });
    }

    if (!status || !['active', 'paused'].includes(status)) {
      return NextResponse.json({ message: 'Status must be either "active" or "paused".' }, { status: 400 });
    }

    // 2. Find and update the subscription, ensuring it belongs to the current user
    const subscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, userId: session.user.id },
      { status },
      { new: true }
    ).populate('productId');

    if (!subscription) {
      return NextResponse.json({ message: 'Subscription not found or access denied.' }, { status: 404 });
    }

    // 3. Create user notification
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

    return NextResponse.json({
      message: `Subscription status updated to ${status} successfully!`,
      subscription
    }, { status: 200 });

  } catch (error) {
    console.error('Subscription Status Update API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
