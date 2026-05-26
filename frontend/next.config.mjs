import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Pin the Turbopack workspace root to this frontend directory so Next.js
    // doesn't get confused by the parent VeggieMart package-lock.json.
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    unoptimized: true,
  },
  allowedDevOrigins: ['localhost', '192.168.1.17', '192.168.1.15'],

  // Proxy all business API routes to the backend on port 5000.
  // /api/auth is handled by NextAuth inside the frontend — everything else goes to the backend.
  async rewrites() {
    return [
      { source: '/api/admin/run-recurring',            destination: `${backendUrl}/api/admin/run-recurring` },
      { source: '/api/categories',                     destination: `${backendUrl}/api/categories` },
      { source: '/api/cron/process-subscriptions',     destination: `${backendUrl}/api/cron/process-subscriptions` },
      { source: '/api/featured-products',              destination: `${backendUrl}/api/featured-products` },
      { source: '/api/orders',                         destination: `${backendUrl}/api/orders` },
      { source: '/api/products/:path*',                destination: `${backendUrl}/api/products/:path*` },
      { source: '/api/products',                       destination: `${backendUrl}/api/products` },
      { source: '/api/seed',                           destination: `${backendUrl}/api/seed` },
      { source: '/api/signup',                         destination: `${backendUrl}/api/signup` },
      { source: '/api/subscription/:path*',            destination: `${backendUrl}/api/subscription/:path*` },
    ];
  },
};

export default nextConfig;
