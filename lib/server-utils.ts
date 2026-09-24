import 'server-only';
import { z } from 'zod';
import { adminDb, adminReady, adminAuth } from './firebase-admin';

/* ------------------------------------------------------------------ rate limiting
   Simple per-address limit (report 5.7). Good enough for a small shop; each server
   instance keeps its own counter. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return list.length > max;
}
export const clientIp = (req: Request) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';

export const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/* ------------------------------------------------------------------ who is calling */
export async function callerUid(req: Request): Promise<{ uid: string; admin: boolean } | null> {
  const h = req.headers.get('authorization') || '';
  if (!h.startsWith('Bearer ') || !adminReady()) return null;
  try {
    const t = await adminAuth().verifyIdToken(h.slice(7));
    return { uid: t.uid, admin: t.admin === true };
  } catch { return null; }
}

/* ------------------------------------------------------------------ input checks (Zod) */
const txt = (min: number, max: number) => z.string().trim().min(min).max(max);
const pkPhone = z.string().trim().max(20).refine((v) => /^923\d{9}$/.test(normalise(v)), 'Please enter a valid Pakistani mobile number.');
function normalise(v: string) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('0092')) d = d.slice(2);
  if (d.startsWith('0')) d = '92' + d.slice(1);
  return d;
}
export const normalisePhone = normalise;

export const OrderInput = z.object({
  items: z.array(z.object({ id: txt(1, 80).regex(/^[a-z0-9-]+$/), qty: z.number().int().min(1).max(99) })).min(1).max(30),
  customer: z.object({
    name: txt(3, 80),
    phone: pkPhone,
    email: z.string().trim().toLowerCase().email().max(120),
    city: txt(2, 60),
    area: z.string().trim().max(80).optional().default(''),
    address: txt(8, 300),
    notes: z.string().trim().max(400).optional().default(''),
  }),
  website: z.string().max(0).optional(),          // honeypot: real people leave it empty
});

export const ContactInput = z.object({
  name: txt(2, 80),
  phone: pkPhone,
  email: z.string().trim().toLowerCase().email().max(120),
  topic: txt(2, 60),
  message: txt(5, 2000),
  website: z.string().max(0).optional(),
});

export const LookupInput = z.object({
  id: txt(6, 40).transform((s) => s.toUpperCase()),
  phone: z.string().trim().max(20),
});

/* ------------------------------------------------------------------ email
   Option A: RESEND_API_KEY set → sent through Resend.
   Option B: otherwise the email is written to the "mail" collection, which the
   Firebase "Trigger Email" extension sends (if it is installed). */
export async function sendMail(to: string | string[], subject: string, html: string, text: string) {
  const list = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!list.length) return { sent: false, via: 'none' };
  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ from: process.env.ALERT_EMAIL_FROM || 'MyChromebook.pk <onboarding@resend.dev>', to: list, subject, html, text }),
      });
      if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()).slice(0, 200));
      return { sent: true, via: 'resend' };
    }
    if (adminReady()) {
      await adminDb().collection('mail').add({ to: list, message: { subject, html, text }, createdAt: new Date() });
      return { sent: true, via: 'mail-collection' };
    }
  } catch (e) { console.error('[mail] could not send', e); }
  return { sent: false, via: 'failed' };
}

export const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
