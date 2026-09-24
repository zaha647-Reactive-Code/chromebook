// One-time: copies today's 24 products (data/products.seed.json) into Firestore,
// and creates the store settings document. Safe to run again — it never
// overwrites a product that already exists unless you add --force.
//
//   npm run migrate:products            (skip products that already exist)
//   npm run migrate:products -- --force (overwrite them)
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw && !process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('FIREBASE_SERVICE_ACCOUNT is missing from .env.local'); process.exit(1);
}
const creds = raw ? JSON.parse(raw) : null;
if (creds?.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');
initializeApp(creds ? { credential: cert(creds) } : { projectId: 'chromebook-site' });
const db = getFirestore();
const force = process.argv.includes('--force');

const products = JSON.parse(readFileSync(new URL('../data/products.seed.json', import.meta.url), 'utf8'));
let added = 0, skipped = 0;
for (const [i, p] of products.entries()) {
  const ref = db.collection('products').doc(p.id);
  if (!force && (await ref.get()).exists) { skipped++; continue; }
  const { id, ...data } = p;
  await ref.set({ ...data, sort: i, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  added++;
  console.log('  ✓', p.id, '— stock', p.stockQty, p.placeholder ? '(sample content)' : '');
}
const sref = db.collection('settings').doc('store');
if (!(await sref.get()).exists) {
  await sref.set({
    whatsapp: '', whatsappDisplay: '',
    bank: { bankName: 'To be confirmed', accountTitle: 'Tech Valley (MyChromebook.pk)', accountNo: 'To be confirmed', iban: 'To be confirmed' },
    deliveryFee: 0, supportHours: 'Monday to Saturday, 10 am – 6 pm', email: 'info@mychromebook.pk', phoneDisplay: '+92 330 2007440', unpaidHoldHours: 48,
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('  ✓ settings/store created (enter the real WhatsApp and bank details in Admin → Settings)');
}
console.log(`\nDone: ${added} products added, ${skipped} already there.`);
console.log('Stock numbers are placeholders (10 / 2 / 0) — enter the real quantities in Admin → Products.');
