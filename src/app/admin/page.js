'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBasket, ClipboardList, TrendingUp, Users, Package } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, orders: 0, totalRevenue: 0 });

  useEffect(() => {
    if (status !== 'loading') {
      if (status === 'unauthenticated' || (status === 'authenticated' && session.user.role !== 'admin')) {
        router.push('/');
      } else if (status === 'authenticated') {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      const orderRes = await fetch('/api/orders');
      const orderData = await orderRes.json();
      
      const revenue = orderData.reduce((acc, curr) => acc + curr.totalAmount, 0);
      
      setStats({
        products: prodData.length,
        orders: orderData.length,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (status === 'loading') return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-green-600" />
          Admin Dashboard
        </h1>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
          Welcome back, <span className="font-bold text-gray-900">{session?.user?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-green-50 rounded-2xl">
              <ShoppingBasket className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-500 font-medium">Total Products</p>
          <h2 className="text-4xl font-black text-gray-900 mt-1">{stats.products}</h2>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-orange-50 rounded-2xl">
              <ClipboardList className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-gray-500 font-medium">Total Orders</p>
          <h2 className="text-4xl font-black text-gray-900 mt-1">{stats.orders}</h2>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-gray-500 font-medium">Total Revenue</p>
          <h2 className="text-4xl font-black text-gray-900 mt-1">₹{stats.totalRevenue.toFixed(0)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/admin/products" className="group bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:border-green-100 transition-all">
          <div className="flex items-center gap-6">
            <div className="p-6 bg-green-600 rounded-[2rem] group-hover:scale-110 transition-transform shadow-lg shadow-green-100">
              <Package className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Manage Products</h3>
              <p className="text-gray-500">Add, edit or remove vegetables from the store catalog.</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" className="group bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all">
          <div className="flex items-center gap-6">
            <div className="p-6 bg-orange-500 rounded-[2rem] group-hover:scale-110 transition-transform shadow-lg shadow-orange-100">
              <ClipboardList className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">View Orders</h3>
              <p className="text-gray-500">Monitor and manage all customer orders and delivery status.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
