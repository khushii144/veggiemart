import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { Order, connectDB } from './service.js';

export async function GET(req) {
  try {
    const session = await getBackendSession(req);
    if (!session) {
      return json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let orders;
    if (session.user.role === 'admin') {
      orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 });
    }
    return json(orders);
  } catch (error) {
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getBackendSession(req);
    if (!session) {
      return json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { items, totalAmount, shippingAddress } = await req.json();

    const order = await Order.create({
      userId: session.user.id,
      items,
      totalAmount,
      shippingAddress,
    });

    return json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
