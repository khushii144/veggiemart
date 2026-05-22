'use client';
export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Edit2, Loader2, Package, Plus, Trash2 } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

const emptyForm = {
  name: '',
  price: '',
  discount: '0',
  stock: '50',
  description: '',
  image: '',
  categorySlug: '',
};

const ITEMS_PER_PAGE = 10;

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, products]);

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

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      const activeCategories = Array.isArray(data) ? data.filter((category) => category.isActive) : [];
      setCategories(activeCategories);
      setFormData((current) => ({
        ...current,
        categorySlug: current.categorySlug || activeCategories[0]?.slug || '',
      }));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchProducts();
      fetchCategories();
      return;
    }

    router.push('/');
  }, [fetchCategories, fetchProducts, router, session, status]);

  const resetForm = () => {
    setEditingProductId(null);
    setFormData(emptyForm);
  };

  const openAddModal = () => {
    resetForm();
    setFormData({ ...emptyForm, categorySlug: categories[0]?.slug || '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name || '',
      price: String(product.price ?? ''),
      discount: String(product.discount ?? '0'),
      stock: String(product.stock ?? '0'),
      description: product.description || '',
      image: product.image || '',
      categorySlug: product.categorySlug || categories.find((category) => category.name === product.category)?.slug || '',
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
        category: categories.find((category) => category.slug === formData.categorySlug)?.name || '',
        price: parseFloat(formData.price),
        discount: Math.min(100, Math.max(0, parseFloat(formData.discount) || 0)),
        stock: Math.max(1, parseInt(formData.stock, 10) || 50),
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
      setCurrentPage((page) => {
        const nextTotal = products.length - 1;
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / ITEMS_PER_PAGE));
        return Math.min(page, nextTotalPages);
      });
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
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
          <Package className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
          Product Management
        </h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-green-700 sm:px-6"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm sm:rounded-[2rem]">
        <div className="space-y-4 p-4 lg:hidden">
          {paginatedProducts.map((product) => (
            <div
              key={product._id}
              className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-gray-950">{product.name}</h2>
                <p className="mt-2 text-lg font-black text-gray-950">Rs. {Number(product.price).toFixed(2)}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-green-700">
                    {product.category}
                  </span>
                  {product.discount > 0 && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black text-red-600">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(product)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-orange-600 transition hover:bg-orange-50"
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product._id}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Delete ${product.name}`}
                >
                  {deletingId === product._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left min-w-[800px]">
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
              {paginatedProducts.map((product) => (
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
        <AdminPagination
          currentPage={currentPage}
          itemName="products"
          onPageChange={setCurrentPage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={products.length}
        />
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
                  value={formData.categorySlug}
                  onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                  required
                >
                  {categories.length === 0 ? (
                    <option value="">Create a category first</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category._id} value={category.slug}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Stock quantity"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />

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
