import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/catalog';
import posts from '@/data/posts.json';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mychromebook.pk';

/* Generated automatically from the live product list (report I6). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const now = new Date();
  const fixed = ['', '/shop', '/about', '/blog', '/contact', '/terms', '/refund', '/privacy'].map((p) => ({
    url: SITE + p, lastModified: now, changeFrequency: p === '/shop' || p === '' ? 'daily' as const : 'monthly' as const, priority: p === '' ? 1 : p === '/shop' ? 0.9 : 0.5,
  }));
  return [
    ...fixed,
    ...products.map((p) => ({ url: SITE + '/shop/' + p.id, lastModified: p.updatedAt ? new Date(p.updatedAt) : now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...(posts as any[]).map((p) => ({ url: SITE + '/blog/' + p.slug, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
