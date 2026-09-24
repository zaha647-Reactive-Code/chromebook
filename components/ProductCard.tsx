'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useStore } from './StoreProvider';
import { Bag, Check, Heart, Spark } from './Icons';
import { money, stockState } from '@/lib/format';
import type { PublicProduct } from '@/lib/catalog';

const DELAYS = ['', 'd1', 'd2', 'd3'];

/* Shop card — same markup and classes as the approved design. */
export default function ProductCard({ p, i = 0, extraClass = '', label, image, desc, chips, feature }: {
  p: PublicProduct; i?: number; extraClass?: string;
  label?: string; image?: string; desc?: string; chips?: string[]; feature?: React.ReactNode;
}) {
  const { add, isWished, toggleWish, showToast } = useStore();
  const [done, setDone] = useState(false);
  const st = stockState(p);
  const href = '/shop/' + p.id;
  const wished = isWished(p.id);

  const pill = st === 'out' ? <span className="b-tagpill">SOLD OUT</span>
    : st === 'low' ? <span className="b-tagpill">LOW STOCK</span>
    : p.tag ? <span className="b-newpill"><Spark />{p.tag}</span>
    : label ? <span className="b-tagpill">{label}</span> : null;

  return (
    <article className={['b-item', 'rv', DELAYS[i % 4], extraClass].filter(Boolean).join(' ')} data-cat={p.category} data-sub={p.subcategory} data-id={p.id}>
      <div className="b-img">
        {pill}
        <span className={'b-heart' + (wished ? ' on' : '')} title={wished ? 'Saved to wishlist' : 'Add to wishlist'} role="button" tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            const on = toggleWish(p.id);
            showToast({ img: p.image, text: on ? 'Saved to your wishlist' : 'Removed from wishlist', link: on ? '/wishlist' : '', linkText: 'View wishlist' });
          }}>
          <Heart />
        </span>
        {feature || (
          <a href={href}><Image src={image || p.image} alt={p.name} width={640} height={560} sizes="(max-width:760px) 100vw, (max-width:1080px) 50vw, 25vw" /></a>
        )}
        {st !== 'out' && (
          <button type="button" className={'qa-btn' + (done ? ' done' : '')} aria-label={'Add ' + p.name + ' to cart'}
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              if (add(p.id, 1)) {
                setDone(true); setTimeout(() => setDone(false), 1600);
                showToast({ img: p.image, text: p.name + ' added to cart', link: '/cart', linkText: 'View cart', drawer: true });
              }
            }}>
            {done ? <Check /> : <Bag />}<span>{done ? 'Added' : 'Add to cart'}</span>
          </button>
        )}
      </div>
      <div className="b-body">
        <h3><a href={href} style={{ color: 'inherit' }}>{p.name}</a></h3>
        <p className="desc">{desc || p.short}</p>
        <div className="b-spec">{(chips || p.specs || []).map((c) => <span key={c}>{c}</span>)}</div>
        <div className="b-row">
          <span className="price-pill">{money(p.price)}</span>
          {st === 'out'
            ? <span className="btn btn-metal btn-sm">Sold out</span>
            : <a className="btn btn-rose btn-sm" href={href}>View details{extraClass.includes('b-feat') && <> <span className="arrow-c">↗</span></>}</a>}
        </div>
      </div>
    </article>
  );
}
