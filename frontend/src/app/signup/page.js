'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Mail, Lock, User, UserPlus, Loader2, ShieldCheck, Truck } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#f6faf5] px-4 py-5">
      <div className="grid w-full max-w-4xl overflow-hidden border border-gray-100 bg-white shadow-xl shadow-green-900/10 lg:max-h-[34rem] lg:grid-cols-[0.98fr_1.02fr]">
        <section className="relative hidden overflow-hidden bg-[#073c2a] lg:block">
          <Image
            src="/images/auth-signup-organic.png"
            alt="Fresh produce basket from Organic Vatika"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#052f21]/95 via-[#052f21]/55 to-[#052f21]/20" />
          <Link href="/" className="absolute left-6 top-6 z-10 inline-flex items-center gap-2">
            <Image src="/logo.PNG" alt="Organic Vatika" width={38} height={38} className="object-contain" />
            <span className="text-sm font-black text-white">Organic Vatika</span>
          </Link>
          <div className="absolute inset-x-0 bottom-0 p-7 text-white">
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur">
              <Leaf className="h-3.5 w-3.5" />
              Join Organic Vatika
            </div>
            <h2 className="mt-4 max-w-sm text-3xl font-black leading-tight">
              Build a fresher grocery routine.
            </h2>
            <p className="mt-3 max-w-sm text-xs font-medium leading-6 text-green-50/85">
              Create your account to order seasonal produce, save your basket, and manage fresh deliveries.
            </p>

            <div className="mt-6 grid max-w-sm grid-cols-2 gap-3">
              <div className="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <Truck className="h-4 w-4 text-orange-300" />
                <p className="mt-2 text-xs font-extrabold">Easy ordering</p>
              </div>
              <div className="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-green-200" />
                <p className="mt-2 text-xs font-extrabold">Quality checked</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden px-4 py-5 sm:px-6 lg:px-9">
          <div className="absolute inset-0 lg:hidden">
            <Image
              src="/images/auth-signup-organic.png"
              alt="Fresh produce basket from Organic Vatika"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-white/92" />
          </div>
          <div className="relative z-10 w-full max-w-sm">
            <div className="relative mb-4 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
                <Image src="/logo.PNG" alt="Organic Vatika" width={32} height={32} className="object-contain" />
                <span className="text-xs font-black text-[#07520c]">Organic Vatika</span>
              </Link>
              <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-green-700 hover:text-green-800">
                Home
              </Link>
            </div>

            <div className="relative border border-white/70 bg-white/95 p-5 shadow-xl shadow-green-900/10 sm:p-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center bg-green-50 text-green-700">
                <UserPlus className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-950 sm:text-3xl">Create Account</h1>
              <p className="mt-2 text-xs font-medium leading-5 text-gray-500">
                Join Organic Vatika for fresh deliveries.
              </p>

              {error && (
                <div className="mt-3 border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 w-full border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-xs font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 w-full border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-xs font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11 w-full border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-xs font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 bg-green-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-green-700/15 transition-all hover:bg-green-700 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs font-semibold text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-black text-green-600 hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
