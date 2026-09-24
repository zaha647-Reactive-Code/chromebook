import type { Product, StockState, OrderStatus } from './types';

export const money = (n: number) =>
  '₨ ' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* Stock label from the real quantity (report I5): low at 3 units or fewer. */
export const LOW_STOCK_AT = 3;
export const stockState = (p: Pick<Product, 'stockQty'>): StockState =>
  p.stockQty <= 0 ? 'out' : p.stockQty <= LOW_STOCK_AT ? 'low' : 'in';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting: 'Awaiting payment verification',
  verified: 'Payment verified',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const CATEGORY_LABEL: Record<string, string> = {
  new: 'New Chromebook',
  refurb: 'Refurbished',
  accessories: 'Accessory',
};

/* 03xx xxxxxxx / +92 3xx / 0092 … → 923xxxxxxxxx */
export const normalisePhone = (v: string) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('0092')) d = d.slice(2);
  if (d.startsWith('0')) d = '92' + d.slice(1);
  return d;
};
export const isPkMobile = (v: string) => /^923\d{9}$/.test(normalisePhone(v));

export const waLink = (number: string, text: string) =>
  'https://wa.me/' + String(number || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(text);

export const fmtDate = (iso: string, withTime = false) => {
  try {
    return new Date(iso).toLocaleString('en-GB', withTime
      ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }
      : { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' });
  } catch { return iso; }
};
