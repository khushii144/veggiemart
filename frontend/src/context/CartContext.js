'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setCart(data);
        })
        .catch((err) => console.error('Error fetching cart:', err));
    } else if (status === 'unauthenticated') {
      setCart([]);
    }
  }, [status]);

  const syncCart = async (newCart) => {
    if (status !== 'authenticated') return;
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newCart }),
      });
    } catch (err) {
      console.error('Error syncing cart:', err);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product) => {
    if (status === 'unauthenticated') {
      showToast('Please login first to add items to your cart.');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    setCart((prevCart) => {
      let newCart;
      const existingItem = prevCart.find((item) => (item.productId || item._id) === product._id && item.qty === product.qty);
      if (existingItem) {
        newCart = prevCart.map((item) =>
          (item.productId || item._id) === product._id && item.qty === product.qty 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        const cartId = `${product._id}-${product.qty || 'default'}`;
        newCart = [
          ...prevCart, 
          { 
            _id: product._id, // Backward compatibility for checkout
            productId: product._id, 
            name: product.name,
            qty: product.qty,
            price: product.price,
            image: product.image || '/images/product-card-default.jpg',
            cartId, 
            quantity: 1 
          }
        ];
      }
      syncCart(newCart);
      showToast(`Added ${product.name} to cart!`);
      return newCart;
    });
  };

  const removeFromCart = (cartId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => (item.cartId ? item.cartId !== cartId : item._id !== cartId));
      syncCart(newCart);
      return newCart;
    });
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity < 1) return;
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        (item.cartId ? item.cartId === cartId : item._id === cartId) ? { ...item, quantity } : item
      );
      syncCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    syncCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
      {/* Toast Notification UI */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#16a34a',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          fontWeight: '700',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          {toastMessage}
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
