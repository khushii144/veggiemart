'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

const fallbackImage =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=900&auto=format&fit=crop';

/* ── quantity options per vegetable type ─────────────────────── */
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
  chilli:      ['100 g', '250 g'],
  ginger:      ['100 g', '250 g'],
};

const defaultOptions = ['250 g', '500 g', '1 kg'];

/* ── helpers ─────────────────────────────────────────────────── */
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
  if (v.includes('chilli')   || v.includes('chili'))   return 'chilli';
  if (v.includes('ginger'))                             return 'ginger';
  return null;
}

function getQuantityOptions(name) {
  const type = getVegetableType(name);
  return type ? quantityOptions[type] : defaultOptions;
}

/* Derive MRP from the stored selling price + discount saved on the product */
function calcPrices(price, discountPct) {
  const pct      = Number(discountPct) || 0;
  const yourPrice = Number(price);
  if (pct <= 0) return { yourPrice, mrp: null, saving: 0, pct: 0 };
  const mrp    = Math.round(yourPrice / (1 - pct / 100));
  const saving = mrp - yourPrice;
  return { yourPrice, mrp, saving, pct };
}

/* ── component ───────────────────────────────────────────────── */
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imgSrc, setImgSrc]   = useState(product.image || fallbackImage);
  const options               = getQuantityOptions(product.name);
  const [qty, setQty]         = useState(options[0]);
  const { yourPrice, mrp, saving, pct } = calcPrices(product.price, product.discount);

  return (
    <div style={styles.card}>
      {/* ── discount ribbon ──────────────────────────────────── */}
      {pct > 0 && (
        <div style={styles.ribbon}>{pct}% OFF</div>
      )}

      {/* ── product image ────────────────────────────────────── */}
      <div style={styles.imageWrap}>
        <img
          src={imgSrc}
          alt={product.name}
          style={styles.image}
          onError={() => setImgSrc(fallbackImage)}
        />
      </div>

      {/* ── body ─────────────────────────────────────────────── */}
      <div style={styles.body}>
        {/* name */}
        <h3 style={styles.name}>
          {product.name.length > 30 ? product.name.slice(0, 30) + '…' : product.name}
        </h3>

        {/* quantity dropdown row */}
        <div style={styles.qtyRow}>
          <select
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={styles.qtySelect}
          >
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <span style={styles.greenDot} />
        </div>

        {/* price row */}
        <div style={styles.priceRow}>
          <span style={styles.yourPrice}>₹{yourPrice}</span>
          {pct > 0 && <span style={styles.yourPriceBadge}>your price</span>}
        </div>
        {mrp !== null && (
          <div style={styles.mrpRow}>
            <span style={styles.mrpLabel}>M.R.P </span>
            <span style={styles.mrp}>₹{mrp}</span>
            <span style={styles.discountNote}> ({pct}% off)</span>
          </div>
        )}

        {/* savings pill */}
        {saving > 0 && <div style={styles.savePill}>Save ₹{saving}</div>}

        {/* delivery area */}
        <button style={styles.deliveryLink}>Select delivery area</button>

        {/* divider */}
        <hr style={styles.divider} />

        {/* add to cart button */}
        <button
          onClick={() => addToCart({ ...product, qty })}
          style={styles.cartBtn}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e6a800')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#f5b800')}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/* ── styles (inline to be self-contained) ────────────────────── */
const styles = {
  card: {
    position:      'relative',
    background:    '#fff',
    border:        '1px solid #e5e7eb',
    borderRadius:  '8px',
    overflow:      'hidden',
    display:       'flex',
    flexDirection: 'column',
    width:         '100%',
    maxWidth:      '220px',
    fontFamily:    "'Inter', 'Segoe UI', sans-serif",
    boxShadow:     '0 1px 4px rgba(0,0,0,.07)',
    transition:    'box-shadow .2s ease, transform .2s ease',
  },

  /* red ribbon */
  ribbon: {
    position:   'absolute',
    top:        '10px',
    left:       '-2px',
    background: '#e53e3e',
    color:      '#fff',
    fontSize:   '11px',
    fontWeight: '700',
    padding:    '3px 8px 3px 6px',
    borderRadius: '0 3px 3px 0',
    letterSpacing: '.4px',
    zIndex:     10,
  },

  /* image */
  imageWrap: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    background:      '#fff',
    padding:         '20px 16px 8px',
    height:          '140px',
  },
  image: {
    maxHeight:  '120px',
    maxWidth:   '140px',
    objectFit: 'contain',
  },

  /* body */
  body: {
    display:       'flex',
    flexDirection: 'column',
    padding:       '10px 14px 0',
    gap:           '6px',
  },

  name: {
    fontSize:   '14px',
    fontWeight: '700',
    color:      '#1a1a1a',
    margin:     '0',
    lineHeight: '1.3',
  },

  /* quantity row */
  qtyRow: {
    display:     'flex',
    alignItems:  'center',
    gap:         '8px',
    marginTop:   '2px',
  },
  qtySelect: {
    flex:          1,
    padding:       '5px 8px',
    fontSize:      '13px',
    border:        '1px solid #d1d5db',
    borderRadius:  '4px',
    background:    '#fff',
    color:         '#374151',
    cursor:        'pointer',
    outline:       'none',
    appearance:    'auto',
  },
  greenDot: {
    width:        '12px',
    height:       '12px',
    borderRadius: '50%',
    background:   '#22c55e',
    flexShrink:   0,
    border:       '2px solid #16a34a',
  },

  /* price */
  priceRow: {
    display:    'flex',
    alignItems: 'center',
    gap:        '6px',
    marginTop:  '2px',
  },
  yourPrice: {
    fontSize:   '18px',
    fontWeight: '800',
    color:      '#111827',
  },
  yourPriceBadge: {
    background:   '#16a34a',
    color:        '#fff',
    fontSize:     '10px',
    fontWeight:   '700',
    padding:      '2px 6px',
    borderRadius: '3px',
    letterSpacing: '.3px',
  },

  mrpRow: {
    fontSize: '12px',
    color:    '#6b7280',
  },
  mrpLabel: {
    color: '#6b7280',
  },
  mrp: {
    textDecoration: 'line-through',
    color:          '#9ca3af',
  },
  discountNote: {
    color: '#6b7280',
  },

  /* savings pill */
  savePill: {
    display:      'inline-block',
    background:   '#f3f4f6',
    color:        '#374151',
    fontSize:     '11px',
    fontWeight:   '600',
    padding:      '3px 10px',
    borderRadius: '20px',
    alignSelf:    'flex-start',
    border:       '1px solid #e5e7eb',
  },

  /* delivery link */
  deliveryLink: {
    background:  'none',
    border:      'none',
    padding:     '0',
    fontSize:    '12px',
    color:       '#6b7280',
    cursor:      'pointer',
    textAlign:   'left',
    textDecoration: 'underline',
    fontFamily:  'inherit',
  },

  divider: {
    border:     'none',
    borderTop:  '1px solid #f3f4f6',
    margin:     '4px 0 0',
  },

  /* add to cart */
  cartBtn: {
    width:        'calc(100% + 28px)',
    marginLeft:   '-14px',
    padding:      '13px 0',
    background:   '#f5b800',
    color:        '#1a1a1a',
    border:       'none',
    fontSize:     '14px',
    fontWeight:   '700',
    cursor:       'pointer',
    letterSpacing: '.3px',
    transition:   'background .15s ease',
  },
};
