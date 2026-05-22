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
    const { subscriptionId } = await req.json();

    // 1. Validation
    if (!subscriptionId) {
      return NextResponse.json({ message: 'Subscription ID is required.' }, { status: 400 });
    }

    // 2. Find and update the subscription status to 'cancelled', validating user ownership
    const subscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, userId: session.user.id },
      { status: 'cancelled' },
      { new: true }
    ).populate('productId');

    if (!subscription) {
      return NextResponse.json({ message: 'Subscription not found or access denied.' }, { status: 404 });
    }

    // 3. Create user notification
    const productName = subscription.productId?.name || 'wholesale vegetables';
    await createNotification({
      userId: session.user.id,
      title: 'Subscription Cancelled ❌',
      message: `Your wholesale subscription for ${productName} has been successfully cancelled.`,
      type: 'cancelled'
    });

    return NextResponse.json({
      message: 'Subscription cancelled successfully!',
      subscription
    }, { status: 200 });

  } catch (error) {
    console.error('Subscription Cancel API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
