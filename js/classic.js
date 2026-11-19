// Site behaviour for every page. Each feature only runs if its elements exist.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });

  /* ---------- Return to a section after visiting a sub-page ---------- */
  addEventListener('DOMContentLoaded', () => {
    let target = null;
    try { target = sessionStorage.getItem('scrollTarget'); sessionStorage.removeItem('scrollTarget'); } catch { /* ignore */ }
    if (target) setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), 120);
  });

  /* ---------- Cursor ---------- */
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  if (fine && dot && ring) {
    document.documentElement.classList.add('has-cursor');
    let rx = mouse.x, ry = mouse.y;
    const tick = () => {
      rx = lerp(rx, mouse.x, reduced ? 1 : 0.18); ry = lerp(ry, mouse.y, reduced ? 1 : 0.18);
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();
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
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener('pointermove', (e) => {
      tx = (innerWidth / 2 - e.clientX) / 40;
      ty = (innerHeight / 2 - e.clientY) / 40;
    }, { passive: true });
    const loop = () => {
      cx = lerp(cx, tx, 0.08); cy = lerp(cy, ty, 0.08);
      card.style.transform = `rotateY(${cx.toFixed(2)}deg) rotateX(${(-cy).toFixed(2)}deg)`;
      card.style.setProperty('--gx', `${50 - cx * 3}%`); card.style.setProperty('--gy', `${30 - cy * 3}%`);
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Hero particles (connected dots) ---------- */
  const pc = $('#particles-js');
  if (pc) {
    const x = pc.getContext('2d');
    let w, h, dpr, pts = [];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); w = pc.clientWidth; h = pc.clientHeight;
      pc.width = w * dpr; pc.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, (w * h) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 0.6 }));
    };
    size(); addEventListener('resize', size);
    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(pc);
    const draw = () => {
      if (visible) {
        x.clearRect(0, 0, w, h);
        const rect = pc.getBoundingClientRect();
        const mx = mouse.x - rect.left, my = mouse.y - rect.top;
        for (const p of pts) {
          if (!reduced) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
            if (mouse.active && d < 120) { p.x += (dx / d) * 0.6; p.y += (dy / d) * 0.6; }
          }
        }
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 130) { x.strokeStyle = `rgba(44,93,147,${(1 - d / 130) * 0.16})`; x.lineWidth = 1; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); }
          }
        }
        for (const p of pts) { x.fillStyle = 'rgba(22,36,61,.32)'; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill(); }
      }
      if (!reduced) requestAnimationFrame(draw);
    };
    draw();
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
      x.fillStyle = 'rgba(236,229,215,0.14)'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#2c5d93'; x.font = `${fs}px monospace`;
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
