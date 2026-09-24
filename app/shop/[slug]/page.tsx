import '@/styles/shop-base.css';
import '@/styles/product.css';
import '@/styles/pill.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductView from './ProductView';
import Effects from '@/components/Effects';
import { getProduct, getProducts, getSettings, publicProduct } from '@/lib/catalog';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: 'Product not found', robots: { index: false } };
  return {
    title: p.name,
    description: p.short,
    alternates: { canonical: '/shop/' + p.id },
    openGraph: { title: p.name + ' — MyChromebook.pk', description: p.short, images: [p.image], type: 'website' },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p, all, settings] = await Promise.all([getProduct(slug), getProducts(), getSettings()]);
  if (!p) notFound();
  const related = all.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4).map(publicProduct);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: p.image, description: p.short, sku: p.sku || p.id,
    offers: { '@type': 'Offer', priceCurrency: 'PKR', price: p.price, availability: p.stockQty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductView product={p} related={related} supportHours={settings.supportHours} />
      <Effects />
    </>
  );
}
