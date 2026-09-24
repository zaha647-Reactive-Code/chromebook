import '@/styles/shop-base.css';
import '@/styles/pill.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import CartView from './CartView';

export const metadata: Metadata = { title: 'Cart', robots: { index: false, follow: false } };
export default function CartPage() { return <CartView />; }
