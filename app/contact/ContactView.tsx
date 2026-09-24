'use client';
import { useEffect, useRef, useState } from 'react';
import { isPkMobile } from '@/lib/format';

const TOPICS = ['General enquiry', 'Buying a Chromebook', 'Bulk order for a school or organisation', 'Book a demo', 'Warranty or after-sales support'];

/* Contact page — same design; the form now really sends (report I3):
   saved in Firestore and emailed to the business by the server. */
export default function ContactView({ supportHours, email, phoneDisplay, demo }: { supportHours: string; email: string; phoneDisplay: string; demo: boolean }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', topic: demo ? 'Book a demo' : TOPICS[0], message: '' });
  const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle');
  const [err, setErr] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (demo) setF((x) => ({ ...x, topic: 'Book a demo' })); }, [demo]);
  const set = (k: keyof typeof f) => (e: any) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (f.name.trim().length < 2) return setErr('Please enter your name.');
    if (!isPkMobile(f.phone)) return setErr('Please enter a valid Pakistani mobile number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return setErr('Please enter a valid email address.');
    if (f.message.trim().length < 5) return setErr('Please write a short message.');
    setState('busy');
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...f, website: (document.getElementById('ct-website') as HTMLInputElement)?.value || '' }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || 'Your message could not be sent. Please email us instead.'); setState('idle'); return; }
      setState('sent');
    } catch { setErr('Connection problem — please try again.'); setState('idle'); }
  };

  return (
    <>
      <header className="ct-hero">
        <div className="wrap">
          <span className="hero-kicker">We would love to hear from you</span>
          <h1>Get in <span className="accent">touch</span></h1>
          <p>Questions about a device, bulk orders for your school, or help choosing the right Chromebook — send us a message and our team will get back to you.</p>
        </div>
      </header>

      <section className="ct-sec">
        <div className="wrap">
          <div className="ct-grid">
            <div className="ct-card rv">
              {state === 'sent' ? (
                <div className="ct-sent">
                  <div className="ok-mark"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></div>
                  <h3>Thank you, {f.name.split(' ')[0]}!</h3>
                  <p className="ct-sub">Your message has reached our team. We will reply to <b>{f.email}</b> or call you on <b>{f.phone}</b> — usually within one working day.</p>
                  <button className="btn btn-metal" type="button" onClick={() => { setF({ name: '', phone: '', email: '', topic: TOPICS[0], message: '' }); setState('idle'); }}>Send another message</button>
                </div>
              ) : (
                <>
                  <h3>Send us a message</h3>
                  <p className="ct-sub">Fill in the form below and our team will get back to you.</p>
                  {f.topic === 'Book a demo' && <p className="ct-demo-note">Booking a demo — we have selected that for you below. Just add your details.</p>}
                  <form id="ctForm" autoComplete="on" noValidate onSubmit={submit}>
                    <div className="ct-row">
                      <div className="ct-field"><label htmlFor="ctName">Your name</label>
                        <input ref={nameRef} type="text" id="ctName" name="name" autoComplete="name" placeholder="e.g. Ayesha Khan" value={f.name} onChange={set('name')} maxLength={80} /></div>
                      <div className="ct-field"><label htmlFor="ctPhone">Phone number</label>
                        <input type="tel" id="ctPhone" name="phone" inputMode="tel" autoComplete="tel" placeholder="03xx xxxxxxx" value={f.phone} onChange={set('phone')} maxLength={20} /></div>
                    </div>
                    <div className="ct-field"><label htmlFor="ctEmail">Email address</label>
                      <input type="email" id="ctEmail" name="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={set('email')} maxLength={120} /></div>
                    <div className="ct-field"><label htmlFor="ctTopic">What is this about?</label>
                      <select id="ctTopic" name="topic" value={f.topic} onChange={set('topic')}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></div>
                    <div className="ct-field"><label htmlFor="ctMsg">Your message</label>
                      <textarea id="ctMsg" name="message" autoComplete="off" placeholder="Tell us what you need and we will guide you." value={f.message} onChange={set('message')} maxLength={2000} /></div>
                    <input id="ct-website" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
                    {err && <p className="ct-err">{err}</p>}
                    <div className="ct-actions">
                      <button className="btn btn-rose" type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : <>Send message <span className="arrow-c">↗</span></>}</button>
                      <span className="ct-hint">Or email us directly at {email}</span>
                    </div>
                  </form>
                </>
              )}
            </div>

            <div>
              <div className="ct-card rv d1">
                <h3>Reach us directly</h3>
                <p className="ct-sub">Our team is available {supportHours}.</p>
                <ul className="ct-info">
                  <li><span className="ct-ic"><svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z" /><path d="M4 7l8 6 8-6" /></svg></span>
                    <span><b>Email</b><a href={'mailto:' + email}>{email}</a></span></li>
                  <li><span className="ct-ic"><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" /></svg></span>
                    <span><b>Phone</b><a href={'tel:+' + phoneDisplay.replace(/\D/g, '')}>{phoneDisplay}</a></span></li>
                  <li><span className="ct-ic"><svg viewBox="0 0 24 24"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></svg></span>
                    <span><b>Office</b>Tech Valley, Main Shaibzada Abdul Qayum Road, Sector I-8/3, Islamabad, Pakistan</span></li>
                </ul>
              </div>
              <div className="ct-demo rv d2">
                <h3>Book a demo</h3>
                <p>Schools and organisations can request a live walkthrough of ChromeOS and our device range — on site or online.</p>
                <a className="btn btn-rose" href="#ctForm" onClick={() => { setF((x) => ({ ...x, topic: 'Book a demo' })); setTimeout(() => nameRef.current?.focus(), 500); }}>Request a demo <span className="arrow-c">↗</span></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
