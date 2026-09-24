import type { MetadataRoute } from 'next';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mychromebook.pk';
/* Private pages are kept out of search engines (report I6). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/account', '/login', '/signup', '/cart', '/checkout', '/order', '/track', '/wishlist', '/api/'] }],
    sitemap: SITE + '/sitemap.xml',
  };
}
