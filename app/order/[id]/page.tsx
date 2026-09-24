import '@/styles/shop-base.css';
import '@/styles/pill.css';
import '@/styles/order.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import { timingSafeEqual } from 'node:crypto';
import { adminDb, adminReady } from '@/lib/firebase-admin';
import { getSettings } from '@/lib/catalog';
import OrderView from './OrderView';
import TrackForm from '@/app/track/TrackForm';

export const metadata: Metadata = { title: 'Your order', robots: { index: false, follow: false } };

const same = (a: string, b: string) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

/* The order page opens only with the private link from the confirmation / email
   (?t=…), or after the customer confirms the phone number used for the order. */
export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const orderId = decodeURIComponent(id).toUpperCase();

  let order: any = null;
  if (adminReady() && sp.t) {
    const snap = await adminDb().collection('orders').doc(orderId).get();
    if (snap.exists && snap.data()?.viewToken && same(snap.data()!.viewToken, sp.t)) order = snap.data();
  }
  if (!order) {
    return (
      <main className="pg" style={{ paddingTop: 44 }}>
        <div className="or-head">
          <span className="hero-kicker" style={{ opacity: 1, animation: 'none' }}>Order tracking</span>
          <h1>Check your <span className="accent">order</span></h1>
          <p>To keep your details private, please confirm the mobile number you used for order <b>{orderId}</b>.</p>
        </div>
        <TrackForm defaultId={orderId} />
      </main>
    );
  }
  const settings = await getSettings();
  const { viewToken, ...safe } = order;
  const c = safe.customer || {};
  return <OrderView order={{ ...safe, customer: { name: c.name, phone: c.phone, email: c.email, city: c.city, area: c.area, address: c.address, notes: c.notes } }}
    token={viewToken} isNew={sp.new === '1'} settings={{ whatsapp: settings.whatsapp, whatsappDisplay: settings.whatsappDisplay, bank: settings.bank, email: settings.email, unpaidHoldHours: settings.unpaidHoldHours }} />;
}
