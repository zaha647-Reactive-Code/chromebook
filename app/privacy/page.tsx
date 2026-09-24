import '@/styles/shop-base.css';
import '@/styles/legal.css';
import '@/styles/store.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How MyChromebook.pk collects, uses and protects your personal information.',
  alternates: { canonical: '/privacy' },
};

/* DRAFT — to be reviewed by the business and a legal adviser before launch (report I8). */
const S: [string, string, React.ReactNode][] = [
  ['who', 'Who we are', <p key="a">MyChromebook.pk is a venture of Tech Valley, Main Shaibzada Abdul Qayum Road, Sector I-8/3, Islamabad. This policy explains what personal information we collect when you use this website, why we collect it and how we look after it.</p>],
  ['collect', 'What we collect', <><p>We only collect what we need to sell and deliver your order and to help you:</p>
    <ul><li><b>Order details</b> — your name, mobile number, email address, delivery address, the products you ordered and any notes you add.</li>
      <li><b>Account details</b> — if you create an account: your name, email, mobile number, saved addresses and wishlist.</li>
      <li><b>Messages</b> — what you send us through the contact form.</li>
      <li><b>Basic technical data</b> — such as your browser type, used to keep the site secure and working.</li></ul></>],
  ['use', 'How we use it', <ul><li>To process your order, confirm your payment and arrange delivery.</li>
    <li>To contact you about your order by phone, WhatsApp or email.</li>
    <li>To run your account, order history and wishlist.</li>
    <li>To answer your questions and demo requests.</li>
    <li>To keep the website secure and prevent fraud.</li></ul>],
  ['store', 'Where it is stored', <p>Your information is stored securely with Google Firebase, a cloud service run by Google. Access is limited to authorised MyChromebook.pk staff. Passwords are handled by Firebase Authentication and are never visible to us.</p>],
  ['share', 'Who we share it with', <><p>We do not sell your personal information. We share it only when needed to serve you:</p>
    <ul><li>with our delivery partner, so your parcel reaches you;</li><li>with the email service that sends your order confirmation;</li><li>where the law requires us to.</li></ul></>],
  ['browser', 'Information saved in your browser', <p>Your cart and, when you are not signed in, your wishlist are saved in your own browser so they are still there when you come back. Signing in uses a secure session. We do not use advertising cookies.</p>],
  ['keep', 'How long we keep it', <p>We keep order records for as long as needed for delivery, warranty, returns and our accounting obligations. You can ask us to delete your account at any time.</p>],
  ['rights', 'Your choices', <p>You can view and update your details in <a href="/account">My account</a>, or ask us to correct or delete your information by contacting us at info@mychromebook.pk.</p>],
  ['changes', 'Changes to this policy', <p>We may update this policy from time to time. The latest version is always on this page.</p>],
];

export default function PrivacyPage() {
  return (
    <>
      <header className="pg-hero">
        <span className="hero-kicker">Store policies</span>
        <h1>Privacy <span className="accent">policy</span></h1>
        <p>What we collect, why we collect it, and how we keep it safe.</p>
      </header>
      <main className="pg">
        <div className="lg">
          <nav className="lg-toc" aria-label="On this page"><b>On this page</b>
            {S.map(([id, h]) => <a key={id} href={'#' + id}>{h}</a>)}
            <a href="/terms" style={{ marginTop: 8, borderTop: '1px solid var(--silver-2)', borderRadius: 0, paddingTop: 12 }}>Terms &amp; conditions →</a>
          </nav>
          <article className="lg-body">
            <p className="upd">Last updated: September 2026</p>
            {S.map(([id, h, body]) => <section key={id} id={id}><h2>{h}</h2>{body}</section>)}
            <div className="lg-help"><p>Questions about your data? Our team is happy to help.</p>
              <a className="btn btn-rose" href="/contact">Contact us <span className="arrow-c">↗</span></a></div>
          </article>
        </div>
      </main>
    </>
  );
}
