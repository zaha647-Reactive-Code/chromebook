/* =============================================================================
   MyChromebook.pk — store engine
   -----------------------------------------------------------------------------
   Cart, wishlist, live search, orders, demo accounts and the shared header UI.
   Everything is saved in the visitor's own browser (localStorage). There is no
   server yet — that arrives in Phase 2. Until then:
     - cart and wishlist work fully, per browser
     - orders are recorded in the browser AND sent to the business on WhatsApp
     - accounts are a DEMO: saved on this device only
   You should not need to edit this file. Settings live in site-config.js,
   products in products.js.
   ============================================================================= */
(function (global) {
  'use strict';

  var CFG = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG : {};
  var HAS_PRODUCTS = (typeof PRODUCTS !== 'undefined');

  /* ------------------------------------------------------------ storage ---- */
  var mem = {};
  var KEY = function (k) { return 'mcb.' + k; };
  var S = {
    get: function (k, d) {
      try {
        var v = global.localStorage.getItem(KEY(k));
        return v == null ? d : JSON.parse(v);
      } catch (e) { return (k in mem) ? mem[k] : d; }
    },
    set: function (k, v) {
      try { global.localStorage.setItem(KEY(k), JSON.stringify(v)); }
      catch (e) { mem[k] = v; }
    },
    del: function (k) {
      try { global.localStorage.removeItem(KEY(k)); } catch (e) { delete mem[k]; }
    }
  };

  /* ------------------------------------------------------------ helpers ---- */
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var money = function (n) {
    n = Math.round(Number(n) || 0);
    return (CFG.currency || '₨') + ' ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  var qs = function (name) { return new URLSearchParams(global.location.search).get(name); };
  var emit = function () {
    try { global.dispatchEvent(new CustomEvent('mc:change')); } catch (e) {}
  };
  var sig = function (arr) {                       // tiny fingerprint of a product list
    var s = JSON.stringify(arr), h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return String(h);
  };

  /* -------------------------------------- admin product edits (demo) ------
     The admin panel saves its edits here. They are applied on top of
     products.js in THIS browser only, so staff can preview changes. To make a
     change live for every customer, the admin exports a new products.js.   */
  var BASE_SIG = HAS_PRODUCTS ? sig(PRODUCTS) : '';
  var ORIGINAL = HAS_PRODUCTS ? JSON.parse(JSON.stringify(PRODUCTS)) : [];
  (function applyAdminEdits() {
    if (!HAS_PRODUCTS) return;
    var saved = S.get('adminProducts', null);
    if (!saved || !Array.isArray(saved.list)) return;
    if (saved.base !== BASE_SIG) return;           // products.js changed since — ignore stale edits
    PRODUCTS.length = 0;
    saved.list.forEach(function (p) { PRODUCTS.push(p); });
  })();

  var product = function (id) {
    if (!HAS_PRODUCTS) return null;
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  };

  /* ------------------------------------------------------------ cart ------- */
  var cart = {
    raw: function () { return S.get('cart', []); },
    items: function () {
      return cart.raw().map(function (l) {
        var p = product(l.id);
        return p ? { id: l.id, qty: l.qty, p: p, line: p.price * l.qty } : null;
      }).filter(Boolean);
    },
    count: function () { return cart.items().reduce(function (a, l) { return a + l.qty; }, 0); },
    subtotal: function () { return cart.items().reduce(function (a, l) { return a + l.line; }, 0); },
    delivery: function () { return cart.count() ? (Number(CFG.deliveryFee) || 0) : 0; },
    total: function () { return cart.subtotal() + cart.delivery(); },
    add: function (id, qty) {
      var p = product(id); if (!p || p.stock === 'out') return false;
      qty = Math.max(1, parseInt(qty, 10) || 1);
      var list = cart.raw(), hit = null;
      list.forEach(function (l) { if (l.id === id) hit = l; });
      if (hit) hit.qty = Math.min(99, hit.qty + qty); else list.push({ id: id, qty: qty });
      S.set('cart', list); emit(); return true;
    },
    set: function (id, qty) {
      qty = parseInt(qty, 10) || 0;
      var list = cart.raw().map(function (l) { if (l.id === id) l.qty = Math.min(99, qty); return l; })
                           .filter(function (l) { return l.qty > 0; });
      S.set('cart', list); emit();
    },
    remove: function (id) { S.set('cart', cart.raw().filter(function (l) { return l.id !== id; })); emit(); },
    clear: function () { S.set('cart', []); emit(); }
  };

  /* ------------------------------------------------------------ wishlist --- */
  var wish = {
    ids: function () { return S.get('wish', []).filter(function (id) { return !HAS_PRODUCTS || product(id); }); },
    has: function (id) { return wish.ids().indexOf(id) > -1; },
    toggle: function (id) {
      var l = wish.ids(), i = l.indexOf(id);
      if (i > -1) l.splice(i, 1); else l.push(id);
      S.set('wish', l); emit(); return i === -1;
    },
    remove: function (id) { S.set('wish', wish.ids().filter(function (x) { return x !== id; })); emit(); }
  };

  /* ------------------------------------------------------------ orders ----- */
  var STATUS = {
    awaiting:  'Awaiting payment verification',
    verified:  'Payment verified',
    shipped:   'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  var orders = {
    all: function () { return S.get('orders', []); },
    get: function (id) { return orders.all().filter(function (o) { return o.id === id; })[0] || null; },
    create: function (customer) {
      var items = cart.items();
      if (!items.length) return null;
      var d = new Date();
      var stamp = String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
      var id = (CFG.orderPrefix || 'MCB') + '-' + stamp + '-' + Math.floor(1000 + Math.random() * 9000);
      var o = {
        id: id,
        createdAt: d.toISOString(),
        status: 'awaiting',
        payment: 'bank',
        customer: customer,
        items: items.map(function (l) {
          return { id: l.id, name: l.p.name, image: l.p.image, price: l.p.price, qty: l.qty };
        }),
        subtotal: cart.subtotal(),
        delivery: cart.delivery(),
        total: cart.total(),
        history: [{ status: 'awaiting', at: d.toISOString() }]
      };
      var list = orders.all(); list.unshift(o); S.set('orders', list);
      cart.clear();
      return o;
    },
    setStatus: function (id, st) {
      var list = orders.all();
      list.forEach(function (o) {
        if (o.id === id && o.status !== st) {
          o.status = st;
          (o.history = o.history || []).push({ status: st, at: new Date().toISOString() });
        }
      });
      S.set('orders', list); emit();
    },
    remove: function (id) { S.set('orders', orders.all().filter(function (o) { return o.id !== id; })); emit(); }
  };

  /* ------------------------------------------------ accounts (DEMO) --------
     Saved on this device only. Passwords are hashed before saving, but this
     is NOT real account security — a proper server login replaces it in
     Phase 2.                                                               */
  var hash = function (txt) {
    try {
      if (global.crypto && global.crypto.subtle && global.TextEncoder) {
        return global.crypto.subtle.digest('SHA-256', new TextEncoder().encode('mcb::' + txt)).then(function (b) {
          return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
        });
      }
    } catch (e) {}
    var h = 5381; txt = 'mcb::' + txt;
    for (var i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0;
    return Promise.resolve('d' + (h >>> 0).toString(16));
  };
  var account = {
    users: function () { return S.get('users', []); },
    current: function () {
      var em = S.get('session', null); if (!em) return null;
      return account.users().filter(function (u) { return u.email === em; })[0] || null;
    },
    signup: function (d) {
      var email = String(d.email || '').trim().toLowerCase();
      if (account.users().some(function (u) { return u.email === email; }))
        return Promise.reject(new Error('An account with this email already exists. Try signing in.'));
      return hash(d.password).then(function (h) {
        var u = { name: d.name.trim(), email: email, phone: (d.phone || '').trim(), pw: h,
                  addresses: [], createdAt: new Date().toISOString() };
        var list = account.users(); list.push(u); S.set('users', list);
        S.set('session', email); emit(); return u;
      });
    },
    login: function (email, pw) {
      email = String(email || '').trim().toLowerCase();
      var u = account.users().filter(function (x) { return x.email === email; })[0];
      if (!u) return Promise.reject(new Error('We could not find an account with that email on this device.'));
      return hash(pw).then(function (h) {
        if (h !== u.pw) throw new Error('That password is not right. Please try again.');
        S.set('session', email); emit(); return u;
      });
    },
    logout: function () { S.del('session'); emit(); },
    update: function (patch) {
      var me = account.current(); if (!me) return;
      var list = account.users().map(function (u) {
        if (u.email === me.email) Object.keys(patch).forEach(function (k) { u[k] = patch[k]; });
        return u;
      });
      S.set('users', list); emit();
    },
    myOrders: function () {
      var me = account.current(); if (!me) return [];
      return orders.all().filter(function (o) { return (o.customer && o.customer.email || '').toLowerCase() === me.email; });
    }
  };

  /* ------------------------------------------------------------ search ----- */
  var CAT_WORDS = { new: 'new chromebook laptop', refurb: 'refurbished refurb chromebook laptop used', accessories: 'accessory accessories' };
  var search = function (term, limit) {
    var t = String(term || '').trim().toLowerCase();
    if (!t || !HAS_PRODUCTS) return [];
    var words = t.split(/\s+/);
    return PRODUCTS.map(function (p) {
      var name = p.name.toLowerCase();
      var hay = [name, p.short, (p.specs || []).join(' '), p.subcategory, CAT_WORDS[p.category] || '',
                 p.details ? Object.keys(p.details).map(function (k) { return p.details[k]; }).join(' ') : '']
                 .join(' ').toLowerCase();
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (hay.indexOf(w) === -1) return null;      // every word must match somewhere
        if (name.indexOf(w) === 0) score += 6;
        else if (name.indexOf(' ' + w) > -1) score += 4;
        else if (name.indexOf(w) > -1) score += 3;
        else score += 1;
      }
      if (p.stock === 'out') score -= 1;
      return { p: p, s: score };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; })
      .slice(0, limit || 50).map(function (x) { return x.p; });
  };

  /* ------------------------------------------------------------ WhatsApp --- */
  var wa = function (text) {
    var n = String(CFG.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(text);
  };

  /* ======================================================== UI ============= */
  var ICONS = {
    bag:   '<svg viewBox="0 0 24 24"><path d="M6 7h12l1.5 12.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>',
    bagPlus:'<svg viewBox="0 0 24 24"><path d="M6 7h12l1.5 12.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><rect x="1" y="6" width="15" height="12" rx="2"/><path d="M16 10h4l3 4v4h-7z"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>'
  };

  /* ---- header badges ---- */
  var paintBadges = function () {
    var c = cart.count(), w = wish.ids().length;
    document.querySelectorAll('[data-mc="cart"] .ic-badge').forEach(function (b) {
      var was = b.textContent;
      b.textContent = c > 99 ? '99+' : c;
      b.classList.toggle('on', c > 0);
      if (was !== String(c) && c > 0) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
    document.querySelectorAll('[data-mc="wish"] .ic-badge').forEach(function (b) {
      b.textContent = w; b.classList.toggle('on', w > 0);
    });
    document.querySelectorAll('[data-mc="acct"]').forEach(function (a) {
      var me = account.current();
      a.classList.toggle('is-in', !!me);
      a.setAttribute('title', me ? 'Signed in as ' + me.name : 'Sign in or create an account');
    });
  };

  /* ---- hearts on product cards ---- */
  var paintHearts = function () {
    document.querySelectorAll('[data-id] .b-heart, .b-heart[data-id]').forEach(function (h) {
      var host = h.closest('[data-id]'); if (!host) return;
      var on = wish.has(host.dataset.id);
      h.classList.toggle('on', on);
      h.setAttribute('title', on ? 'Saved to wishlist' : 'Add to wishlist');
    });
  };

  /* ---- quick-add buttons on product cards ---- */
  var addQuickAdd = function () {
    document.querySelectorAll('.b-item[data-id]').forEach(function (card) {
      var img = card.querySelector('.b-img');
      if (!img || img.querySelector('.qa-btn')) return;
      var p = product(card.dataset.id);
      if (!p || p.stock === 'out') return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'qa-btn'; b.setAttribute('aria-label', 'Add ' + p.name + ' to cart');
      b.innerHTML = ICONS.bagPlus + '<span>Add to cart</span>';
      img.appendChild(b);
    });
  };

  /* ---- toast ---- */
  var toastEl, toastTimer;
  var toast = function (o) {
    if (!toastEl) {
      toastEl = document.createElement('div'); toastEl.className = 'mc-toast'; toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = (o.img ? '<img src="' + esc(o.img) + '" alt="">' : '') +
      '<span class="t-txt">' + esc(o.text) + '</span>' +
      (o.link ? '<a href="' + esc(o.link) + '"' + (o.onclick ? ' data-act="' + o.onclick + '"' : '') + '>' + esc(o.linkText || 'View') + '</a>' : '');
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, o.ms || 3200);
  };

  /* ---- cart drawer ---- */
  var drawer, veil;
  var buildDrawer = function () {
    if (drawer) return;
    veil = document.createElement('div'); veil.className = 'cd-veil';
    drawer = document.createElement('aside'); drawer.className = 'cd'; drawer.setAttribute('aria-label', 'Your cart');
    document.body.appendChild(veil); document.body.appendChild(drawer);
    veil.addEventListener('click', closeDrawer);
  };
  var lineHTML = function (l) {
    return '<div class="li" data-line="' + esc(l.id) + '">' +
      '<a class="li-img" href="product.html?id=' + encodeURIComponent(l.id) + '"><img src="' + esc(l.p.image) + '" alt=""></a>' +
      '<div><a class="li-name" href="product.html?id=' + encodeURIComponent(l.id) + '">' + esc(l.p.name) + '</a>' +
        '<span class="li-meta">' + money(l.p.price) + ' each</span></div>' +
      '<div class="li-side"><span class="li-price">' + money(l.line) + '</span>' +
        '<span class="qty"><button type="button" data-q="-1" aria-label="Less">−</button><span>' + l.qty + '</span>' +
        '<button type="button" data-q="1" aria-label="More">+</button></span>' +
        '<button type="button" class="li-rm" data-rm>Remove</button></div>' +
    '</div>';
  };
  var emptyHTML = function (title, text, href, btn, icon) {
    return '<div class="empty"><div class="e-ic">' + (icon || ICONS.bag) + '</div><h3>' + esc(title) + '</h3>' +
      '<p>' + esc(text) + '</p><a class="btn btn-rose" href="' + href + '">' + esc(btn) + ' <span class="arrow-c">↗</span></a></div>';
  };
  var paintDrawer = function () {
    if (!drawer) return;
    var items = cart.items(), n = cart.count();
    var free = (Number(CFG.deliveryFee) || 0) === 0;
    drawer.innerHTML =
      '<div class="cd-head"><h3>Your cart<small>' + (n ? n + (n === 1 ? ' item' : ' items') : '') + '</small></h3>' +
        '<button class="cd-x" type="button" aria-label="Close cart">✕</button></div>' +
      (items.length && free ? '<div class="cd-free">' + ICONS.truck + 'Free delivery on every order, anywhere in Pakistan.</div>' : '') +
      '<div class="cd-list">' + (items.length ? items.map(lineHTML).join('') :
        emptyHTML('Your cart is empty', 'Browse Chromebooks and accessories, then add them here.', 'shop.html', 'Go to shop')) + '</div>' +
      (items.length ?
        '<div class="cd-foot">' +
          '<div class="cd-row"><span>Subtotal</span><span>' + money(cart.subtotal()) + '</span></div>' +
          '<div class="cd-row"><span>Delivery</span><span>' + (cart.delivery() ? money(cart.delivery()) : '<b class="sum-free">Free</b>') + '</span></div>' +
          '<div class="cd-row tot"><span>Total</span><span>' + money(cart.total()) + '</span></div>' +
          '<div class="cd-btns"><a class="btn btn-metal" href="cart.html">View cart</a>' +
          '<a class="btn btn-rose" href="checkout.html">Checkout</a></div>' +
        '</div>' : '');
    drawer.querySelector('.cd-x').addEventListener('click', closeDrawer);
  };
  var openDrawer = function () {
    buildDrawer(); paintDrawer();
    if (toastEl) toastEl.classList.remove('show');
    requestAnimationFrame(function () { veil.classList.add('open'); drawer.classList.add('open'); });
    document.body.style.overflow = 'hidden';
  };
  var closeDrawer = function () {
    if (!drawer) return;
    veil.classList.remove('open'); drawer.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* shared +/-/remove handling for any list of .li rows */
  var bindLines = function (root) {
    root.addEventListener('click', function (e) {
      var row = e.target.closest('.li[data-line]'); if (!row) return;
      var id = row.dataset.line;
      var q = e.target.closest('[data-q]');
      if (q) {
        var cur = cart.raw().filter(function (l) { return l.id === id; })[0];
        if (cur) cart.set(id, cur.qty + Number(q.dataset.q));
        return;
      }
      if (e.target.closest('[data-rm]')) {
        row.classList.add('out');
        setTimeout(function () { cart.remove(id); }, 260);
      }
    });
  };

  /* ---- live search in the header ---- */
  var initSearch = function () {
    document.querySelectorAll('form.searchbar:not(.bl-search)').forEach(function (form) {
      var input = form.querySelector('input');
      if (!input) return;
      form.setAttribute('action', 'shop.html');
      input.setAttribute('name', 'q');
      input.setAttribute('autocomplete', 'off');
      var cur = qs('q'); if (cur && /shop\.html/.test(location.pathname)) input.value = cur;
      var drop = document.createElement('div'); drop.className = 'sr-drop'; drop.setAttribute('role', 'listbox');
      form.appendChild(drop);
      var act = -1, results = [];
      var hl = function (txt, t) {
        var out = esc(txt);
        t.trim().split(/\s+/).forEach(function (w) {
          if (!w) return;
          var re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
          out = out.replace(re, '<mark>$1</mark>');
        });
        return out;
      };
      var paint = function () {
        var t = input.value;
        if (!t.trim()) { drop.classList.remove('open'); return; }
        results = search(t, 6); act = -1;
        drop.innerHTML = results.length ?
          results.map(function (p, i) {
            return '<a class="sr-item" role="option" data-i="' + i + '" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
              '<img src="' + esc(p.image) + '" alt=""><span><b>' + hl(p.name, t) + '</b>' +
              '<small>' + esc(p.stock === 'out' ? 'Sold out' : (p.category === 'refurb' ? 'Refurbished' : p.category === 'new' ? 'New Chromebook' : 'Accessory')) + '</small></span>' +
              '<span class="sr-price">' + money(p.price) + '</span></a>';
          }).join('') + '<a class="sr-all" href="shop.html?q=' + encodeURIComponent(t.trim()) + '">See all results for “' + esc(t.trim()) + '”</a>'
          : '<div class="sr-empty">No products match “' + esc(t.trim()) + '”. Try “mouse”, “stylus” or “CTL”.</div>';
        drop.classList.add('open');
      };
      var mark = function () {
        drop.querySelectorAll('.sr-item').forEach(function (a, i) { a.classList.toggle('act', i === act); });
      };
      input.addEventListener('input', paint);
      input.addEventListener('focus', function () { if (input.value.trim()) paint(); });
      input.addEventListener('keydown', function (e) {
        if (!drop.classList.contains('open')) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(results.length - 1, act + 1); mark(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(-1, act - 1); mark(); }
        else if (e.key === 'Escape') { drop.classList.remove('open'); }
        else if (e.key === 'Enter' && act > -1 && results[act]) {
          e.preventDefault(); location.href = 'product.html?id=' + encodeURIComponent(results[act].id);
        }
      });
      form.addEventListener('submit', function (e) { if (!input.value.trim()) e.preventDefault(); });
      document.addEventListener('click', function (e) { if (!form.contains(e.target)) drop.classList.remove('open'); });
    });
  };

  /* ---- global click handling ---- */
  var initClicks = function () {
    document.addEventListener('click', function (e) {
      /* header cart icon opens the drawer (except on the cart page itself) */
      var ci = e.target.closest('[data-mc="cart"]');
      if (ci && !/cart\.html/.test(location.pathname)) { e.preventDefault(); openDrawer(); return; }

      /* wishlist hearts on cards */
      var h = e.target.closest('.b-heart');
      if (h) {
        var host = h.closest('[data-id]');
        if (host) {
          e.preventDefault(); e.stopPropagation();
          var added = wish.toggle(host.dataset.id);
          var p = product(host.dataset.id);
          h.classList.remove('pulse'); void h.offsetWidth; h.classList.add('pulse');
          toast({ img: p && p.image, text: added ? 'Saved to your wishlist' : 'Removed from wishlist',
                  link: added ? 'wishlist.html' : '', linkText: 'View wishlist' });
        }
        return;
      }

      /* quick add on cards */
      var qa = e.target.closest('.qa-btn');
      if (qa) {
        e.preventDefault(); e.stopPropagation();
        var card = qa.closest('[data-id]'); if (!card) return;
        var pr = product(card.dataset.id);
        if (cart.add(card.dataset.id, 1)) {
          qa.classList.add('done'); qa.innerHTML = ICONS.check + '<span>Added</span>';
          setTimeout(function () { qa.classList.remove('done'); qa.innerHTML = ICONS.bagPlus + '<span>Add to cart</span>'; }, 1600);
          toast({ img: pr.image, text: pr.name + ' added to cart', link: 'cart.html', linkText: 'View cart', onclick: 'drawer' });
        }
        return;
      }

      /* toast "View cart" opens the drawer instead of leaving the page */
      var ta = e.target.closest('.mc-toast a[data-act="drawer"]');
      if (ta && !/cart\.html/.test(location.pathname)) { e.preventDefault(); toastEl.classList.remove('show'); openDrawer(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  };

  /* ---- keep everything in sync ---- */
  var refresh = function () { paintBadges(); paintHearts(); if (drawer && drawer.classList.contains('open')) paintDrawer(); };
  global.addEventListener('mc:change', refresh);
  global.addEventListener('storage', function (e) { if (e.key && e.key.indexOf('mcb.') === 0) { emit(); } });

  var boot = function () {
    buildDrawer();
    bindLines(drawer);
    addQuickAdd();
    initSearch();
    initClicks();
    refresh();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ------------------------------------------------------------ public ----- */
  global.MC = {
    cfg: CFG, S: S, esc: esc, money: money, qs: qs, emit: emit,
    product: product, cart: cart, wish: wish, orders: orders, STATUS: STATUS,
    account: account, search: search, wa: wa, toast: toast,
    openDrawer: openDrawer, closeDrawer: closeDrawer, bindLines: bindLines,
    lineHTML: lineHTML, emptyHTML: emptyHTML, ICONS: ICONS,
    enhance: function () { addQuickAdd(); paintHearts(); },
    admin: {
      baseSig: BASE_SIG,
      original: function () { return JSON.parse(JSON.stringify(ORIGINAL)); },
      hasEdits: function () { var s = S.get('adminProducts', null); return !!(s && s.base === BASE_SIG); },
      save: function (list) { S.set('adminProducts', { base: BASE_SIG, list: list, at: new Date().toISOString() }); emit(); },
      discard: function () { S.del('adminProducts'); }
    }
  };
})(window);
