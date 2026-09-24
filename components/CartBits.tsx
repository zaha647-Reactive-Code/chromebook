'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStore } from './StoreProvider';
import { Bag, Truck } from './Icons';
import { money } from '@/lib/format';

/* One cart row — used by the drawer and the cart page. Shows stock problems (report I1). */
export function CartLineRow({ id }: { id: string }) {
  const { cartItems, setQty, remove } = useStore();
  const l = cartItems.find((x) => x.id === id);
  const [out, setOut] = useState(false);
  if (!l) return null;
  const href = '/shop/' + l.id;
  return (
    <div className={'li' + (out ? ' out' : '') + (l.problem ? ' li-problem' : '')}>
      <a className="li-img" href={href}><Image src={l.p.image} alt="" width={160} height={140} sizes="80px" /></a>
      <div>
        <a className="li-name" href={href}>{l.p.name}</a>
        <span className="li-meta">{money(l.p.price)} each</span>
        {l.problem === 'out' && <span className="li-warn">Sold out — please remove it to continue</span>}
        {l.problem === 'reduced' && <span className="li-warn">Only {l.p.stockQty} left — quantity reduced</span>}
      </div>
      <div className="li-side">
        <span className="li-price">{l.problem === 'out' ? '—' : money(l.line)}</span>
        {l.problem !== 'out' && (
          <span className="qty">
            <button type="button" aria-label="Less" onClick={() => setQty(l.id, l.qty - 1)}>−</button>
            <span>{l.qty}</span>
            <button type="button" aria-label="More" disabled={l.qty >= l.p.stockQty} onClick={() => setQty(l.id, l.qty + 1)}>+</button>
          </span>
        )}
        <button type="button" className="li-rm" onClick={() => { setOut(true); setTimeout(() => remove(l.id), 260); }}>Remove</button>
      </div>
    </div>
  );
}

export function EmptyState({ title, text, href, button, icon }: { title: string; text: string; href: string; button: string; icon?: React.ReactNode }) {
  return (
    <div className="empty">
      <div className="e-ic">{icon || <Bag />}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <a className="btn btn-rose" href={href}>{button} <span className="arrow-c">↗</span></a>
    </div>
  );
}

export function CartDrawer() {
  const { drawerOpen, closeDrawer, cartItems, cartCount, subtotal, delivery, total, hasProblems } = useStore();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <div className={'cd-veil' + (drawerOpen ? ' open' : '')} onClick={closeDrawer} />
      <aside className={'cd' + (drawerOpen ? ' open' : '')} aria-label="Your cart" aria-hidden={!drawerOpen}>
        <div className="cd-head">
          <h3>Your cart<small>{cartCount ? cartCount + (cartCount === 1 ? ' item' : ' items') : ''}</small></h3>
          <button className="cd-x" type="button" aria-label="Close cart" onClick={closeDrawer}>✕</button>
        </div>
        {cartItems.length > 0 && delivery === 0 && (
          <div className="cd-free"><Truck />Free delivery on every order, anywhere in Pakistan.</div>
        )}
        <div className="cd-list">
          {cartItems.length
            ? cartItems.map((l) => <CartLineRow key={l.id} id={l.id} />)
            : <EmptyState title="Your cart is empty" text="Browse Chromebooks and accessories, then add them here." href="/shop" button="Go to shop" />}
        </div>
        {cartItems.length > 0 && (
          <div className="cd-foot">
            <div className="cd-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="cd-row"><span>Delivery</span><span>{delivery ? money(delivery) : <b className="sum-free">Free</b>}</span></div>
            <div className="cd-row tot"><span>Total</span><span>{money(total)}</span></div>
            <div className="cd-btns">
              <a className="btn btn-metal" href="/cart">View cart</a>
              {hasProblems
                ? <a className="btn btn-rose" href="/cart">Review cart</a>
                : <a className="btn btn-rose" href="/checkout">Checkout</a>}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export function Toast() {
  const { toast, openDrawer } = useStore();
  return (
    <div className={'mc-toast' + (toast ? ' show' : '')} role="status">
      {toast?.img && <img src={toast.img} alt="" />}
      <span className="t-txt">{toast?.text}</span>
      {toast?.link && (
        <a href={toast.link} onClick={(e) => { if (toast.drawer && location.pathname !== '/cart') { e.preventDefault(); openDrawer(); } }}>
          {toast.linkText || 'View'}
        </a>
      )}
    </div>
  );
}
