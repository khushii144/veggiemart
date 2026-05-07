'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { Leaf, Search, ShieldCheck, Truck } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const readSearchTerm = () => {
      if (typeof window === 'undefined') return;
      setSearchTerm(new URLSearchParams(window.location.search).get('q') || '');
    };

    const handleSearch = (event) => {
      setSearchTerm(event.detail || '');
    };

    readSearchTerm();
    window.addEventListener('popstate', readSearchTerm);
    window.addEventListener('veggiemart:search', handleSearch);

    return () => {
      window.removeEventListener('popstate', readSearchTerm);
      window.removeEventListener('veggiemart:search', handleSearch);
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = normalizedSearch
    ? products.filter((product) => product.name.toLowerCase().includes(normalizedSearch))
    : products;

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative flex h-[260px] items-center overflow-hidden rounded-3xl bg-green-50 text-white shadow-sm sm:h-[320px] lg:h-[360px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/banner image.jpg"
            alt="Fresh vegetables banner"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/35 via-green-900/10 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-xl p-6 sm:p-10 lg:p-12">
          <span className="mb-4 inline-block rounded-full bg-white/25 px-4 py-1 text-sm font-semibold backdrop-blur-md">
            🌱 100% Organic & Fresh
          </span>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Fresh Vegetables <br />
            <span className="text-green-300">Directly from Farm</span>
          </h1>
          <p className="mb-6 max-w-lg text-sm text-green-50 opacity-95 sm:text-base">
            Order fresh, organic, and locally grown vegetables delivered straight to your door within 2 hours. Healthy living starts here.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl bg-white px-6 py-3 font-bold text-green-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-green-50">
              Shop Now
            </button>
            <button className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 font-bold backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          { icon: <Truck className="w-8 h-8 text-orange-500" />, title: 'Fast Delivery', desc: 'Get your veggies within 2 hours of ordering.' },
          { icon: <ShieldCheck className="w-8 h-8 text-blue-500" />, title: 'Quality Assured', desc: 'Handpicked vegetables with 100% quality check.' },
          { icon: <Leaf className="w-8 h-8 text-green-500" />, title: 'Eco Friendly', desc: 'Sustainable packaging and zero-waste process.' },
        ].map((feature, i) => (
          <div key={i} className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
            <div className="mb-4 p-4 bg-gray-50 rounded-2xl">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-500 text-sm">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Product Grid */}
      <section>
        <div className="flex justify-between items-end mb-10 px-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {normalizedSearch ? `Search results for "${searchTerm.trim()}"` : 'Popular Vegetables'}
            </h2>
            <p className="text-gray-500">
              {normalizedSearch
                ? `${filteredProducts.length} ${filteredProducts.length === 1 ? 'vegetable' : 'vegetables'} found`
                : 'The freshest picks of the week for you'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-[300px] animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No vegetables found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try searching for another fresh vegetable by name.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
