'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { WhatsApp } from '@/components/Icons';
import { STATUS_LABEL, fmtDate, money, waLink } from '@/lib/format';
import type { Order } from '@/lib/types';

function CopyBtn({ text, light }: { text: string; light?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button className={'cp' + (ok ? ' ok' : '') + (light ? ' cp-light' : '')} type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(text); } catch {
        const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch {} t.remove();
      }
      setOk(true); setTimeout(() => setOk(false), 1600);
    }}>{ok ? 'Copied' : 'Copy'}</button>
  );
}

export default function OrderView({ order: o, token, isNew, settings }: {
  order: Order; token: string; isNew: boolean;
  settings: { whatsapp: string; whatsappDisplay: string; bank: { bankName: string; accountTitle: string; accountNo: string; iban: string }; email: string; unpaidHoldHours: number };
}) {
  const { user } = useAuth();
  const c = o.customer;
  const first = (c.name || '').split(' ')[0];

  useEffect(() => {  // keep the private link in the address bar, drop "new=1"
    if (isNew) window.history.replaceState(null, '', '/order/' + encodeURIComponent(o.id) + '?t=' + token);
  }, [isNew, o.id, token]);

  const itemsTxt = o.items.map((i) => '• ' + i.name + ' × ' + i.qty).join('\n');
  const waMsg = 'Assalam o Alaikum, I have placed order ' + o.id + ' on MyChromebook.pk.\n\n' + itemsTxt + '\n\nTotal: ' + money(o.total) +
    '\nName: ' + c.name + '\nPhone: ' + c.phone + '\n\nI am attaching my payment screenshot.';

  const ORDER: string[] = ['awaiting', 'verified', 'shipped', 'delivered'];
  const at: Record<string, string> = {}; (o.history || []).forEach((h) => { at[h.status] = h.at; });
  const curIdx = ORDER.indexOf(o.status);
  const steps = [
    { t: 'Order placed', d: fmtDate(o.createdAt, true) },
    { t: 'Awaiting payment verification', d: 'Send your payment screenshot on WhatsApp' },
    { t: 'Payment verified', d: at.verified ? fmtDate(at.verified, true) : 'We confirm your transfer' },
    { t: 'Shipped', d: at.shipped ? fmtDate(at.shipped, true) : 'On its way to you' },
    { t: 'Delivered', d: at.delivered ? fmtDate(at.delivered, true) : 'Usually 3–5 working days' },
  ];
  const b = settings.bank;
  const bankRows: [string, string][] = [['Bank', b.bankName], ['Account title', b.accountTitle], ['Account number', b.accountNo], ['IBAN', b.iban], ['Amount', money(o.total)]];
  const payNeeded = o.status === 'awaiting';

  return (
    <main className="pg" style={{ paddingTop: 44 }}>
      <div className="or-head">
        {isNew ? (
          <>
            <div className="ok-mark"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></div>
            <h1>Thank you, <span className="accent">{first || 'friend'}</span></h1>
            <p>Your order has been placed and our team has been notified. Complete the bank transfer below and send us the screenshot on WhatsApp — we will confirm and ship.</p>
          </>
        ) : (
          <><span className="hero-kicker" style={{ opacity: 1, animation: 'none' }}>Order details</span><h1>Order <span className="accent">status</span></h1></>
        )}
        {/* report I2: this bar now wraps into two rows on small phones */}
        <div className="ord-no">
          <span className="ord-no-main">Order <b>{o.id}</b></span>
          <span className={'st ' + o.status}>{STATUS_LABEL[o.status]}</span>
          <CopyBtn text={o.id} light />
        </div>
      </div>

      <div className="pg-grid">
        <div>
          {payNeeded && (
            <div className="panel">
              <h3>Complete your payment</h3><p className="sub">Three quick steps and your order is on its way.</p>
              <ol className="pay-steps">
                <li><span>Transfer <b>{money(o.total)}</b> to the account below.</span></li>
                <li><span>Send the payment screenshot on WhatsApp{settings.whatsappDisplay ? <> to <b>{settings.whatsappDisplay}</b></> : null}, with your order number <b>{o.id}</b>.</span></li>
                <li><span>We verify the transfer, update your order status and ship.</span></li>
              </ol>
              <div className="bank"><h4>Bank transfer details</h4>
                {bankRows.map(([l, v]) => (
                  <div className="bank-row" key={l}><span><small>{l}</small><b>{v}</b></span><CopyBtn text={v} /></div>
                ))}
              </div>
              <a className="wa-btn no-print" style={{ marginTop: 18 }} target="_blank" rel="noopener" href={waLink(settings.whatsapp, waMsg)}><WhatsApp />Send payment screenshot on WhatsApp</a>
              <p className="or-alt">Unpaid orders are held for {settings.unpaidHoldHours} hours.</p>
            </div>
          )}

          <div className="panel">
            <h3>Order progress</h3><p className="sub">We update this as your order moves along. Refresh the page to see the latest status.</p>
            {o.status === 'cancelled' ? (
              <ul className="tl">
                <li className="done"><i /><b>Order placed</b><small>{fmtDate(o.createdAt, true)}</small></li>
                <li className="now"><i /><b>Cancelled</b><small>{at.cancelled ? fmtDate(at.cancelled, true) : ''}</small></li>
              </ul>
            ) : (
              <ul className="tl">
                {steps.map((s, i) => {
                  const idx = i - 1;
                  const cls = i === 0 ? 'done' : idx < curIdx ? 'done' : idx === curIdx ? (o.status === 'delivered' ? 'done' : 'now') : '';
                  return <li key={s.t} className={cls}><i /><b>{s.t}</b><small>{s.d}</small></li>;
                })}
              </ul>
            )}
          </div>

          {!user && isNew && (
            <div className="panel cta-acct no-print">
              <h3>Save your details for next time</h3>
              <p className="sub" style={{ marginBottom: 16 }}>Create an account with this email to see all your orders and check out faster.</p>
              <a className="btn btn-rose btn-sm" style={{ padding: '11px 20px', fontSize: 13.5 }}
                href={'/signup?name=' + encodeURIComponent(c.name) + '&email=' + encodeURIComponent(c.email) + '&phone=' + encodeURIComponent(c.phone)}>Create account</a>
            </div>
          )}
        </div>

        <aside className="sticky">
          <div className="panel">
            <h3>Order summary</h3><p className="sub">Placed {fmtDate(o.createdAt, true)}</p>
            <div className="sum-items">
              {o.items.map((i) => (
                <div className="li" key={i.id}>
                  <span className="li-img">{i.image ? <Image src={i.image} alt="" width={112} height={96} sizes="56px" /> : null}</span>
                  <div><span className="li-name" style={{ fontSize: 13 }}>{i.name}</span><span className="li-meta">Qty {i.qty}</span></div>
                  <span className="li-price" style={{ fontSize: 13 }}>{money(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="sum-row"><span>Subtotal</span><b>{money(o.subtotal)}</b></div>
            <div className="sum-row"><span>Delivery</span>{o.delivery ? <b>{money(o.delivery)}</b> : <span className="sum-free">Free</span>}</div>
            <div className="sum-row tot"><span>Total</span><span>{money(o.total)}</span></div>
          </div>
          <div className="panel">
            <h3>Delivering to</h3>
            <p className="addr" style={{ marginTop: 12 }}><b>{c.name}</b>{c.address}{c.area ? ', ' + c.area : ''}<br />{c.city}<br />{c.phone}<br />{c.email}</p>
            <div className="no-print" style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-metal btn-sm" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => window.print()}>Print</button>
              <a className="btn btn-metal btn-sm" style={{ padding: '10px 18px', fontSize: 13 }} href="/shop">Continue shopping</a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
