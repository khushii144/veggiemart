<<<<<<< HEAD
import { Poppins } from 'next/font/google';
=======
>>>>>>> 02f19d15883a62fed77e45597c2f0b668055cf99
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';

<<<<<<< HEAD
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

=======
>>>>>>> 02f19d15883a62fed77e45597c2f0b668055cf99
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
<<<<<<< HEAD
      <body className={`${poppins.variable} font-sans bg-gray-50 min-h-screen text-gray-900`} suppressHydrationWarning>
=======
      <body className="bg-gray-50 min-h-screen text-gray-900" suppressHydrationWarning>
>>>>>>> 02f19d15883a62fed77e45597c2f0b668055cf99
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
