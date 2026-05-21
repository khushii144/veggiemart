'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Clock, MapPin, User, Package } from 'lucide-react';

export default function AdminOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      if (status === 'authenticated' && session.user.role === 'admin') {
        fetchOrders();
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  if (loading && orders.length === 0) return <div className="text-center py-20">Loading orders...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <ClipboardList className="w-8 h-8 text-green-600" />
        All Customer Orders
      </h1>

      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-x-auto">
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
            {orders.map((order) => (
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
    </div>
  );
}
