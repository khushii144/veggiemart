export const dynamic = 'force-dynamic';

import AdminLayoutClient from './AdminLayoutClient';

export default function AdminLayout({ children }) {
<<<<<<< HEAD
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="w-full min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
=======
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
>>>>>>> 02f19d15883a62fed77e45597c2f0b668055cf99
}
