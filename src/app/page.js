'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import BlogCard from '@/components/BlogCard';
import { Leaf, Search, ShieldCheck, Truck, Droplets, UserCheck, Star, Quote, Clock, MapPin, CalendarRange, CheckCircle2, ArrowRight } from 'lucide-react';
import { blogs } from '@/lib/blogs';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { question: 'What makes your Desi Ghee different from store-bought brands?', answer: 'Our Desi Ghee is made using the traditional Bilona method from grass-fed cows. It contains no preservatives or artificial flavors, ensuring maximum purity and nutrition.' },
    { question: 'Are your Cold Pressed Oils truly chemical-free?', answer: 'Yes, our oils are extracted using traditional wooden ghani methods at low temperatures without any chemical solvents, preserving their natural aroma, taste, and nutrients.' },
    { question: 'How do you verify the "Organic" status of your pulses and grains?', answer: 'We partner directly with certified organic farms and conduct regular soil and product testing to ensure everything meets strict organic and safety standards.' },
    { question: 'How long does shipping take for fresh products?', answer: 'For fresh produce, we offer next-day delivery in major city zones to ensure maximum freshness upon arrival. Pantry items are delivered within 2-3 business days.' }
  ];

  const heroImages = [
    '/images/banner image.jpg',
    '/images/banner2.jpg',
    '/images/banner3.jpg',
    '/images/banner4.jpg',
  ];

  const categories = [
    { 
      id: 'All',
      name: 'All Products',
      desc: 'Explore our complete organic collection',
      image: '/images/categories/all.jpg',
    },
    {
      id: 'Vegetables',
      name: 'Vegetables',
      desc: 'Crisp & fresh everyday veggies',
      image: '/images/categories/vegetables.jpg',
    },
    {
      id: 'Fruits',
      name: 'Fruits',
      desc: 'Sweet, juicy, farm-picked fruits',
      image: '/images/categories/fruits.jpg',
    },
    {
      id: 'Dairy',
      name: 'Dairy',
      desc: 'Pure milk, cheese & farm dairy',
      image: '/images/categories/dairy.jpg',
    },
    {
      id: 'Herbs',
      name: 'Herbs',
      desc: 'Aromatic & medicinal fresh herbs',
      image: '/images/categories/herbs.jpg',
    },
    {
      id: 'Seeds',
      name: 'Seeds',
      desc: 'Premium quality planting seeds',
      image: '/images/categories/seeds.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
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
  const filteredProducts = products.filter((product) => {
    const matchesSearch = normalizedSearch
      ? product.name?.toLowerCase().includes(normalizedSearch)
      : true;
      
    // Handle category match - case insensitive and flexible
    const matchesCategory = selectedCategory === 'All' 
      ? true 
      : product.category?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section - Premium Organic Style */}
      <section className="relative flex h-[400px] items-center overflow-hidden bg-[#fbf9f4] text-[#1e3b2b] sm:h-[480px] lg:h-[550px] w-full">
        {/* Background Images with Overlay */}
        {heroImages.map((src, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image 
              src={src}
              alt={`Premium organic products ${idx + 1}`}
              fill
              priority={idx === 0}
              className="object-cover"
            />
            {/* Elegant dark gradient overlay to make text readable but keep it natural */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1e3b2b]/80 via-[#1e3b2b]/40 to-transparent"></div>
          </div>
        ))}

        <div className="mx-auto max-w-[90rem] w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl">
            <span className="mb-4 inline-block tracking-widest uppercase text-xs font-bold text-white/90 border-b-2 border-[#4a7c59] pb-1">
              100% Organic Farm Products
            </span>
            <h1 className="mb-6 text-4xl font-serif leading-tight text-white sm:text-5xl lg:text-6xl">
              Fresh Harvest for a <br />
              <span className="text-[#a4d4b4]">Healthier Life</span>
            </h1>
            <p className="mb-8 max-w-lg text-sm text-gray-100 sm:text-base leading-relaxed">
              From naturally grown vegetables to farm-fresh fruits, bring home wholesome nutrition, authentic taste, and the goodness of chemical-free farming.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full bg-[#4a7c59] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#386044] shadow-md"
              >
                Shop Now
              </button>
              <Link href="/subscriptions" className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20">
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Home Page Sections Centered Container */}
      <div className="max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Our Strengths Section */}
        <section className="space-y-10 pt-4 pb-8">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-serif text-[#1e3b2b] sm:text-4xl font-bold">
              Our Strengths
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Discover what makes us different and why we&apos;re the best choice for your organic needs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[
              { icon: <Leaf className="w-7 h-7 text-[#218838]" />, title: 'Ethically Sourced', desc: 'Straight from sustainable local farms to your doorstep.' },
              { icon: <Droplets className="w-7 h-7 text-[#218838]" />, title: 'Pure Integrity', desc: 'Transparent processes you can trust, every single time.' },
              { icon: <UserCheck className="w-7 h-7 text-[#218838]" />, title: 'Community First', desc: 'Empowering rural growers and supporting local economy.' },
              { icon: <Leaf className="w-7 h-7 text-[#218838]" />, title: 'Curated Organic', desc: 'A handpicked selection of premium organic goods.' },
              { icon: <ShieldCheck className="w-7 h-7 text-[#218838]" />, title: 'Gold Standard', desc: 'Triple-certified quality checks for max nutrient density.' },
              { icon: <Leaf className="w-7 h-7 text-[#218838]" />, title: 'Ancient Harvest', desc: 'Preserving heritage grains with modern safety standards.' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-white border border-gray-100 rounded-3xl transition-all hover:border-[#218838]/30 hover:shadow-sm">
                <div className="mb-5 w-16 h-16 rounded-full bg-[#ebf5e9] flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-[15px] font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Organic Categories Section */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-serif text-[#1e3b2b] sm:text-4xl font-bold">
              Shop by Category
            </h2>
            <div className="w-16 h-0.5 bg-[#4a7c59] mx-auto"></div>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Explore our curated selection of premium organic and naturally grown products.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-2">
            {categories.map((cat, i) => {
              const isActive = selectedCategory === cat.id;
              return (
                <Link
                  key={i}
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  className={`group relative overflow-hidden rounded-2xl aspect-square text-left shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 focus:outline-none ${
                    isActive
                      ? 'ring-4 ring-[#4a7c59] ring-offset-2 shadow-[#4a7c59]/30'
                      : ''
                  }`}
                  style={{ background: '#e8f5e9' }}
                >
                  {/* Background Image */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                  />

                  {/* Gradient overlay – stronger at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

                  {/* Active badge */}
                  {isActive && (
                    <span className="absolute top-3 right-3 z-10 bg-[#4a7c59] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                      Selected
                    </span>
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 sm:p-5">
                    <h3 className="text-white font-bold text-base sm:text-lg leading-tight mb-1 drop-shadow">
                      {cat.name}
                    </h3>
                    <p className="text-gray-300 text-[11px] sm:text-xs leading-snug mb-3 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {cat.desc}
                    </p>
                    <div className="flex items-center gap-1.5 text-[#a4d4b4] text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="pt-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-4 rounded-none border-2 border-[#218838] bg-white px-10 py-5 text-base font-semibold uppercase tracking-[0.24em] text-[#218838] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#218838] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#218838]/30"
            >
              <span>SEE ALL PRODUCTS</span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#218838] text-white transition duration-300 ease-out group-hover:bg-[#1f6b2f]">
                <ArrowRight className="h-6 w-6" />
              </span>
            </Link>
          </div>
        </section>

        {/* Subscription Plans Section */}
        <section className="space-y-8 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <span className="text-xs font-bold text-[#4a7c59] uppercase tracking-widest block">
              Save More
            </span>
            <h2 className="text-3xl font-serif text-[#1e3b2b] sm:text-4xl">
              Subscription Plans
            </h2>
            <div className="w-16 h-0.5 bg-[#4a7c59] mx-auto"></div>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Get fresh harvest delivered regularly at discounted prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Weekly Plan */}
            <div className="bg-[#fbf9f4] rounded-[2.5rem] border border-[#e8e3d3] shadow-sm p-8 sm:p-10 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <CalendarRange className="w-32 h-32 text-[#4a7c59]" />
              </div>
              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 bg-white border border-[#e8e3d3] text-[#4a7c59] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  Weekly Plan
                </span>
                <h3 className="text-4xl font-serif text-[#1e3b2b] mb-2">10% OFF</h3>
                <p className="text-gray-500 text-sm mb-6">Perfect for families needing fresh supplies every week.</p>
                <ul className="space-y-3 mb-8">
                  {['Deliveries every 7 days', 'Pause or cancel anytime', 'Free delivery on all orders', 'Priority support'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#4a7c59] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/subscriptions" className="block w-full py-3.5 text-center rounded-full bg-white border border-[#e8e3d3] text-[#1e3b2b] font-bold hover:bg-[#4a7c59] hover:text-white hover:border-[#4a7c59] transition-all shadow-sm">
                  View Subscriptions
                </Link>
              </div>
            </div>

            {/* Monthly Plan */}
            <div className="bg-[#1e3b2b] rounded-[2.5rem] shadow-xl p-8 sm:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <CalendarRange className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 bg-[#c25a3a] text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4 shadow-sm">
                  Monthly Plan
                </span>
                <h3 className="text-4xl font-serif text-white mb-2">15% OFF</h3>
                <p className="text-[#a4d4b4] text-sm mb-6 font-light">Best value for long-term supply of essentials.</p>
                <ul className="space-y-3 mb-8 text-white/90">
                  {['Deliveries every 30 days', 'Maximum savings guaranteed', 'Pause or cancel anytime', 'Early access to seasonal harvest'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#c25a3a] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/subscriptions" className="block w-full py-3.5 text-center rounded-full bg-[#c25a3a] text-white font-bold hover:bg-[#a0482d] transition-colors shadow-lg shadow-[#c25a3a]/20">
                  Subscribe Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Farm Story Section */}
        <section className="pt-16 pb-8">
          <div className="bg-[#1e3b2b] rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-xl">
            <div className="w-full lg:w-1/2 p-10 sm:p-16 flex flex-col justify-center text-white">
              <span className="text-xs font-bold text-[#a4d4b4] uppercase tracking-widest block mb-4 border-b border-[#a4d4b4]/30 pb-2 w-max">
                Our Roots
              </span>
              <h2 className="text-3xl font-serif sm:text-4xl mb-6 leading-tight">
                From Soil to Soul: <br />Our commitment to direct farming
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                A deep dive into our ethical sourcing process and how we support our local farming community by cutting out the middlemen. We partner directly with local, sustainable farms to bring the harvest straight to your door.
              </p>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 font-light">
                By choosing us, you are preserving heritage farming with modern safety standards and feeding your family the best nature has to offer.
              </p>
              <Link href="/subscriptions" className="self-start inline-flex items-center justify-center gap-2 bg-[#4a7c59] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#386044] transition-all">
                Join Our Community <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-full">
              <img 
                src="https://images.unsplash.com/photo-1595858641158-b6481cb1ebde?q=80&w=800&auto=format&fit=crop" 
                alt="Farmer harvesting vegetables"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        </section>

        {/* Customer Testimonials Section */}
        <section className="space-y-8 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl font-serif text-[#1e3b2b] sm:text-4xl">
              What Our Customers Say
            </h2>
            <div className="w-16 h-0.5 bg-[#4a7c59] mx-auto"></div>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Join thousands of happy families enjoying fresh produce daily.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { name: 'Priya Sharma', role: 'Regular Customer', content: 'The aroma takes me back to my village. Truly authentic and pure. Delivery is super fast!', rating: 5, bg: 'bg-[#fbf9f4] border-[#e8e3d3]' },
              { name: 'Rahul Verma', role: 'Subscriber', content: 'You can taste the difference compared to supermarket brands. Subscribing was the best decision.', rating: 5, bg: 'bg-white border-[#e8e3d3]' },
              { name: 'Anita Desai', role: 'Home Chef', content: 'The texture and quality is perfect. My family has switched to this for all our meals.', rating: 5, bg: 'bg-[#fbf9f4] border-[#e8e3d3]' },
            ].map((testimonial, i) => (
              <div key={i} className={`p-8 rounded-[2rem] border shadow-sm relative ${testimonial.bg} hover:-translate-y-1 transition-transform`}>
                <Quote className="w-8 h-8 text-[#4a7c59]/20 absolute top-8 right-8" />
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                     <Star key={i} className="w-4 h-4 fill-[#c25a3a] text-[#c25a3a]" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-8 relative z-10 leading-relaxed text-sm">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#4a7c59] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e3b2b] text-sm">{testimonial.name}</h4>
                    <span className="text-xs text-gray-500 font-medium">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery Information Section */}
        <section className="space-y-8 pt-8 border-t border-[#e8e3d3]/50">
          <div className="bg-[#fbf9f4] border border-[#e8e3d3] rounded-[3rem] p-10 sm:p-14 text-[#1e3b2b] relative overflow-hidden shadow-sm">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-[#e8e3d3]">
              <div className="flex flex-col items-center md:items-start pt-6 md:pt-0">
                <Clock className="w-8 h-8 text-[#4a7c59] mb-4" />
                <h3 className="text-lg font-bold mb-2 font-serif">Delivery Timing</h3>
                <p className="text-gray-500 text-sm">7:00 AM - 10:00 PM<br/>7 Days a week</p>
              </div>
              <div className="flex flex-col items-center md:items-start md:pl-8 pt-6 md:pt-0">
                <MapPin className="w-8 h-8 text-[#c25a3a] mb-4" />
                <h3 className="text-lg font-bold mb-2 font-serif">Delivery Areas</h3>
                <p className="text-gray-500 text-sm">Currently delivering across all major city pin codes.</p>
              </div>
              <div className="flex flex-col items-center md:items-start md:pl-8 pt-6 md:pt-0">
                <ShieldCheck className="w-8 h-8 text-[#4a7c59] mb-4" />
                <h3 className="text-lg font-bold mb-2 font-serif">Freshness Guarantee</h3>
                <p className="text-gray-500 text-sm">100% replacement if produce is not fresh upon arrival.</p>
              </div>
              <div className="flex flex-col items-center md:items-start md:pl-8 pt-6 md:pt-0">
                <Truck className="w-8 h-8 text-[#c25a3a] mb-4" />
                <h3 className="text-lg font-bold mb-2 font-serif">Fast Dispatch</h3>
                <p className="text-gray-500 text-sm">Orders are processed within 2 hours of placement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="space-y-8 pt-8 border-t border-[#e8e3d3]/50">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <span className="text-xs font-bold text-[#4a7c59] uppercase tracking-widest block">
              Our News & Articles
            </span>
            <h2 className="text-3xl font-serif text-[#1e3b2b] sm:text-4xl">
              Latest From Our Blog
            </h2>
            <div className="w-16 h-0.5 bg-[#4a7c59] mx-auto"></div>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Stay updated with fresh nutrition guides, agricultural stories from our local farms, and wholesome health tips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-8 pt-12 pb-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
            <h2 className="text-3xl font-serif text-[#1e3b2b] sm:text-4xl font-bold">
              Common Inquiries
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsam voluptatibus quisquam.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-[#fafafa] transition-colors hover:bg-gray-100"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="text-gray-700 font-medium text-[15px] sm:text-base">{faq.question}</span>
                  <span className="text-gray-400 font-light text-xl ml-4">
                    {activeFaq === index ? '-' : '+'}
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="px-6 pb-5 text-gray-500 text-sm sm:text-[15px] leading-relaxed border-t border-gray-200/60 pt-4 mt-1 mx-2">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
