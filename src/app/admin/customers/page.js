'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Search, MoreVertical, Mail, Calendar, Shield } from 'lucide-react';

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Placeholder data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Customer', joined: 'Oct 24, 2023', status: 'Active' },
    { id: 2, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', joined: 'Sep 12, 2023', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Customer', joined: 'Nov 02, 2023', status: 'Inactive' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Customer', joined: 'Jan 15, 2024', status: 'Active' },
    { id: 5, name: 'Michael Brown', email: 'michael@example.com', role: 'Customer', joined: 'Feb 20, 2024', status: 'Active' },
  ];

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') return <div className="p-8 text-center text-gray-500">Loading customers...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage customers, admins, and permissions.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
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
            {users.map((user) => (
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
    </div>
  );
}
