'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Package, Calendar, MapPin, Wallet, Settings, LogOut, Plus, Trash2, Loader2, Edit2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, ordRes, subRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/orders', { credentials: 'omit' }), // Next.js rewrites proxy these cookies automatically if using fetch, wait. Actually let's just do standard fetch.
        fetch('/api/subscription/user')
      ]);
      
      if (profRes.ok) setProfile(await profRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (subRes.ok) setSubscriptions(await subRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateProfile = async (updates) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      setProfile(await res.json());
      alert('Profile updated successfully!');
    }
  };

  const handleAddAddress = () => {
    const street = prompt('Enter Street Address:');
    if (!street) return;
    const city = prompt('Enter City:');
    const zip = prompt('Enter Zip Code:');
    const label = prompt('Label (Home/Work):') || 'Home';
    
    const newAddr = { street, city, state: '', zip, label, isDefault: profile.addresses?.length === 0 };
    updateProfile({ addresses: [...(profile.addresses || []), newAddr] });
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  }

  if (!profile) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'subscriptions', label: 'My Subscriptions', icon: Calendar },
    { id: 'addresses', label: 'My Addresses', icon: MapPin },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 text-xl font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-all border-l-4 border-transparent mt-2 border-t border-gray-50"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 min-h-[500px]">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-extrabold text-gray-900">Welcome back, {profile.name}!</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-100 p-6 rounded-2xl">
                  <p className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2">Total Orders</p>
                  <p className="text-3xl font-black text-green-600">{orders.length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                  <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Active Subs</p>
                  <p className="text-3xl font-black text-blue-600">{subscriptions.filter(s => s.status === 'active').length}</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                  <p className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-2">Wallet Balance</p>
                  <p className="text-3xl font-black text-orange-600">₹{profile.walletBalance || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">My Orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">You have no orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="border border-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:shadow-md transition">
                      <div>
                        <p className="font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-green-600">₹{order.totalAmount}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">My Subscriptions</h2>
              {subscriptions.length === 0 ? (
                <p className="text-gray-500">You have no active subscriptions.</p>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map(sub => (
                    <div key={sub._id} className="border border-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:shadow-md transition">
                      <div>
                        <p className="font-bold text-gray-900">{sub.productId?.name || 'Product'}</p>
                        <p className="text-sm text-gray-500">{sub.frequency} • Qty: {sub.quantity}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {sub.status.toUpperCase()}
                        </span>
                        {sub.status === 'active' && (
                          <button 
                            onClick={async () => {
                              if(confirm('Cancel subscription?')) {
                                await fetch('/api/subscription/cancel', { method: 'POST', body: JSON.stringify({ subscriptionId: sub._id }) });
                                fetchData();
                              }
                            }}
                            className="text-xs font-bold text-red-500 hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">My Addresses</h2>
                <button onClick={handleAddAddress} className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>
              {(!profile.addresses || profile.addresses.length === 0) ? (
                <p className="text-gray-500">No addresses saved.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.addresses.map((addr, i) => (
                    <div key={i} className="border border-gray-200 p-5 rounded-2xl relative">
                      {addr.isDefault && <span className="absolute top-4 right-4 text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-md">DEFAULT</span>}
                      <p className="font-bold text-gray-900 mb-1">{addr.label}</p>
                      <p className="text-sm text-gray-600">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                      <div className="mt-4 flex gap-3">
                        <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><Edit2 className="w-3 h-3"/> Edit</button>
                        <button 
                          onClick={() => {
                            const newAddrs = profile.addresses.filter((_, idx) => idx !== i);
                            updateProfile({ addresses: newAddrs });
                          }}
                          className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"><Trash2 className="w-3 h-3"/> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Wallet</h2>
              <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-3xl p-8 text-white shadow-xl shadow-green-900/20 max-w-sm">
                <p className="text-green-100 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                <h3 className="text-5xl font-black mb-6">₹{profile.walletBalance || 0}</h3>
                <button className="w-full bg-white text-green-700 font-extrabold py-3 rounded-xl hover:bg-green-50 transition">
                  + Add Money
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in max-w-md">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Account Settings</h2>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfile({ name: e.target.name.value });
                }}
                className="space-y-4"
              >
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 uppercase">Full Name</span>
                  <input type="text" name="name" defaultValue={profile.name} className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 uppercase">Email Address (Read Only)</span>
                  <input type="email" disabled value={profile.email} className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 outline-none font-semibold text-gray-500 cursor-not-allowed" />
                </label>
                <button type="submit" className="bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 transition w-full sm:w-auto mt-4">
                  Save Changes
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
