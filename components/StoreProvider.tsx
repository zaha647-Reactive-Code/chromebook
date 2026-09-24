'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PublicProduct } from '@/lib/catalog';
import type { CartLine, StoreSettings } from '@/lib/types';

/* Shared shopping state for every page: the product list, the cart, the wishlist,
   the slide-in cart drawer and the little notification ("toast").
   The cart lives in this browser (like every online shop) — prices and stock are
   always re-checked on the server when the order is placed. */

type Toast = { text: string; img?: string; link?: string; linkText?: string; drawer?: boolean } | null;

interface Store {
  products: PublicProduct[];
  settings: Pick<StoreSettings, 'deliveryFee' | 'supportHours' | 'whatsapp' | 'whatsappDisplay' | 'email' | 'phoneDisplay'>;
  byId: (id: string) => PublicProduct | undefined;
  cart: CartLine[];
  cartCount: number;
  cartItems: { id: string; qty: number; p: PublicProduct; line: number; problem: '' | 'out' | 'reduced' }[];
  subtotal: number;
  delivery: number;
  total: number;
  hasProblems: boolean;
  add: (id: string, qty?: number) => boolean;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clearCart: () => void;
  wish: string[];
  isWished: (id: string) => boolean;
  toggleWish: (id: string) => boolean;
  setWish: (ids: string[]) => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toast: Toast;
  showToast: (t: Toast, ms?: number) => void;
  ready: boolean;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore must be used inside <StoreProvider>');
  return c;
};

const read = (k: string, d: any) => {
  try { const v = localStorage.getItem('mcb.' + k); return v == null ? d : JSON.parse(v); } catch { return d; }
};
const write = (k: string, v: any) => { try { localStorage.setItem('mcb.' + k, JSON.stringify(v)); } catch {} };

export default function StoreProvider({ products, settings, children }: {
  products: PublicProduct[]; settings: Store['settings']; children: React.ReactNode;
}) {
  const map = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const byId = useCallback((id: string) => map.get(id), [map]);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [wish, setWishState] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawer] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const timer = useRef<any>(null);

  const showToast = useCallback((t: Toast, ms = 3200) => {
    setToast(t);
    clearTimeout(timer.current);
    if (t) timer.current = setTimeout(() => setToast(null), ms);
  }, []);

  /* load once; clean out products that no longer exist (report M2) */
  useEffect(() => {
    const raw: CartLine[] = read('cart', []);
    const valid = raw.filter((l) => l && map.has(l.id) && l.qty > 0);
    const gone = raw.length - valid.length;
    setCart(valid);
    if (gone) {
      write('cart', valid);
      setTimeout(() => showToast({ text: gone === 1 ? 'One item in your cart is no longer available and was removed.' : gone + ' items in your cart are no longer available and were removed.' }, 5200), 400);
    }
    setWishState((read('wish', []) as string[]).filter((id) => map.has(id)));
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mcb.cart') setCart(read('cart', []));
      if (e.key === 'mcb.wish') setWishState(read('wish', []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [map, showToast]);

  const saveCart = (next: CartLine[]) => { setCart(next); write('cart', next); };

  const add = useCallback((id: string, qty = 1) => {
    const p = map.get(id);
    if (!p || p.stockQty <= 0) return false;
    const cur = read('cart', []) as CartLine[];
    const hit = cur.find((l) => l.id === id);
    const want = (hit ? hit.qty : 0) + Math.max(1, qty);
    const capped = Math.min(want, p.stockQty, 99);
    const next = hit ? cur.map((l) => (l.id === id ? { ...l, qty: capped } : l)) : [...cur, { id, qty: capped }];
    saveCart(next);
    if (capped < want) showToast({ text: 'Only ' + p.stockQty + ' of ' + p.name + ' available — your cart has the maximum.' }, 4200);
    return true;
  }, [map, showToast]);

  const setQty = useCallback((id: string, qty: number) => {
    const p = map.get(id);
    const max = p ? Math.min(p.stockQty, 99) : 0;
    const q = Math.max(0, Math.min(Math.round(qty), max));
    const cur = read('cart', []) as CartLine[];
    saveCart(cur.map((l) => (l.id === id ? { ...l, qty: q } : l)).filter((l) => l.qty > 0));
    if (p && qty > max && max > 0) showToast({ text: 'Only ' + max + ' available.' }, 2600);
  }, [map, showToast]);

  const remove = useCallback((id: string) => saveCart((read('cart', []) as CartLine[]).filter((l) => l.id !== id)), []);
  const clearCart = useCallback(() => saveCart([]), []);

  const setWish = useCallback((ids: string[]) => { const v = ids.filter((id) => map.has(id)); setWishState(v); write('wish', v); }, [map]);
  const toggleWish = useCallback((id: string) => {
    const cur = (read('wish', []) as string[]);
    const has = cur.includes(id);
    const next = has ? cur.filter((x) => x !== id) : [...cur, id];
    setWishState(next); write('wish', next);
    try { window.dispatchEvent(new CustomEvent('mc:wish', { detail: next })); } catch {}
    return !has;
  }, []);

  /* cart lines with live price + stock problems (report I1) */
  const cartItems = useMemo(() => cart.map((l) => {
    const p = map.get(l.id);
    if (!p) return null as any;
    let problem: '' | 'out' | 'reduced' = '';
    let qty = l.qty;
    if (p.stockQty <= 0) problem = 'out';
    else if (qty > p.stockQty) { problem = 'reduced'; qty = p.stockQty; }
    return { id: l.id, qty, p, line: problem === 'out' ? 0 : p.price * qty, problem };
  }).filter((l) => l.p), [cart, map]);

  const cartCount = cartItems.reduce((a, l) => a + (l.problem === 'out' ? 0 : l.qty), 0);
  const subtotal = cartItems.reduce((a, l) => a + l.line, 0);
  const delivery = cartCount ? Number(settings.deliveryFee) || 0 : 0;
  const hasProblems = cartItems.some((l) => l.problem);

  const value: Store = {
    products, settings, byId, cart, cartCount, cartItems, subtotal, delivery, total: subtotal + delivery, hasProblems,
    add, setQty, remove, clearCart,
    wish, isWished: (id) => wish.includes(id), toggleWish, setWish,
    drawerOpen, openDrawer: () => { setToast(null); setDrawer(true); }, closeDrawer: () => setDrawer(false),
    toast, showToast, ready,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
