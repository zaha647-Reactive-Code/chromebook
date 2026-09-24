import '@/styles/shop-base.css';
import '@/styles/pill.css';
import '@/styles/wishlist.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import WishView from './WishView';
import Effects from '@/components/Effects';

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false, follow: false } };
export default function WishlistPage() { return <><WishView /><Effects /></>; }
