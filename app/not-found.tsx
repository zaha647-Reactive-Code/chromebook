import '@/styles/shop-base.css';
import '@/styles/store.css';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <main className="pg" style={{ paddingTop: 60 }}>
      <div className="panel" style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="empty">
          <div className="e-ic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg></div>
          <h3>We could not find that page</h3>
          <p>The link may be old, or the product may no longer be available. Try the shop, or search from the bar at the top.</p>
          <a className="btn btn-rose" href="/shop">Go to shop <span className="arrow-c">↗</span></a>
        </div>
      </div>
    </main>
  );
}
