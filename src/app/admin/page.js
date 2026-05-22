'use client';
<<<<<<< HEAD
/* eslint-disable react-hooks/set-state-in-effect */
=======
export const dynamic = 'force-dynamic';
>>>>>>> 02f19d15883a62fed77e45597c2f0b668055cf99
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBasket, ClipboardList, TrendingUp, Users, Package, Calendar, ArrowRight, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 6890 },
  { name: 'Sat', revenue: 8390 },
  { name: 'Sun', revenue: 7490 },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, orders: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  async function fetchStats() {
    try {
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      
      const orderRes = await fetch('/api/orders');
      const orderData = await orderRes.json();
      const products = Array.isArray(prodData) ? prodData : [];
      const orders = Array.isArray(orderData) ? orderData : [];
      
      const revenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
      
      setStats({
        products: products.length,
        orders: orders.length,
        totalRevenue: revenue || 0,
      });

      // Get 5 most recent orders
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (status !== 'loading') {
      if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
        router.push('/');
      } else if (status === 'authenticated') {
        fetchStats();
      }
    }
  }, [status, session, router]);

  if (status === 'loading') return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
            <LayoutDashboard className="h-7 w-7 text-green-600 dark:text-green-400 sm:h-8 sm:w-8" />
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name || 'Admin'}!</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-2xl">
                <ShoppingBasket className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Products</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.products}</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-2xl">
                <ClipboardList className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+8%</span>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Orders</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.orders}</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+24%</span>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Customers</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">1,204</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+18%</span>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">₹{stats.totalRevenue.toFixed(0)}</h2>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Recent Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analytics</h3>
            <Link href="/admin/analytics" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Full Report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <Package className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{order.userId?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">₹{order.totalAmount.toFixed(0)}</p>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{order.status}</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                <Package className="w-8 h-8 mb-2 opacity-50" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <Link href="/admin/products" className="group bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <Package className="w-10 h-10 text-white mb-6" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Manage Products</h3>
              <p className="text-green-100 text-sm">Add, edit, and organize inventory.</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/subscriptions" className="group bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <Calendar className="w-10 h-10 text-white mb-6" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Subscriptions</h3>
              <p className="text-indigo-100 text-sm">Review pending & active terms.</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/reports" className="group bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden hidden lg:block">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <TrendingUp className="w-10 h-10 text-white mb-6" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">System Reports</h3>
              <p className="text-purple-100 text-sm">Export and analyze performance.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
