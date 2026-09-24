'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/components/StoreProvider';
import ProductCard from '@/components/ProductCard';
import { Back, Clock, Heart, Shield, Spark, Truck, Zoom } from '@/components/Icons';
import { money, stockState } from '@/lib/format';
import type { PublicProduct } from '@/lib/catalog';
import type { Product } from '@/lib/types';

const LABELS: [keyof NonNullable<Product['details']>, string][] = [
  ['processor', 'Processor'], ['ram', 'Memory (RAM)'], ['storage', 'Storage'], ['screen', 'Display'], ['battery', 'Battery'],
  ['updates', 'Automatic updates'], ['os', 'Operating system'], ['connection', 'Connection'], ['ports', 'Ports'],
  ['camera', 'Camera'], ['colour', 'Colour'], ['weight', 'Weight'], ['inTheBox', 'In the box'],
];
const KEY: [keyof NonNullable<Product['details']>, string][] = [
  ['processor', 'Processor'], ['ram', 'Memory'], ['storage', 'Storage'], ['screen', 'Display'], ['battery', 'Battery'],
  ['connection', 'Connection'], ['colour', 'Colour'], ['weight', 'Weight'], ['updates', 'Updates'],
];

export default function ProductView({ product: p, related, supportHours }: { product: Product; related: PublicProduct[]; supportHours: string }) {
  const { add, isWished, toggleWish, showToast, openDrawer } = useStore();
  const sample = !!p.placeholder;                        // report C2: never show sample text as fact
  const gallery = sample ? [p.image] : (p.gallery?.length ? p.gallery : [p.image]);
  const st = stockState(p);
  const soldOut = st === 'out';
  const [cur, setCur] = useState(0);
  const [qty, setQty] = useState(1);
  const [viewer, setViewer] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [lens, setLens] = useState('50% 50%');
  const [added, setAdded] = useState(false);
  const wished = isWished(p.id);
  const max = Math.min(p.stockQty, 99);

  const show = (i: number) => setCur((i + gallery.length) % gallery.length);

  useEffect(() => {
    if (!viewer) return;
    document.body.style.overflow = 'hidden';
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setViewer(false); setZoomed(false); }
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    };
    document.addEventListener('keydown', k);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', k); };
  }, [viewer, cur]); // eslint-disable-line react-hooks/exhaustive-deps

  const details = sample ? {} : (p.details || {});
  const rows = LABELS.filter(([k]) => details[k]).map(([k, l]) => [l, details[k] as string]);
  if (p.condition) rows.push(['Condition', p.condition === 'refurbished' ? 'Certified refurbished' : 'Brand new']);
  if (!sample && p.warranty) rows.push(['Warranty', p.warranty]);
  if (!sample && p.sku) rows.push(['Product code', p.sku]);

  let keyRows = KEY.filter(([k]) => details[k]).slice(0, 6).map(([k, l]) => [l, details[k] as string]);
  if (keyRows.length < 6 && !sample && p.warranty) keyRows.push(['Warranty', p.warranty]);
  if (keyRows.length % 2) keyRows = keyRows.slice(0, -1);

  const stockLabel = soldOut ? 'Sold out' : st === 'low' ? 'Only ' + p.stockQty + ' left' : 'In stock';

  return (
    <>
      <div className="pd-wrap">
        <nav className="pd-crumb" aria-label="Breadcrumb">
          <a href="/">Home</a><span className="sep">/</span>
          <a href="/shop">Shop</a><span className="sep">/</span>
          <b>{p.name}</b>
        </nav>
      </div>

      <section className="pd-wrap">
        <div className="pd-top">
          <div className="pd-gallery rv" style={gallery.length < 2 ? { gridTemplateColumns: '1fr' } : undefined}>
            <div className="pd-thumbs" style={gallery.length < 2 ? { display: 'none' } : undefined}>
              {gallery.map((g, i) => (
                <button key={g + i} className={i === cur ? 'on' : ''} aria-label={'Photo ' + (i + 1)} onClick={() => show(i)}>
                  <Image src={g} alt="" width={160} height={140} sizes="82px" />
                </button>
              ))}
            </div>
            <div className="pd-stage" onClick={() => setViewer(true)}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setLens(((e.clientX - r.left) / r.width) * 100 + '% ' + ((e.clientY - r.top) / r.height) * 100 + '%');
              }}>
              {p.tag && <span className="b-newpill"><Spark />{p.tag}</span>}
              <div className="pd-frame"><Image src={gallery[cur]} alt={p.name} width={1200} height={900} sizes="(max-width:960px) 100vw, 55vw" priority /></div>
              <div className="pd-lens" style={{ backgroundImage: `url("/_next/image?url=${encodeURIComponent(gallery[cur])}&w=1920&q=80")`, backgroundPosition: lens }} />
              <span className="pd-hint"><Zoom />Hover to zoom · click for full screen</span>
              {gallery.length > 1 && <span className="pd-count">{cur + 1} / {gallery.length}</span>}
            </div>
          </div>

          <div className="pd-info rv d1">
            <h1>{p.name}</h1>
            <p className="pd-lead">{sample ? p.short : (p.long || p.short)}</p>
            <div className="pd-price">
              <span className="amt">{money(p.price)}</span>
              <span className={'pd-stock ' + st}>{stockLabel}</span>
            </div>

            {(p.variants?.length || 0) > 1 && (
              <div className="pd-vars">
                <h4>Available options</h4>
                <div className="pd-swatches">
                  {p.variants!.map((v) => (
                    <a key={v.id} className={v.id === p.id ? 'on' : ''} href={'/shop/' + v.id}><i style={{ background: v.swatch }} />{v.label}</a>
                  ))}
                </div>
              </div>
            )}

            {keyRows.length > 0 && (
              <div className="pd-key">{keyRows.map(([l, v]) => <div key={l}><b>{l}</b><span>{v}</span></div>)}</div>
            )}
            {p.specs?.length > 0 && <div className="pd-chips">{p.specs.map((c) => <span key={c}>{c}</span>)}</div>}

            <div className="pd-buy">
              {!soldOut && (
                <div className="pd-qty">
                  <button type="button" aria-label="Less" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <input type="text" inputMode="numeric" aria-label="Quantity" value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(max, parseInt(e.target.value, 10) || 1)))} />
                  <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(max, q + 1))}>+</button>
                </div>
              )}
              {soldOut ? <span className="btn btn-metal">Sold out</span> : (
                <>
                  <button className="btn btn-rose" type="button" onClick={() => {
                    if (add(p.id, qty)) { setAdded(true); setTimeout(() => setAdded(false), 1500); openDrawer(); }
                  }}>{added ? <>Added <span className="arrow-c">✓</span></> : <>Add to cart <span className="arrow-c">↗</span></>}</button>
                  {/* report M1: Buy now checks out ONLY this product; the cart is left as it is */}
                  <a className="btn btn-metal" href={'/checkout?buy=' + encodeURIComponent(p.id) + '&qty=' + qty}>Buy now</a>
                </>
              )}
              <button className={'pd-fav' + (wished ? ' on' : '')} type="button" title={wished ? 'Saved to wishlist' : 'Add to wishlist'} aria-label="Add to wishlist"
                onClick={() => {
                  const on = toggleWish(p.id);
                  showToast({ img: p.image, text: on ? 'Saved to your wishlist' : 'Removed from wishlist', link: on ? '/wishlist' : '', linkText: 'View wishlist' });
                }}><Heart /></button>
            </div>
            {st === 'low' && <p className="pd-low">Only {p.stockQty} left in stock — order soon.</p>}

            <div className="pd-promise">
              <div><Truck />Free delivery across Pakistan</div>
              <div><Shield />Genuine, verified device</div>
              <div><Back />7-day money-back guarantee</div>
              <div><Clock />Support {supportHours.split(',')[0]}</div>
            </div>
          </div>
        </div>
      </section>

      {rows.length > 0 && (
        <section className="pd-wrap pd-spec-sec">
          <h2 className="rv">Full <span className="accent">specifications</span></h2>
          <div className="pd-table rv d1">{rows.map(([l, v]) => <div className="row" key={l}><b>{l}</b><span>{v}</span></div>)}</div>
          {sample && <p className="pd-soon">Full specifications for this model are being added. Questions? <a href="/contact">Ask our team</a>.</p>}
        </section>
      )}

      {related.length > 0 && (
        <section className="pd-wrap pd-rel">
          <h2 className="rv">You may also <span className="accent">like</span></h2>
          <div className="grid4">{related.map((r, i) => <ProductCard key={r.id} p={r} i={i} />)}</div>
        </section>
      )}

      <div className={'pv' + (viewer ? ' open' : '')} role="dialog" aria-label="Product photo viewer"
        onClick={(e) => { if (e.target === e.currentTarget) { setViewer(false); setZoomed(false); } }}>
        <button className="pv-btn pv-close" aria-label="Close" onClick={() => { setViewer(false); setZoomed(false); }}>✕</button>
        {gallery.length > 1 && <button className="pv-btn pv-prev" aria-label="Previous photo" onClick={() => show(cur - 1)}>‹</button>}
        {viewer && <img className={'pv-img' + (zoomed ? ' zoomed' : '')} src={`/_next/image?url=${encodeURIComponent(gallery[cur])}&w=1920&q=85`} alt={p.name} onClick={() => setZoomed((z) => !z)} />}
        {gallery.length > 1 && <button className="pv-btn pv-next" aria-label="Next photo" onClick={() => show(cur + 1)}>›</button>}
        {gallery.length > 1 && (
          <div className="pv-strip">
            {gallery.map((g, i) => <button key={g + i} className={i === cur ? 'on' : ''} onClick={() => show(i)}><img src={`/_next/image?url=${encodeURIComponent(g)}&w=128&q=70`} alt="" /></button>)}
          </div>
        )}
      </div>
    </>
  );
}
