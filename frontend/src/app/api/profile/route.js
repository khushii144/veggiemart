import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id).select('-password');
    return Response.json(user);
  } catch (error) {
    return Response.json({ message: 'Error fetching profile' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const data = await req.json();
    
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.addresses) updateData.addresses = data.addresses;
    if (data.walletBalance !== undefined) updateData.walletBalance = data.walletBalance;

    const user = await User.findByIdAndUpdate(session.user.id, updateData, { new: true }).select('-password');
    return Response.json(user);
  } catch (error) {
    return Response.json({ message: 'Error updating profile' }, { status: 500 });
  }
}
