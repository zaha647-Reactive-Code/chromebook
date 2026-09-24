/* Shared footer — identical to the approved design. The Staff login link is gone
   (report M3): staff bookmark /admin instead. */
export default function Footer() {
  return (
    <footer>
      <div className="f-shine" />
      <div className="wrap">
        <div className="f-grid">
          <div className="f-brand">
            <span className="logo-pill">
              <svg className="logo-mark" viewBox="0 0 44 44">
                <rect x="6" y="9" width="32" height="21" rx="4" fill="none" stroke="url(#lgm)" strokeWidth="2.6" />
                <path d="M4 33.5h36" stroke="url(#lgm)" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="22" cy="19.5" r="3.2" fill="url(#lgm)" />
              </svg>
              <span className="logo-word"><span className="my">My</span>Chromebook</span>
            </span>
            <p>Powered by Tech Valley — your digital transformation and professional development partner.</p>
          </div>
          <div>
            <h4>Visit</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About us</a></li>
              <li><a href="/shop">Shop</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><a href="/account">My account</a></li>
              <li><a href="/track">Track an order</a></li>
              <li><a href="/terms">Terms &amp; conditions</a></li>
              <li><a href="/refund">Refund &amp; returns policy</a></li>
              <li><a href="/privacy">Privacy policy</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:info@mychromebook.pk">info@mychromebook.pk</a></li>
              <li><a href="tel:+923302007440">+92 330 2007440</a></li>
              <li style={{ lineHeight: 1.6 }}>Tech Valley, Main Shaibzada Abdul Qayum Road, Sector I-8/3, Islamabad, Pakistan</li>
            </ul>
          </div>
        </div>
        <div className="f-bottom">
          <span>© {new Date().getFullYear()} MyChromebook.pk. All rights reserved.</span>
          <div className="f-social">
            <a href="https://www.instagram.com/mychromebookpakistan" aria-label="Instagram" rel="noopener" target="_blank">
              <svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8 0-3.2 0-3.6.1-4.8.1-3.2 1.7-4.8 4.9-4.9 1.2-.1 1.6-.1 4.8-.1zm0 3.7a6.1 6.1 0 1 0 0 12.2 6.1 6.1 0 0 0 0-12.2zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.2a1.4 1.4 0 1 1-2.9 0 1.4 1.4 0 0 1 2.9 0z" /></svg>
            </a>
            <a href="https://www.linkedin.com/showcase/my-chromebook/about/" aria-label="LinkedIn" rel="noopener" target="_blank">
              <svg viewBox="0 0 24 24"><path d="M4.98 3.5C4.98 4.9 3.9 6 2.5 6S0 4.9 0 3.5 1.1 1 2.5 1s2.48 1.1 2.48 2.5zM.2 8h4.6v14.8H.2V8zm7.6 0h4.4v2h.1c.6-1.2 2.1-2.4 4.4-2.4 4.7 0 5.5 3.1 5.5 7.1v8.1h-4.6v-7.2c0-1.7 0-3.9-2.4-3.9s-2.8 1.9-2.8 3.8v7.3H7.8V8z" /></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61570084514868" aria-label="Facebook" rel="noopener" target="_blank">
              <svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
