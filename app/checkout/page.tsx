import '@/styles/shop-base.css';
import '@/styles/pill.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import CheckoutView from './CheckoutView';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return <CheckoutView buy={sp.buy || ''} buyQty={Math.max(1, parseInt(sp.qty || '1', 10) || 1)} />;
}
