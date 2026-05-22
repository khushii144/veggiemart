'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-green-50 p-8 rounded-full mb-6">
          <ShoppingBag className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven&apos;t added any vegetables to your cart yet. Let&apos;s find some fresh picks!</p>
        <Link
          href="/"
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-green-100"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-green-600" />
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.cartId || item._id} className="bg-white p-4 rounded-3xl flex gap-4 items-center border border-gray-50 shadow-sm">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-gray-900">{item.name} {item.qty ? `(${item.qty})` : ''}</h3>
                <p className="text-green-600 font-bold">${item.price.toFixed(2)}</p>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.cartId || item._id, item.quantity - 1)}
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartId || item._id, item.quantity + 1)}
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId || item._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="h-px bg-gray-100 my-4"></div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-green-600">₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <Link
            href="/checkout"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 group"
          >
            Checkout
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
