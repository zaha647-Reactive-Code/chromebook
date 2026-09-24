import '@/styles/shop-base.css';
import '@/styles/pill.css';
import '@/styles/order.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import TrackForm from './TrackForm';

export const metadata: Metadata = { title: 'Track an order', robots: { index: false, follow: true } };

export default function TrackPage() {
  return (
    <main className="pg" style={{ paddingTop: 44 }}>
      <div className="or-head">
        <span className="hero-kicker" style={{ opacity: 1, animation: 'none' }}>Order tracking</span>
        <h1>Track your <span className="accent">order</span></h1>
        <p>Enter the order number from your confirmation and the mobile number you used. Signed in? Your orders are also in <a href="/account" style={{ color: 'var(--rose-deep)', fontWeight: 600 }}>My account</a>.</p>
      </div>
      <TrackForm />
    </main>
  );
}
