'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Edit2, Loader2, Plus, Search, Tags, Trash2, X } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
  isActive: true,
};

const ITEMS_PER_PAGE = 10;

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminCategories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchCategories();
      return;
    }

    router.push('/');
  }, [fetchCategories, router, session, status]);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesQuery =
        !query ||
        category.name?.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && category.isActive) ||
        (statusFilter === 'inactive' && !category.isActive);

      return matchesQuery && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredCategories]);

  const resetForm = () => {
    setEditingCategoryId(null);
    setFormData(emptyForm);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategoryId(category._id);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image: category.image || '',
      isActive: category.isActive ?? true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const updateName = (name) => {
    setFormData((current) => ({
      ...current,
      name,
      slug: editingCategoryId ? current.slug : slugify(name),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        slug: slugify(formData.slug || formData.name),
        ...(editingCategoryId && { _id: editingCategoryId }),
      };

      const res = await fetch('/api/categories', {
        method: editingCategoryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to save category');
        return;
      }

      closeModal();
      await fetchCategories();
    } catch (error) {
      console.error(error);
      alert('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const shouldDelete = window.confirm(
      `Delete "${category.name}"? Related products will move to Uncategorized.`,
    );
    if (!shouldDelete) return;

    setDeletingId(category._id);
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(category._id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to delete category');
        return;
      }

      await fetchCategories();
      alert(`${data.message}. ${data.reassignedProducts || 0} product(s) moved to Uncategorized.`);
    } catch (error) {
      console.error(error);
      alert('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && categories.length === 0) {
    return <div className="text-center py-20">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            <Tags className="h-7 w-7 text-green-600" />
            Category Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage the same categories customers see in the Products menu.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-100 transition hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      <div className="grid gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search categories..."
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="space-y-4 p-4 lg:hidden">
          {paginatedCategories.map((category) => (
            <div
              key={category._id}
              className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <Image src={category.image || '/images/categories/all.jpg'} alt={category.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-gray-950 dark:text-white">{category.name}</h2>
                <p className="mt-1 truncate text-sm font-semibold text-gray-500 dark:text-gray-300">{category.slug}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${category.isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="line-clamp-1 text-xs font-medium text-gray-400">
                    {category.description || 'No description'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(category)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-orange-600 transition hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-900"
                  aria-label={`Edit ${category.name}`}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  disabled={deletingId === category._id}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Delete ${category.name}`}
                >
                  {deletingId === category._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">Category</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">Slug</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {paginatedCategories.map((category) => (
                <tr key={category._id} className="transition hover:bg-gray-50/80 dark:hover:bg-gray-900/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                        <Image src={category.image || '/images/categories/all.jpg'} alt={category.name} fill sizes="48px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{category.name}</p>
                        <p className="line-clamp-1 max-w-xs text-xs text-gray-500">{category.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-300">{category.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${category.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={deletingId === category._id}
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Delete ${category.name}`}
                      >
                        {deletingId === category._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="font-bold text-gray-900 dark:text-white">No categories found</p>
            <p className="mt-1 text-sm text-gray-500">Try a different search or add a new category.</p>
          </div>
        )}
        <AdminPagination
          currentPage={currentPage}
          itemName="categories"
          onPageChange={setCurrentPage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={filteredCategories.length}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-800 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingCategoryId ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                aria-label="Close category form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Category name"
                className="w-full rounded-2xl bg-gray-50 p-4 text-sm font-medium outline-none transition focus:ring-2 focus:ring-green-500/20 dark:bg-gray-900 dark:text-white"
                value={formData.name}
                onChange={(e) => updateName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="category-slug"
                className="w-full rounded-2xl bg-gray-50 p-4 text-sm font-medium outline-none transition focus:ring-2 focus:ring-green-500/20 dark:bg-gray-900 dark:text-white"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                className="w-full rounded-2xl bg-gray-50 p-4 text-sm font-medium outline-none transition focus:ring-2 focus:ring-green-500/20 dark:bg-gray-900 dark:text-white"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="h-28 w-full rounded-2xl bg-gray-50 p-4 text-sm font-medium outline-none transition focus:ring-2 focus:ring-green-500/20 dark:bg-gray-900 dark:text-white"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <label className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-sm font-bold text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 accent-green-600"
                />
                Show on user side
              </label>
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-2xl px-6 py-4 font-bold text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 font-bold text-white shadow-lg shadow-green-100 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editingCategoryId ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
