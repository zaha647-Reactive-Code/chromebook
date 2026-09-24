import type { Metadata, Viewport } from 'next';
import StoreProvider from '@/components/StoreProvider';
import AuthProvider from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartDrawer, Toast } from '@/components/CartBits';
import { getProducts, getSettings, publicProduct } from '@/lib/catalog';

export const dynamic = 'force-dynamic';   // prices and stock always come live from Firestore

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mychromebook.pk';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'MyChromebook.pk — Verified Chromebooks in Pakistan', template: '%s — MyChromebook.pk' },
  description: 'Genuine Google Chromebooks and accessories in Pakistan — official warranty, free nationwide delivery. A Google for Education partner.',
  openGraph: { type: 'website', siteName: 'MyChromebook.pk', locale: 'en_PK', images: ['/assets/chromebook-tent.jpg'] },
  twitter: { card: 'summary_large_image' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F3F4F6' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const pub = products.map(publicProduct);
  const shared = {
    deliveryFee: settings.deliveryFee, supportHours: settings.supportHours, whatsapp: settings.whatsapp,
    whatsappDisplay: settings.whatsappDisplay, email: settings.email, phoneDisplay: settings.phoneDisplay,
  };
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider products={pub} settings={shared}>
          <AuthProvider>
            <Header />
            {children}
            <Footer />
            <CartDrawer />
            <Toast />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
