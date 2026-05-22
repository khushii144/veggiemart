'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Search, Bell, Sun, Moon, User, Menu } from 'lucide-react';

export default function AdminTopBar({ onMenuClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, setTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    const href = query ? `/admin?search=${encodeURIComponent(query)}` : '/admin';
    router.replace(href);
  };

  const breadcrumbs = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex min-w-0 items-center justify-between gap-2 px-3 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center space-x-2 md:space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <nav className="hidden min-w-0 items-center space-x-2 truncate text-sm text-gray-600 dark:text-gray-300 sm:flex">
          {breadcrumbs.map((seg, idx) => {
            const href = '/' + breadcrumbs.slice(0, idx + 1).join('/') + (idx === breadcrumbs.length - 1 ? '' : '/');
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <span key={idx} className="flex items-center">
                <Link href={href} className={isLast ? 'font-bold text-gray-900 dark:text-white' : 'hover:underline'}>{seg}</Link>
                {!isLast && <span className="mx-1">/</span>}
              </span>
            );
          })}
        </nav>
      </div>
      <form onSubmit={handleSearch} className="flex shrink-0 items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-40 rounded-md border border-gray-300 py-1 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 md:w-56"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button type="submit" className="sm:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </form>
      <div className="flex shrink-0 items-center space-x-2 md:space-x-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
        <button className="relative p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label="Notifications">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {/* Placeholder badge */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="relative">
          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {/* Simple dropdown placeholder */}
        </div>
      </div>
    </header>
  );
}
