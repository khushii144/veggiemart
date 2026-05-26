'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Search, MoreVertical, Mail, Calendar, Shield, RefreshCw } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVAL_MS = 15000;

function formatDate(date) {
  if (!date) return 'Not logged in';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatRole(role) {
  return role === 'admin' ? 'Admin' : 'Customer';
}

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [error, setError] = useState('');

  async function fetchCustomers({ silent = false } = {}) {
    if (!silent) setIsLoadingCustomers(true);
    setError('');

    try {
      const res = await fetch('/api/admin/customers', {
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load customers');
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      if (!silent) setIsLoadingCustomers(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      (user.name || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      formatRole(user.role).toLowerCase().includes(query) ||
      (user.subscriptionStatus || '').toLowerCase().includes(query)
    );
  }, [searchTerm, users]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredUsers]);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'admin') return;

    fetchCustomers();
    const intervalId = window.setInterval(() => {
      fetchCustomers({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [status, session?.user?.role]);

  if (status === 'loading' || isLoadingCustomers) return <div className="p-8 text-center text-gray-500">Loading customers...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
            <Users className="h-7 w-7 text-blue-600 dark:text-blue-400 sm:h-8 sm:w-8" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Live customer data from MongoDB.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fetchCustomers()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search users..." 
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-[2rem]">
        <div className="space-y-4 p-4 lg:hidden">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 font-bold text-blue-700">
                {(user.name || user.email || 'U').charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-gray-950 dark:text-white">{user.name || 'Unnamed User'}</h2>
                <p className="mt-1 flex items-center gap-1 truncate text-xs font-medium text-gray-500">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {user.role === 'admin' && <Shield className="h-3 w-3" />}
                    {formatRole(user.role)}
                  </span>
                  <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-black ${user.subscriptionStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.subscriptionStatus}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(user.joined)}
                  </span>
                </div>
              </div>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400">User</th>
              <th className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400">Role</th>
              <th className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400">Joined Date</th>
              <th className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400">Subscription</th>
              <th className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400">Last Login</th>
              <th className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold">
                      {(user.name || user.email || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{user.name || 'Unnamed User'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {user.role === 'admin' && <Shield className="w-3 h-3" />}
                    {formatRole(user.role)}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(user.joined)}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${user.subscriptionStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.subscriptionStatus} ({user.subscriptionCount || 0})
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-gray-500">{formatDate(user.lastLoginAt)}</td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-bold text-gray-900 dark:text-white">No users found</p>
            <p className="mt-1 text-sm text-gray-500">Try a different search term.</p>
          </div>
        )}
        <AdminPagination
          currentPage={currentPage}
          itemName="users"
          onPageChange={setCurrentPage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={filteredUsers.length}
        />
      </div>
    </div>
  );
}
