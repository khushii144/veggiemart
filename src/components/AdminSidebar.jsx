'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBasket,
  Users,
  Calendar,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  BarChart2,
  FileText,
  ShieldCheck,
  X,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBasket },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: Calendar },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:z-20`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.PNG" alt="Organic Vatika" width={36} height={36} priority className="object-contain" />
            <span className="text-sm font-bold text-gray-800">Admin</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto mt-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const activeClass = active ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white';
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeClass}`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
