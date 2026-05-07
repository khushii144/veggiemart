import Link from 'next/link';
import { Leaf, Mail, MapPin, Phone, Truck } from 'lucide-react';

const shopLinks = [
  { href: '/', label: 'Home' },
  { href: '/cart', label: 'Cart' },
  { href: '/orders', label: 'Orders' },
  { href: '/checkout', label: 'Checkout' },
];

const helpLinks = [
  'Freshness guarantee',
  'Same-day delivery',
  'Secure checkout',
  'Easy returns',
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center text-2xl font-bold text-green-600 tracking-tight">
              Veggie<span className="text-orange-500">Mart</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
              Fresh, organic, and locally grown vegetables delivered quickly from trusted farms to your kitchen.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              <Leaf className="h-4 w-4" />
              100% fresh picks daily
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Shop</h2>
            <div className="mt-4 space-y-3">
              {shopLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block text-sm text-gray-500 transition-colors hover:text-green-600">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Why Us</h2>
            <div className="mt-4 space-y-3">
              {helpLinks.map((label) => (
                <p key={label} className="text-sm text-gray-500">
                  {label}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Contact</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-500">
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-green-600" />
                +91 98765 43210
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-green-600" />
                hello@veggiemart.local
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-green-600" />
                Fresh Market Road, India
              </p>
              <p className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-green-600" />
                Delivery every day, 7 AM - 10 PM
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 VeggieMart. All rights reserved.</p>
          <p>Farm fresh vegetables, delivered with care.</p>
        </div>
      </div>
    </footer>
  );
}
