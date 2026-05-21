import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { calculateNextDeliveryDate } from '@/lib/recurringOrders';
import { createNotification } from '@/lib/notifications';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    await connectDB();
    const { productId, quantity, frequency, deliveryDate } = await req.json();

    // 1. Validation
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ message: 'Quantity must be a positive number.' }, { status: 400 });
    }

    if (!frequency || !['weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json({ message: 'Frequency must be either "weekly" or "monthly".' }, { status: 400 });
    }

    if (!deliveryDate) {
      return NextResponse.json({ message: 'Delivery date/day is required.' }, { status: 400 });
    }

    // 2. Compute initial nextDeliveryDate from today
    let nextDeliveryDate = null;
    try {
      nextDeliveryDate = calculateNextDeliveryDate({ frequency, deliveryDate });
    } catch (dateErr) {
      console.warn('Could not compute nextDeliveryDate:', dateErr.message);
    }

    // 3. Fetch product details for name populated notifications
    let productName = 'vegetables';
    try {
      const ProductModel = require('@/models/Product').default;
      const prod = await ProductModel.findById(productId);
      if (prod) productName = prod.name;
    } catch (prodErr) {
      console.warn('Could not fetch product details for notification:', prodErr);
    }

    // 4. Save subscription data in MongoDB
    const subscription = await Subscription.create({
      userId: session.user.id,
      productId,
      quantity: qty,
      frequency,
      deliveryDate,
      verificationStatus: 'pending',
      status: 'inactive',
      nextDeliveryDate,
    });

    // 5. Create admin alert notification
    await createNotification({
      isAdmin: true,
      title: 'New Subscription Pending Approval 🔔',
      message: `Customer ${session.user.name || session.user.email} requested a new ${frequency} subscription for ${productName} (${qty} pack(s)).`,
      type: 'pending_approval'
    });

    return NextResponse.json({
      message: 'Subscription created successfully!',
      subscription
    }, { status: 201 });

  } catch (error) {
    console.error('Subscription API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
