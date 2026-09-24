export type Category = 'new' | 'refurb' | 'accessories';

export interface ProductDetails {
  processor?: string; ram?: string; storage?: string; screen?: string; battery?: string;
  updates?: string; os?: string; connection?: string; ports?: string; camera?: string;
  colour?: string; weight?: string; inTheBox?: string;
}

export interface Variant { id: string; label: string; swatch: string }

export interface Product {
  id: string;                 // also the web address: /shop/<id>
  name: string;
  category: Category;
  subcategory: string;        // '' | audio | mice | stylus | sleeves
  badge?: string;
  image: string;
  gallery: string[];
  short: string;
  long?: string;
  specs: string[];            // short chips shown on cards
  price: number;              // PKR, whole rupees
  stockQty: number;           // real quantity; 0 = sold out
  condition?: string;         // new | refurbished | ''
  warranty?: string;
  details?: ProductDetails;
  tag?: string;               // optional marketing tag, e.g. "Just in"
  variants?: Variant[];
  placeholder?: boolean;      // true = descriptions/specs are sample content, hidden from customers
  active: boolean;            // false = hidden from the shop
  sku?: string;
  updatedAt?: string;
}

export type StockState = 'in' | 'low' | 'out';

export interface CartLine { id: string; qty: number }

export type OrderStatus = 'awaiting' | 'verified' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem { id: string; name: string; image: string; price: number; qty: number }

export interface Customer {
  name: string; phone: string; email: string;
  city: string; area?: string; address: string; notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  payment: 'bank';
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  history: { status: OrderStatus; at: string }[];
  userId?: string | null;
}

export interface StoreSettings {
  whatsapp: string;           // digits only, e.g. 923302007440 ('' = not set yet)
  whatsappDisplay: string;
  bank: { bankName: string; accountTitle: string; accountNo: string; iban: string };
  deliveryFee: number;
  supportHours: string;
  email: string;
  phoneDisplay: string;
  unpaidHoldHours: number;
}
