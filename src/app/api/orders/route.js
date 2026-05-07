import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let orders;
    if (session.user.role === 'admin') {
      orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 });
    }
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { items, totalAmount, shippingAddress } = await req.json();

    const order = await Order.create({
      userId: session.user.id,
      items,
      totalAmount,
      shippingAddress,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
