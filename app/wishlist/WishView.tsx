'use client';
import Image from 'next/image';
import { useStore } from '@/components/StoreProvider';
import { useAuth } from '@/components/AuthProvider';
import { EmptyState } from '@/components/CartBits';
import { Heart } from '@/components/Icons';
import { money } from '@/lib/format';

export default function WishView() {
  const { wish, byId, add, toggleWish, showToast, openDrawer, ready } = useStore();
  const { user } = useAuth();
  const list = wish.map(byId).filter(Boolean) as NonNullable<ReturnType<typeof byId>>[];

  return (
    <>
      <header className="pg-hero">
        <span className="hero-kicker">Saved for later</span>
        <h1>Your <span className="accent">wishlist</span></h1>
        <p>{user ? 'Saved to your account — it follows you to every device.' : <>Everything you have saved in one place. <a href="/login?next=/wishlist" style={{ color: 'var(--rose-deep)', fontWeight: 600 }}>Sign in</a> to keep it on every device.</>}</p>
      </header>
      <main className="pg">
        {!ready ? null : !list.length ? (
          <div className="panel"><EmptyState icon={<Heart />} title="Nothing saved yet" text="Tap the heart on any product to save it here for later." href="/shop" button="Browse products" /></div>
        ) : (
          <>
            <div className="wl-bar">
              <span>{list.length + (list.length === 1 ? ' saved product' : ' saved products')}</span>
              <button type="button" className="btn btn-rose btn-sm" onClick={() => {
                let moved = 0; list.forEach((p) => { if (add(p.id, 1)) { toggleWish(p.id); moved++; } });
                if (moved) openDrawer();
              }}>Move all to cart</button>
            </div>
            <div className="grid4">
              {list.map((p, i) => {
                const href = '/shop/' + p.id; const sold = p.stockQty <= 0;
                return (
                  <article key={p.id} className={'b-item wl-card rv in ' + ['', 'd1', 'd2', 'd3'][i % 4]} data-id={p.id}>
                    <div className="b-img">
                      {sold && <span className="b-tagpill">SOLD OUT</span>}
                      <span className="b-heart on" title="Remove from wishlist" role="button" onClick={() => toggleWish(p.id)}><Heart /></span>
                      <a href={href}><Image src={p.image} alt={p.name} width={640} height={560} sizes="(max-width:760px) 100vw, 25vw" /></a>
                    </div>
                    <div className="b-body">
                      <h3><a href={href} style={{ color: 'inherit' }}>{p.name}</a></h3>
                      <p className="desc">{p.short}</p>
                      <div className="b-row">
                        <span className="price-pill">{money(p.price)}</span>
                        {sold ? <span className="btn btn-metal btn-sm">Sold out</span> :
                          <button type="button" className="btn btn-rose btn-sm" onClick={() => {
                            if (add(p.id, 1)) { toggleWish(p.id); showToast({ img: p.image, text: p.name + ' moved to cart', link: '/cart', linkText: 'View cart', drawer: true }); }
                          }}>Move to cart</button>}
                      </div>
                      <button type="button" className="wl-rm" onClick={() => toggleWish(p.id)}>Remove</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
