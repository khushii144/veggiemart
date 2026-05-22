'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, Package, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

const ITEMS_PER_PAGE = 6;

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'order', title: 'New Order Received', message: 'Order #3914 has been placed by Alice Smith.', time: '2 mins ago', read: false, icon: Package, color: 'bg-blue-100 text-blue-600' },
    { id: 2, type: 'alert', title: 'Low Stock Alert', message: 'Tomatoes are running low (only 12kg left).', time: '1 hour ago', read: false, icon: AlertTriangle, color: 'bg-orange-100 text-orange-600' },
    { id: 3, type: 'system', title: 'System Update', message: 'Scheduled maintenance will occur at 2 AM UTC.', time: '3 hours ago', read: true, icon: ShieldCheck, color: 'bg-gray-100 text-gray-600' },
    { id: 4, type: 'order', title: 'Order Delivered', message: 'Order #3910 has been successfully delivered.', time: '5 hours ago', read: true, icon: Package, color: 'bg-green-100 text-green-600' },
  ]);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return notifications.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, notifications]);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (status === 'loading') return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
            <Bell className="h-7 w-7 text-yellow-500 sm:h-8 sm:w-8" />
            Notifications
          </h1>
          <p className="text-gray-500 mt-1">Real-time alerts and system updates.</p>
        </div>
        <button 
          onClick={markAllRead}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <Check className="w-4 h-4 text-green-500" />
          Mark all as read
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50 dark:divide-gray-700/50 dark:border-gray-700 dark:bg-gray-800 sm:rounded-[2.5rem]">
        {paginatedNotifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div 
              key={notif.id} 
              className={`p-6 flex items-start gap-4 transition-colors ${!notif.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className={`p-3 rounded-2xl flex-shrink-0 ${notif.color} dark:bg-opacity-20`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`text-base font-bold ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-4">{notif.time}</span>
                </div>
                <p className={`mt-1 text-sm ${!notif.read ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-500'}`}>
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              )}
            </div>
          );
        })}
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
