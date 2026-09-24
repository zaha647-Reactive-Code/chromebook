import '@/styles/blog-base.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import posts from '@/data/posts.json';

type Props = { params: Promise<{ slug: string }> };
const find = (s: string) => (posts as any[]).find((p) => p.slug === s);

export function generateStaticParams() { return (posts as any[]).map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = find((await params).slug);
  if (!p) return { title: 'Article not found', robots: { index: false } };
  return { title: p.title, description: p.paragraphs[0]?.slice(0, 155), alternates: { canonical: '/blog/' + p.slug },
    openGraph: { title: p.title, type: 'article', images: [p.image] } };
}

/* One page per article (report 5.3). Uses the blog's own reader styles. */
export default async function ArticlePage({ params }: Props) {
  const p = find((await params).slug);
  if (!p) notFound();
  const others = (posts as any[]).filter((x) => x.slug !== p.slug);
  return (
    <main className="art-page">
      <article className="reader-art art-full">
        <div className="a-cover"><img src={`/_next/image?url=${encodeURIComponent(p.image)}&w=1920&q=75`} alt="" /><span className="cat">{p.category}</span></div>
        <div className="a-text">
          <a className="art-back" href="/blog">← All articles</a>
          <h1>{p.title}</h1>
          <div className="meta">{p.meta}</div>
          {p.paragraphs.map((t: string, i: number) => <p key={i}>{t}</p>)}
          <div className="art-cta">
            <a className="btn btn-rose" href="/shop">Browse Chromebooks <span className="arrow-c">↗</span></a>
            <a className="btn btn-metal" href="/contact?topic=demo">Book a demo</a>
          </div>
        </div>
      </article>
      <section className="art-more">
        <h2>More <span className="accent">articles</span></h2>
        <div className="art-grid">
          {others.map((o) => (
            <a key={o.slug} className="art-card" href={'/blog/' + o.slug}>
              <img src={`/_next/image?url=${encodeURIComponent(o.image)}&w=640&q=70`} alt="" loading="lazy" />
              <span><small>{o.category}</small><b>{o.title}</b></span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
