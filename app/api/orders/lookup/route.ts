import { adminDb, adminReady } from '@/lib/firebase-admin';
import { LookupInput, clientIp, json, normalisePhone, rateLimited } from '@/lib/server-utils';

/* POST /api/orders/lookup — guest order tracking with order number + phone
   (report C4). Returns a private link token only when both match. */
export async function POST(req: Request) {
  if (rateLimited('lookup:' + clientIp(req), 10, 10 * 60 * 1000))
    return json({ error: 'Too many attempts. Please wait a few minutes.' }, 429);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const parsed = LookupInput.safeParse(body);
  if (!parsed.success) return json({ error: 'Please enter your order number and phone number.' }, 400);
  if (!adminReady()) return json({ error: 'Order tracking is not connected yet. Please contact us on WhatsApp.' }, 503);

  const { id, phone } = parsed.data;
  const snap = await adminDb().collection('orders').doc(id).get();
  const d: any = snap.data();
  const ok = snap.exists && d?.customer && normalisePhone(d.customer.phone) === normalisePhone(phone);
  if (!ok) return json({ error: 'We could not find an order with that number and phone. Please check both and try again.' }, 404);
  return json({ id, token: d.viewToken });
}
