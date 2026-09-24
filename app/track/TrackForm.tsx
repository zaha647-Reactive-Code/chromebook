'use client';
import { useState } from 'react';

/* Guest order tracking: order number + the phone number used for the order. */
export default function TrackForm({ defaultId = '' }: { defaultId?: string }) {
  const [id, setId] = useState(defaultId);
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="panel" style={{ maxWidth: 560, margin: '0 auto' }}>
      <form noValidate autoComplete="on" onSubmit={async (e) => {
        e.preventDefault(); setMsg('');
        if (id.trim().length < 6 || phone.trim().length < 10) { setMsg('Please enter your order number and the mobile number you used.'); return; }
        setBusy(true);
        try {
          const r = await fetch('/api/orders/lookup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: id.trim(), phone: phone.trim() }) });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) { setMsg(d.error || 'We could not find that order.'); setBusy(false); return; }
          window.location.href = '/order/' + encodeURIComponent(d.id) + '?t=' + d.token;
        } catch { setMsg('Connection problem — please try again.'); setBusy(false); }
      }}>
        <div className="f"><label htmlFor="tr-id">Order number</label>
          <input id="tr-id" name="order" placeholder="e.g. MCB-260924-1234" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} autoComplete="off" maxLength={40} /></div>
        <div className="f"><label htmlFor="tr-phone">Mobile number used for the order</label>
          <input id="tr-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03xx xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} /></div>
        {msg && <div className="au-msg err" style={{ display: 'block' }}>{msg}</div>}
        <button className="btn btn-rose" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>{busy ? 'Checking…' : 'Track order'}</button>
      </form>
    </div>
  );
}
