'use client';
import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Clock, Heart } from '@/components/Icons';
import { isPkMobile } from '@/lib/format';

/* Sign in / create account / reset password — Firebase Authentication (report C4).
   Accounts now work on every device; password reset is sent by email. */

const PIN = <svg viewBox="0 0 24 24"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></svg>;

const friendly = (code: string) => ({
  'auth/invalid-credential': 'That email and password do not match. Please try again.',
  'auth/wrong-password': 'That password is not right. Please try again.',
  'auth/user-not-found': 'We could not find an account with that email.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
  'auth/weak-password': 'Please choose a stronger password (at least 8 characters).',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Connection problem — please check your internet.',
  'auth/invalid-email': 'Please enter a valid email address.',
} as Record<string, string>)[code] || 'Something went wrong. Please try again.';

export default function AuthForm({ mode: initial, next, pre }: { mode: 'signin' | 'signup' | 'forgot'; next: string; pre: { name?: string; email?: string; phone?: string } }) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState(initial);
  const [f, setF] = useState({ name: pre.name || '', email: pre.email || '', phone: pre.phone || '', pw: '', terms: false });
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const safeNext = /^\/[a-z0-9/_-]*$/i.test(next) ? next : '/account';

  useEffect(() => { if (!loading && user && mode !== 'forgot') window.location.href = safeNext; }, [user, loading]); // eslint-disable-line
  const set = (k: keyof typeof f) => (e: any) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  let score = 0; const v = f.pw;
  if (v.length >= 8) score++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++; if (/\d/.test(v)) score++; if (/[^A-Za-z0-9]/.test(v)) score++;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    if (!firebaseConfigured) return setMsg({ t: 'Accounts are not connected yet (Firebase settings missing).' });
    const email = f.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setMsg({ t: 'Please enter a valid email address.' });
    setBusy(true);
    try {
      if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email, { url: window.location.origin + '/login' });
        setMsg({ t: 'If an account exists for ' + email + ', a password reset link is on its way. Check your inbox (and spam folder).', ok: true });
      } else if (mode === 'signin') {
        if (!f.pw) { setBusy(false); return setMsg({ t: 'Please enter your password.' }); }
        await signInWithEmailAndPassword(auth, email, f.pw);
        window.location.href = safeNext;
        return;
      } else {
        if (f.name.trim().length < 3) { setBusy(false); return setMsg({ t: 'Please enter your full name.' }); }
        if (!isPkMobile(f.phone)) { setBusy(false); return setMsg({ t: 'Please enter a valid Pakistani mobile number.' }); }
        if (f.pw.length < 8) { setBusy(false); return setMsg({ t: 'Your password needs at least 8 characters.' }); }
        if (!f.terms) { setBusy(false); return setMsg({ t: 'Please agree to the terms and privacy policy to continue.' }); }
        const cred = await createUserWithEmailAndPassword(auth, email, f.pw);
        await updateProfile(cred.user, { displayName: f.name.trim() });
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: f.name.trim(), phone: f.phone.trim(), addresses: [], wishlist: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        }, { merge: true });
        window.location.href = safeNext;
        return;
      }
    } catch (err: any) { setMsg({ t: friendly(err?.code) }); }
    setBusy(false);
  };

  return (
    <main className="pg" style={{ paddingTop: 46 }}>
      <div className="au">
        <div className="au-side">
          <div>
            <span className="hero-kicker">Your MyChromebook account</span>
            <h2>Shop faster, <span className="accent">track everything</span></h2>
            <p>Save your delivery details once, follow every order from payment to your door, and keep a wishlist that follows you to every device.</p>
            <ul className="au-perks">
              <li><i><Clock /></i>Live status for every order</li>
              <li><i>{PIN}</i>Saved addresses for one-tap checkout</li>
              <li><i><Heart /></i>Your wishlist on every device</li>
            </ul>
          </div>
          <p style={{ fontSize: 12.5, color: '#9A9CA5', marginTop: 30 }}>No account? You can still check out as a guest.</p>
        </div>

        <form className="au-card" noValidate autoComplete="on" onSubmit={submit}>
          {mode === 'forgot' ? (
            <>
              <h3>Reset your password</h3>
              <p className="sub">Enter the email you signed up with and we will email you a reset link.</p>
            </>
          ) : (
            <div className="tabs">
              <button type="button" className={mode === 'signin' ? 'on' : ''} onClick={() => { setMode('signin'); setMsg(null); }}>Sign in</button>
              <button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setMsg(null); }}>Create account</button>
            </div>
          )}
          {msg && <div className={'au-msg ' + (msg.ok ? 'ok' : 'err')}>{msg.t}</div>}

          {mode === 'signup' && (
            <div className="f"><label htmlFor="fName">Full name</label>
              <input id="fName" name="name" autoComplete="name" placeholder="e.g. Ayesha Khan" value={f.name} onChange={set('name')} maxLength={80} /></div>
          )}
          <div className={mode === 'signup' ? 'f-row' : ''}>
            <div className="f"><label htmlFor="fEmail">Email address</label>
              <input id="fEmail" name="email" type="email" inputMode="email" autoComplete={mode === 'signup' ? 'email' : 'username'} placeholder="you@example.com" value={f.email} onChange={set('email')} maxLength={120} /></div>
            {mode === 'signup' && (
              <div className="f"><label htmlFor="fPhone">Mobile number</label>
                <input id="fPhone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03xx xxxxxxx" value={f.phone} onChange={set('phone')} maxLength={20} /></div>
            )}
          </div>
          {mode !== 'forgot' && (
            <div className="f"><label htmlFor="fPw">Password</label>
              <div className="pw">
                <input id="fPw" name="password" type={show ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} value={f.pw} onChange={set('pw')} maxLength={128} />
                <button type="button" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
              </div>
            </div>
          )}
          {mode === 'signup' && (
            <>
              <div className="pw-meter"><i style={{ width: Math.max(8, score * 25) + '%', background: ['#D98B8B', '#D98B8B', '#D9B26A', '#7FB894', '#4F9A6E'][score] }} /></div>
              <div className="pw-hint">{f.pw ? ['Too short', 'Weak — add numbers or capitals', 'Fair', 'Good', 'Strong password'][score] : 'Use 8 or more characters with a mix of letters and numbers.'}</div>
              <label className="check" style={{ margin: '18px 0 20px' }}>
                <input type="checkbox" checked={f.terms} onChange={set('terms')} />
                <span>I agree to the <a href="/terms" style={{ color: 'var(--rose-deep)' }}>terms</a> and <a href="/privacy" style={{ color: 'var(--rose-deep)' }}>privacy policy</a></span>
              </label>
            </>
          )}
          {mode === 'signin' && (
            <div className="au-row"><span />
              <button type="button" className="au-link" onClick={() => { setMode('forgot'); setMsg(null); }}>Forgot password?</button></div>
          )}
          <button className="btn btn-rose" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? <>Sign in <span className="arrow-c">↗</span></> : mode === 'signup' ? <>Create account <span className="arrow-c">↗</span></> : 'Send reset link'}
          </button>
          {mode === 'forgot' && <p className="au-alt"><button type="button" className="au-link" onClick={() => { setMode('signin'); setMsg(null); }}>← Back to sign in</button></p>}
        </form>
      </div>
    </main>
  );
}
