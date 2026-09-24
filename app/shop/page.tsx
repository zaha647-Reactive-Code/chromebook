import '@/styles/shop-base.css';
import '@/styles/pill.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import ShopView from './ShopView';
import Effects from '@/components/Effects';
import { getProducts, publicProduct } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Shop Chromebooks & accessories',
  description: 'Shop new and certified refurbished Chromebooks, plus headphones, mice, keyboards, styluses, sleeves and chargers. Free delivery across Pakistan.',
  alternates: { canonical: '/shop' },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const products = (await getProducts()).map(publicProduct);
  return (
    <>
      <ShopView products={products} initial={{ cat: sp.cat || 'all', sub: sp.sub || 'all', q: sp.q || '' }} />
      <Effects />
    </>
  );
}
