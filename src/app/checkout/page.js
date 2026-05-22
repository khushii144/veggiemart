'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { data: session, status } = useSession();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();


  useEffect(() => {
    if (status !== 'loading' && status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);

    try {
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: cartTotal,
          shippingAddress: address,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        clearCart();
        setTimeout(() => router.push('/orders'), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-green-100 p-8 rounded-full mb-6 animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-8 max-w-md">Thank you for shopping with Organic Vatika. Your fresh vegetables are being packed and will reach you soon.</p>
        <p className="text-sm text-gray-400">Redirecting to order history...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Nothing to checkout!</h2>
        <button onClick={() => router.push('/')} className="text-green-600 font-bold hover:underline">Go to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-green-600" />
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Delivery Address
            </h2>
            <textarea
              placeholder="Enter your full delivery address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all outline-none h-32"
              required
            />
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Payment Method
            </h2>
            <div className="p-4 border-2 border-green-500 bg-green-50 rounded-2xl flex items-center gap-4">
              <div className="bg-green-600 p-2 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">Cash on Delivery</p>
                <p className="text-sm text-gray-500">Pay when you receive your veggies</p>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            Summary
          </h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-600">
              <span>Items ({cart.length})</span>
              <span>₹{cartTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="h-px bg-gray-100 my-4"></div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-green-600">₹{cartTotal.toFixed(0)}</span>
            </div>
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !address}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
