'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from './StoreProvider';
import { useAuth } from './AuthProvider';
import { Bag, Heart, Search, User } from './Icons';
import { money } from '@/lib/format';
import { searchProducts } from '@/lib/search';

const TABS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

/* Shared header — same markup and classes as the approved design. */
export default function Header() {
  const path = usePathname() || '/';
  const { cartCount, wish, openDrawer, products } = useStore();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(-1);
  const formRef = useRef<HTMLFormElement>(null);
  const [bump, setBump] = useState(false);
  const prev = useRef(cartCount);

  useEffect(() => {
    const u = new URL(window.location.href);
    if (path === '/shop' && u.searchParams.get('q')) setQ(u.searchParams.get('q') || '');
  }, [path]);

  useEffect(() => {
    if (cartCount > prev.current) { setBump(false); requestAnimationFrame(() => setBump(true)); }
    prev.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (formRef.current && !formRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const results = useMemo(() => (q.trim() ? searchProducts(products, q, 6) : []), [q, products]);
  const isActive = (href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/'));

  const hl = (text: string) => {
    const words = q.trim().split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!words.length) return text;
    const parts = text.split(new RegExp('(' + words.join('|') + ')', 'ig'));
    return parts.map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
  };

  return (
    <nav className="nav">
      <div className="nav-top">
        <a className="logo-pill" href="/" aria-label="MyChromebook home">
          <svg className="logo-mark" viewBox="0 0 44 44">
            <defs>
              <linearGradient id="lgm" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#D8A3AB" /><stop offset=".55" stopColor="#C4838D" /><stop offset="1" stopColor="#B4B9C3" />
              </linearGradient>
            </defs>
            <rect x="6" y="9" width="32" height="21" rx="4" fill="none" stroke="url(#lgm)" strokeWidth="2.6" />
            <path d="M4 33.5h36" stroke="url(#lgm)" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="22" cy="19.5" r="3.2" fill="url(#lgm)" />
          </svg>
          <span className="logo-word"><span className="my">My</span>Chromebook</span>
        </a>

        <form className="searchbar" action="/shop" method="get" ref={formRef} role="search"
          onSubmit={(e) => {
            if (!q.trim()) { e.preventDefault(); return; }
            if (act > -1 && results[act]) { e.preventDefault(); window.location.href = '/shop/' + results[act].id; }
          }}>
          <input type="text" name="q" placeholder="Search Chromebooks, accessories…" aria-label="Search" autoComplete="off"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); setAct(-1); }}
            onFocus={() => q.trim() && setOpen(true)}
            onKeyDown={(e) => {
              if (!open) return;
              if (e.key === 'ArrowDown') { e.preventDefault(); setAct((a) => Math.min(results.length - 1, a + 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setAct((a) => Math.max(-1, a - 1)); }
              else if (e.key === 'Escape') setOpen(false);
            }} />
          <button type="submit" aria-label="Search"><Search /></button>
          <div className={'sr-drop' + (open && q.trim() ? ' open' : '')} role="listbox">
            {results.length ? (
              <>
                {results.map((p, i) => (
                  <a key={p.id} className={'sr-item' + (i === act ? ' act' : '')} role="option" href={'/shop/' + p.id}>
                    <img src={p.image} alt="" />
                    <span>
                      <b>{hl(p.name)}</b>
                      <small>{p.stockQty <= 0 ? 'Sold out' : p.category === 'refurb' ? 'Refurbished' : p.category === 'new' ? 'New Chromebook' : 'Accessory'}</small>
                    </span>
                    <span className="sr-price">{money(p.price)}</span>
                  </a>
                ))}
                <a className="sr-all" href={'/shop?q=' + encodeURIComponent(q.trim())}>See all results for “{q.trim()}”</a>
              </>
            ) : (
              <div className="sr-empty">No products match “{q.trim()}”. Try “mouse”, “stylus” or “CTL”.</div>
            )}
          </div>
        </form>

        <div className="nav-icons">
          <a className="icon-c" href="/wishlist" data-mc="wish" aria-label="Wishlist">
            <Heart /><span className={'ic-badge' + (wish.length ? ' on' : '')}>{wish.length}</span>
          </a>
          <a className={'icon-c' + (user ? ' is-in' : '')} href="/account" data-mc="acct"
             aria-label="Account" title={user ? 'Signed in as ' + (user.displayName || user.email) : 'Sign in or create an account'}>
            <User />
          </a>
          <a className="icon-c" href="/cart" data-mc="cart" aria-label="Cart"
             onClick={(e) => { if (path !== '/cart') { e.preventDefault(); openDrawer(); } }}>
            <Bag /><span className={'ic-badge' + (cartCount ? ' on' : '') + (bump ? ' bump' : '')}>{cartCount > 99 ? '99+' : cartCount}</span>
          </a>
          <button className="nav-burger" id="burger" aria-label="Open menu" onClick={() => setMenu((m) => !m)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={'nav-tabs' + (menu ? ' open' : '')} id="navTabs">
        {TABS.map((t) => (
          <a key={t.href} className={'tab' + (isActive(t.href) ? ' active' : '')} href={t.href}>{t.label}</a>
        ))}
      </div>
    </nav>
  );
}
