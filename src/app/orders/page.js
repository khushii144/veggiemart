'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, Clock, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading') {
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (status === 'authenticated') {
        fetchOrders();
      }
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return <div className="text-center py-20 animate-pulse">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingBag className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h1>
        <p className="text-gray-500 mb-8">When you place an order, it will appear here.</p>
        <button onClick={() => router.push('/')} className="text-green-600 font-bold hover:underline">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Package className="w-8 h-8 text-green-600" />
        My Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-[2rem] border border-gray-50 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Placed</p>
                  <p className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-green-600 text-lg">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-full border border-gray-100 text-sm font-bold text-orange-600">
                  {order.status}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p className="text-gray-700">{order.shippingAddress}</p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50/30 rounded-2xl">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
