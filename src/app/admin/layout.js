export const dynamic = 'force-dynamic';

import AdminLayoutClient from './AdminLayoutClient';

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
