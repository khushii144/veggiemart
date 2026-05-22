import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import Product from '@/models/Product'; // Must import to ensure populate works
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    await connectDB();

    // Fetch user's subscriptions and populate product details
    const subscriptions = await Subscription.find({ userId: session.user.id })
      .populate('productId')
      .sort({ createdAt: -1 });

    return NextResponse.json(subscriptions, { status: 200 });

  } catch (error) {
    console.error('Fetch Subscription API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
