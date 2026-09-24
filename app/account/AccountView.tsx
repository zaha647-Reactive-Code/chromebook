'use client';
import { useEffect, useState } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { useStore } from '@/components/StoreProvider';
import { EmptyState } from '@/components/CartBits';
import { STATUS_LABEL, fmtDate, money } from '@/lib/format';

type Addr = { label: string; city: string; area?: string; address: string };

/* My account — orders, saved addresses and profile, stored in Firebase so they
   work on every device (report C4). */
export default function AccountView() {
  const { user, loading, isAdmin } = useAuth();
  const { wish } = useStore();
  const [tab, setTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<any[] | null>(null);
  const [profile, setProfile] = useState<{ name: string; phone: string; addresses: Addr[] }>({ name: '', phone: '', addresses: [] });
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null);
  const [na, setNa] = useState<Addr>({ label: '', city: '', area: '', address: '' });

  useEffect(() => { if (!loading && !user) window.location.href = '/login?next=/account'; }, [loading, user]);
  useEffect(() => {
    const h = (location.hash || '').slice(1) as any;
    if (['orders', 'addresses', 'profile'].includes(h)) setTab(h);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const s = await getDoc(doc(db, 'users', user.uid));
        const d: any = s.exists() ? s.data() : {};
        setProfile({ name: d.name || user.displayName || '', phone: d.phone || '', addresses: Array.isArray(d.addresses) ? d.addresses : [] });
      } catch (e) { console.warn(e); }
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setOrders(snap.docs.map((x) => x.data()).sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      } catch (e) { console.warn(e); setOrders([]); }
    })();
  }, [user]);

  if (loading || !user) return <main className="pg" style={{ minHeight: 400 }} />;

  const saveProfile = async (patch: Partial<typeof profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    await setDoc(doc(db, 'users', user.uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
  };
  const name = profile.name || user.displayName || user.email || '';
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const open = (orders || []).filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const go = (t: typeof tab) => { setTab(t); setMsg(null); history.replaceState(null, '', '#' + t); };

  return (
    <main className="pg" style={{ paddingTop: 46 }}>
      <div className="db-head">
        <div className="avatar">{initials}</div>
        <div><h1>Hello, <span className="accent">{name.split(' ')[0]}</span></h1><p>{user.email}</p></div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isAdmin && <a className="btn btn-rose btn-sm" style={{ padding: '10px 20px', fontSize: 13 }} href="/admin">Store admin</a>}
          <button type="button" className="btn btn-metal btn-sm" style={{ padding: '10px 20px', fontSize: 13 }} onClick={async () => { await signOut(auth); window.location.href = '/'; }}>Sign out</button>
        </div>
      </div>
      <div className="db-stats">
        <a className="db-stat" href="#orders" onClick={(e) => { e.preventDefault(); go('orders'); }}><small>Orders</small><b>{orders ? orders.length : '–'}</b></a>
        <a className="db-stat" href="#orders" onClick={(e) => { e.preventDefault(); go('orders'); }}><small>In progress</small><b>{orders ? open : '–'}</b></a>
        <a className="db-stat" href="/wishlist"><small>Wishlist</small><b>{wish.length}</b></a>
      </div>
      <div className="tabs">
        {([['orders', 'My orders'], ['addresses', 'Addresses'], ['profile', 'Profile']] as const).map(([k, l]) =>
          <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => go(k)}>{l}</button>)}
      </div>

      <div className="panel">
        {tab === 'orders' && (orders === null ? <p className="sub">Loading your orders…</p> : orders.length ? orders.map((o) => (
          <div className="ord" key={o.id}>
            <div><b>{o.id}</b><small>{fmtDate(o.createdAt)} · {o.items.reduce((a: number, i: any) => a + i.qty, 0)} items</small></div>
            <div className="thumbs">{o.items.slice(0, 4).map((i: any) => <img key={i.id} src={i.image} alt="" />)}</div>
            <div><span className={'st ' + o.status}>{STATUS_LABEL[o.status as keyof typeof STATUS_LABEL]}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="amt">{money(o.total)}</span>
              <a className="btn btn-metal btn-sm" style={{ padding: '8px 15px', fontSize: 12.5 }} href={'/order/' + encodeURIComponent(o.id) + '?t=' + o.viewToken}>View</a>
            </div>
          </div>
        )) : <EmptyState title="No orders yet" text="Orders you place while signed in appear here with their live status." href="/shop" button="Start shopping" />)}

        {tab === 'addresses' && (
          <>
            {profile.addresses.length ? (
              <div className="adr">{profile.addresses.map((a, i) => (
                <div key={i} className={'adr-card' + (i === 0 ? ' first' : '')}>
                  {i === 0 && <span className="def">Default</span>}
                  <b>{a.label || a.city}</b>{a.address}{a.area ? ', ' + a.area : ''}<br />{a.city}
                  <button type="button" className="li-rm" onClick={() => saveProfile({ addresses: profile.addresses.filter((_, k) => k !== i) })}>Remove</button>
                </div>
              ))}</div>
            ) : <p className="sub">No saved addresses yet. Add one below — it will be filled in for you at checkout.</p>}
            <form style={{ marginTop: 24, borderTop: '1px solid var(--silver-2)', paddingTop: 22 }} noValidate autoComplete="on" onSubmit={async (e) => {
              e.preventDefault();
              if (!na.city.trim() || na.address.trim().length < 8) return setMsg({ t: 'Please add a city and a full street address.' });
              await saveProfile({ addresses: [...profile.addresses, { label: na.label.trim() || na.city.trim(), city: na.city.trim(), area: (na.area || '').trim(), address: na.address.trim() }].slice(0, 6) });
              setNa({ label: '', city: '', area: '', address: '' }); setMsg({ t: 'Address saved.', ok: true });
            }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Add an address</h3>
              <div className="f-row">
                <div className="f"><label>Label</label><input name="label" autoComplete="off" placeholder="e.g. Home, Office" value={na.label} onChange={(e) => setNa({ ...na, label: e.target.value })} maxLength={40} /></div>
                <div className="f"><label>City</label><input name="city" autoComplete="address-level2" placeholder="e.g. Faisalabad" value={na.city} onChange={(e) => setNa({ ...na, city: e.target.value })} maxLength={60} /></div>
              </div>
              <div className="f"><label>Area / sector</label><input name="area" autoComplete="address-level3" placeholder="optional" value={na.area} onChange={(e) => setNa({ ...na, area: e.target.value })} maxLength={80} /></div>
              <div className="f"><label>Street address</label><textarea name="address" autoComplete="street-address" placeholder="House number, street, nearest landmark" value={na.address} onChange={(e) => setNa({ ...na, address: e.target.value })} maxLength={300} /></div>
              {msg && <div className={'au-msg ' + (msg.ok ? 'ok' : 'err')}>{msg.t}</div>}
              <button className="btn btn-rose btn-sm" style={{ padding: '11px 22px', fontSize: 13.5 }} type="submit">Save address</button>
            </form>
          </>
        )}

        {tab === 'profile' && (
          <form noValidate autoComplete="on" onSubmit={async (e) => {
            e.preventDefault();
            if (profile.name.trim().length < 3) return setMsg({ t: 'Please enter your full name.' });
            await saveProfile({ name: profile.name.trim(), phone: profile.phone.trim() });
            try { await updateProfile(user, { displayName: profile.name.trim() }); } catch {}
            setMsg({ t: 'Your details have been saved.', ok: true });
          }}>
            <div className="f-row">
              <div className="f"><label>Full name</label><input name="name" autoComplete="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} maxLength={80} /></div>
              <div className="f"><label>Mobile number</label><input name="phone" type="tel" autoComplete="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} maxLength={20} /></div>
            </div>
            <div className="f"><label>Email address</label><input value={user.email || ''} disabled style={{ opacity: 0.7 }} /></div>
            {msg && <div className={'au-msg ' + (msg.ok ? 'ok' : 'err')}>{msg.t}</div>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-rose btn-sm" style={{ padding: '11px 22px', fontSize: 13.5 }} type="submit">Save changes</button>
              <a className="btn btn-metal btn-sm" style={{ padding: '11px 22px', fontSize: 13.5 }} href={'/login?reset=1&email=' + encodeURIComponent(user.email || '')}>Change password</a>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
