import { randomBytes } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, adminReady, adminReason } from '@/lib/firebase-admin';
import { getSettings } from '@/lib/catalog';
import { OrderInput, callerUid, clientIp, esc, json, normalisePhone, rateLimited, sendMail } from '@/lib/server-utils';

/* POST /api/orders — creates an order (report 6.7).
   The browser sends ONLY product ids, quantities and contact details.
   The server looks up the real prices and stock, and in one transaction lowers
   the stock and saves the order. Prices sent by a browser are never trusted. */

const money = (n: number) => 'Rs ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export async function POST(req: Request) {
  if (rateLimited('order:' + clientIp(req), 6, 10 * 60 * 1000))
    return json({ error: 'Too many orders from this connection. Please wait a few minutes or contact us.' }, 429);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const parsed = OrderInput.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return json({ error: first?.message || 'Please check your details.', field: first?.path?.join('.') }, 400);
  }
  const { items, customer } = parsed.data;
  if (!adminReady()) {
    console.error('[orders] ' + adminReason());
    return json({ error: 'Ordering is not connected yet. Please contact us on WhatsApp to place your order.' }, 503);
  }

  // merge duplicate lines
  const qty = new Map<string, number>();
  items.forEach((l) => qty.set(l.id, Math.min(99, (qty.get(l.id) || 0) + l.qty)));

  const caller = await callerUid(req);
  const settings = await getSettings();
  const db = adminDb();
  const now = new Date();
  const stamp = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
  const viewToken = randomBytes(18).toString('hex');

  try {
    const order = await db.runTransaction(async (tx) => {
      const refs = [...qty.keys()].map((id) => db.collection('products').doc(id));
      const snaps = await Promise.all(refs.map((r) => tx.get(r)));
      const problems: { id: string; name: string; available: number }[] = [];
      const lines = snaps.map((s) => {
        const d: any = s.data();
        const want = qty.get(s.id)!;
        if (!s.exists || d.active === false) { problems.push({ id: s.id, name: d?.name || s.id, available: 0 }); return null; }
        const stock = Math.max(0, Math.round(Number(d.stockQty) || 0));
        if (stock < want) problems.push({ id: s.id, name: d.name, available: stock });
        return { ref: s.ref, id: s.id, name: d.name, image: d.image || '', price: Math.round(Number(d.price) || 0), qty: want };
      });
      if (problems.length) { const e: any = new Error('stock'); e.problems = problems; throw e; }

      // unique, readable order number
      let id = '';
      for (let i = 0; i < 6; i++) {
        const cand = 'MCB-' + stamp + '-' + (1000 + Math.floor(Math.random() * 9000));
        const ex = await tx.get(db.collection('orders').doc(cand));
        if (!ex.exists) { id = cand; break; }
      }
      if (!id) throw new Error('Could not create an order number.');

      const ok = lines.filter(Boolean) as NonNullable<(typeof lines)[number]>[];
      const subtotal = ok.reduce((a, l) => a + l.price * l.qty, 0);
      const delivery = Number(settings.deliveryFee) || 0;
      const data = {
        id, createdAt: now.toISOString(), status: 'awaiting', payment: 'bank',
        customer: { ...customer, phoneNormalised: normalisePhone(customer.phone) },
        items: ok.map(({ id: pid, name, image, price, qty: q }) => ({ id: pid, name, image, price, qty: q })),
        subtotal, delivery, total: subtotal + delivery,
        history: [{ status: 'awaiting', at: now.toISOString() }],
        userId: caller?.uid || null,
        viewToken,
        holdUntil: new Date(now.getTime() + (settings.unpaidHoldHours || 48) * 3600 * 1000).toISOString(),
      };
      ok.forEach((l) => tx.update(l.ref, { stockQty: FieldValue.increment(-l.qty), updatedAt: now }));
      tx.set(db.collection('orders').doc(id), data);
      return data;
    });

    /* ---- email alerts (never block the order) ---- */
    const rows = order.items.map((i) => `<tr><td>${esc(i.name)}</td><td align="center">${i.qty}</td><td align="right">${money(i.price * i.qty)}</td></tr>`).join('');
    const c = order.customer;
    const site = process.env.NEXT_PUBLIC_SITE_URL || '';
    const table = `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows}<tr><td colspan="2"><b>Total</b></td><td align="right"><b>${money(order.total)}</b></td></tr></table>`;
    const to = process.env.ALERT_EMAIL_TO || settings.email;
    await Promise.all([
      sendMail(to, `New order ${order.id} — ${money(order.total)}`,
        `<h2>New order ${esc(order.id)}</h2>${table}<p><b>${esc(c.name)}</b><br>${esc(c.phone)}<br>${esc(c.email)}<br>${esc(c.address)}${c.area ? ', ' + esc(c.area) : ''}, ${esc(c.city)}${c.notes ? '<br><i>' + esc(c.notes) + '</i>' : ''}</p><p>Status: awaiting payment verification.</p>`,
        `New order ${order.id}\n${order.items.map((i) => `${i.name} x ${i.qty}`).join('\n')}\nTotal ${money(order.total)}\n${c.name} ${c.phone} ${c.email}\n${c.address}, ${c.city}`),
      sendMail(c.email, `Your MyChromebook.pk order ${order.id}`,
        `<h2>Thank you, ${esc(c.name.split(' ')[0])}!</h2><p>We have received your order <b>${esc(order.id)}</b>.</p>${table}<p>Please transfer <b>${money(order.total)}</b> to the bank account shown on your order page and send the payment screenshot to us on WhatsApp with your order number.</p><p><a href="${site}/order/${encodeURIComponent(order.id)}?t=${order.viewToken}">View your order</a></p>`,
        `Thank you! Order ${order.id}. Total ${money(order.total)}. View it: ${site}/order/${order.id}?t=${order.viewToken}`),
    ]);

    return json({ id: order.id, token: order.viewToken }, 201);
  } catch (e: any) {
    if (e?.message === 'stock') {
      return json({ error: 'Some items are no longer available in the quantity you chose.', problems: e.problems }, 409);
    }
    console.error('[orders] failed', e);
    return json({ error: 'We could not place your order. Please try again, or contact us on WhatsApp.' }, 500);
  }
}
