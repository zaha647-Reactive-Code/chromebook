'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/components/StoreProvider';
import { useAuth } from '@/components/AuthProvider';
import { EmptyState } from '@/components/CartBits';
import { Shield, Truck } from '@/components/Icons';
import { isPkMobile, money } from '@/lib/format';

const CITIES = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Other'];
type F = { name: string; phone: string; email: string; city: string; area: string; address: string; notes: string };
const RULES: Record<string, (v: string) => boolean> = {
  name: (v) => v.trim().length >= 3,
  phone: (v) => isPkMobile(v),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  city: (v) => !!v,
  address: (v) => v.trim().length >= 8,
};
const ERR: Record<string, string> = {
  name: 'Please enter your full name.',
  phone: 'Please enter a valid Pakistani mobile number, e.g. 0330 2007440.',
  email: 'Please enter a valid email address.',
  city: 'Please choose your city.',
  address: 'Please enter your delivery address.',
};

export default function CheckoutView({ buy, buyQty }: { buy: string; buyQty: number }) {
  const store = useStore();
  const { cartItems, byId, clearCart, remove, ready, settings } = store;
  const { user, getToken } = useAuth();
  const [f, setF] = useState<F>({ name: '', phone: '', email: '', city: '', area: '', address: '', notes: '' });
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [problems, setProblems] = useState<{ id: string; name: string; available: number }[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  /* "Buy now" = only that product (report M1); otherwise the cart */
  const lines = useMemo(() => {
    if (buy) {
      const p = byId(buy);
      if (!p || p.stockQty <= 0) return [];
      const qty = Math.min(buyQty, p.stockQty);
      return [{ id: p.id, qty, p, line: p.price * qty, problem: '' as const }];
    }
    return cartItems;
  }, [buy, buyQty, byId, cartItems]);
  const okLines = lines.filter((l) => l.problem !== 'out');
  const count = okLines.reduce((a, l) => a + l.qty, 0);
  const subtotal = okLines.reduce((a, l) => a + l.line, 0);
  const delivery = count ? Number(settings.deliveryFee) || 0 : 0;
  const hasOut = lines.some((l) => l.problem === 'out');

  /* signed-in customers: fill in their details and saved addresses */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const s = await getDoc(doc(db, 'users', user.uid));
        const d: any = s.exists() ? s.data() : {};
        setF((x) => ({ ...x, name: x.name || d.name || user.displayName || '', email: x.email || user.email || '', phone: x.phone || d.phone || '' }));
        const ads = Array.isArray(d.addresses) ? d.addresses : [];
        setAddresses(ads);
        if (ads[0]) setF((x) => ({ ...x, city: x.city || ads[0].city || '', area: x.area || ads[0].area || '', address: x.address || ads[0].address || '' }));
      } catch { setF((x) => ({ ...x, email: x.email || user.email || '', name: x.name || user.displayName || '' })); }
    })();
  }, [user]);

  const set = (k: keyof F) => (e: any) => { const v = e.target.value; setF((x) => ({ ...x, [k]: v })); if (bad[k]) setBad((b) => ({ ...b, [k]: !RULES[k](v) })); };
  const blur = (k: string) => () => { if (RULES[k] && (f as any)[k]) setBad((b) => ({ ...b, [k]: !RULES[k]((f as any)[k]) })); };
  const cls = (k: string) => 'f' + (bad[k] ? ' bad' : '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setProblems([]);
    const b: Record<string, boolean> = {};
    Object.keys(RULES).forEach((k) => { b[k] = !RULES[k]((f as any)[k]); });
    setBad(b);
    const first = Object.keys(b).find((k) => b[k]);
    if (first) { document.getElementById('co-' + first)?.focus(); return; }
    if (hasOut) { setMsg('Please remove sold-out items from your cart first.'); return; }
    setBusy(true);
    try {
      const token = await getToken();
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify({ items: okLines.map((l) => ({ id: l.id, qty: l.qty })), customer: f, website: (document.getElementById('co-website') as HTMLInputElement)?.value || '' }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 409 && data.problems) { setProblems(data.problems); setMsg(data.error); setBusy(false); return; }
      if (!r.ok) { setMsg(data.error || 'We could not place your order. Please try again.'); setBusy(false); return; }
      if (!buy) clearCart(); else remove(buy);
      window.location.href = '/order/' + encodeURIComponent(data.id) + '?t=' + data.token + '&new=1';
    } catch {
      setMsg('Connection problem — please check your internet and try again.'); setBusy(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <header className="pg-hero">
        <span className="hero-kicker">Secure checkout</span>
        <h1>Almost <span className="accent">there</span></h1>
        <div className="steps">
          <span className="done"><i>✓</i>Cart</span><span className="on"><i>2</i>Details</span><span><i>3</i>Payment</span>
        </div>
      </header>
      <main className="pg">
        {!lines.length ? (
          <div className="panel"><EmptyState title={buy ? 'This product is not available' : 'Your cart is empty'} text={buy ? 'It may have just sold out. Have a look at similar products in the shop.' : 'Add a product to your cart before checking out.'} href="/shop" button="Go to shop" /></div>
        ) : (
          <form className="pg-grid" onSubmit={submit} noValidate autoComplete="on">
            <div>
              <div className="panel">
                <h3>Contact details</h3>
                <p className="sub">{user ? <>Signed in as <b>{user.displayName || user.email}</b>. Check your details below.</> :
                  <>We use these to confirm your order and arrange delivery. Have an account? <a href="/login?next=/checkout" style={{ color: 'var(--rose-deep)', fontWeight: 600 }}>Sign in</a></>}</p>
                <div className={cls('name')}><label htmlFor="co-name">Full name</label>
                  <input id="co-name" name="name" autoComplete="name" placeholder="e.g. Ayesha Khan" value={f.name} onChange={set('name')} onBlur={blur('name')} maxLength={80} />
                  <div className="err">{ERR.name}</div></div>
                <div className="f-row">
                  <div className={cls('phone')}><label htmlFor="co-phone">Mobile number</label>
                    <input id="co-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03xx xxxxxxx" value={f.phone} onChange={set('phone')} onBlur={blur('phone')} maxLength={20} />
                    <div className="err">{ERR.phone}</div></div>
                  <div className={cls('email')}><label htmlFor="co-email">Email address</label>
                    <input id="co-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={set('email')} onBlur={blur('email')} maxLength={120} />
                    <div className="err">{ERR.email}</div></div>
                </div>
              </div>

              <div className="panel">
                <h3>Delivery address</h3>
                <p className="sub">Free delivery anywhere in Pakistan, usually within 3–5 working days after payment is verified.</p>
                {addresses.length > 0 && (
                  <div className="f"><label htmlFor="co-saved">Use a saved address</label>
                    <select id="co-saved" defaultValue="0" onChange={(e) => {
                      const a = addresses[+e.target.value];
                      setF((x) => ({ ...x, city: a ? a.city : '', area: a ? a.area || '' : '', address: a ? a.address : '' }));
                    }}>
                      {addresses.map((a, i) => <option key={i} value={i}>{(a.label || a.city) + ' — ' + String(a.address).slice(0, 40)}</option>)}
                      <option value="-1">Enter a new address</option>
                    </select></div>
                )}
                <div className="f-row">
                  <div className={cls('city')}><label htmlFor="co-city">City</label>
                    <select id="co-city" name="city" autoComplete="address-level2" value={f.city} onChange={set('city')}>
                      <option value="">Select your city</option>
                      {CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <div className="err">{ERR.city}</div></div>
                  <div className="f"><label htmlFor="co-area">Area / sector <span style={{ fontWeight: 400, color: '#8A8D95' }}>(optional)</span></label>
                    <input id="co-area" name="area" autoComplete="address-level3" placeholder="e.g. Sector I-8/3" value={f.area} onChange={set('area')} maxLength={80} /></div>
                </div>
                <div className={cls('address')}><label htmlFor="co-address">Street address</label>
                  <textarea id="co-address" name="address" autoComplete="street-address" placeholder="House number, street, nearest landmark" value={f.address} onChange={set('address')} onBlur={blur('address')} maxLength={300} />
                  <div className="err">{ERR.address}</div></div>
                <div className="f"><label htmlFor="co-notes">Order notes <span style={{ fontWeight: 400, color: '#8A8D95' }}>(optional)</span></label>
                  <input id="co-notes" name="notes" autoComplete="off" placeholder="Anything we should know — e.g. call before delivery" value={f.notes} onChange={set('notes')} maxLength={400} /></div>
                <input id="co-website" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
              </div>

              <div className="panel">
                <h3>Payment method</h3>
                <p className="sub">You will see our bank details on the next screen, after you place the order.</p>
                <div className="pay">
                  <label className="on">
                    <input type="radio" name="pay" value="bank" defaultChecked />
                    <span><b>Direct bank transfer</b><small>Transfer the total, then send us the payment screenshot on WhatsApp. We confirm and ship.</small></span>
                    <span className="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#AE707B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l9-6 9 6" /><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" /></svg></span>
                  </label>
                  <label className="off" title="Coming soon">
                    <input type="radio" name="pay" value="card" disabled />
                    <span><b>Card, JazzCash or Easypaisa</b><small>Instant online payment — launching soon.</small></span>
                    <span className="soon">Soon</span>
                  </label>
                </div>
              </div>
            </div>

            <aside className="sticky">
              <div className="panel">
                <h3>Your order</h3>
                <p className="sub">{count + (count === 1 ? ' item' : ' items')}{buy && ' — just this product'}</p>
                <div className="sum-items">
                  {lines.map((l) => (
                    <div className="li" key={l.id}>
                      <span className="li-img"><Image src={l.p.image} alt="" width={112} height={96} sizes="56px" /></span>
                      <div><span className="li-name" style={{ fontSize: 13 }}>{l.p.name}</span>
                        <span className="li-meta">{l.problem === 'out' ? 'Sold out' : 'Qty ' + l.qty}</span>
                        {problems.find((x) => x.id === l.id) && <span className="li-warn">{problems.find((x) => x.id === l.id)!.available ? 'Only ' + problems.find((x) => x.id === l.id)!.available + ' left' : 'No longer available'}</span>}
                      </div>
                      <span className="li-price" style={{ fontSize: 13 }}>{l.problem === 'out' ? '—' : money(l.line)}</span>
                    </div>
                  ))}
                </div>
                <div className="sum-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
                <div className="sum-row"><span>Delivery</span>{delivery ? <b>{money(delivery)}</b> : <span className="sum-free">Free</span>}</div>
                <div className="sum-row tot"><span>Total</span><span>{money(subtotal + delivery)}</span></div>
                {msg && <div className="au-msg err" style={{ display: 'block', marginTop: 14 }}>{msg}{problems.length > 0 && !buy && <> <a href="/cart" style={{ color: 'inherit', fontWeight: 600 }}>Update cart</a></>}</div>}
                <button className="btn btn-rose sum-btn" type="submit" disabled={busy || hasOut}>{busy ? 'Placing your order…' : <>Place order <span className="arrow-c">↗</span></>}</button>
                <p style={{ fontSize: 12, color: '#8A8D95', textAlign: 'center', marginTop: 12, lineHeight: 1.55 }}>
                  By placing your order you agree to our <a href="/terms" style={{ color: 'var(--rose-deep)' }}>terms</a>, <a href="/privacy" style={{ color: 'var(--rose-deep)' }}>privacy policy</a> and our <a href="/refund" style={{ color: 'var(--rose-deep)' }}>7-day return policy</a>.</p>
                <div className="trust">
                  <div><Shield />Genuine devices, official warranty</div>
                  <div><Truck />Free delivery across Pakistan</div>
                </div>
                <a href="/cart" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#7A7D86', marginTop: 16 }}>← Back to cart</a>
              </div>
            </aside>
          </form>
        )}
      </main>
    </>
  );
}
