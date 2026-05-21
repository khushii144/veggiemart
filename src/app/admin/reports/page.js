'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') return <div className="p-8 text-center text-gray-500">Loading reports...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            System Reports
          </h1>
          <p className="text-gray-500 mt-1">Generate and export detailed business reports.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
            <Download className="w-4 h-4 text-green-600" />
            Export Excel
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <Filter className="w-4 h-4" /> Filter Options:
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-indigo-500">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <select className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-indigo-500">
            <option>All Categories</option>
            <option>Sales Reports</option>
            <option>Inventory Reports</option>
            <option>Customer Reports</option>
          </select>
          <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition w-full">
            Generate Report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Generate</h3>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Select your filter options above and click generate to view the report preview here before exporting.</p>
      </div>
    </div>
  );
}
