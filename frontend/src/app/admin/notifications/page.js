'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  Check,
  Clock,
  Package,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

const ITEMS_PER_PAGE = 6;
const REFRESH_INTERVAL_MS = 15000;

const relevantTypes = new Set([
  'approved',
  'rejected',
  'cancelled',
  'paused',
  'resumed',
  'recurring_created',
  'delivery_reminder',
  'renewal_reminder',
  'new_subscription',
  'recurring_failed',
  'pending_approval',
  'user_registered',
  'user_login',
  'product_created',
  'product_updated',
  'product_deleted',
  'low_stock',
  'wholesale_inquiry',
  'recurring_processed',
  'new_order',
]);

function getNotificationMeta(type) {
  switch (type) {
    case 'user_registered':
    case 'user_login':
      return { icon: UserPlus, color: 'bg-blue-100 text-blue-600' };
    case 'product_created':
    case 'product_updated':
    case 'product_deleted':
    case 'new_order':
    case 'recurring_created':
    case 'recurring_processed':
      return { icon: Package, color: 'bg-indigo-100 text-indigo-600' };
    case 'low_stock':
    case 'recurring_failed':
      return { icon: AlertTriangle, color: 'bg-orange-100 text-orange-600' };
    case 'approved':
    case 'resumed':
      return { icon: ShieldCheck, color: 'bg-green-100 text-green-600' };
    case 'rejected':
    case 'cancelled':
      return { icon: AlertTriangle, color: 'bg-red-100 text-red-600' };
    case 'paused':
    case 'delivery_reminder':
    case 'renewal_reminder':
      return { icon: Clock, color: 'bg-amber-100 text-amber-600' };
    default:
      return { icon: Bell, color: 'bg-yellow-100 text-yellow-600' };
  }
}

function timeAgo(dateValue) {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchNotifications({ silent = false } = {}) {
    if (!silent) setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/notifications', {
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load notifications');
      }

      const realNotifications = Array.isArray(data)
        ? data.filter((notification) => relevantTypes.has(notification.type))
        : [];

      setNotifications(realNotifications);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return notifications.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, notifications]);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'admin') return;

    fetchNotifications();
    const intervalId = window.setInterval(() => {
      fetchNotifications({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [status, session?.user?.role]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    await fetch('/api/notifications', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markAllRead' }),
    });
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === id ? { ...notification, isRead: true } : notification
      )
    );
    await fetch('/api/notifications', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markRead', id }),
    });
  };

  if (status === 'loading' || isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
            <Bell className="h-7 w-7 text-yellow-500 sm:h-8 sm:w-8" />
            Notifications
          </h1>
          <p className="text-gray-500 mt-1">Live alerts from website activity and subscription operations.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => fetchNotifications()}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className="w-4 h-4 text-blue-500" />
            Refresh
          </button>
          <button
            onClick={markAllRead}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Check className="w-4 h-4 text-green-500" />
            Mark all as read
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50 dark:divide-gray-700/50 dark:border-gray-700 dark:bg-gray-800 sm:rounded-[2.5rem]">
        {paginatedNotifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-bold text-gray-900 dark:text-white">No notifications yet</p>
            <p className="mt-1 text-sm text-gray-500">New website activity will appear here automatically.</p>
          </div>
        ) : (
          paginatedNotifications.map((notif) => {
            const meta = getNotificationMeta(notif.type);
            const Icon = meta.icon;

            return (
              <div
                key={notif._id}
                className={`p-6 flex items-start gap-4 transition-colors cursor-pointer ${!notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                onClick={() => markAsRead(notif._id)}
              >
                <div className={`p-3 rounded-2xl flex-shrink-0 ${meta.color} dark:bg-opacity-20`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-base font-bold ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-4">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm whitespace-pre-wrap ${!notif.isRead ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-500'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                )}
              </div>
            );
          })
        )}
        <AdminPagination
          currentPage={currentPage}
          itemName="notifications"
          onPageChange={setCurrentPage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={notifications.length}
        />
      </div>
    </div>
  );
}
