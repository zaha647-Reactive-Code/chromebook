import '@/styles/home-base.css';
import '@/styles/pill.css';
import '@/styles/store.css';
import StaticHtml from '@/components/StaticHtml';
import Effects from '@/components/Effects';
import ProductCard from '@/components/ProductCard';
import { homeTop, homeBottom, homeProductsHead } from '@/content/home';
import { getProducts, publicProduct } from '@/lib/catalog';

/* The five "Our recommendation" cards on the home page keep their own curated
   photos and wording from the approved design. Prices and stock come live from
   the catalogue. (The original "CTL Chromebook Plus" card pointed to a product
   that is not in the shop, so that slot now shows the Centerm Flip 2-in-1.) */
const BENTO = [
  { id: 'ctl-chromebook-px11eg', label: 'BEST VALUE', feat: true,
    desc: 'Steady, reliable performance for daily learning — from video lectures to research and writing. Boots in seconds, protects your work with built-in security, and manages its own updates silently in the background.',
    chips: ['Intel N5100', '4 GB RAM', '32 GB eMMC', 'Updates till 2031'],
    stage: [['/assets/samsung-chromebook-silver.jpg', 'closed view'], ['/assets/samsung-galaxy-go.jpg', 'open view'], ['/assets/samsung-2in1.jpg', 'flip view']] },
  { id: 'allied-chromebook-11', label: 'EDUCATION', image: '/assets/chromebook-rosegold.png',
    desc: 'A dependable everyday partner for students and teachers — smooth, steady performance for classes and research.', chips: ['Intel N5100', '4 GB RAM'] },
  { id: 'centerm-mars-m610', label: 'LIGHTWEIGHT', image: '/assets/laptop-silver-15.jpg',
    desc: 'Lightweight, affordable, and easy to use — seamless access to digital resources and collaborative tools.', chips: ['ChromeOS', 'Lightweight'] },
  { id: 'centerm-flip-2-in-1', label: '2-IN-1', image: '/assets/chromebook-tent.jpg',
    desc: 'A convertible Chromebook that folds into a tablet — laptop for work, tent for group work, tablet for reading.', chips: ['2-in-1', 'Touch'] },
  { id: 'ctl-chromebook-nl71', label: 'REFURBISHED', image: '/assets/lenovo-500e-grey.jpg',
    desc: 'Certified refurbished with a 180° rotating camera — fully tested, verified, and budget-friendly.', chips: ['Certified refurb', '180° camera'] },
];

export default async function Home() {
  const all = (await getProducts()).map(publicProduct);
  const byId = new Map(all.map((p) => [p.id, p]));
  const cards = BENTO.map((b) => ({ b, p: byId.get(b.id) })).filter((x) => x.p);

  return (
    <>
      <StaticHtml html={homeTop} />

      <section className="products" id="products">
        <div className="wrap">
          <StaticHtml html={homeProductsHead} />
          <div className="bento">
            {cards.map(({ b, p }, i) => (
              <ProductCard key={b.id} p={p!} i={i < 4 ? i : 0} extraClass={(b.feat ? 'b-feat' : '') + (i === 4 ? ' d4' : '')}
                label={b.label} image={b.image} desc={b.desc} chips={b.chips}
                feature={b.stage ? (
                  <div className="stage" data-stage>
                    {b.stage.map(([src, view], k) => (
                      k === 1
                        ? <a key={src} href={'/shop/' + p!.id}><img src={src} alt={p!.name + ' — ' + view} loading="lazy" /></a>
                        : <img key={src} className={k === 0 ? 'on' : ''} src={src} alt={p!.name + ' — ' + view} loading="lazy" />
                    ))}
                    <div className="stage-dots"><i className="on" /><i /><i /></div>
                  </div>
                ) : undefined} />
            ))}
            <div className="b-promo rv">
              <div>
                <h3>Can&apos;t decide? <span className="accent">Book a free demo.</span></h3>
                <p>Our team will walk you through the right Chromebook for your school, office, or home.</p>
              </div>
              <a className="btn btn-rose" href="/contact?topic=demo">Book a Demo <span className="arrow-c">↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <StaticHtml html={homeBottom} />
      <Effects />
    </>
  );
}
