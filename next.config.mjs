/** @type {import('next').NextConfig} */

// Security headers (report section 5.7). The Content Security Policy allows only
// this site, Google Fonts and Firebase / Google APIs.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com https://*.googleusercontent.com https://i.ytimg.com",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://firebasestorage.googleapis.com wss://*.firebaseio.com https://www.google-analytics.com",
  "frame-src 'self' https://www.youtube.com https://chromebook-site.firebaseapp.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Old addresses keep working (and keep their Google ranking).
  async redirects() {
    return [
      { source: '/product.html', has: [{ type: 'query', key: 'id', value: '(?<id>.+)' }], destination: '/shop/:id', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/home-v18.html', destination: '/', permanent: true },
      { source: '/order.html', destination: '/track', permanent: true },
      ...['shop', 'about', 'blog', 'contact', 'cart', 'wishlist', 'checkout', 'account', 'terms', 'refund', 'admin'].flatMap((p) => [
        { source: `/${p}.html`, destination: `/${p}`, permanent: true },
        { source: `/${p}-v18.html`, destination: `/${p}`, permanent: true },
      ]),
      // old WordPress / WooCommerce addresses
      { source: '/my-account/:path*', destination: '/account', permanent: true },
      { source: '/wishlist-2/:path*', destination: '/wishlist', permanent: true },
      { source: '/refund-return-policy/:path*', destination: '/refund', permanent: true },
      { source: '/what-is-byod/:path*', destination: '/blog/byod', permanent: true },
      { source: '/why-buy-chromebooks/:path*', destination: '/blog/why', permanent: true },
      { source: '/how-chromebooks-are-transforming-education-for-the-beaconhouse-school-system/:path*', destination: '/blog/classroom', permanent: true },
    ];
  },
};

export default nextConfig;
