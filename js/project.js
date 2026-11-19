// Case-study pages: shared behaviour plus media zoom, stat count-up and lazy video.
import { initShared, initVariableType, reduced, clamp } from './core.js';

initShared();
initVariableType();

// Media eases from slightly zoomed to natural size as it scrolls into view.
const media = [...document.querySelectorAll('.cs-media')];
function zoom() {
  media.forEach((m) => {
    const r = m.getBoundingClientRect();
    const p = clamp(1 - (r.top - innerHeight * 0.15) / innerHeight);
    m.style.setProperty('--zoom', reduced ? 1 : (1.08 - p * 0.08).toFixed(4));
  });
}
if (media.length) { addEventListener('scroll', zoom, { passive: true }); zoom(); }

// Count up the stat numbers once.
const counters = document.querySelectorAll('[data-count]');
const cio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, end = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    if (reduced) return;
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const k = clamp((t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = `${v}${suffix}`;
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = `0${suffix}`;
    requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
counters.forEach((c) => cio.observe(c));

// Videos play (muted) only while on screen.
document.querySelectorAll('video[data-autoplay]').forEach((v) => {
  if (reduced) return;
  new IntersectionObserver((e) => {
    if (e[0].isIntersecting) v.play().catch(() => {}); else v.pause();
  }, { threshold: 0.35 }).observe(v);
});
