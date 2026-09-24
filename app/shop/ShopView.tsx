'use client';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { EmptyState } from '@/components/CartBits';
import { Search } from '@/components/Icons';
import { searchProducts } from '@/lib/search';
import type { PublicProduct } from '@/lib/catalog';

const FILTERS = [['all', 'All'], ['new', 'New Chromebooks'], ['refurb', 'Refurbished'], ['accessories', 'Accessories']];
const SUBS = [['all', 'All accessories'], ['audio', 'Audio'], ['mice', 'Mice & Keyboards'], ['stylus', 'Stylus & Wearables'], ['sleeves', 'Sleeves & Chargers']];
const SUB_HEAD: Record<string, string> = { audio: 'AUDIO', mice: 'MICE & KEYBOARDS', stylus: 'STYLUS & WEARABLES', sleeves: 'SLEEVES & CHARGERS' };

export default function ShopView({ products, initial }: { products: PublicProduct[]; initial: { cat: string; sub: string; q: string } }) {
  const [cat, setCat] = useState(initial.cat || 'all');
  const [sub, setSub] = useState(initial.sub || 'all');
  const q = initial.q.trim();

  /* the filter lives in the address, so a filtered page can be shared */
  useEffect(() => {
    if (q) return;
    const u = new URL(window.location.href);
    cat === 'all' ? u.searchParams.delete('cat') : u.searchParams.set('cat', cat);
    cat === 'accessories' && sub !== 'all' ? u.searchParams.set('sub', sub) : u.searchParams.delete('sub');
    window.history.replaceState(null, '', u.pathname + (u.search || ''));
  }, [cat, sub, q]);

  const found = useMemo(() => (q ? searchProducts(products, q) : []), [q, products]);
  const of = (c: string) => products.filter((p) => p.category === c);
  const show = (c: string) => cat === 'all' || cat === c;
  const count = (n: number, one: string, many: string) => n + ' ' + (n === 1 ? one : many);

  const pick = (e: React.MouseEvent, v: string) => {
    e.preventDefault(); setCat(v); setSub('all');
    document.getElementById('filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <header className="sh-hero">
        <span className="hero-kicker">MyChromebook.pk store</span>
        {q ? <h1>Search <span className="accent">results</span></h1> : <h1>Shop <span className="accent">Chromebooks &amp; accessories</span></h1>}
        <p>Verified devices, official warranty, free nationwide delivery — and everything that goes with your Chromebook.</p>
        {!q && (
          <>
            <div className="filters" id="filters">
              {FILTERS.map(([v, l]) => <a key={v} className={'tab' + (cat === v ? ' active' : '')} data-f={v} href={'/shop' + (v === 'all' ? '' : '?cat=' + v)} onClick={(e) => pick(e, v)}>{l}</a>)}
            </div>
            <div className="subfilters" id="subfilters" style={{ display: cat === 'accessories' ? 'flex' : 'none' }}>
              {SUBS.map(([v, l]) => <a key={v} className={'tab' + (sub === v ? ' active' : '')} data-s={v} href={'/shop?cat=accessories' + (v === 'all' ? '' : '&sub=' + v)} onClick={(e) => { e.preventDefault(); setSub(v); }}>{l}</a>)}
            </div>
          </>
        )}
      </header>

      {q ? (
        <section className="sh-sec sh-results" id="results">
          <div className="wrap">
            <div className="sh-head">
              <div><h2>Results for <span className="accent">“{q}”</span></h2>
                <p>{found.length ? 'Showing every product that matches your search.' : 'Nothing matched. Try a shorter word, or browse the full range.'}</p></div>
              <a className="count" href="/shop" style={{ cursor: 'pointer' }}>✕ Clear search</a>
            </div>
            {found.length
              ? <div className="grid4">{found.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
              : <EmptyState icon={<Search />} title="No products found" text="We could not find anything for that search. Try “mouse”, “stylus”, “refurbished” or “CTL”." href="/shop" button="Browse all products" />}
          </div>
        </section>
      ) : (
        <>
          <section className={'sh-sec' + (show('new') ? '' : ' hide')} data-sec="new" id="new">
            <div className="wrap">
              <div className="sh-head"><div><h2>New <span className="accent">Chromebooks</span></h2><p>Centerm, Allied, and CTL — Google-verified with automatic updates until June 2031.</p></div><span className="count">{count(of('new').length, 'model', 'models')}</span></div>
              <div className="grid4">{of('new').map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
            </div>
          </section>
          <section className={'sh-sec' + (show('refurb') ? '' : ' hide')} data-sec="refurb" id="refurb">
            <div className="wrap">
              <div className="sh-head"><div><h2>Refurbished <span className="accent">Chromebooks</span></h2><p>Certified CTL devices — fully tested, verified, and budget-friendly.</p></div><span className="count">{count(of('refurb').length, 'model', 'models')}</span></div>
              <div className="grid4">{of('refurb').map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
            </div>
          </section>
          <section className={'sh-sec' + (show('accessories') ? '' : ' hide')} data-sec="accessories" id="accessories">
            <div className="wrap">
              <div className="sh-head"><div><h2>Accessories</h2><p>Audio, mice and keyboards, stylus and wearables, sleeves and chargers.</p></div><span className="count">{count(of('accessories').length, 'item', 'items')}</span></div>
              {Object.keys(SUB_HEAD).filter((s) => sub === 'all' || sub === s).map((s) => {
                const list = of('accessories').filter((p) => p.subcategory === s);
                if (!list.length) return null;
                return (
                  <div key={s} style={{ display: 'contents' }}>
                    <div className="sh-sub" data-subhead={s}>{SUB_HEAD[s]}</div>
                    <div className="grid4">{list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <section className="cta">
        <div className="wrap">
          <div className="cta-panel rv">
            <div className="cta-left">
              <h2>Need help <span className="accent">choosing?</span></h2>
              <p>Book a free demo and our team will match the right Chromebook and accessories to your school, office, or home.</p>
              <a className="btn btn-rose" href="/contact?topic=demo">Book a Demo <span className="arrow-c">↗</span></a>
            </div>
            <div className="cta-right"><img src="/_next/image?url=%2Fassets%2Flenovo-500e-grey.jpg&w=1080&q=75" alt="Grey Chromebook" style={{ borderRadius: 22 }} loading="lazy" /></div>
          </div>
        </div>
      </section>
    </>
  );
}
