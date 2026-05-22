import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Please login.' }, { status: 401 });
    }

    await connectDB();

    let query = {};
    if (session.user.role === 'admin') {
      // Admins get admin notifications as well as their user notifications
      query = {
        $or: [
          { isAdmin: true },
          { userId: session.user.id }
        ]
      };
    } else {
      // Normal users get only their notifications
      query = { userId: session.user.id, isAdmin: false };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await connectDB();
    const { action, id } = await req.json();

    let query = {};
    if (session.user.role === 'admin') {
      query = {
        $or: [
          { isAdmin: true },
          { userId: session.user.id }
        ]
      };
    } else {
      query = { userId: session.user.id, isAdmin: false };
    }

    if (action === 'markRead') {
      if (!id) {
        return NextResponse.json({ message: 'Notification ID required.' }, { status: 400 });
      }
      const updated = await Notification.findOneAndUpdate(
        { _id: id, ...query },
        { isRead: true },
        { new: true }
      );
      return NextResponse.json({ message: 'Marked as read.', notification: updated });

    } else if (action === 'markAllRead') {
      await Notification.updateMany(
        { ...query, isRead: false },
        { isRead: true }
      );
      return NextResponse.json({ message: 'All marked as read.' });

    } else if (action === 'clearAll') {
      await Notification.deleteMany(query);
      return NextResponse.json({ message: 'All notifications cleared.' });

    } else {
      return NextResponse.json({ message: 'Invalid action.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error modifying notifications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
