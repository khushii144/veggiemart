import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

async function getSession(request) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) return null;

  const token =
    (await getToken({ req: request, secret, secureCookie: true })) ||
    (await getToken({ req: request, secret, secureCookie: false }));

  if (!token) return null;

  return {
    user: {
      id: token.id || token.sub,
      name: token.name,
      email: token.email,
      role: token.role,
    },
  };
}

function getNotificationQuery(session) {
  if (session.user.role === 'admin') {
    return {
      $or: [
        { isAdmin: true },
        { userId: session.user.id },
      ],
    };
  }

  return { userId: session.user.id, isAdmin: false };
}

export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return Response.json({ message: 'Unauthorized. Please login.' }, { status: 401 });
    }

    await connectDB();
    const notifications = await Notification.find(getNotificationQuery(session))
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return Response.json(notifications);
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return Response.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await connectDB();
    const { action, id } = await request.json();
    const query = getNotificationQuery(session);

    if (action === 'markRead') {
      if (!id) return Response.json({ message: 'Notification ID required.' }, { status: 400 });

      const updated = await Notification.findOneAndUpdate(
        { _id: id, ...query },
        { isRead: true },
        { new: true }
      );

      return Response.json({ message: 'Marked as read.', notification: updated });
    }

    if (action === 'markAllRead') {
      await Notification.updateMany({ ...query, isRead: false }, { isRead: true });
      return Response.json({ message: 'All marked as read.' });
    }

    if (action === 'clearAll') {
      await Notification.deleteMany(query);
      return Response.json({ message: 'All notifications cleared.' });
    }

    return Response.json({ message: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
