'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, Truck, ShieldCheck, Leaf, ArrowLeft, 
  ChevronRight, Calendar, Home, CheckCircle2, Clock 
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const fallbackImage =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=900&auto=format&fit=crop';

const quantityOptions = {
  cabbage:     ['400-500 g', '800 g-1 kg'],
  tomato:      ['500 g', '1 kg', '2 kg'],
  spinach:     ['1 Bunch', '2 Bunch'],
  carrot:      ['500 g', '1 kg'],
  eggplant:    ['500 g', '1 kg'],
  pepper:      ['250 g', '500 g'],
  broccoli:    ['1 Piece', '2 Piece'],
  onion:       ['500 g', '1 kg', '2 kg'],
  potato:      ['500 g', '1 kg', '2 kg'],
  cauliflower: ['1 Piece', '2 Piece'],
  arhar:       ['500 g', '1 kg', '2 kg'],
  chilli:      ['100 g', '250 g'],
  ginger:      ['100 g', '250 g'],
};

const defaultOptions = ['250 g', '500 g', '1 kg'];

function getVegetableType(name) {
  const v = name.toLowerCase();
  if (v.includes('tomato'))                             return 'tomato';
  if (v.includes('cabbage'))                            return 'cabbage';
  if (v.includes('spinach'))                            return 'spinach';
  if (v.includes('carrot'))                             return 'carrot';
  if (v.includes('eggplant') || v.includes('brinjal')) return 'eggplant';
  if (v.includes('pepper')   || v.includes('capsicum'))return 'pepper';
  if (v.includes('broccoli'))                           return 'broccoli';
  if (v.includes('onion'))                              return 'onion';
  if (v.includes('potato'))                             return 'potato';
  if (v.includes('cauliflower'))                        return 'cauliflower';
  if (v.includes('arhar') || v.includes('toor dal'))    return 'arhar';
  if (v.includes('chilli')   || v.includes('chili'))   return 'chilli';
  if (v.includes('ginger'))                             return 'ginger';
  return null;
}

function getQuantityOptions(name) {
  const type = getVegetableType(name);
  return type ? quantityOptions[type] : defaultOptions;
}

function calcPrices(price, discountPct) {
  const pct      = Number(discountPct) || 0;
  const yourPrice = Number(price);
  if (pct <= 0) return { yourPrice, mrp: null, saving: 0, pct: 0 };
  const mrp    = Math.round(yourPrice / (1 - pct / 100));
  const saving = mrp - yourPrice;
  return { yourPrice, mrp, saving, pct };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(fallbackImage);
  const [qty, setQty] = useState('');
  
  // Subscription modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subFreq, setSubFreq] = useState('weekly');
  const [subQty, setSubQty] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('Monday');

  useEffect(() => {
    setDeliveryDate(subFreq === 'weekly' ? 'Monday' : '1st of the month');
  }, [subFreq]);

  useEffect(() => {
    if (!params.id) return;

    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Fetch current product
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
        setImgSrc(data.image || fallbackImage);
        
        const options = getQuantityOptions(data.name);
        setQty(options[0]);

        // Fetch related products for bottom carousel
        const allRes = await fetch('/api/products');
        if (allRes.ok) {
          const allData = await allRes.json();
          const filtered = (Array.isArray(allData) ? allData : [])
            .filter((p) => p._id !== params.id)
            .sort((a, b) => {
              const aMatches = a.categorySlug === data.categorySlug || a.category === data.category;
              const bMatches = b.categorySlug === data.categorySlug || b.category === data.category;
              return Number(bMatches) - Number(aMatches);
            })
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-[90rem] mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-semibold text-sm">Harvesting product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[90rem] mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900">Product Not Found</h2>
        <p className="text-gray-500 mt-2">The vegetable you are looking for is currently out of stock or does not exist.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 hover:bg-green-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>
    );
  }

  const { yourPrice, mrp, saving, pct } = calcPrices(product.price, product.discount);
  const options = getQuantityOptions(product.name);
  const stockCount = Number(product.stock) || 0;
  const inStock = stockCount > 0;

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: subQty,
          frequency: subFreq,
          deliveryDate: deliveryDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Save locally
      const newSubscription = {
        id: data.subscription?._id || Date.now().toString(),
        productId: product._id,
        productName: product.name,
        image: imgSrc,
        size: qty,
        quantity: subQty,
        frequency: subFreq,
        deliveryDate: deliveryDate,
        price: Math.round(yourPrice * subQty * (subFreq === 'weekly' ? 0.9 : 0.85)),
        createdAt: new Date().toISOString()
      };
      
      const existing = JSON.parse(localStorage.getItem('veggiemart_subscriptions') || '[]');
      existing.push(newSubscription);
      localStorage.setItem('veggiemart_subscriptions', JSON.stringify(existing));
      
      alert(`Successfully subscribed to ${product.name}!`);
      setIsModalOpen(false);
    } catch (err) {
      alert(`Subscription failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-12 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
        <Link href="/" className="hover:text-green-600 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-gray-400">Products</span>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-gray-900 font-extrabold">{product.name}</span>
      </div>

      {/* Main product presentation columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 border border-gray-100 shadow-sm">
        
        {/* Left Column: Image Gallery View */}
        <div className="flex flex-col space-y-4">
          <div className="relative aspect-square w-full bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-8 group">
            {pct > 0 && (
              <span className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 z-10">
                {pct}% Discount
              </span>
            )}
            <img
              src={imgSrc}
              alt={product.name}
              className="object-contain max-h-[400px] max-w-full transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgSrc(fallbackImage)}
            />
          </div>
          
          {/* Farm-fresh assurance cards */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="border border-gray-100 p-3.5 text-center bg-gray-50/50 space-y-1">
              <Leaf className="w-5 h-5 text-green-600 mx-auto" />
              <div className="text-[10px] font-black uppercase text-gray-800">100% Organic</div>
            </div>
            <div className="border border-gray-100 p-3.5 text-center bg-gray-50/50 space-y-1">
              <Truck className="w-5 h-5 text-orange-500 mx-auto" />
              <div className="text-[10px] font-black uppercase text-gray-800">2-Hour Delivery</div>
            </div>
            <div className="border border-gray-100 p-3.5 text-center bg-gray-50/50 space-y-1">
              <ShieldCheck className="w-5 h-5 text-blue-500 mx-auto" />
              <div className="text-[10px] font-black uppercase text-gray-800">Quality Checked</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Pricing & Action Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category tag */}
            <span className="text-xs font-black text-green-600 uppercase tracking-widest block">
              {product.category || 'Fresh Organic Vegetables'}
            </span>
            <span className={`inline-flex w-fit px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {inStock ? `${stockCount} in stock` : 'Out of stock'}
            </span>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="border-y border-gray-150 py-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-gray-900">₹{yourPrice}</span>
                {pct > 0 && (
                  <span className="bg-green-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">
                    Your Special Price
                  </span>
                )}
              </div>
              {mrp !== null && (
                <div className="text-xs sm:text-sm text-gray-500 font-semibold flex items-center gap-2">
                  <span>M.R.P:</span>
                  <span className="line-through text-gray-400">₹{mrp}</span>
                  <span className="text-orange-500 font-bold">({pct}% off)</span>
                </div>
              )}
              {saving > 0 && (
                <div className="inline-flex bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-3 py-1">
                  You Save ₹{saving} on this pack!
                </div>
              )}
            </div>

            {/* Size/Pack selection */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">
                Select Pack Size / Quantity
              </span>
              <div className="flex items-center gap-3 max-w-xs">
                <select
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 focus:border-green-500 focus:bg-white outline-none"
                >
                  {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <span className="w-3.5 h-3.5 rounded-full bg-green-500 shrink-0 border-2 border-green-600" />
              </div>
            </div>

            {/* Description/Content */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">
                Product Overview & Nutrition Values
              </span>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-semibold">
                {product.description || `Handpicked ${product.name} sourced directly from verified organic farms in local crop belts. Cultivated using sustainable regenerative agricultural standards to preserve high mineral density and standard vitamin count. Delivered in raw, fresh state to prolong structural shelf-life.`}
              </p>
            </div>

          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-6 border-t border-gray-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Add to Cart button */}
              <button
                onClick={() => addToCart({ ...product, qty })}
                disabled={!inStock}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-widest py-4 transition-all duration-200 shadow-sm disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <ShoppingCart className="w-4 h-4" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {/* Subscribe & Save button */}
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!inStock}
                className="flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 bg-white hover:bg-green-50 font-extrabold text-xs uppercase tracking-widest py-4 transition-all duration-200 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
              >
                <Calendar className="w-4 h-4" />
                Subscribe & Save
              </button>

            </div>
            
            {/* Safe Delivery Assurance note */}
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
              ⚡ Free immediate door delivery on orders above ₹100
            </p>
          </div>

        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <div>
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest block">
              More Fresh Choices
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 uppercase">
              You Might Also Like
            </h2>
          </div>
          
          <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Subscription Modal Integration */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 max-w-md w-full relative space-y-6 shadow-2xl animate-fadeIn">
            
            {/* Modal Close */}
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>

            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase">Wholesale Subscription</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">Set up recurring fresh deliveries of {product.name}</p>
            </div>

            {/* Product preview */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 border border-gray-100">
              <div className="relative w-16 h-16 bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center">
                <img src={imgSrc} alt={product.name} className="object-contain max-h-[50px] max-w-full" />
              </div>
              <div>
                <div className="text-xs font-black text-gray-900 uppercase">{product.name}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Pack Size: {qty}</div>
                <div className="text-xs font-extrabold text-green-600 mt-1">₹{yourPrice} / pack</div>
              </div>
            </div>

            {/* Quantity select */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Quantity (Packs)</span>
              <div className="flex items-center gap-4 bg-gray-100 p-1.5 self-start w-fit">
                <button 
                  onClick={() => setSubQty(q => Math.max(1, q - 1))} 
                  className="w-8 h-8 bg-white border-none text-gray-800 font-bold text-lg flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-sm font-black text-gray-900 w-6 text-center">{subQty}</span>
                <button 
                  onClick={() => setSubQty(q => q + 1)} 
                  className="w-8 h-8 bg-white border-none text-gray-800 font-bold text-lg flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Frequency options */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Delivery Frequency</span>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setSubFreq('weekly')}
                  className={`border-2 p-3 text-center cursor-pointer transition-all ${
                    subFreq === 'weekly' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-gray-900">Weekly</div>
                  <div className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">Save 10% Extra</div>
                </div>
                <div 
                  onClick={() => setSubFreq('monthly')}
                  className={`border-2 p-3 text-center cursor-pointer transition-all ${
                    subFreq === 'monthly' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-gray-900">Monthly</div>
                  <div className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">Save 15% Extra</div>
                </div>
              </div>
            </div>

            {/* Preferred Delivery date select */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Preferred Delivery Day / Date</span>
              <select
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 outline-none"
              >
                {subFreq === 'weekly' ? (
                  <>
                    <option value="Monday">Monday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Friday">Friday</option>
                  </>
                ) : (
                  <>
                    <option value="1st of the month">1st of the month</option>
                    <option value="10th of the month">10th of the month</option>
                    <option value="20th of the month">20th of the month</option>
                  </>
                )}
              </select>
            </div>

            {/* Pricing Summary block */}
            <div className="bg-gray-50 p-4 border border-gray-100 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 font-semibold">
                <span>Base Price ({subQty} x ₹{yourPrice}):</span>
                <span>₹{yourPrice * subQty}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-semibold">
                <span>Subscription Discount ({subFreq === 'weekly' ? '10%' : '15%'}):</span>
                <span className="text-green-600">-₹{Math.round(yourPrice * subQty * (subFreq === 'weekly' ? 0.1 : 0.15))}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-sm font-black uppercase text-gray-900">
                <span>Recurring Price:</span>
                <span className="text-green-600">₹{Math.round(yourPrice * subQty * (subFreq === 'weekly' ? 0.9 : 0.85))}</span>
              </div>
            </div>

            {/* Confirm subscription */}
            <button 
              onClick={handleSubscribe}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-md shadow-green-600/10 transition-colors"
            >
              Confirm Subscription
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
