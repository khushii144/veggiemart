'use client';
import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {children}
    </div>
  );
}
