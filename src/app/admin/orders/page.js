'use client';
<<<<<<< HEAD
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
=======
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
>>>>>>> 02f19d15883a62fed77e45597c2f0b668055cf99
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Clock, MapPin, User } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, orders]);

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      if (status === 'authenticated' && session.user.role === 'admin') {
        fetchOrders();
      } else {
        router.push('/');
      }
    }
  }, [fetchOrders, status, session, router]);

  if (loading && orders.length === 0) return <div className="text-center py-20">Loading orders...</div>;

  return (
    <div className="space-y-6 lg:space-y-8">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
        <ClipboardList className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
        All Customer Orders
      </h1>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm sm:rounded-[2rem]">
        <div className="space-y-4 p-4 lg:hidden">
          {paginatedOrders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-950">#{order._id.substring(order._id.length - 8)}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <select className="shrink-0 rounded-full border-none bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 outline-none">
                  <option value="Pending">{order.status}</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-950">{order.userId?.name || 'Unknown'}</p>
                  <p className="truncate text-xs font-medium text-gray-500">{order.userId?.email || '-'}</p>
                </div>
                <p className="ml-auto shrink-0 text-lg font-black text-green-600">${order.totalAmount.toFixed(2)}</p>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-gray-50 px-3 py-3 text-sm font-medium text-gray-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span className="line-clamp-2">{order.shippingAddress}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-6 font-bold text-gray-600">Order ID / Date</th>
              <th className="px-8 py-6 font-bold text-gray-600">Customer</th>
              <th className="px-8 py-6 font-bold text-gray-600">Amount</th>
              <th className="px-8 py-6 font-bold text-gray-600">Status</th>
              <th className="px-8 py-6 font-bold text-gray-600">Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">#{order._id.substring(order._id.length - 8)}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-50 rounded-lg"><User className="w-4 h-4 text-green-600" /></div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{order.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{order.userId?.email || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-green-600">${order.totalAmount.toFixed(2)}</td>
                <td className="px-8 py-6">
                   <select className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border-none outline-none cursor-pointer">
                     <option value="Pending">{order.status}</option>
                     <option value="Shipped">Shipped</option>
                     <option value="Delivered">Delivered</option>
                   </select>
                </td>
                <td className="px-8 py-6 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {order.shippingAddress}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <AdminPagination
          currentPage={currentPage}
          itemName="orders"
          onPageChange={setCurrentPage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={orders.length}
        />
      </div>
    </div>
  );
}
