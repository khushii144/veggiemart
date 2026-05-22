'use client';
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, LogIn, Mail, Lock, Loader2, ShieldCheck, Truck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res.error) {
        setError(res.error);
      } else {
        const session = await getSession();
        if (session?.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#f6faf5] px-4 py-5">
      <div className="grid w-full max-w-4xl overflow-hidden border border-gray-100 bg-white shadow-xl shadow-green-900/10 lg:max-h-[34rem] lg:grid-cols-[0.98fr_1.02fr]">
        <section className="relative hidden overflow-hidden bg-[#073c2a] lg:block">
          <Image
            src="/images/auth-login-organic.png"
            alt="Fresh vegetables from Organic Vatika"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#052f21]/95 via-[#052f21]/55 to-[#052f21]/20" />
          <Link href="/" className="absolute left-6 top-6 z-10 inline-flex items-center gap-2">
            <Image src="/logo.PNG" alt="Organic Vatika" width={38} height={38} className="object-contain" />
            <span className="text-sm font-black text-white">Organic Vatika</span>
=======
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-green-100/50 border border-gray-50 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-green-50 rounded-2xl mb-4">
            <LogIn className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all outline-none"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-100 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-green-600 font-bold hover:underline">
            Sign Up
>>>>>>> 02f19d15883a62fed77e45597c2f0b668055cf99
          </Link>
          <div className="absolute inset-x-0 bottom-0 p-7 text-white">
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur">
              <Leaf className="h-3.5 w-3.5" />
              Organic Vatika
            </div>
            <h2 className="mt-4 max-w-sm text-3xl font-black leading-tight">
              Fresh vegetables delivered with care.
            </h2>
            <p className="mt-3 max-w-sm text-xs font-medium leading-6 text-green-50/85">
              Sign in to manage your cart, track orders, and keep your weekly fresh grocery routine moving.
            </p>

            <div className="mt-6 grid max-w-sm grid-cols-2 gap-3">
              <div className="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <Truck className="h-4 w-4 text-orange-300" />
                <p className="mt-2 text-xs font-extrabold">Daily delivery</p>
              </div>
              <div className="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-green-200" />
                <p className="mt-2 text-xs font-extrabold">Freshness checked</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden px-4 py-5 sm:px-6 lg:px-9">
          <div className="absolute inset-0 lg:hidden">
            <Image
              src="/images/auth-login-organic.png"
              alt="Fresh vegetables from Organic Vatika"
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
                <LogIn className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-950 sm:text-3xl">Welcome Back</h1>
              <p className="mt-2 text-xs font-medium leading-5 text-gray-500">
                Enter your credentials to access your account.
              </p>

              {error && (
                <div className="mt-3 border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600 animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-xs font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-xs font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 bg-green-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-green-700/15 transition-all hover:bg-green-700 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs font-semibold text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-black text-green-600 hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
