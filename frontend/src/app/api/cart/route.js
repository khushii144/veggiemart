import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: session.user.id });
    return Response.json(cart ? cart.items : []);
  } catch (error) {
    return Response.json({ message: 'Error fetching cart' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { items } = await req.json();

    const cart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { items },
      { upsert: true, new: true }
    );

    return Response.json(cart.items);
  } catch (error) {
    return Response.json({ message: 'Error updating cart' }, { status: 500 });
  }
}
