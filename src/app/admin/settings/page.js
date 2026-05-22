'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Settings, User, Bell, Shield, Moon, Sun, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading' || !mounted) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          Settings & Preferences
        </h1>
        <p className="text-gray-500 mt-1">Manage your admin profile, appearance, and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl flex items-center gap-3">
            <User className="w-5 h-5 text-blue-500" /> Profile
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-bold rounded-xl flex items-center gap-3 transition">
            <Moon className="w-5 h-5 text-indigo-500" /> Appearance
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-bold rounded-xl flex items-center gap-3 transition">
            <Bell className="w-5 h-5 text-yellow-500" /> Notifications
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-bold rounded-xl flex items-center gap-3 transition">
            <Shield className="w-5 h-5 text-green-500" /> Security
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Admin Profile</h3>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {session?.user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  Change Avatar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <input type="text" defaultValue={session?.user?.name} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <input type="email" defaultValue={session?.user?.email} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 text-sm" disabled />
              </div>
            </div>
            <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-sm">
              Save Changes
            </button>
          </div>

          {/* Theme Section */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appearance</h3>
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition ${theme === 'light' ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
              >
                <Sun className="w-6 h-6" />
                <span className="text-sm font-bold">Light</span>
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition ${theme === 'dark' ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-400' : 'border-gray-100 dark:border-gray-700 hover:border-gray-600'}`}
              >
                <Moon className="w-6 h-6" />
                <span className="text-sm font-bold">Dark</span>
              </button>
              <button 
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition ${theme === 'system' ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
              >
                <Monitor className="w-6 h-6" />
                <span className="text-sm font-bold">System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
