'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  collection, doc, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc, updateDoc, deleteDoc, increment,
} from 'firebase/firestore';
import { ref as sref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { EmptyState } from '@/components/CartBits';
import { STATUS_LABEL, fmtDate, money, normalisePhone, stockState } from '@/lib/format';
import type { OrderStatus } from '@/lib/types';

/* Store admin — works directly on Firestore and Firebase Storage.
   Every change is live for all customers at once (report C3).
   Access: only accounts with the admin role; the security rules enforce it (C5). */

const CAT: Record<string, string> = { new: 'New Chromebook', refurb: 'Refurbished', accessories: 'Accessory' };
const SUB: Record<string, string> = { '': '—', audio: 'Audio', mice: 'Mice & keyboards', stylus: 'Stylus & wearables', sleeves: 'Sleeves & chargers' };
const DET: [string, string][] = [['processor', 'Processor'], ['ram', 'Memory'], ['storage', 'Storage'], ['screen', 'Display'], ['battery', 'Battery'],
  ['updates', 'Updates'], ['os', 'Operating system'], ['connection', 'Connection'], ['ports', 'Ports'], ['camera', 'Camera'], ['colour', 'Colour'], ['weight', 'Weight'], ['inTheBox', 'In the box']];
const slug = (s: string) => s.toLowerCase().replace(/[—–]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
const I = {
  edit: <svg viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>,
  eye: <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  x: <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>,
  lock: <svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>,
};

function Modal({ title, onClose, children, foot }: { title: string; onClose: () => void; children: React.ReactNode; foot: React.ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', k); };
  }, [onClose]);
  return (
    <div className="md-veil open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="md" role="dialog">
        <div className="md-h"><h3>{title}</h3><button className="ib" type="button" onClick={onClose}>{I.x}</button></div>
        <div className="md-b">{children}</div>
        <div className="md-f">{foot}</div>
      </div>
    </div>
  );
}

export default function AdminView() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<'overview' | 'products' | 'orders' | 'messages' | 'settings'>('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (!user || !isAdmin) return;
    const fail = (e: any) => setErr('Could not load data: ' + (e?.message || e) + ' — check that the security rules are published.');
    const u1 = onSnapshot(collection(db, 'products'), (s) => setProducts(s.docs.map((d) => ({ ...d.data(), id: d.id }))), fail);
    const u2 = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (s) => setOrders(s.docs.map((d) => d.data())), fail);
    const u3 = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (s) => setMessages(s.docs.map((d) => ({ ...d.data(), _id: d.id }))), fail);
    const u4 = onSnapshot(doc(db, 'settings', 'store'), (s) => setSettings(s.exists() ? s.data() : {}), fail);
    return () => { u1(); u2(); u3(); u4(); };
  }, [user, isAdmin]);

  if (loading) return <main className="pg" style={{ minHeight: 420 }} />;
  if (!user || !isAdmin) {
    return (
      <main className="pg" style={{ paddingTop: 40 }}>
        <div className="gate"><div className="panel">
          <div className="lock">{I.lock}</div>
          <h1>Store <span className="accent">admin</span></h1>
          {!user ? (
            <>
              <p className="sub" style={{ marginBottom: 22 }}>Staff only. Sign in with the admin account.</p>
              <a className="btn btn-rose" href="/login?next=/admin">Sign in <span className="arrow-c">↗</span></a>
            </>
          ) : (
            <>
              <p className="sub" style={{ marginBottom: 12 }}>You are signed in as <b>{user.email}</b>, but this account does not have admin access.</p>
              <p className="sub" style={{ fontSize: 12.5 }}>The admin role is added once from a trusted computer (see the setup guide, step “Make the first admin”). Then sign out and sign in again.</p>
              <button className="btn btn-metal" type="button" onClick={() => signOut(auth)}>Sign out</button>
            </>
          )}
        </div></div>
      </main>
    );
  }

  const awaiting = orders.filter((o) => o.status === 'awaiting').length;
  const unread = messages.filter((m) => !m.read).length;

  return (
    <main className="pg" style={{ paddingTop: 40 }}>
      <div className="ad-top">
        <div><h1>Store <span className="accent">admin</span></h1><p>{products.length} products · {orders.length} orders · signed in as {user.email}</p></div>
        <div className="sp">
          <a className="btn btn-metal" href="/shop" target="_blank">View store ↗</a>
          <button className="btn btn-metal" type="button" onClick={async () => { await signOut(auth); window.location.href = '/'; }}>Sign out</button>
        </div>
      </div>
      {err && <div className="au-msg err">{err}</div>}
      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {([['overview', 'Overview'], ['products', 'Products'], ['orders', 'Orders' + (awaiting ? ' (' + awaiting + ')' : '')], ['messages', 'Messages' + (unread ? ' (' + unread + ')' : '')], ['settings', 'Settings']] as const).map(([k, l]) =>
          <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k as any)}>{l}</button>)}
      </div>
      {tab === 'overview' && <Overview products={products} orders={orders} messages={messages} go={setTab} />}
      {tab === 'products' && <Products products={products} flash={flash} />}
      {tab === 'orders' && <Orders orders={orders} flash={flash} />}
      {tab === 'messages' && <Messages messages={messages} />}
      {tab === 'settings' && <Settings settings={settings} flash={flash} />}
      {toast && <div className="mc-toast show"><span className="t-txt">{toast}</span></div>}
    </main>
  );
}

/* ------------------------------------------------------------------ overview */
function Overview({ products, orders, messages, go }: any) {
  const paid = orders.filter((o: any) => ['verified', 'shipped', 'delivered'].includes(o.status));
  const rev = paid.reduce((a: number, o: any) => a + o.total, 0);
  const alerts = products.filter((p: any) => p.active !== false && stockState(p) !== 'in');
  const sample = products.filter((p: any) => p.placeholder).length;
  const awaiting = orders.filter((o: any) => o.status === 'awaiting');
  return (
    <>
      <div className="kpis">
        <div className="kpi rose"><small>Confirmed revenue</small><b>{money(rev)}</b><span>{paid.length} paid orders</span></div>
        <div className={'kpi' + (awaiting.length ? ' warn' : '')}><small>Awaiting payment</small><b>{awaiting.length}</b><span>check WhatsApp screenshots</span></div>
        <div className="kpi"><small>Products live</small><b>{products.filter((p: any) => p.active !== false).length}</b><span>{products.filter((p: any) => stockState(p) === 'in').length} in stock</span></div>
        <div className={'kpi' + (alerts.length ? ' warn' : '')}><small>Stock alerts</small><b>{alerts.length}</b><span>low or sold out</span></div>
      </div>
      {sample > 0 && (
        <div className="ad-banner" style={{ background: '#fff', borderColor: 'var(--platinum)' }}>
          <span><b>{sample} of {products.length} products still have sample content.</b> Customers only see their name, price, condition and short text until you enter the real specifications and untick “Sample content”.</span>
          <span className="sp"><button className="btn btn-metal" type="button" onClick={() => go('products')}>Review products</button></span>
        </div>
      )}
      <div className="ad-2">
        <div className="panel"><h3>Recent orders</h3><p className="sub">Live — new orders appear here instantly.</p>
          {orders.length ? orders.slice(0, 6).map((o: any) => (
            <div className="mini" key={o.id}><img src={o.items[0]?.image} alt="" />
              <div><b>{o.id}</b><br /><small style={{ color: '#8A8D95' }}>{o.customer?.name} · {fmtDate(o.createdAt, true)}</small></div>
              <div className="r"><b>{money(o.total)}</b><br /><span className={'st ' + o.status}>{STATUS_LABEL[o.status as OrderStatus]}</span></div>
            </div>
          )) : <p className="sub" style={{ margin: 0 }}>No orders yet.</p>}
          {orders.length > 0 && <button className="btn btn-metal btn-sm" style={{ marginTop: 16, padding: '10px 18px', fontSize: 13 }} type="button" onClick={() => go('orders')}>All orders</button>}
        </div>
        <div className="panel"><h3>Stock alerts</h3><p className="sub">Products that are low or sold out.</p>
          {alerts.length ? alerts.map((p: any) => (
            <div className="mini" key={p.id}><img src={p.image} alt="" /><div><b>{p.name}</b></div>
              <div className="r"><span className={'st ' + (stockState(p) === 'out' ? 'cancelled' : 'awaiting')}>{stockState(p) === 'out' ? 'Sold out' : p.stockQty + ' left'}</span></div></div>
          )) : <p className="sub" style={{ margin: 0 }}>Everything is in stock.</p>}
          {messages.filter((m: any) => !m.read).length > 0 && <button className="btn btn-rose btn-sm" style={{ marginTop: 16, padding: '10px 18px', fontSize: 13 }} type="button" onClick={() => go('messages')}>{messages.filter((m: any) => !m.read).length} unread messages</button>}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ products */
function Products({ products, flash }: any) {
  const [q, setQ] = useState('');
  const [c, setC] = useState('all');
  const [edit, setEdit] = useState<any | null>(null);
  const list = useMemo(() => products
    .filter((p: any) => (c === 'all' || p.category === c) && (!q || (p.name + ' ' + p.id).toLowerCase().includes(q.toLowerCase())))
    .sort((a: any, b: any) => (a.category + a.name).localeCompare(b.category + b.name)), [products, q, c]);

  const patch = async (id: string, data: any) => {
    try { await updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() }); flash('Saved — live on the site'); }
    catch (e: any) { alert('Could not save: ' + e.message); }
  };

  return (
    <>
      <div className="tbar">
        <input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={c} onChange={(e) => setC(e.target.value)}>
          <option value="all">All categories</option>{Object.keys(CAT).map((k) => <option key={k} value={k}>{CAT[k]}</option>)}
        </select>
        <button className="btn btn-rose" type="button" onClick={() => setEdit({})}>+ Add product</button>
      </div>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th></th><th>Product</th><th>Category</th><th>Price (₨)</th><th>Stock</th><th>Tag</th><th>Shown</th><th></th></tr></thead>
        <tbody>
          {list.length ? list.map((p: any) => (
            <tr key={p.id}>
              <td><img className="pimg" src={p.image} alt="" /></td>
              <td className="pn"><b>{p.name}</b><small>{p.id}</small>{p.placeholder && <> <span className="chip ph">Sample content</span></>}</td>
              <td><span className="chip">{CAT[p.category] || p.category}</span></td>
              <td><input className="cell-in price" type="number" min={0} step={100} defaultValue={p.price}
                onBlur={(e) => { const v = Math.max(0, Math.round(+e.target.value || 0)); if (v !== p.price) patch(p.id, { price: v }); }} /></td>
              <td><input className="cell-in price" style={{ width: 80 }} type="number" min={0} step={1} defaultValue={p.stockQty ?? 0}
                onBlur={(e) => { const v = Math.max(0, Math.round(+e.target.value || 0)); if (v !== p.stockQty) patch(p.id, { stockQty: v }); }} />
                <small style={{ display: 'block', color: '#8A8D95', fontSize: 11, marginTop: 3 }}>{stockState(p) === 'out' ? 'Sold out' : stockState(p) === 'low' ? 'Low stock' : 'In stock'}</small></td>
              <td><input className="cell-in tag" placeholder="none" defaultValue={p.tag || ''} onBlur={(e) => { if (e.target.value.trim() !== (p.tag || '')) patch(p.id, { tag: e.target.value.trim() }); }} /></td>
              <td><input type="checkbox" checked={p.active !== false} onChange={(e) => patch(p.id, { active: e.target.checked })} title="Show in the shop" /></td>
              <td><div className="row-act">
                <a className="ib" title="View on site" target="_blank" href={'/shop/' + p.id}>{I.eye}</a>
                <button className="ib" type="button" title="Edit" onClick={() => setEdit(p)}>{I.edit}</button>
              </div></td>
            </tr>
          )) : <tr><td colSpan={8} style={{ textAlign: 'center', padding: 34, color: '#8A8D95' }}>No products match.</td></tr>}
        </tbody>
      </table></div>
      <p className="demo-note">Price, stock, tag and “Shown” save as soon as you leave the box, and are live for every customer immediately. Stock goes down automatically when an order is placed; at 3 or fewer the product shows “Low stock”, at 0 “Sold out”.</p>
      {edit && <ProductEditor p={edit} existing={products} onClose={() => setEdit(null)} flash={flash} />}
    </>
  );
}

function ProductEditor({ p: orig, existing, onClose, flash }: any) {
  const isNew = !orig.id;
  const [p, setP] = useState<any>(() => ({
    name: '', category: 'new', subcategory: '', condition: 'new', price: 0, stockQty: 0, tag: '', active: true,
    short: '', long: '', specs: [], image: '', gallery: [], details: {}, warranty: '', sku: '', placeholder: false, variants: [], ...JSON.parse(JSON.stringify(orig)),
  }));
  const [busy, setBusy] = useState(false);
  const [bad, setBad] = useState('');
  const set = (k: string, v: any) => setP((x: any) => ({ ...x, [k]: v }));
  const setD = (k: string, v: string) => setP((x: any) => ({ ...x, details: { ...(x.details || {}), [k]: v } }));

  const upload = async (files: FileList | null, main: boolean) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { alert(f.name + ': please use a JPG, PNG or WebP image.'); continue; }
        if (f.size > 5 * 1024 * 1024) { alert(f.name + ' is larger than 5 MB. Please make it smaller first.'); continue; }
        const id = p.id || slug(p.name) || 'product';
        const r = sref(storage, 'products/' + id + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.' + (f.type.split('/')[1] === 'jpeg' ? 'jpg' : f.type.split('/')[1]));
        await uploadBytes(r, f, { contentType: f.type, cacheControl: 'public,max-age=31536000' });
        urls.push(await getDownloadURL(r));
      }
      if (urls.length) setP((x: any) => {
        const gallery = [...(x.gallery || []).filter((g: string) => g !== x.image), ...urls];
        const image = main || !x.image ? urls[0] : x.image;
        return { ...x, image, gallery: [image, ...gallery.filter((g: string) => g !== image)] };
      });
    } catch (e: any) { alert('Upload failed: ' + e.message); }
    setBusy(false);
  };

  const save = async () => {
    if ((p.name || '').trim().length < 2) return setBad('Please enter a product name.');
    if (!p.image) return setBad('Please upload a main photo.');
    setBusy(true);
    try {
      let id = p.id;
      if (isNew) {
        const base = slug(p.name) || 'product'; id = base; let n = 2;
        while (existing.some((x: any) => x.id === id)) id = base + '-' + n++;
      }
      const data = {
        name: p.name.trim(), category: p.category, subcategory: p.category === 'accessories' ? p.subcategory : '', condition: p.condition,
        price: Math.max(0, Math.round(+p.price || 0)), stockQty: Math.max(0, Math.round(+p.stockQty || 0)), tag: (p.tag || '').trim(), active: p.active !== false,
        short: (p.short || '').trim(), long: (p.long || '').trim(), specs: (Array.isArray(p.specs) ? p.specs : String(p.specs).split(',')).map((s: string) => s.trim()).filter(Boolean),
        image: p.image, gallery: (p.gallery?.length ? p.gallery : [p.image]), details: p.details || {}, warranty: (p.warranty || '').trim(), sku: (p.sku || '').trim(),
        placeholder: !!p.placeholder, variants: p.variants || [], updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'products', id), isNew ? { ...data, createdAt: serverTimestamp() } : data, { merge: true });
      flash((isNew ? 'Added ' : 'Saved ') + data.name + ' — live on the site');
      onClose();
    } catch (e: any) { setBad('Could not save: ' + e.message); }
    setBusy(false);
  };

  const inp = (k: string, label: string, type = 'text', ph = '') => (
    <div className="f"><label>{label}</label><input type={type} value={p[k] ?? ''} placeholder={ph} onChange={(e) => set(k, e.target.value)} /></div>
  );

  return (
    <Modal title={isNew ? 'Add product' : 'Edit product'} onClose={onClose} foot={<>
      {!isNew && <button className="btn btn-danger left" type="button" onClick={async () => {
        if (!confirm('Delete “' + p.name + '” for good? (To hide it for now, untick “Shown in the shop” instead.)')) return;
        await deleteDoc(doc(db, 'products', p.id)); flash('Deleted ' + p.name); onClose();
      }}>Delete</button>}
      <button className="btn btn-metal" type="button" onClick={onClose}>Cancel</button>
      <button className="btn btn-rose" type="button" disabled={busy} onClick={save}>{busy ? 'Saving…' : isNew ? 'Add product' : 'Save changes'}</button>
    </>}>
      {bad && <div className="au-msg err">{bad}</div>}
      <div className="sec">Basics</div>
      {inp('name', 'Product name', 'text', 'e.g. CTL Chromebook PX11EG')}
      <div className="f-3">
        <div className="f"><label>Category</label><select value={p.category} onChange={(e) => set('category', e.target.value)}>{Object.keys(CAT).map((k) => <option key={k} value={k}>{CAT[k]}</option>)}</select></div>
        <div className="f"><label>Accessory group</label><select value={p.subcategory} onChange={(e) => set('subcategory', e.target.value)} disabled={p.category !== 'accessories'}>{Object.keys(SUB).map((k) => <option key={k} value={k}>{SUB[k]}</option>)}</select></div>
        <div className="f"><label>Condition</label><select value={p.condition} onChange={(e) => set('condition', e.target.value)}><option value="new">Brand new</option><option value="refurbished">Refurbished</option><option value="">Not applicable</option></select></div>
      </div>
      <div className="f-3">
        {inp('price', 'Price (₨)', 'number', '0')}
        {inp('stockQty', 'Stock quantity', 'number', '0')}
        {inp('tag', 'Marketing tag', 'text', 'e.g. Just in')}
      </div>
      <label className="check" style={{ marginBottom: 6 }}><input type="checkbox" checked={p.active !== false} onChange={(e) => set('active', e.target.checked)} />Shown in the shop</label>

      <div className="sec">Photos</div>
      <div className="prev">{(p.gallery?.length ? p.gallery : p.image ? [p.image] : []).map((g: string, i: number) => (
        <span key={g + i} style={{ position: 'relative' }}>
          <img src={g} alt="" style={g === p.image ? { outline: '2px solid var(--rose-2)' } : undefined} onClick={() => set('image', g)} title="Click to make this the main photo" />
          <button type="button" className="ib" style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22 }} title="Remove"
            onClick={() => setP((x: any) => { const gal = (x.gallery || []).filter((y: string) => y !== g); return { ...x, gallery: gal, image: x.image === g ? gal[0] || '' : x.image }; })}>{I.x}</button>
        </span>
      ))}</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0 4px' }}>
        <label className="btn btn-metal btn-sm" style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}>{p.image ? 'Replace main photo' : 'Upload main photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files, true)} /></label>
        <label className="btn btn-metal btn-sm" style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}>Add more photos
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files, false)} /></label>
      </div>
      <p style={{ fontSize: 12, color: '#8A8D95' }}>JPG, PNG or WebP, up to 5 MB each. Click a photo to make it the main one.{busy && ' Uploading…'}</p>

      <div className="sec">Descriptions</div>
      {inp('short', 'Short description (shop card)', 'text', 'One line')}
      <div className="f"><label>Long description (product page)</label><textarea value={p.long || ''} onChange={(e) => set('long', e.target.value)} /></div>
      <div className="f"><label>Spec chips — comma separated</label><input value={Array.isArray(p.specs) ? p.specs.join(', ') : p.specs} onChange={(e) => set('specs', e.target.value.split(','))} placeholder="e.g. Intel N5100, 4 GB, 32 GB" /></div>

      <div className="sec">Full specifications</div>
      <div className="f-3">{DET.map(([k, l]) => (
        <div className="f" key={k}><label>{l}</label><input value={p.details?.[k] || ''} onChange={(e) => setD(k, e.target.value)} /></div>
      ))}</div>
      <div className="f-row">{inp('warranty', 'Warranty', 'text', 'e.g. 1 year official warranty')}{inp('sku', 'Product code (optional)')}</div>
      <label className="check" style={{ margin: '6px 0 4px' }}><input type="checkbox" checked={!!p.placeholder} onChange={(e) => set('placeholder', e.target.checked)} />
        Sample content — hide the long description, specifications, extra photos and warranty from customers</label>
    </Modal>
  );
}

/* ------------------------------------------------------------------ orders */
function Orders({ orders, flash }: any) {
  const [f, setF] = useState('all');
  const [view, setView] = useState<any | null>(null);
  const counts: Record<string, number> = { all: orders.length };
  Object.keys(STATUS_LABEL).forEach((k) => { counts[k] = orders.filter((o: any) => o.status === k).length; });
  const shown = orders.filter((o: any) => f === 'all' || o.status === f);

  const setStatus = async (o: any, st: OrderStatus) => {
    if (st === o.status) return;
    if (st === 'cancelled' && !confirm('Cancel order ' + o.id + '? Its items go back into stock.')) return;
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'orders', o.id);
        const cur = await tx.get(ref);
        const was = cur.data()?.status;
        // stock goes back when an order is cancelled, and comes out again if it is un-cancelled
        if (st === 'cancelled' && was !== 'cancelled') o.items.forEach((i: any) => tx.update(doc(db, 'products', i.id), { stockQty: increment(i.qty) }));
        if (was === 'cancelled' && st !== 'cancelled') o.items.forEach((i: any) => tx.update(doc(db, 'products', i.id), { stockQty: increment(-i.qty) }));
        tx.update(ref, { status: st, history: [...(cur.data()?.history || []), { status: st, at: new Date().toISOString() }] });
      });
      flash(o.id + ': ' + STATUS_LABEL[st]);
    } catch (e: any) { alert('Could not update: ' + e.message); }
  };

  return (
    <>
      <div className="chips">
        {[['all', 'All'], ['awaiting', 'Awaiting payment'], ['verified', 'Verified'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']].map(([k, l]) =>
          <button key={k} type="button" className={f === k ? 'on' : ''} onClick={() => setF(k)}>{l}<i>{counts[k] || 0}</i></button>)}
      </div>
      {orders.length ? (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {shown.length ? shown.map((o: any) => (
              <tr key={o.id}>
                <td className="pn"><b>{o.id}</b><small>{fmtDate(o.createdAt, true)}</small></td>
                <td className="pn"><b>{o.customer?.name}</b><small>{o.customer?.phone} · {o.customer?.city}</small></td>
                <td>{o.items.reduce((a: number, i: any) => a + i.qty, 0)}</td>
                <td><b>{money(o.total)}</b></td>
                <td><select className="cell-in" value={o.status} onChange={(e) => setStatus(o, e.target.value as OrderStatus)}>
                  {Object.keys(STATUS_LABEL).map((k) => <option key={k} value={k}>{STATUS_LABEL[k as OrderStatus]}</option>)}</select></td>
                <td><div className="row-act">
                  {o.status === 'awaiting' && <button className="btn btn-rose btn-sm" style={{ padding: '7px 13px', fontSize: 12 }} type="button" onClick={() => setStatus(o, 'verified')}>Verify payment</button>}
                  <button className="ib" type="button" title="Details" onClick={() => setView(o)}>{I.eye}</button>
                </div></td>
              </tr>
            )) : <tr><td colSpan={6} style={{ textAlign: 'center', padding: 34, color: '#8A8D95' }}>No orders with this status.</td></tr>}
          </tbody>
        </table></div>
      ) : <div className="panel"><EmptyState title="No orders yet" text="Every order placed on the website appears here instantly, from any device." href="/shop" button="View the shop" /></div>}
      {view && (() => {
        const o = orders.find((x: any) => x.id === view.id) || view; const c = o.customer || {};
        const wa = 'https://wa.me/' + normalisePhone(c.phone) + '?text=' + encodeURIComponent('Assalam o Alaikum ' + (c.name || '').split(' ')[0] + ', this is MyChromebook.pk about your order ' + o.id + '.');
        return (
          <Modal title={'Order ' + o.id} onClose={() => setView(null)} foot={<>
            <a className="btn btn-metal" target="_blank" href={'/order/' + encodeURIComponent(o.id) + '?t=' + o.viewToken}>Customer view ↗</a>
            <a className="btn btn-rose" target="_blank" rel="noopener" href={wa}>WhatsApp customer</a>
          </>}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
              <span className={'st ' + o.status}>{STATUS_LABEL[o.status as OrderStatus]}</span><small style={{ color: '#8A8D95' }}>Placed {fmtDate(o.createdAt, true)}</small></div>
            <div className="sec">Items</div>
            <div className="sum-items">{o.items.map((i: any) => (
              <div className="li" key={i.id}><span className="li-img"><img src={i.image} alt="" /></span>
                <div><span className="li-name" style={{ fontSize: 13 }}>{i.name}</span><span className="li-meta">{money(i.price)} × {i.qty}</span></div>
                <span className="li-price" style={{ fontSize: 13 }}>{money(i.price * i.qty)}</span></div>))}</div>
            <div className="sum-row tot"><span>Total</span><span>{money(o.total)}</span></div>
            <div className="f-row" style={{ marginTop: 6 }}>
              <div><div className="sec">Customer</div><p style={{ fontSize: 14, lineHeight: 1.7, color: '#4B4D55' }}><b style={{ color: 'var(--graphite)' }}>{c.name}</b><br />{c.phone}<br />{c.email}</p></div>
              <div><div className="sec">Deliver to</div><p style={{ fontSize: 14, lineHeight: 1.7, color: '#4B4D55' }}>{c.address}{c.area ? ', ' + c.area : ''}<br />{c.city}{c.notes && <><br /><i style={{ color: '#8A8D95' }}>“{c.notes}”</i></>}</p></div>
            </div>
            <div className="sec">History</div>
            <ul className="tl">{(o.history || []).map((h: any, i: number) => <li key={i} className="done"><i /><b>{STATUS_LABEL[h.status as OrderStatus] || h.status}</b><small>{fmtDate(h.at, true)}</small></li>)}</ul>
          </Modal>
        );
      })()}
    </>
  );
}

/* ------------------------------------------------------------------ messages */
function Messages({ messages }: any) {
  return messages.length ? (
    <div className="tbl-wrap"><table className="tbl">
      <thead><tr><th>From</th><th>Topic</th><th>Message</th><th>Received</th><th></th></tr></thead>
      <tbody>{messages.map((m: any) => (
        <tr key={m._id} style={m.read ? { opacity: 0.65 } : undefined}>
          <td className="pn"><b>{m.name}</b><small>{m.phone}<br />{m.email}</small></td>
          <td><span className="chip">{m.topic}</span></td>
          <td style={{ maxWidth: 380, whiteSpace: 'pre-wrap', fontSize: 13.5 }}>{m.message}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(m.createdAt, true)}</td>
          <td><div className="row-act" style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
            <a className="btn btn-rose btn-sm" style={{ padding: '7px 13px', fontSize: 12 }} href={'mailto:' + m.email + '?subject=' + encodeURIComponent('Re: ' + m.topic)}>Reply</a>
            <button className="li-rm" type="button" onClick={() => updateDoc(doc(db, 'messages', m._id), { read: !m.read })}>{m.read ? 'Mark unread' : 'Mark read'}</button>
          </div></td>
        </tr>
      ))}</tbody>
    </table></div>
  ) : <div className="panel"><EmptyState title="No messages yet" text="Messages from the contact page appear here, and are emailed to the business." href="/contact" button="View contact page" /></div>;
}

/* ------------------------------------------------------------------ settings */
function Settings({ settings, flash }: any) {
  const [s, setS] = useState<any>(null);
  useEffect(() => {
    if (settings && !s) setS({
      whatsapp: '', whatsappDisplay: '', deliveryFee: 0, supportHours: 'Monday to Saturday, 10 am – 6 pm', email: 'info@mychromebook.pk', phoneDisplay: '+92 330 2007440', unpaidHoldHours: 48,
      ...settings, bank: { bankName: '', accountTitle: '', accountNo: '', iban: '', ...(settings.bank || {}) },
    });
  }, [settings, s]);
  if (!s) return <p className="sub">Loading…</p>;
  const f = (k: string, l: string, ph = '', type = 'text', help = '') => (
    <div className="f"><label>{l}</label><input type={type} value={s[k] ?? ''} placeholder={ph} onChange={(e) => setS({ ...s, [k]: e.target.value })} />{help && <small style={{ color: '#8A8D95', fontSize: 12 }}>{help}</small>}</div>
  );
  const b = (k: string, l: string) => (
    <div className="f"><label>{l}</label><input value={s.bank[k] ?? ''} onChange={(e) => setS({ ...s, bank: { ...s.bank, [k]: e.target.value } })} /></div>
  );
  return (
    <form className="panel" onSubmit={async (e) => {
      e.preventDefault();
      const wa = String(s.whatsapp || '').replace(/\D/g, '');
      if (wa && !/^923\d{9}$/.test(wa)) return alert('WhatsApp number: use the international format, e.g. 923302007440');
      await setDoc(doc(db, 'settings', 'store'), { ...s, whatsapp: wa, deliveryFee: Math.max(0, +s.deliveryFee || 0), unpaidHoldHours: Math.max(1, +s.unpaidHoldHours || 48), updatedAt: serverTimestamp() }, { merge: true });
      flash('Settings saved — live on the site');
    }}>
      <h3>Store settings</h3><p className="sub">Shown to customers at checkout and on the order page. Saved changes are live immediately.</p>
      <div className="sec">WhatsApp</div>
      <div className="f-row">{f('whatsapp', 'WhatsApp number (for links)', '923302007440', 'text', 'International format, digits only')}{f('whatsappDisplay', 'WhatsApp number (as shown)', '+92 330 2007440')}</div>
      <div className="sec">Bank transfer details</div>
      <div className="f-row">{b('bankName', 'Bank name')}{b('accountTitle', 'Account title')}</div>
      <div className="f-row">{b('accountNo', 'Account number')}{b('iban', 'IBAN')}</div>
      <div className="sec">Store</div>
      <div className="f-row">{f('supportHours', 'Support hours', 'Monday to Saturday, 10 am – 6 pm')}{f('email', 'Store email')}</div>
      <div className="f-3">{f('phoneDisplay', 'Phone (as shown)')}{f('deliveryFee', 'Delivery fee (₨, 0 = free)', '0', 'number')}{f('unpaidHoldHours', 'Hold unpaid orders (hours)', '48', 'number')}</div>
      <button className="btn btn-rose" type="submit">Save settings</button>
    </form>
  );
}
