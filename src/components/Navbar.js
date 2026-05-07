'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingCart, User, LogOut, ShieldCheck, X } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const readSearchTerm = () => {
      if (typeof window === 'undefined') return;
      setSearchTerm(new URLSearchParams(window.location.search).get('q') || '');
    };

    readSearchTerm();
    window.addEventListener('popstate', readSearchTerm);

    return () => {
      window.removeEventListener('popstate', readSearchTerm);
    };
  }, [pathname]);

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

  return (
    <nav className="sticky top-0 z-50 px-3 py-3 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/70 bg-white/90 px-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:py-0">
          <div className="flex items-center justify-between lg:shrink-0">
            <Link href="/" className="text-xl font-bold tracking-tight text-green-600 transition-transform duration-200 hover:scale-[1.02] sm:text-2xl">
              Veggie<span className="text-orange-500">Mart</span>
            </Link>
          </div>

          <div className="order-3 w-full lg:order-none lg:max-w-xl lg:flex-1">
            <div className="group flex h-11 items-center gap-3 rounded-full border border-gray-100 bg-gray-50 px-4 text-gray-500 shadow-inner transition-all duration-200 focus-within:border-green-200 focus-within:bg-white focus-within:shadow-[0_10px_30px_rgba(22,163,74,0.10)]">
              <Search className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-focus-within:text-green-600" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search fresh vegetables..."
                aria-label="Search vegetables by name"
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear vegetable search"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {session && (
              <Link href="/orders" className="text-sm font-medium text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:text-green-600">
                Orders
              </Link>
            )}
            {session?.user?.role === 'admin' && (
              <Link href="/admin" className="flex items-center text-sm font-medium text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:text-green-600">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3 lg:shrink-0">
            <Link
              href="/cart"
              aria-label={`Shopping cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-100 hover:bg-green-50 hover:text-green-700 hover:shadow-md active:translate-y-0 sm:h-11 sm:w-11"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.9} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 text-gray-700 sm:flex">
                  <User className="w-5 h-5 text-green-600" />
                  <span className="hidden text-sm font-medium lg:block">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="inline-flex h-10 items-center rounded-full bg-gray-100 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-200 hover:shadow-sm active:translate-y-0 sm:h-11"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-full px-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:text-green-700 active:translate-y-0 sm:h-11 sm:px-4"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-md shadow-green-700/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg hover:shadow-green-700/20 active:translate-y-0 sm:h-11 sm:px-5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
