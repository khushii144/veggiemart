import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    await connectDB();

    // Fetch all subscriptions, populate customer user details and product details
    const subscriptions = await Subscription.find()
      .populate('userId', 'name email')
      .populate('productId')
      .sort({ createdAt: -1 });

    return NextResponse.json(subscriptions, { status: 200 });

  } catch (error) {
    console.error('Admin Fetch Subscriptions API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
