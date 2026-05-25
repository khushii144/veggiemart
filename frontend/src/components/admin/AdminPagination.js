'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminPagination({
  currentPage,
  itemName = 'items',
  onPageChange,
  pageSize,
  totalItems,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) return true;
    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
  });

  return (
    <div className="flex flex-col gap-4 border-t border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs font-bold text-gray-500">
        Showing <span className="text-gray-900">{startItem}</span> to{' '}
        <span className="text-gray-900">{endItem}</span> of{' '}
        <span className="text-gray-900">{totalItems}</span> {itemName}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-9 w-9 items-center justify-center border border-gray-200 text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-wrap items-center gap-1">
          {pages.map((page, index) => {
            const previousPage = pages[index - 1];
            const showGap = previousPage && page - previousPage > 1;

            return (
              <div key={page} className="flex items-center gap-1">
                {showGap && <span className="px-1 text-xs font-black text-gray-400">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`h-9 min-w-9 border px-3 text-xs font-black transition ${
                    currentPage === page
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50 hover:text-green-700'
                  }`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex h-9 w-9 items-center justify-center border border-gray-200 text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
