'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Edit2, Loader2, Package, Plus, Trash2 } from 'lucide-react';

const emptyForm = {
  name: '',
  price: '',
  discount: '0',
  description: '',
  image: '',
  category: 'Vegetables',
};

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchProducts();
      return;
    }

    router.push('/');
  }, [fetchProducts, router, session, status]);

  const resetForm = () => {
    setEditingProductId(null);
    setFormData(emptyForm);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name || '',
      price: String(product.price ?? ''),
      discount: String(product.discount ?? '0'),
      description: product.description || '',
      image: product.image || '',
      category: product.category || 'Vegetables',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discount: Math.min(100, Math.max(0, parseFloat(formData.discount) || 0)),
        ...(editingProductId && { _id: editingProductId }),
      };

      const res = await fetch('/api/products', {
        method: editingProductId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to save product');
        return;
      }

      closeModal();
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const shouldDelete = window.confirm(`Delete "${product.name}"?`);
    if (!shouldDelete) return;

    setDeletingId(product._id);
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(product._id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to delete product');
        return;
      }

      setProducts((currentProducts) => currentProducts.filter((item) => item._id !== product._id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && products.length === 0) {
    return <div className="text-center py-20">Loading products...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="w-8 h-8 text-green-600" />
          Product Management
        </h1>
        <button
          onClick={openAddModal}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-green-100"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-6 font-bold text-gray-600">Product</th>
              <th className="px-8 py-6 font-bold text-gray-600">Category</th>
              <th className="px-8 py-6 font-bold text-gray-600">Price</th>
              <th className="px-8 py-6 font-bold text-gray-600">Discount</th>
              <th className="px-8 py-6 font-bold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm bg-gray-50">
                      <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <span className="font-bold text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                </td>
                <td className="px-8 py-6 font-bold text-gray-900">Rs. {Number(product.price).toFixed(2)}</td>
                <td className="px-8 py-6">
                  {product.discount > 0 ? (
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                      {product.discount}% OFF
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">No offer</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product._id}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Delete ${product.name}`}
                    >
                      {deletingId === product._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold mb-6">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price (₹)"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <select
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Greens">Greens</option>
                  <option value="Fruits">Fruits</option>
                </select>
              </div>

              {/* ── Offer / Discount section ── */}
              <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3">🏷️ Offer / Discount</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="0"
                      className="w-full p-4 pr-10 bg-white border border-red-100 rounded-2xl outline-none focus:border-red-400 transition-colors text-gray-800 font-semibold"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 font-bold text-sm">%</span>
                  </div>
                  <div className="text-sm text-gray-500 leading-snug">
                    {formData.discount > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-full">
                        <span>🔥</span> {formData.discount}% OFF applied
                      </span>
                    ) : (
                      <span className="text-gray-400">No discount</span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  Enter 0 to show no offer. Max 100.
                </p>
              </div>
              <input
                type="text"
                placeholder="Image URL"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none h-32"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
