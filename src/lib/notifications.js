import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

/**
 * Creates a notification in the database with built-in duplicate guard.
 * Checks if a similar unread notification was generated within the last 5 minutes.
 * 
 * @param {Object} params
 * @param {string} [params.userId] - The user to notify. If null/undefined, must set isAdmin to true
 * @param {boolean} [params.isAdmin] - Whether this is an admin alert (default: false)
 * @param {string} params.title - Title of the notification
 * @param {string} params.message - Body content of the notification
 * @param {string} params.type - Categorized type
 */
export async function createNotification({ userId = null, isAdmin = false, title, message, type }) {
  try {
    await connectDB();

    // 5 minutes duplicate protection
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const query = {
      title,
      message,
      type,
      isRead: false,
      createdAt: { $gte: fiveMinutesAgo }
    };

    if (isAdmin) {
      query.isAdmin = true;
    } else if (userId) {
      query.userId = userId;
    } else {
      console.warn('[Notification Engine] Attempted to create notification with no user/admin context.');
      return null;
    }

    const existing = await Notification.findOne(query);
    if (existing) {
      console.log(`[Notification Engine] Duplicate unread alert skipped: "${title}"`);
      return existing;
    }

    // Create a new notification
    const notification = await Notification.create({
      userId: isAdmin ? null : userId,
      isAdmin,
      title,
      message,
      type,
      isRead: false
    });

    console.log(`[Notification Engine] Created notification: "${title}" for ${isAdmin ? 'Admins' : userId}`);
    return notification;
  } catch (error) {
    console.error('[Notification Engine] Failed to create notification:', error);
    return null;
  }
}
