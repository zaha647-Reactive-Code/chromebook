'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from '@/lib/firebase';
import { useStore } from './StoreProvider';

/* Who is signed in (Firebase Authentication), whether they are an admin
   (custom claim set once from a trusted computer — report 6.6), and keeping the
   wishlist saved to the customer's account so it follows them to every device. */

interface AuthState { user: User | null; isAdmin: boolean; loading: boolean; getToken: () => Promise<string | null> }
const Ctx = createContext<AuthState>({ user: null, isAdmin: false, loading: true, getToken: async () => null });
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { wish, setWish, ready } = useStore();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured || !auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try { const t = await u.getIdTokenResult(); setIsAdmin(!!t.claims.admin); } catch { setIsAdmin(false); }
      } else { setIsAdmin(false); synced.current = null; }
      setLoading(false);
    });
  }, []);

  /* on sign-in: merge this browser's wishlist with the saved one */
  useEffect(() => {
    if (!user || !ready || synced.current === user.uid) return;
    synced.current = user.uid;
    (async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const saved: string[] = (snap.exists() && Array.isArray(snap.data().wishlist)) ? snap.data().wishlist : [];
        const merged = Array.from(new Set([...saved, ...wish]));
        setWish(merged);
        if (merged.length !== saved.length) await setDoc(ref, { wishlist: merged, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) { console.warn('[wishlist] could not sync', e); }
    })();
  }, [user, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  /* after that: every change is saved to the account */
  useEffect(() => {
    if (!user) return;
    const onWish = async (e: any) => {
      try { await setDoc(doc(db, 'users', user.uid), { wishlist: e.detail, updatedAt: serverTimestamp() }, { merge: true }); }
      catch (err) { console.warn('[wishlist] save failed', err); }
    };
    window.addEventListener('mc:wish', onWish);
    return () => window.removeEventListener('mc:wish', onWish);
  }, [user]);

  const getToken = async () => (auth?.currentUser ? auth.currentUser.getIdToken() : null);

  return <Ctx.Provider value={{ user, isAdmin, loading, getToken }}>{children}</Ctx.Provider>;
}
