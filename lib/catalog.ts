import 'server-only';
import { adminDb, adminReady } from './firebase-admin';
import type { Product, StoreSettings } from './types';
import seed from '@/data/products.seed.json';

/* Product catalogue and store settings, read on the server.
   Source of truth: Firestore ("products" collection, "settings/store" document).
   If Firebase is not connected yet (first local run), the site falls back to the
   seed file so pages still render, and says so in the terminal. */

let warned = false;
const warnSeed = () => {
  if (warned) return; warned = true;
  console.warn('\n[catalog] Firebase not connected — showing products from data/products.seed.json.\n' +
               '          Orders, contact messages and admin changes need FIREBASE_SERVICE_ACCOUNT in .env.local.\n');
};

const normalise = (id: string, d: any): Product => ({
  id,
  name: d.name || '',
  category: d.category || 'accessories',
  subcategory: d.subcategory || '',
  badge: d.badge || '',
  image: d.image || '',
  gallery: Array.isArray(d.gallery) && d.gallery.length ? d.gallery : (d.image ? [d.image] : []),
  short: d.short || '',
  long: d.long || '',
  specs: Array.isArray(d.specs) ? d.specs : [],
  price: Math.max(0, Math.round(Number(d.price) || 0)),
  stockQty: Math.max(0, Math.round(Number(d.stockQty) || 0)),
  condition: d.condition || '',
  warranty: d.warranty || '',
  details: d.details || {},
  tag: d.tag || '',
  variants: Array.isArray(d.variants) ? d.variants : [],
  placeholder: !!d.placeholder,
  active: d.active !== false,
  sku: d.sku || '',
  updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : (d.updatedAt || ''),
});

/* keep the shop order stable: new → refurb → accessories, then the saved "sort" field */
const ORDER = { new: 0, refurb: 1, accessories: 2 } as Record<string, number>;
const SUB = { '': 0, audio: 1, mice: 2, stylus: 3, sleeves: 4 } as Record<string, number>;
const sortProducts = (a: any, b: any) =>
  (ORDER[a.category] ?? 9) - (ORDER[b.category] ?? 9) ||
  (SUB[a.subcategory] ?? 9) - (SUB[b.subcategory] ?? 9) ||
  (a.sort ?? 999) - (b.sort ?? 999) ||
  a.name.localeCompare(b.name);

export async function getProducts({ includeHidden = false } = {}): Promise<Product[]> {
  if (!adminReady()) {
    warnSeed();
    return (seed as any[]).map((p, i) => ({ ...normalise(p.id, p), sort: i } as any)).sort(sortProducts);
  }
  const snap = await adminDb().collection('products').get();
  const list = snap.docs.map((d) => ({ ...normalise(d.id, d.data()), sort: d.data().sort } as any));
  return list.filter((p) => includeHidden || p.active).sort(sortProducts);
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!adminReady()) {
    warnSeed();
    const p = (seed as any[]).find((x) => x.id === id);
    return p ? normalise(p.id, p) : null;
  }
  const d = await adminDb().collection('products').doc(id).get();
  if (!d.exists) return null;
  const p = normalise(d.id, d.data());
  return p.active ? p : null;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  whatsapp: '',
  whatsappDisplay: '',
  bank: { bankName: 'To be confirmed', accountTitle: 'Tech Valley (MyChromebook.pk)', accountNo: 'To be confirmed', iban: 'To be confirmed' },
  deliveryFee: 0,
  supportHours: 'Monday to Saturday, 10 am – 6 pm',
  email: 'info@mychromebook.pk',
  phoneDisplay: '+92 330 2007440',
  unpaidHoldHours: 48,
};

export async function getSettings(): Promise<StoreSettings> {
  if (!adminReady()) return DEFAULT_SETTINGS;
  try {
    const d = await adminDb().collection('settings').doc('store').get();
    const s = (d.exists ? d.data() : {}) as Partial<StoreSettings>;
    return { ...DEFAULT_SETTINGS, ...s, bank: { ...DEFAULT_SETTINGS.bank, ...(s.bank || {}) } };
  } catch (e) {
    console.error('[settings] could not read settings/store', e);
    return DEFAULT_SETTINGS;
  }
}

/* what the browser is allowed to know about the catalogue (no internal fields) */
export const publicProduct = (p: Product) => ({
  id: p.id, name: p.name, category: p.category, subcategory: p.subcategory, image: p.image,
  short: p.short, specs: p.specs, price: p.price, stockQty: p.stockQty, tag: p.tag || '',
  placeholder: !!p.placeholder, details: p.placeholder ? {} : p.details, variants: p.variants || [],
});
export type PublicProduct = ReturnType<typeof publicProduct>;
