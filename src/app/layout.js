import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';

export const metadata = {
  title: 'Organic Vatika | Fresh Vegetables Delivered',
  description: 'Order fresh, organic vegetables online and get them delivered to your doorstep.',
  icons: {
    icon: [
      { url: '/logo.PNG', sizes: '16x16', type: 'image/png' },
      { url: '/logo.PNG', sizes: '32x32', type: 'image/png' },
      { url: '/logo.PNG', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.PNG',
    apple: '/logo.PNG',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className="bg-gray-50 min-h-screen text-gray-900" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <div className="flex min-h-screen flex-col">
            <main className="w-full flex-1 flex flex-col">
              <PageWrapper>{children}</PageWrapper>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
