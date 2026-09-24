'use client';
import { useEffect } from 'react';

/* The approved site's animations, carried over line for line from the original
   page scripts: hero card decks, 3D card tilt, featured-photo stage, About
   parallax, reveal-on-scroll, the video lightbox and the blog monitor.
   Everything is cleaned up when the page changes. */
export default function Effects() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const timers: any[] = [];
    const later = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const every = (fn: () => void, ms: number) => { const t = setInterval(fn, ms); timers.push(t); return t; };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    /* ---- rotating hero decks ---- */
    [...document.querySelectorAll<HTMLElement>('[data-deck]')].forEach((deck, d) => {
      const cards = [...deck.querySelectorAll<HTMLElement>('.deck-card')];
      const pos = ['p0', 'p1', 'p2'];
      let order = cards.map((_, i) => i);
      const base = 300 + d * 280;
      cards.forEach((c, k) => later(() => { c.classList.remove('enter'); c.classList.add(pos[k]); }, base + k * 560));
      if (reduce) return;
      const cycle = () => {
        const front = cards[order[0]];
        front.classList.remove('p0'); front.classList.add('out');
        order = [...order.slice(1), order[0]];
        order.slice(0, -1).forEach((ci, k) => { cards[ci].classList.remove('p1', 'p2'); cards[ci].classList.add(pos[k]); });
        later(() => {
          front.classList.add('snap'); front.classList.remove('out'); front.classList.add('p2'); front.style.opacity = '0';
          requestAnimationFrame(() => requestAnimationFrame(() => { front.classList.remove('snap'); front.style.opacity = ''; }));
        }, 1050);
      };
      later(() => every(cycle, 3000), base + cards.length * 560 + 1400 + d * 700);
    });

    /* ---- 3D tilt on product cards (delegated, so cards added later work too) ---- */
    if (fine) {
      let last: HTMLElement | null = null;
      const move = (e: MouseEvent) => {
        const card = (e.target as HTMLElement)?.closest?.('.b-item') as HTMLElement | null;
        if (last && last !== card) { last.style.transform = ''; }
        last = card;
        if (!card) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-8px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
      };
      const leave = () => { if (last) last.style.transform = ''; last = null; };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseleave', leave);
      cleanups.push(() => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseleave', leave); });
    }

    /* ---- featured product stage ---- */
    document.querySelectorAll('[data-stage]').forEach((st) => {
      const imgs = [...st.querySelectorAll('img')], dots = [...st.querySelectorAll('.stage-dots i')];
      if (imgs.length < 2) return;
      let i = 0;
      every(() => {
        imgs[i].classList.remove('on'); dots[i]?.classList.remove('on');
        i = (i + 1) % imgs.length;
        imgs[i].classList.add('on'); dots[i]?.classList.add('on');
      }, 3200);
    });

    /* ---- About: parallax layers follow the cursor ---- */
    const v = document.getElementById('abVisual');
    if (v && fine) {
      const layers = [...v.querySelectorAll<HTMLElement>('.ab-layer')];
      const baseT = (l: HTMLElement) => (l.classList.contains('ab-main') ? 'rotate(2deg)' : l.classList.contains('ab-sub') ? 'rotate(-5deg)' : '');
      const mm = (e: MouseEvent) => {
        const r = v.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach((l) => { const dd = +(l.dataset.depth || 10); l.style.transform = `translate(${(x * dd).toFixed(1)}px,${(y * dd).toFixed(1)}px) ${baseT(l)}`; });
      };
      const ml = () => layers.forEach((l) => { l.style.transform = baseT(l); });
      v.addEventListener('mousemove', mm); v.addEventListener('mouseleave', ml);
      cleanups.push(() => { v.removeEventListener('mousemove', mm); v.removeEventListener('mouseleave', ml); });
    }

    /* ---- reveal on scroll (also for content that appears later) ---- */
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    const watch = (root: ParentNode) => root.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el));
    watch(document);
    const mo = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
      if (n instanceof HTMLElement) { if (n.matches('.rv:not(.in)')) io.observe(n); watch(n); }
    })));
    mo.observe(document.body, { childList: true, subtree: true });
    cleanups.push(() => { io.disconnect(); mo.disconnect(); });

    /* ---- video lightbox ---- */
    const lb = document.getElementById('lightbox'), lbFrame = document.getElementById('lbFrame');
    if (lb && lbFrame) {
      const close = () => { lb.classList.remove('open'); lbFrame.innerHTML = ''; };
      const onCard = (e: Event) => {
        const c = (e.currentTarget as HTMLElement); const id = c.dataset.video;
        if (!id || id.startsWith('VIDEO_ID')) { alert('Video link coming soon — it will play right here.'); return; }
        lbFrame.innerHTML = '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        lb.classList.add('open');
      };
      const cards = [...document.querySelectorAll<HTMLElement>('.v-card')];
      cards.forEach((c) => c.addEventListener('click', onCard));
      const x = document.getElementById('lbClose'); x?.addEventListener('click', close);
      const bg = (e: MouseEvent) => { if (e.target === lb) close(); };
      lb.addEventListener('click', bg);
      cleanups.push(() => { cards.forEach((c) => c.removeEventListener('click', onCard)); x?.removeEventListener('click', close); lb.removeEventListener('click', bg); });
    }

    /* ---- blog: monitor auto-reader ---- */
    const arts = [...document.querySelectorAll<HTMLElement>('.s-body .article')];
    const mon = document.getElementById('monitor');
    if (arts.length && mon) {
      const dots = [...document.querySelectorAll<HTMLElement>('#mondots button')];
      const prog = document.getElementById('sprog') as HTMLElement, url = document.getElementById('surl') as HTMLElement;
      let cur = 0, paused = false, t0 = 0, elapsed = 0, raf = 0, alive = true;
      const dur = 12000;
      const pTimers: any[] = [];
      const show = (i: number) => {
        pTimers.forEach(clearTimeout); pTimers.length = 0;
        arts.forEach((a, k) => { a.classList.toggle('on', k === i); a.querySelectorAll('p').forEach((p) => p.classList.remove('show')); (a.querySelector('.a-inner') as HTMLElement).style.transform = ''; });
        dots.forEach((d, k) => d.classList.toggle('on', k === i));
        if (url) url.textContent = 'mychromebook.pk/blog/' + arts[i].dataset.id;
        const ps = [...arts[i].querySelectorAll('p')];
        ps.forEach((p, k) => pTimers.push(setTimeout(() => {
          p.classList.add('show');
          if (k >= 1) (arts[i].querySelector('.a-inner') as HTMLElement).style.transform = 'translateY(-' + Math.min(230, 60 + k * 70) + 'px)';
        }, 900 + k * 2200)));
        elapsed = 0; t0 = performance.now(); if (prog) prog.style.width = '0';
      };
      const tick = () => {
        if (!alive) return;
        if (!paused) { elapsed = performance.now() - t0; if (prog) prog.style.width = Math.min(100, (elapsed / dur) * 100) + '%'; if (elapsed >= dur) { cur = (cur + 1) % arts.length; show(cur); } }
        else t0 = performance.now() - elapsed;
        raf = requestAnimationFrame(tick);
      };
      show(0); raf = requestAnimationFrame(tick);
      const pe = () => (paused = true), pl = () => (paused = false);
      mon.addEventListener('mouseenter', pe); mon.addEventListener('mouseleave', pl);
      const dh = dots.map((d) => { const h = () => { cur = +(d.dataset.i || 0); show(cur); }; d.addEventListener('click', h); return h; });
      cleanups.push(() => { alive = false; cancelAnimationFrame(raf); pTimers.forEach(clearTimeout); mon.removeEventListener('mouseenter', pe); mon.removeEventListener('mouseleave', pl); dots.forEach((d, k) => d.removeEventListener('click', dh[k])); });
    }

    /* ---- blog: every "open article" element now opens the article's own page ---- */
    const opens = [...document.querySelectorAll<HTMLElement>('[data-open]')];
    const go = (e: Event) => { const k = (e.currentTarget as HTMLElement).dataset.open; if (k) window.location.href = '/blog/' + k; };
    opens.forEach((el) => { el.style.cursor = 'pointer'; el.addEventListener('click', go); });
    cleanups.push(() => opens.forEach((el) => el.removeEventListener('click', go)));

    /* ---- blog: search the articles on the page ---- */
    const bf = document.querySelector<HTMLFormElement>('.bl-search');
    if (bf) {
      const input = bf.querySelector('input') as HTMLInputElement;
      const cards = [...document.querySelectorAll<HTMLElement>('.bl-card')];
      const grid = document.querySelector('.bl-grid');
      const none = document.createElement('p');
      none.style.cssText = 'display:none;grid-column:1/-1;text-align:center;color:#6B6E78;font-size:14.5px;padding:30px 0';
      grid?.appendChild(none);
      const run = () => {
        const t = input.value.trim().toLowerCase(); let shown = 0;
        cards.forEach((c) => { const hit = !t || (c.textContent || '').toLowerCase().includes(t); c.style.display = hit ? '' : 'none'; if (hit) shown++; });
        none.style.display = shown ? 'none' : ''; none.textContent = 'No articles match “' + input.value.trim() + '”.';
      };
      const sub = (e: Event) => { e.preventDefault(); run(); grid?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      input.addEventListener('input', run); bf.addEventListener('submit', sub);
      cleanups.push(() => { input.removeEventListener('input', run); bf.removeEventListener('submit', sub); none.remove(); });
    }

    return () => { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); cleanups.forEach((f) => f()); };
  }, []);
  return null;
}
