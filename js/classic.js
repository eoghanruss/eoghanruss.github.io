// Site behaviour for every page. Each feature only runs if its elements exist.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rgbCache = {};
  const themeRGB = (v) => { const k = v + (document.documentElement.dataset.theme || ''); return rgbCache[k] || (rgbCache[k] = getComputedStyle(document.documentElement).getPropertyValue(v).trim()); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });

  /* ---------- Smooth inertia scrolling (Lenis) ---------- */
  let lenis = null;
  const startLenis = () => {
    if (reduced || !window.Lenis || document.body.classList.contains('gf')) return;
    lenis = new window.Lenis({ lerp: 0.14, smoothWheel: true, wheelMultiplier: 1.05, syncTouch: false });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.siteLenis = lenis;
  };
  const goTo = (target) => {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  // Same-page anchor links glide to their section.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = id === 'top' ? document.body : document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (id === 'top') { lenis ? lenis.scrollTo(0, { duration: 1.4 }) : scrollTo({ top: 0, behavior: 'smooth' }); } else goTo(el);
    history.replaceState(null, '', location.pathname);
  });

  /* ---------- Return to a section after visiting a sub-page ---------- */
  addEventListener('DOMContentLoaded', () => {
    let target = null;
    try { target = sessionStorage.getItem('scrollTarget'); sessionStorage.removeItem('scrollTarget'); } catch { /* ignore */ }
    startLenis();
    if (target) setTimeout(() => goTo(target), 160);
  });

  /* ---------- Cursor ---------- */
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  if (fine && dot && ring) {
    document.documentElement.classList.add('has-cursor');
    let rx = mouse.x, ry = mouse.y, running = false;
    const tick = () => {
      rx = lerp(rx, mouse.x, reduced ? 1 : 0.22); ry = lerp(ry, mouse.y, reduced ? 1 : 0.22);
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      if (Math.abs(rx - mouse.x) + Math.abs(ry - mouse.y) > 0.3) requestAnimationFrame(tick); else running = false;
    };
    addEventListener('pointermove', () => { if (!running) { running = true; requestAnimationFrame(tick); } }, { passive: true });
    const hoverSel = 'a, button, .project-card, .chat-trigger, .gallery figure, input, textarea';
    document.addEventListener('pointerover', (e) => document.body.classList.toggle('hovering', !!e.target.closest(hoverSel)));
    document.addEventListener('pointerleave', () => document.body.classList.add('cursor-hidden'));
    document.addEventListener('pointerenter', () => document.body.classList.remove('cursor-hidden'));
  }

  /* ---------- Nav, progress bar, mobile menu, active link ---------- */
  const nav = $('.navbar'), bar = $('.scroll-progress');
  const onScroll = () => {
    nav?.classList.toggle('scrolled', scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menuBtn = $('.menu-btn');
  const setMenu = (open) => {
    document.documentElement.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
    menuBtn?.setAttribute('aria-expanded', String(open));
    if (menuBtn) menuBtn.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
  };
  menuBtn?.addEventListener('click', () => setMenu(!document.documentElement.classList.contains('menu-open')));
  $$('.mobile-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  // Links to a homepage section from a sub-page remember where to land.
  $$('[data-section]').forEach((a) => a.addEventListener('click', () => { try { sessionStorage.setItem('scrollTarget', a.dataset.section); } catch { /* ignore */ } }));
  const links = $$('.nav-link[href^="#"]');
  if (links.length) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${en.target.id}`));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((l) => { const s = $(l.getAttribute('href')); if (s) io.observe(s); });
  }

  /* ---------- Typewriter ---------- */
  const tw = $('#typewriter');
  if (tw) {
    const phrases = JSON.parse(tw.dataset.phrases || '[]');
    if (reduced) tw.textContent = phrases[0];
    else {
      let p = 0, c = 0, del = false;
      const type = () => {
        const word = phrases[p];
        c += del ? -1 : 1;
        tw.textContent = word.slice(0, c);
        let wait = del ? 45 : 95;
        if (!del && c === word.length) { del = true; wait = 2000; }
        else if (del && c === 0) { del = false; p = (p + 1) % phrases.length; wait = 450; }
        setTimeout(type, wait);
      };
      setTimeout(type, 500);
    }
  }

  /* ---------- 3D tilt card (eased) ---------- */
  const card = $('#tiltCard');
  if (card && fine && !reduced) {
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false, onScreen = true;
    const glareBox = document.createElement('span'); glareBox.className = 'tilt-glare'; glareBox.setAttribute('aria-hidden', 'true'); const glare = document.createElement('i'); glareBox.append(glare); card.append(glareBox);
    new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; }).observe(card);
    const loop = () => {
      cx = lerp(cx, tx, 0.1); cy = lerp(cy, ty, 0.1);
      card.style.transform = `rotateY(${cx.toFixed(2)}deg) rotateX(${(-cy).toFixed(2)}deg)`;
      glare.style.transform = `translate3d(${(-cx * 6).toFixed(1)}px, ${(-cy * 6).toFixed(1)}px, 0)`;
      if (Math.abs(cx - tx) + Math.abs(cy - ty) > 0.02) requestAnimationFrame(loop); else running = false;
    };
    addEventListener('pointermove', (e) => {
      if (!onScreen) return;
      tx = (innerWidth / 2 - e.clientX) / 40; ty = (innerHeight / 2 - e.clientY) / 40;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }

  /* ---------- Hero particles (connected dots) ---------- */
  const pc = $('#particles-js');
  if (pc) {
    const x = pc.getContext('2d');
    let w, h, dpr, pts = [];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5); w = pc.clientWidth; h = pc.clientHeight;
      pc.width = w * dpr; pc.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(48, (w * h) / 22000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 0.6 }));
    };
    let pcRect = pc.getBoundingClientRect();
    const measure = () => { pcRect = pc.getBoundingClientRect(); };
    size(); addEventListener('resize', () => { size(); measure(); });
    addEventListener('scroll', measure, { passive: true });
    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(pc);
    let lastDraw = 0;
    const draw = (t = 0) => {
      if (visible && !document.hidden && t - lastDraw > 32) {
        const step = lastDraw ? Math.min(3, (t - lastDraw) / 16.7) : 1;
        lastDraw = t;
        x.clearRect(0, 0, w, h);
        const mx = mouse.x - pcRect.left, my = mouse.y - pcRect.top;
        for (const p of pts) {
          if (!reduced) {
            p.x += p.vx * step; p.y += p.vy * step;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
            if (mouse.active && d2 < 14400) { const d = Math.sqrt(d2) || 1; p.x += (dx / d) * 1.2; p.y += (dy / d) * 1.2; }
          }
        }
        // Lines are batched into three opacity bands: three strokes instead of hundreds.
        const bands = [new Path2D(), new Path2D(), new Path2D()];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 < 16900) { const band = d2 < 3600 ? 0 : d2 < 9000 ? 1 : 2; bands[band].moveTo(a.x, a.y); bands[band].lineTo(b.x, b.y); }
          }
        }
        const lc = themeRGB('--particle-line');
        x.lineWidth = 1;
        [0.15, 0.09, 0.04].forEach((al, i) => { x.strokeStyle = `rgba(${lc},${al})`; x.stroke(bands[i]); });
        const dots = new Path2D();
        for (const p of pts) { dots.moveTo(p.x + p.r, p.y); dots.arc(p.x, p.y, p.r, 0, 6.283); }
        x.fillStyle = `rgba(${themeRGB('--particle')},.32)`; x.fill(dots);
      }
      if (!reduced) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- Hero entrance: words rise in ---------- */
  const split = $('.hero-split');
  if (split) {
    const words = split.textContent.trim().split(/\s+/);
    split.setAttribute('aria-label', split.textContent.trim());
    split.innerHTML = words.map((w, i) => `<span class="split-w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
  }
  if ($('.hero-seq')) requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('hero-ready')));

  /* ---------- Photo parallax ---------- */
  const par = $('#heroParallax'), heroEl = $('.hero');
  if (par && heroEl && !reduced) {
    let heroH = heroEl.offsetHeight, wide = innerWidth > 900, queued = false;
    addEventListener('resize', () => { heroH = heroEl.offsetHeight; wide = innerWidth > 900; }, { passive: true });
    const step = () => {
      queued = false;
      const y = scrollY;
      if (y > heroH + 200) return;
      par.style.transform = `translate3d(0, ${wide ? (Math.min(y, heroH) * 0.14).toFixed(1) : 0}px, 0)`;
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(step); } }, { passive: true });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduced) {
    $$('[data-magnetic]').forEach((el) => {
      const pull = el.classList.contains('social') || el.classList.contains('chat-trigger') ? 0.4 : 0.28;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = 'transform .2s ease-out, background .3s, color .3s, box-shadow .35s';
        el.style.transform = `translate(${(dx * pull).toFixed(1)}px, ${(dy * pull - 2).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .8s cubic-bezier(.2, 1.4, .4, 1), background .3s, color .3s, box-shadow .35s';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Project cards: tilt toward the cursor ---------- */
  if (fine && !reduced) {
    $$('.project-card').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--tx', `${(px * 10).toFixed(2)}deg`);
        c.style.setProperty('--ty', `${(-py * 8).toFixed(2)}deg`);
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--tx', '0deg'); c.style.setProperty('--ty', '0deg'); });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal, .timeline-item');
  if (reduced) revealEls.forEach((el) => el.classList.add('show'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Timeline line fills as you scroll ---------- */
  const tl = $('.timeline-wrapper'), fill = $('.timeline-line i');
  if (tl && fill) {
    const f = () => {
      const r = tl.getBoundingClientRect();
      fill.style.transform = `scaleY(${reduced ? 1 : clamp((innerHeight * 0.6 - r.top) / r.height)})`;
    };
    addEventListener('scroll', f, { passive: true }); f();
  }

  /* ---------- Project cards: tap to flip on touch screens ---------- */
  $$('.project-card').forEach((c) => {
    c.addEventListener('click', (e) => {
      if (fine || e.target.closest('a, button')) return;
      $$('.project-card.flipped').forEach((o) => { if (o !== c) o.classList.remove('flipped'); });
      c.classList.toggle('flipped');
    });
  });

  /* ---------- Copy email ---------- */
  $$('[data-copy]').forEach((el) => el.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(el.dataset.copy); } catch { location.href = `mailto:${el.dataset.copy}`; return; }
    const s = el.querySelector('span'); const old = s.textContent;
    s.textContent = 'Copied to clipboard'; setTimeout(() => { s.textContent = old; }, 1800);
  }));

  /* ---------- Contact form ---------- */
  const form = $('#contactForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]'), status = $('#formStatus'), label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Sending…'; status.textContent = '';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) { location.href = '/success/'; return; }
      const err = await res.json().catch(() => ({}));
      status.textContent = err.errors?.[0]?.message || 'Something went wrong. Please try again or email me directly.';
    } catch { status.textContent = 'Network error. Please check your connection and try again.'; }
    btn.disabled = false; btn.innerHTML = label;
  });

  /* ---------- Chat ---------- */
  const trigger = $('#chatTrigger'), body = $('#chatBody'), input = $('#chatInput');
  if (trigger && body && input) {
    const setChat = (open) => { document.documentElement.classList.toggle('chat-open', open); trigger.setAttribute('aria-expanded', String(open)); if (open) setTimeout(() => input.focus(), 250); };
    trigger.addEventListener('click', () => setChat(!document.documentElement.classList.contains('chat-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.documentElement.classList.contains('chat-open')) { setChat(false); trigger.focus(); } });
    const send = () => {
      const q = input.value.trim(); if (!q) return;
      const me = document.createElement('div'); me.className = 'chat-msg user'; me.textContent = q; body.append(me);
      input.value = '';
      const typing = document.createElement('div'); typing.className = 'chat-msg bot typing'; typing.innerHTML = '<i></i><i></i><i></i>'; body.append(typing);
      body.scrollTop = body.scrollHeight;
      setTimeout(() => {
        typing.remove();
        const bot = document.createElement('div'); bot.className = 'chat-msg bot';
        // getBotResponse (js/bot.js) returns trusted, hand-written HTML.
        bot.innerHTML = typeof window.getBotResponse === 'function' ? window.getBotResponse(q.toLowerCase()) : 'Send Eoghan a message through the contact form!';
        body.append(bot); body.scrollTop = body.scrollHeight;
      }, 650);
    };
    $('#sendBtn')?.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  }

  /* ---------- Matrix rain (footer) ---------- */
  const mc = $('#matrix-canvas');
  if (mc && !reduced) {
    const x = mc.getContext('2d');
    const letters = '01010101ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fs = 14; let drops = [], w, h;
    const size = () => { w = mc.width = mc.clientWidth; h = mc.height = mc.clientHeight; drops = Array(Math.floor(w / fs)).fill(0).map(() => Math.random() * -40); };
    size(); addEventListener('resize', size);
    let visible = false;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(mc);
    setInterval(() => {
      if (!visible) return;
      x.fillStyle = getComputedStyle(mc.parentElement).backgroundColor.replace('rgb(', 'rgba(').replace(')', ', 0.14)'); x.fillRect(0, 0, w, h);
      x.fillStyle = `rgb(${themeRGB('--particle-line')})`; x.font = `${fs}px monospace`;
      drops.forEach((d, k) => {
        x.fillText(letters[(Math.random() * letters.length) | 0], k * fs, d * fs);
        if (d * fs > h && Math.random() > 0.975) drops[k] = 0;
        drops[k] += 1;
      });
    }, 55);
  }

  /* ---------- Project pages: counters, video, lightbox ---------- */
  const cio = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    if (reduced) return;
    const el = en.target, end = Number(el.dataset.count), suf = el.dataset.suffix || '', t0 = performance.now();
    const step = (t) => { const k = clamp((t - t0) / 1300); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));
  $$('video[data-autoplay]').forEach((v) => {
    if (reduced) return;
    new IntersectionObserver((e) => { if (e[0].isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.35 }).observe(v);
  });
  const box = $('#lightbox');
  if (box) {
    $$('.gallery figure').forEach((f) => f.addEventListener('click', () => { const im = f.querySelector('img'); box.querySelector('img').src = im.src; box.querySelector('img').alt = im.alt; box.showModal(); }));
    box.querySelector('button').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  }

  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();
