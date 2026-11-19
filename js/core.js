// Shared site behaviour: starfield, cursor, magnetic buttons, sound, header, variable-font letters.

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => 1 - Math.pow(1 - t, 3);
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

export const pointer = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, active: false };
addEventListener('pointermove', (e) => {
  pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
  pointer.nx = e.clientX / innerWidth - 0.5; pointer.ny = e.clientY / innerHeight - 0.5;
}, { passive: true });

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

/* ------------------------------------------------------------------ Sound */
export const sound = (() => {
  let ctx = null, master = null, pad = null, hum = null, humGain = null;
  let on = false;
  const scale = [0, 3, 5, 7, 10, 12, 15];

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  }
  function startPad() {
    if (!ctx || pad) return;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520; f.Q.value = 3;
    const lfo = ctx.createOscillator(); const lfoG = ctx.createGain();
    lfo.frequency.value = 0.07; lfoG.gain.value = 240; lfo.connect(lfoG); lfoG.connect(f.frequency); lfo.start();
    const oscs = [55, 82.4, 110.3, 164.8].map((fr, i) => {
      const o = ctx.createOscillator(); o.type = i % 2 ? 'sine' : 'sawtooth'; o.frequency.value = fr; o.detune.value = (i - 1.5) * 7;
      o.connect(f); o.start(); return o;
    });
    f.connect(g); g.connect(master);
    g.gain.setTargetAtTime(0.035, ctx.currentTime, 2.5);
    pad = { g, oscs, lfo };
    // engine hum for the plane
    const noise = ctx.createBufferSource(); noise.buffer = noiseBuffer(2); noise.loop = true;
    const hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 300;
    humGain = ctx.createGain(); humGain.gain.value = 0;
    noise.connect(hf); hf.connect(humGain); humGain.connect(master); noise.start();
    hum = { noise, hf };
  }
  function noiseBuffer(sec) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function blip(freq, dur = 0.09, type = 'sine', vol = 0.05) {
    if (!on || !ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  const api = {
    get on() { return on; },
    toggle(force) {
      ensure(); if (!ctx) return false;
      on = typeof force === 'boolean' ? force : !on;
      if (on) { ctx.resume(); startPad(); master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.2); api.click(); }
      else master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      store.set('er-sound', on ? '1' : '0');
      return on;
    },
    hover() { blip(660 * Math.pow(2, scale[(Math.random() * scale.length) | 0] / 12), 0.12, 'sine', 0.028); },
    click() { if (!on || !ctx) return; blip(520, 0.14, 'triangle', 0.06); setTimeout(() => blip(780, 0.12, 'sine', 0.04), 45); },
    note(semi, vol = 0.06) { blip(330 * Math.pow(2, semi / 12), 0.9, 'sine', vol); },
    whoosh(vol = 0.18) {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource(); src.buffer = noiseBuffer(1.4);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
      f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.5); f.frequency.exponentialRampToValueAtTime(300, t + 1.3);
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      src.connect(f); f.connect(g); g.connect(master); src.start(t);
    },
    engine(level) {
      if (!ctx || !humGain) return;
      humGain.gain.setTargetAtTime(on ? level * 0.22 : 0, ctx.currentTime, 0.1);
      hum.hf.frequency.setTargetAtTime(200 + level * 600, ctx.currentTime, 0.1);
    },
  };
  return api;
})();

export function initSoundButton() {
  const btn = document.querySelector('.sound');
  if (!btn) return;
  const txt = btn.querySelector('.sound__txt');
  const set = (v) => { btn.setAttribute('aria-pressed', String(v)); txt.textContent = v ? 'SOUND ON' : 'SOUND OFF'; };
  btn.addEventListener('click', () => set(sound.toggle()));
  // Browsers need a gesture to start audio, so a saved "on" resumes on the first click anywhere.
  if (store.get('er-sound') === '1') {
    const once = () => { set(sound.toggle(true)); removeEventListener('pointerdown', once, true); };
    addEventListener('pointerdown', (e) => { if (!e.target.closest('.sound')) once(); }, { capture: true, once: true });
  }
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('a, button, [data-cursor], .planet');
    if (t && !t.contains(e.relatedTarget)) sound.hover();
  });
  document.addEventListener('click', (e) => { if (e.target.closest('a, button:not(.sound)')) sound.click(); });
}

/* ------------------------------------------------------------------ Starfield */
export function initSky() {
  const c = document.getElementById('sky');
  if (!c) return;
  const x = c.getContext('2d');
  let w, h, dpr, stars = [], shooting = null, nextShoot = performance.now() + 3000;
  const warp = { v: 0, target: 0 };
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((w * h) / 2600);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, z: Math.random() * 0.9 + 0.1,
      tw: Math.random() * Math.PI * 2, hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 270 : 15) : 230,
    }));
  }
  resize(); addEventListener('resize', resize);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last); last = now;
    x.clearRect(0, 0, w, h);
    const sy = scrollY;
    warp.v = lerp(warp.v, warp.target, 0.06);
    for (const s of stars) {
      const px = s.x - pointer.nx * 18 * s.z;
      let py = (s.y - sy * 0.06 * s.z) % h; if (py < 0) py += h;
      const tw = reduced ? 0.8 : 0.55 + Math.sin(now * 0.0016 + s.tw) * 0.45;
      const r = s.z * 1.25;
      x.globalAlpha = tw * (0.35 + s.z * 0.65);
      x.fillStyle = `hsl(${s.hue} 80% ${s.hue === 230 ? 94 : 80}%)`;
      if (warp.v > 0.02) {
        x.strokeStyle = x.fillStyle; x.lineWidth = r;
        const dx = px - w / 2, dy = py - h / 2;
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + dx * warp.v * 0.12 * s.z, py + dy * warp.v * 0.12 * s.z); x.stroke();
      } else { x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill(); }
    }
    if (!reduced) {
      if (!shooting && now > nextShoot) {
        shooting = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.4, vx: -(6 + Math.random() * 5), vy: 2.5 + Math.random() * 2, life: 1 };
        nextShoot = now + 5000 + Math.random() * 9000;
      }
      if (shooting) {
        const s = shooting; s.x += s.vx * dt / 16; s.y += s.vy * dt / 16; s.life -= 0.012 * dt / 16;
        const g = x.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        g.addColorStop(0, 'rgba(255,220,210,0.9)'); g.addColorStop(1, 'rgba(255,122,89,0)');
        x.globalAlpha = Math.max(0, s.life); x.strokeStyle = g; x.lineWidth = 1.6;
        x.beginPath(); x.moveTo(s.x, s.y); x.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); x.stroke();
        if (s.life <= 0) shooting = null;
      }
    }
    x.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return warp;
}

/* ------------------------------------------------------------------ Cursor */
export function initCursor() {
  if (!finePointer) return;
  const ring = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  if (!ring || !dot) return;
  document.documentElement.classList.add('has-cursor');
  const label = ring.querySelector('.cursor__label');
  let rx = pointer.x, ry = pointer.y;
  let shown = false;
  function tick() {
    rx = lerp(rx, pointer.x, reduced ? 1 : 0.2); ry = lerp(ry, pointer.y, reduced ? 1 : 0.2);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    requestAnimationFrame(tick);
  }
  tick();
  addEventListener('pointermove', () => { if (!shown) { shown = true; ring.classList.remove('is-hidden'); dot.classList.remove('is-hidden'); } }, { passive: true });
  document.addEventListener('pointerleave', () => { ring.classList.add('is-hidden'); dot.classList.add('is-hidden'); shown = false; });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, input, textarea, .tag');
    ring.classList.remove('has-label', 'is-hover');
    if (!t) return;
    if (t.matches('input, textarea')) return;
    const l = t.dataset.cursor || (t.classList.contains('tag') ? 'Drag' : '');
    if (l) { label.textContent = t.dataset.copied ? 'Copied!' : l; ring.classList.add('has-label'); }
    else ring.classList.add('is-hover');
  });
  addEventListener('pointerdown', () => ring.classList.add('is-down'));
  addEventListener('pointerup', () => ring.classList.remove('is-down'));
  ring.setLabel = (t) => { label.textContent = t; };
  return ring;
}

/* ------------------------------------------------------------------ Magnetic */
export function initMagnetic() {
  if (!finePointer || reduced) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = el.classList.contains('btn--sm') || el.classList.contains('sound') ? 0.3 : 0.4;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      el.style.transition = 'transform .15s ease-out';
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .7s cubic-bezier(.2,1.6,.4,1)';
      el.style.transform = '';
    });
  });
}

/* ------------------------------------------------------------------ Copy */
export function initCopy() {
  document.querySelectorAll('[data-copy]').forEach((el) => {
    el.addEventListener('click', async () => {
      const v = el.dataset.copy;
      try { await navigator.clipboard.writeText(v); } catch {
        const t = document.createElement('textarea'); t.value = v; document.body.append(t); t.select();
        try { document.execCommand('copy'); } catch { /* ignore */ } t.remove();
      }
      const small = el.querySelector('small');
      el.dataset.copied = '1';
      if (small) small.textContent = 'COPIED ✓';
      const ring = document.querySelector('.cursor'); ring?.setLabel?.('Copied!');
      setTimeout(() => { delete el.dataset.copied; if (small) small.textContent = 'CLICK TO COPY'; ring?.setLabel?.('Copy'); }, 1800);
    });
  });
}

/* ------------------------------------------------------------------ Header */
export function initHeader() {
  const header = document.querySelector('.header');
  const fuel = document.querySelector('.fuel');
  const burger = document.querySelector('.burger');
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY;
    header.classList.toggle('is-solid', y > 40);
    if (!document.documentElement.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > 300);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (fuel) fuel.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const close = () => { document.documentElement.classList.remove('menu-open'); burger?.setAttribute('aria-expanded', 'false'); burger?.setAttribute('aria-label', 'Open menu'); };
  burger?.addEventListener('click', () => {
    const open = document.documentElement.classList.toggle('menu-open');
    if (open) header.classList.remove('is-hidden');
    burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('.mobile-menu a').forEach((a) => a.addEventListener('click', close));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Active nav link
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { links.forEach((l) => l.classList.remove('is-active')); map.get(en.target.id)?.classList.add('is-active'); } });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* ------------------------------------------------------------------ Variable font letters */
export function initVariableType() {
  const groups = [...document.querySelectorAll('[data-vf]')];
  const chars = [];
  groups.forEach((g) => {
    const text = g.textContent;
    g.textContent = '';
    [...text].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'vf-char'; s.textContent = ch === ' ' ? ' ' : ch;
      g.append(s); chars.push(s);
    });
  });
  if (reduced) return chars;
  let pending = false;
  function update() {
    pending = false;
    for (const s of chars) {
      const r = s.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) continue;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.hypot(pointer.x - cx, pointer.y - cy);
      const p = pointer.active ? Math.max(0, 1 - d / Math.max(260, r.height * 1.6)) : 0;
      const k = p * p * (3 - 2 * p);
      s.style.setProperty('--w', (560 + k * 340).toFixed(0));
      s.style.setProperty('--d', (88 + k * 62).toFixed(0));
    }
  }
  const req = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  if (!finePointer) {
    const wave = (t) => {
      chars.forEach((s, i) => {
        const k = 0.5 + 0.5 * Math.sin(t / 900 - i * 0.55);
        s.style.setProperty('--w', (560 + k * 340).toFixed(0));
        s.style.setProperty('--d', (88 + k * 50).toFixed(0));
      });
      requestAnimationFrame(wave);
    };
    requestAnimationFrame(wave);
    return chars;
  }
  addEventListener('pointermove', req, { passive: true });
  addEventListener('scroll', req, { passive: true });
  update();
  return chars;
}

/* ------------------------------------------------------------------ Reveal */
export function initReveal() {
  const els = document.querySelectorAll('.rv');
  if (reduced) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en, i) => {
      if (en.isIntersecting || en.boundingClientRect.top < 0) {
        setTimeout(() => en.target.classList.add('in'), i * 90);
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach((e) => io.observe(e));
}

export function initShared() {
  const warp = initSky();
  initHeader();
  initCursor();
  initMagnetic();
  initSoundButton();
  initCopy();
  initReveal();
  const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
  const toTop = document.getElementById('toTop');
  toTop?.addEventListener('click', () => { sound.whoosh(0.12); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
  return { warp };
}
