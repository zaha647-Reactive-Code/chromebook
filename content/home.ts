/* Static home sections carried over from the approved HTML design. */
export const homeTop = `<!-- ===================== HERO — staggered swipe-in ===================== -->
<header class="hero">
  <!-- LEFT deck — cards keep rotating: front card swipes away every few seconds, next comes forward -->
  <div class="stack stack-l" data-deck>
    <div class="deck-card enter"><img src="/_next/image?url=%2Fassets%2Fchromebook-rosegold.png&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="Rose gold Chromebook"><div class="deck-cap"><strong>Rose Gold Edition</strong><span><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Google verified · Warranty</span></div></div>
    <div class="deck-card enter"><img src="/_next/image?url=%2Fassets%2Fsamsung-galaxy-go.jpg&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="Samsung Galaxy Chromebook Go"><div class="deck-cap"><strong>Galaxy Go · Silver</strong><span><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Google verified · Warranty</span></div></div>
    <div class="deck-card enter"><img src="/_next/image?url=%2Fassets%2Flaptop-silver-15.jpg&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="Silver 15.6-inch laptop"><div class="deck-cap"><strong>Silver 15.6"</strong><span><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Google verified · Warranty</span></div></div>
  </div>
  <!-- RIGHT deck -->
  <div class="stack stack-r" data-deck>
    <div class="deck-card enter"><img src="/_next/image?url=%2Fassets%2Fsamsung-chromebook-silver.jpg&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="Samsung Chromebook silver"><div class="deck-cap"><strong>Samsung · Platinum</strong><span><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Google verified · Warranty</span></div></div>
    <div class="deck-card enter"><img src="/_next/image?url=%2Fassets%2Flenovo-500e-grey.jpg&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="Lenovo 500e Chromebook"><div class="deck-cap"><strong>500e · Graphite Grey</strong><span><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Google verified · Warranty</span></div></div>
    <div class="deck-card enter"><img src="/_next/image?url=%2Fassets%2Fchromebook-tent.jpg&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="Chromebook in tent mode"><div class="deck-cap"><strong>Flip · Tent Mode</strong><span><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Google verified · Warranty</span></div></div>
  </div>

  <div class="hero-inner">
    <svg class="hero-logo" viewBox="0 0 44 44" aria-hidden="true">
      <rect x="6" y="9" width="32" height="21" rx="4" fill="none" stroke="url(#lgm)" stroke-width="2.6"/>
      <path d="M4 33.5h36" stroke="url(#lgm)" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="22" cy="19.5" r="3.2" fill="url(#lgm)"/>
    </svg>
    <span class="hero-kicker">Pakistan's home of verified Chromebooks</span>
    <h1>Verified Chromebooks.<br><span class="accent">Made for Pakistan.</span></h1>
    <p>Genuine, Google-verified Chromebooks with official warranty and automatic updates — for students, teachers, and institutions across the country.</p>
    <div class="hero-cta">
      <a class="btn btn-rose" href="#products">Shop Chromebooks <span class="arrow-c">↗</span></a>
      <a class="btn btn-metal" href="#how">How ordering works</a>
    </div>
  </div>
</header>

<!-- ===================== TRUST BAR (badges relocated here) ===================== -->
<div class="trustbar">
  <div class="wrap">
    <div class="trust-row">
      <span class="t-badge"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Google Verified</span>
      <span class="t-badge"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Official Warranty</span>
      <span class="t-badge"><svg viewBox="0 0 24 24"><rect x="1" y="6" width="15" height="12" rx="2"/><path d="M16 10h4l3 4v4h-7z"/></svg>Free Nationwide Delivery</span>
      <span class="t-badge"><svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>Trusted by Top Schools</span>
    </div>
  </div>
</div>

<!-- ===================== CLIENTS ===================== -->
<section class="clients">
  <div class="wrap"><h2 class="rv">Trusted by Pakistan's <span class="accent">leading institutions</span></h2></div>
  <div class="marquee rv d1">
    <div class="marquee-track">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fbeaconhouse-logo-2.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Beaconhouse">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Funnamed-2.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Lahore Grammar School">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Funnamed-3.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="The Millennium Education">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fgovernment-of-pakistan-logo.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Government of Pakistan">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2FTMUC-logo-3-e1619011518621.jpg&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="TMUC">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fmiuc-logo-1.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="MIUC">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Funnamed.jpg&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Client">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fj0lZtHFe_400x400.jpg&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Client">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fbeaconhouse-logo-2.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Funnamed-2.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Funnamed-3.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fgovernment-of-pakistan-logo.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2FTMUC-logo-3-e1619011518621.jpg&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fmiuc-logo-1.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Funnamed.jpg&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fj0lZtHFe_400x400.jpg&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="">
    </div>
  </div>
</section>

<!-- ===================== PROMISE ===================== -->
<section class="promise">
  <div class="wrap">
    <div class="promise-grid">
      <div class="p-card rv"><div class="p-ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="1" y="6" width="15" height="12" rx="2"/><path d="M16 10h4l3 4v4h-7z"/></svg></div><h3>Free delivery</h3><p>Free shipping on every order, anywhere in Pakistan.</p></div>
      <div class="p-card rv d1"><div class="p-ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><h3>Real support</h3><p>Real help from our team, Monday to Saturday.</p></div>
      <div class="p-card rv d2"><div class="p-ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg></div><h3>7-day returns</h3><p>Money-back guarantee within 7 days of delivery.</p></div>
      <div class="p-card rv d3"><div class="p-ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><h3>Official warranty</h3><p>Every device is genuine, verified, and fully covered.</p></div>
    </div>
  </div>
</section>`;
export const homeBottom = `<!-- ===================== HOW ===================== -->
<section class="how" id="how">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="rv">Ordering, made <span class="accent">simple</span></h2>
      <p class="rv d1">From first look to full support — here's how it works.</p>
    </div>
    <div class="timeline">
      <div class="step rv"><div class="step-n">1</div><div class="step-b"><h3>Browse &amp; choose</h3><p>Explore new and refurbished Chromebooks and pick the model that fits your needs and budget.</p></div></div>
      <div class="step rv d1"><div class="step-n">2</div><div class="step-b"><h3>Order online or book a demo</h3><p>Add to cart and check out — or book a demo and let our team walk you through the device first.</p></div></div>
      <div class="step rv d2"><div class="step-n">3</div><div class="step-b"><h3>Free nationwide delivery</h3><p>Your Chromebook ships free to your doorstep, anywhere in Pakistan.</p></div></div>
      <div class="step rv d3"><div class="step-n">4</div><div class="step-b"><h3>Warranty &amp; ongoing support</h3><p>Official warranty, 7-day money-back guarantee, and friendly support — before and after the sale.</p></div></div>
    </div>
  </div>
</section>

<!-- ===================== TESTIMONIALS ===================== -->
<section class="testi">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">What our partners <span class="accent">say</span></h2></div>
    <div class="testi-grid">
      <div class="t-card rv">
        <p>"Tech Valley has been a technology partner for Beaconhouse for the past few years. I congratulate them for launching mychromebook.pk to ensure affordable and verified Chromebooks in Pakistan."</p>
        <div class="t-who"><img src="/_next/image?url=%2Fassets%2Fpartners%2Fali-khan-3.jpg&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Ali Ahmad Khan"><div><strong>Ali Ahmad Khan</strong><span>COO, Beaconhouse</span></div></div>
      </div>
      <div class="t-card rv d1">
        <p>"From textbooks to techbooks is not merely a transition, it's a transformation. Together with Tech Valley, Chromebook and The Millennium Education Group Pakistan is reimagining learning for a generation that will build, create, and lead through technology."</p>
        <div class="t-who"><img src="/_next/image?url=%2Fassets%2Fpartners%2Funnamed-1-e1763018898717.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Dr. Faisal Mushtaq TI"><div><strong>Dr. Faisal Mushtaq TI</strong><span>Founder &amp; CEO, The Millennium Education Group</span></div></div>
      </div>
    </div>
  </div>
</section>

<!-- ===================== PARTNERS ===================== -->
<section class="partners">
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:44px"><h2 class="rv">Trusted <span class="accent">partners</span></h2></div>
    <div class="partners-row rv d1">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2FNRTC-Logo-new-copy1.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="NRTC">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2FGoogle_Cloud_Partner_outline_horizontal-e1751278555230.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Google Cloud Partner">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2FAllied-Logo-scaled.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Allied">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2FAsset-2-scaled.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Chromebook">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2Fctl.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="CTL">
      <img src="/_next/image?url=%2Fassets%2Fpartners%2FGfE-Partner-Badges-Horizontal-Png-e1751278630886.png&amp;w=384&amp;q=75" loading="lazy" decoding="async" alt="Google for Education Partner">
    </div>
  </div>
</section>

<!-- ===================== VIDEOS ===================== -->
<section class="videos">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="rv">See it <span class="accent">for yourself</span></h2>
      <p class="rv d1">Real Chromebooks, assembled and verified in Pakistan.</p>
    </div>
    <div class="vid-grid">
      <div class="v-card rv" data-video="VIDEO_ID_1">
        <img class="bg" src="/_next/image?url=%2Fassets%2Fchromebook-tent.jpg&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="">
        <div class="v-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
        <div class="v-meta"><small>PAKISTAN'S FIRST</small><h3>Chromebook Assembly Line — Tech Valley, Allied &amp; NRTC</h3></div>
      </div>
      <div class="v-card rv d1" data-video="VIDEO_ID_2">
        <img class="bg" src="/_next/image?url=%2Fassets%2Fsamsung-galaxy-go.jpg&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="">
        <div class="v-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
        <div class="v-meta"><small>TIRED OF FAKE CHROMEBOOKS?</small><h3>Google-Verified Chromebooks, Explained</h3></div>
      </div>
    </div>
  </div>
</section>

<!-- ===================== BLOG — newsroom ===================== -->
<section class="blog" id="blog">
  <div class="wrap">
    <div class="blog-head">
      <h2 class="rv">Latest <span class="accent">posts</span></h2>
      <p class="rv d1">Hover to pause · click any story to read</p>
    </div>
    <div class="ticker rv d1">
      <div class="ticker-tag"><i></i>LIVE</div>
      <div class="ticker-track"><div class="ticker-run"><span>Pakistan's first Chromebook assembly line launched with Allied &amp; NRTC</span><span>Beaconhouse approves Chromebooks for its BYOD programme nationwide</span><span>Why schools are switching to cloud-first devices</span><span>Automatic updates supported until June 2031 on all new models</span><span>Free nationwide delivery on every order</span><span>Google for Education Partner — verified devices only</span><span>Pakistan's first Chromebook assembly line launched with Allied &amp; NRTC</span><span>Beaconhouse approves Chromebooks for its BYOD programme nationwide</span><span>Why schools are switching to cloud-first devices</span><span>Automatic updates supported until June 2031 on all new models</span><span>Free nationwide delivery on every order</span><span>Google for Education Partner — verified devices only</span></div></div>
    </div>
  </div>
  <div class="reel rv d2">
    <div class="reel-track">
      <a class="rail-card" href="/blog/classroom">
        <img class="cover" src="/_next/image?url=%2Fassets%2Fblog-chromebooks-trio.webp&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="" style="object-position:center">
        <div class="rail-body">
          <span class="cat"><i></i>CHROMEBOOK NEWS</span>
          <h3>Chromebooks Are Transforming Education</h3>
          <p>How cloud-first devices are reshaping classrooms across Pakistan.</p>
          <span class="rail-go">Read article <span class="arrow-c">↗</span></span>
        </div>
      </a>
      <a class="rail-card" href="/blog/byod">
        <img class="cover" src="/_next/image?url=%2Fassets%2Fblog-byod-girl.png&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="" style="object-position:center">
        <div class="rail-body">
          <span class="cat"><i></i>BYOD</span>
          <h3>What is BYOD?</h3>
          <p>Bring Your Own Device — and why it matters for Pakistani students.</p>
          <span class="rail-go">Read article <span class="arrow-c">↗</span></span>
        </div>
      </a>
      <a class="rail-card" href="/blog/why">
        <img class="cover" src="/_next/image?url=%2Fassets%2Fblog-classroom-kids.png&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="" style="object-position:center">
        <div class="rail-body">
          <span class="cat"><i></i>GUIDE</span>
          <h3>Why Buy Chromebooks?</h3>
          <p>Speed, security, and simplicity — the case for a Chromebook.</p>
          <span class="rail-go">Read article <span class="arrow-c">↗</span></span>
        </div>
      </a>
      <a class="rail-card" href="/blog/classroom">
        <img class="cover" src="/_next/image?url=%2Fassets%2Fblog-beaconhouse-classroom.png&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="" style="object-position:50% 22%">
        <div class="rail-body">
          <span class="cat"><i></i>BEACONHOUSE</span>
          <h3>Beaconhouse-Approved Chromebooks</h3>
          <p>The official school-ready devices for Pakistani students.</p>
          <span class="rail-go">Read article <span class="arrow-c">↗</span></span>
        </div>
      </a>
      <a class="rail-card" href="/blog/classroom">
        <img class="cover" src="/_next/image?url=%2Fassets%2Fblog-chromebooks-trio.webp&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="" style="object-position:center">
        <div class="rail-body">
          <span class="cat"><i></i>CHROMEBOOK NEWS</span>
          <h3>Chromebooks Are Transforming Education</h3>
          <p>How cloud-first devices are reshaping classrooms across Pakistan.</p>
          <span class="rail-go">Read article <span class="arrow-c">↗</span></span>
        </div>
      </a>
      <a class="rail-card" href="/blog/byod">
        <img class="cover" src="/_next/image?url=%2Fassets%2Fblog-byod-girl.png&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="" style="object-position:center">
        <div class="rail-body">
          <span class="cat"><i></i>BYOD</span>
          <h3>What is BYOD?</h3>
          <p>Bring Your Own Device — and why it matters for Pakistani students.</p>
          <span class="rail-go">Read article <span class="arrow-c">↗</span></span>
        </div>
      </a>
      <a class="rail-card" href="/blog/why">
        <img class="cover" src="/_next/image?url=%2Fassets%2Fblog-classroom-kids.png&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="" style="object-position:center">
        <div class="rail-body">
          <span class="cat"><i></i>GUIDE</span>
          <h3>Why Buy Chromebooks?</h3>
          <p>Speed, security, and simplicity — the case for a Chromebook.</p>
          <span class="rail-go">Read article <span class="arrow-c">↗</span></span>
        </div>
      </a>
      <a class="rail-card" href="/blog/classroom">
        <img class="cover" src="/_next/image?url=%2Fassets%2Fblog-beaconhouse-classroom.png&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="" style="object-position:50% 22%">
        <div class="rail-body">
          <span class="cat"><i></i>BEACONHOUSE</span>
          <h3>Beaconhouse-Approved Chromebooks</h3>
          <p>The official school-ready devices for Pakistani students.</p>
          <span class="rail-go">Read article <span class="arrow-c">↗</span></span>
        </div>
      </a>
    </div>
  </div>
  <div class="wrap">
    <div class="ticker rev rv d2">
      <div class="ticker-tag"><i></i>UPDATES</div>
      <div class="ticker-track"><div class="ticker-run"><span>Pakistan's first Chromebook assembly line launched with Allied &amp; NRTC</span><span>Beaconhouse approves Chromebooks for its BYOD programme nationwide</span><span>Why schools are switching to cloud-first devices</span><span>Automatic updates supported until June 2031 on all new models</span><span>Free nationwide delivery on every order</span><span>Google for Education Partner — verified devices only</span><span>Pakistan's first Chromebook assembly line launched with Allied &amp; NRTC</span><span>Beaconhouse approves Chromebooks for its BYOD programme nationwide</span><span>Why schools are switching to cloud-first devices</span><span>Automatic updates supported until June 2031 on all new models</span><span>Free nationwide delivery on every order</span><span>Google for Education Partner — verified devices only</span></div></div>
    </div>
  </div>
</section>

<!-- ===================== CTA ===================== -->
<section class="cta">
  <div class="wrap">
    <div class="cta-panel rv">
      <div class="cta-left">
        <h2>Ready to explore <span class="accent">our products?</span></h2>
        <p>Genuine devices, official warranty, free delivery. Find the right Chromebook for your classroom, office, or home.</p>
        <a class="btn btn-rose" href="/shop">Go to shop <span class="arrow-c">↗</span></a>
      </div>
      <div class="cta-right"><img src="/_next/image?url=%2Fassets%2Flenovo-500e-grey.jpg&amp;w=1080&amp;q=75" loading="lazy" decoding="async" alt="Grey Chromebook" style="border-radius:22px"></div>
    </div>
  </div>
</section>

<!-- ===================== FOOTER — glossy metallic ===================== -->
<!-- lightbox -->
<div class="lightbox" id="lightbox">
  <button class="lb-close" id="lbClose" aria-label="Close video">✕</button>
  <div class="lb-frame" id="lbFrame"></div>
</div>`;
export const homeProductsHead = `<div class="sec-head">
      <h2 class="rv">Our <span class="accent">recommendation</span></h2>
      <p class="rv d1">Fast, reliable, and just right — every model is Google-verified, with automatic security updates for years.</p>
    </div>`;
