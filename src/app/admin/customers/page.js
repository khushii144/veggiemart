'use client';
<<<<<<< HEAD
import { useState, useEffect, useMemo } from 'react';
=======
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
>>>>>>> 02f19d15883a62fed77e45597c2f0b668055cf99
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Search, MoreVertical, Mail, Calendar, Shield } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

const ITEMS_PER_PAGE = 10;

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Customer', joined: 'Oct 24, 2023', status: 'Active' },
  { id: 2, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', joined: 'Sep 12, 2023', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Customer', joined: 'Nov 02, 2023', status: 'Inactive' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Customer', joined: 'Jan 15, 2024', status: 'Active' },
  { id: 5, name: 'Michael Brown', email: 'michael@example.com', role: 'Customer', joined: 'Feb 20, 2024', status: 'Active' },
];

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredUsers]);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') return <div className="p-8 text-center text-gray-500">Loading customers...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
            <Users className="h-7 w-7 text-blue-600 dark:text-blue-400 sm:h-8 sm:w-8" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage customers, admins, and permissions.</p>
        </div>
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

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-[2rem]">
        <div className="space-y-4 p-4 lg:hidden">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 font-bold text-blue-700">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-gray-950 dark:text-white">{user.name}</h2>
                <p className="mt-1 flex items-center gap-1 truncate text-xs font-medium text-gray-500">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {user.role === 'Admin' && <Shield className="h-3 w-3" />}
                    {user.role}
                  </span>
                  <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-black ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {user.joined}
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
              <th className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {user.role === 'Admin' && <Shield className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {user.joined}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.status}
                  </span>
                </td>
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
