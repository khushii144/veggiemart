"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingCart, User, LogOut, ShieldCheck, X, Bell, Clock, Package, ShieldAlert, CheckCircle2, XCircle, Menu, Leaf, ChevronDown } from 'lucide-react';

const allProductsCategory = { _id: 'all', name: 'All Products', slug: 'All' };

export default function Navbar() {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');

  // Notification system states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [navCategories, setNavCategories] = useState([allProductsCategory]);

  const productCategoryHref = (catId) =>
    catId === 'All' ? '/products' : `/products?category=${encodeURIComponent(catId)}`;

  const fetchNotifications = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const nextNotifications = Array.isArray(data) ? data : [];
        setNotifications(nextNotifications);
        setUnreadCount(nextNotifications.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Poll every 15s for instant updates
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    const handleClose = () => {
      setShowNotifications(false);
      setShowProductsMenu(false);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowProductsMenu(false);
  };

  const toggleProductsMenu = (e) => {
    e.stopPropagation();
    setShowProductsMenu((open) => !open);
    setShowNotifications(false);
  };

  const markAsRead = async (id) => {
    try {
      // Optimistic state update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', id })
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' })
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const clearAll = async (e) => {
    e.stopPropagation();
    try {
      setNotifications([]);
      setUnreadCount(0);

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clearAll' })
      });
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  useEffect(() => {
    const readSearchTerm = () => {
      if (typeof window === 'undefined') return;
      setSearchTerm(new URLSearchParams(window.location.search).get('q') || '');
      setActiveCategory(new URLSearchParams(window.location.search).get('category') || 'All');
    };

    readSearchTerm();
    setMobileMenuOpen(false);
    setShowProductsMenu(false);
    window.addEventListener('popstate', readSearchTerm);

    return () => {
      window.removeEventListener('popstate', readSearchTerm);
    };
  }, [pathname]);

  useEffect(() => {
    const fetchProductCategories = async () => {
      try {
        const res = await fetch('/api/categories', {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) return;

        const categories = await res.json();
        if (!Array.isArray(categories)) return;

        setNavCategories([
          allProductsCategory,
          ...categories
            .filter((category) => category.isActive)
            .map((category) => ({
              _id: category._id,
              name: category.name,
              slug: category.slug,
            })),
        ]);
      } catch (err) {
        console.error('Failed to fetch product categories:', err);
      }
    };

    fetchProductCategories();
  }, []);

  const updateSearch = (value) => {
    setSearchTerm(value);

    const query = value.trim();
    const href = query ? `/?q=${encodeURIComponent(query)}` : '/';
    router.replace(href, { scroll: false });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('veggiemart:search', { detail: query }));
    }
  };

  const clearSearch = () => {
    updateSearch('');
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto max-w-[90rem] w-full px-4 sm:px-6 lg:px-8">
        
        {/* Main layout container */}
        <div className="flex flex-col py-3 lg:py-4">
          
          {/* TOP ROW: Logo, Search, and Action Controls */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2 transition-transform duration-200 hover:scale-[1.01] shrink-0">
              <Image src="/logo.PNG" alt="Organic Vatika" width={48} height={48} priority className="object-contain" />
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#07520c] transition-colors duration-200">
                Organic<span className="text-[#6b4308] group-hover:text-[#80520d] transition-colors duration-200"> Vatika</span>
              </span>
            </Link>

            {/* Search Bar (Visible on desktop & tablet, hidden on small screens) */}
            <div className="hidden sm:block flex-1 max-w-md md:max-w-lg lg:max-w-xl mx-2">
              <div className="group relative flex h-10 items-center gap-2.5 border border-gray-200 bg-gray-50/50 px-3 text-gray-500 transition-all duration-300 focus-within:border-green-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500/10">
                <Search className="h-4 w-4 shrink-0 text-gray-400 group-focus-within:text-green-600" strokeWidth={2.2} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Search fresh vegetables..."
                  aria-label="Search vegetables by name"
                  className="h-full min-w-0 flex-1 bg-transparent text-xs font-semibold text-gray-800 outline-none placeholder:text-gray-400/75"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear vegetable search"
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop and Tablet Action Cluster */}
            <div className="flex items-center gap-2">
              
              {/* Notification Bell (if logged in, desktop only) */}
              {session && (
                <div className="relative inline-block shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={toggleDropdown}
                    className={`relative inline-flex h-10 w-10 items-center justify-center border shadow-sm transition-all duration-300 ${
                      showNotifications 
                        ? 'border-green-300 bg-green-50 text-green-700' 
                        : 'border-gray-100 bg-white text-gray-600 hover:border-green-100 hover:bg-green-55 hover:text-green-700'
                    }`}
                    aria-label="View notifications"
                  >
                    <Bell className="h-4 w-4" strokeWidth={2.2} />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-red-500 px-1 text-[8px] font-bold leading-none text-white shadow-sm ring-2 ring-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden animate-fadeIn">
                      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-55/50">
                        <div className="font-extrabold text-gray-900 text-xs flex items-center gap-1">
                          Notifications
                          {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {notifications.length > 0 && (
                            <>
                              <button
                                onClick={markAllRead}
                                className="text-[9px] text-green-600 hover:text-green-800 font-bold uppercase tracking-wider"
                              >
                                Mark Read
                              </button>
                              <span className="text-gray-300 text-[9px]">|</span>
                              <button
                                onClick={clearAll}
                                className="text-[9px] text-gray-400 hover:text-gray-605 font-bold uppercase tracking-wider"
                              >
                                Clear
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-400 space-y-1.5">
                            <Bell className="w-6 h-6 text-gray-200 mx-auto" />
                            <p className="text-xs font-bold text-gray-800">All caught up!</p>
                            <p className="text-[10px]">No notifications right now.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            let Icon = Bell;
                            let iconColor = 'text-gray-500 bg-gray-50';

                            switch (notif.type) {
                              case 'approved':
                                Icon = CheckCircle2;
                                iconColor = 'text-green-600 bg-green-50 border border-green-100/50';
                                break;
                              case 'rejected':
                              case 'cancelled':
                                Icon = XCircle;
                                iconColor = 'text-red-600 bg-red-50 border border-red-100/50';
                                break;
                              case 'paused':
                                Icon = Clock;
                                iconColor = 'text-amber-500 bg-amber-50 border border-amber-100/50';
                                break;
                              case 'resumed':
                                Icon = CheckCircle2;
                                iconColor = 'text-blue-500 bg-blue-55 border border-blue-100/50';
                                break;
                              case 'recurring_created':
                                Icon = Package;
                                iconColor = 'text-indigo-600 bg-indigo-50 border border-indigo-100/50';
                                break;
                              case 'delivery_reminder':
                              case 'renewal_reminder':
                                Icon = Clock;
                                iconColor = 'text-orange-500 bg-orange-50 border border-orange-100/50';
                                break;
                              case 'pending_approval':
                              case 'new_subscription':
                                Icon = Bell;
                                iconColor = 'text-amber-600 bg-amber-50 border border-amber-100/50';
                                break;
                              case 'recurring_failed':
                                Icon = ShieldAlert;
                                iconColor = 'text-red-700 bg-red-50 border border-red-100/50';
                                break;
                            }

                            return (
                              <div
                                key={notif._id}
                                onClick={() => markAsRead(notif._id)}
                                className={`p-3.5 hover:bg-gray-50/80 transition-all cursor-pointer flex gap-2.5 relative ${
                                  !notif.isRead ? 'bg-blue-50/10' : ''
                                }`}
                              >
                                <div className={`w-8.5 h-8.5 flex items-center justify-center shrink-0 shadow-sm ${iconColor}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5 pr-2 flex-1">
                                  <div className={`text-xs font-bold text-gray-900 leading-tight ${!notif.isRead ? 'font-black' : ''}`}>
                                    {notif.title}
                                  </div>
                                  <div className="text-[10px] text-gray-500 leading-normal font-medium">
                                    {notif.message}
                                  </div>
                                </div>
                                {!notif.isRead && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600" />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Login / Sign Up or Sign Out Buttons */}
              <div className="hidden md:flex items-center gap-2">
                {session ? (
                  <>
                    <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50/80 px-3 py-2 border border-gray-100">
                      <User className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-bold max-w-[110px] truncate">{session.user.name}</span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="inline-flex h-10 items-center justify-center bg-gray-100 hover:bg-gray-200 px-4 text-xs font-bold text-gray-700 transition-all duration-300"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2 text-gray-500" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center border border-green-600 bg-white px-4 text-xs font-bold text-green-600 transition-all duration-300 hover:bg-green-50"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>

              {/* Solid Green Cart Button */}
              <Link
                href="/cart"
                aria-label={`Shopping cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
                className="relative inline-flex h-10 w-10 items-center justify-center bg-green-600 text-white shadow-md shadow-green-600/20 transition-all duration-300 hover:bg-green-700 hover:scale-[1.03] shrink-0"
              >
                <ShoppingCart className="h-4.5 w-4.5" strokeWidth={2.3} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex h-10 w-10 items-center justify-center border border-gray-100 bg-white text-gray-600 shadow-sm transition-all duration-205 hover:bg-gray-55 md:hidden shrink-0"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>

            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="block sm:hidden w-full mt-3">
            <div className="group relative flex h-10 items-center gap-2 border border-gray-200 bg-gray-50/50 px-3 text-gray-500 transition-all duration-305 focus-within:border-green-500 focus-within:bg-white">
              <Search className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={2.2} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search fresh vegetables..."
                className="h-full min-w-0 flex-1 bg-transparent text-xs font-semibold text-gray-800 outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-gray-400"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* TOP & BOTTOM ROW DIVIDER */}
          <div className="hidden md:block w-full border-t border-gray-100/80 my-3"></div>

          {/* BOTTOM ROW: Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/" 
              className={`px-4 py-2 text-xs font-extrabold transition-all duration-300 ${
                pathname === '/'
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/10' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-gray-55'
              }`}
            >
              Home
            </Link>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={toggleProductsMenu}
                aria-haspopup="menu"
                aria-expanded={showProductsMenu}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold transition-all duration-300 ${
                  pathname?.startsWith('/products')
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/10' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-55'
                }`}
              >
                Products
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showProductsMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProductsMenu && (
                <div className="absolute left-0 top-full z-50 mt-0 w-56 overflow-hidden border-l-2 border-green-600 bg-white shadow-xl ring-1 ring-black/5 animate-fadeIn">
                  <div className="max-h-[28rem] overflow-y-auto py-1">
                    {navCategories.map((cat) => (
                      <Link
                        key={cat._id || cat.slug}
                        href={productCategoryHref(cat.slug)}
                        onClick={() => {
                          setActiveCategory(cat.slug);
                          setShowProductsMenu(false);
                        }}
                        className={`block px-8 py-3.5 text-sm font-medium transition-all duration-200 ${
                          activeCategory === cat.slug && pathname?.startsWith('/products')
                            ? 'bg-green-50 text-green-700'
                            : 'text-slate-700 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {session && (
              <>
                <Link 
                  href="/orders" 
                  className={`px-4 py-2 text-xs font-extrabold transition-all duration-300 ${
                    pathname === '/orders'
                      ? 'bg-green-600 text-white shadow-md shadow-green-600/10' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  Orders
                </Link>
                <Link 
                  href="/subscriptions" 
                  className={`px-4 py-2 text-xs font-extrabold transition-all duration-300 ${
                    pathname === '/subscriptions'
                      ? 'bg-green-600 text-white shadow-md shadow-green-600/10' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  Subscriptions
                </Link>
              </>
            )}

            {session?.user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className={`px-4 py-2 text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                  pathname?.startsWith('/admin')
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/10' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-55'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.2} />
                Admin Panel
              </Link>
            )}
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100/50 pt-2 pb-4 flex flex-col gap-4 animate-fadeIn">
            {session && (
              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50/80 border border-gray-100/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-100 flex items-center justify-center text-green-700">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-gray-800 block leading-tight">{session.user.name}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">{session.user.role}</span>
                  </div>
                </div>
                
                {/* Mobile Notification bell */}
                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={toggleDropdown}
                    className={`relative inline-flex h-8 w-8 items-center justify-center border ${
                      showNotifications 
                        ? 'border-green-300 bg-green-50 text-green-700' 
                        : 'border-gray-100 bg-white text-gray-600'
                    }`}
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center bg-red-500 text-[8px] font-bold text-white shadow-sm ring-1 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-64 border border-gray-100 bg-white shadow-xl z-50 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between bg-gray-55/50">
                        <span className="font-extrabold text-gray-800 text-[10px]">Notifications</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[8px] text-green-600 hover:text-green-800 font-bold uppercase tracking-wider"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="p-3 text-center text-gray-400 text-[10px]">No new updates.</div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => markAsRead(notif._id)}
                              className="p-2.5 text-[10px] cursor-pointer hover:bg-gray-50"
                            >
                              <div className="font-bold text-gray-900 leading-tight">{notif.title}</div>
                              <div className="text-gray-500 mt-0.5 leading-normal">{notif.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mobile links list */}
            <div className="flex flex-col gap-1.5 px-1">
              <Link
                href="/"
                className={`px-4 py-3 text-xs font-bold transition-all ${
                  pathname === '/'
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/10 font-extrabold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                }`}
              >
                Home
              </Link>

              <div className="overflow-hidden">
                <button
                  type="button"
                  onClick={toggleProductsMenu}
                  aria-haspopup="menu"
                  aria-expanded={showProductsMenu}
                  className={`flex w-full items-center justify-between px-4 py-3 text-xs font-bold transition-all ${
                    pathname?.startsWith('/products')
                      ? 'bg-green-600 text-white shadow-md shadow-green-600/10 font-extrabold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                  }`}
                >
                  Products
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showProductsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProductsMenu && (
                  <div className="mt-1 overflow-hidden border-l-2 border-green-600 bg-white shadow-sm animate-fadeIn">
                    {navCategories.map((cat) => (
                      <Link
                        key={cat._id || cat.slug}
                        href={productCategoryHref(cat.slug)}
                        onClick={() => {
                          setActiveCategory(cat.slug);
                          setShowProductsMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        className={`block px-8 py-3.5 text-sm font-medium transition-all ${
                          activeCategory === cat.slug && pathname?.startsWith('/products')
                            ? 'bg-green-50 text-green-700'
                            : 'text-slate-700 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>



              {session ? (
                <>
                  <Link
                    href="/orders"
                    className={`px-4 py-3 text-xs font-bold transition-all ${
                      pathname === '/orders'
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/10 font-extrabold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                    }`}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/subscriptions"
                    className={`px-4 py-3 text-xs font-bold transition-all ${
                      pathname === '/subscriptions'
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/10 font-extrabold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                    }`}
                  >
                    Subscriptions
                  </Link>
                  
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`flex items-center px-4 py-3 text-xs font-bold transition-all ${
                        pathname?.startsWith('/admin')
                          ? 'bg-green-600 text-white shadow-md shadow-green-600/10 font-extrabold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2 text-green-600" strokeWidth={2.2} />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center px-4 py-3 text-xs font-bold text-red-655 hover:bg-red-50 transition-all mt-2"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-red-500" strokeWidth={2.2} />
                    Logout Account
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <Link
                    href="/login"
                    className="w-full text-center py-3 text-xs font-bold text-gray-650 hover:bg-gray-55 transition-colors border border-gray-150"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full text-center py-3 bg-green-600 hover:bg-green-700 text-white text-xs font-extrabold shadow-md shadow-green-700/10 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
