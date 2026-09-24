import { adminDb, adminReady, adminReason } from '@/lib/firebase-admin';
import { getSettings } from '@/lib/catalog';
import { ContactInput, clientIp, esc, json, rateLimited, sendMail } from '@/lib/server-utils';

/* POST /api/contact — saves the message in Firestore and emails the business (report I3). */
export async function POST(req: Request) {
  if (rateLimited('contact:' + clientIp(req), 5, 10 * 60 * 1000))
    return json({ error: 'Too many messages from this connection. Please try again later.' }, 429);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const parsed = ContactInput.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return json({ error: first?.message || 'Please check your details.', field: first?.path?.join('.') }, 400);
  }
  if (!adminReady()) {
    console.error('[contact] ' + adminReason());
    return json({ error: 'Messages are not connected yet. Please email or WhatsApp us directly.' }, 503);
  }
  const m = parsed.data;
  const now = new Date();
  await adminDb().collection('messages').add({ name: m.name, phone: m.phone, email: m.email, topic: m.topic, message: m.message, createdAt: now.toISOString(), read: false });
  const settings = await getSettings();
  await sendMail(process.env.ALERT_EMAIL_TO || settings.email, `[${m.topic}] Website message from ${m.name}`,
    `<p><b>${esc(m.name)}</b><br>${esc(m.phone)}<br>${esc(m.email)}</p><p><b>${esc(m.topic)}</b></p><p>${esc(m.message).replace(/\n/g, '<br>')}</p>`,
    `${m.name}\n${m.phone}\n${m.email}\n${m.topic}\n\n${m.message}`);
  return json({ ok: true }, 201);
}
