import { initShared, reduced, clamp, lerp, sound, pointer } from './core.js';

initShared();
const $ = (s) => document.querySelector(s);

function setup(canvas) {
  const x = canvas.getContext('2d');
  const s = { c: canvas, x, w: 0, h: 0, vis: false };
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); s.w = canvas.clientWidth; s.h = canvas.clientHeight; canvas.width = s.w * d; canvas.height = s.h * d; x.setTransform(d, 0, 0, d, 0, 0); s.onResize?.(); };
  size(); addEventListener('resize', size);
  new IntersectionObserver((e) => { s.vis = e[0].isIntersecting; }).observe(canvas);
  const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  s.local = local;
  return s;
}

/* ---------------------------------------------------------------- 01 Warp drive */
const warp = setup($('#cWarp'));
const stars = Array.from({ length: 700 }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() }));
let speed = 0.002, holding = false, spaceHeld = false;
const hold = (v) => { if (v && !holding) sound.whoosh(0.16); holding = v; };
warp.c.addEventListener('pointerdown', (e) => { warp.c.setPointerCapture(e.pointerId); hold(true); });
warp.c.addEventListener('pointerup', () => hold(false));
warp.c.addEventListener('pointercancel', () => hold(false));
addEventListener('keydown', (e) => {
  if (e.code === 'Space' && warp.vis && !['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
    e.preventDefault(); if (!spaceHeld) { spaceHeld = true; hold(true); }
  }
});
addEventListener('keyup', (e) => { if (e.code === 'Space') { spaceHeld = false; hold(false); } });
const speedEl = $('#warpSpeed');
function drawWarp() {
  const { x, w, h } = warp;
  speed = lerp(speed, holding ? 0.05 : 0.002, holding ? 0.03 : 0.05);
  x.fillStyle = `rgba(5,6,15,${holding ? 0.35 : 0.9})`; x.fillRect(0, 0, w, h);
  const cx = w / 2 + (pointer.nx * w * 0.2), cy = h / 2;
  const f = Math.max(w, h) * 0.5;
  for (const s of stars) {
    const pz = s.z; s.z -= speed;
    if (s.z <= 0.001) { s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; s.z = 1; continue; }
    const sx = cx + (s.x / s.z) * f, sy = cy + (s.y / s.z) * f;
    const px = cx + (s.x / pz) * f, py = cy + (s.y / pz) * f;
    if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
    const b = 1 - s.z;
    x.strokeStyle = speed > 0.01 ? `hsla(${260 - b * 240}, 90%, ${60 + b * 30}%, ${b})` : `rgba(238,240,255,${b})`;
    x.lineWidth = b * 2.4;
    x.beginPath(); x.moveTo(px, py); x.lineTo(sx, sy); x.stroke();
  }
  speedEl.textContent = `SPEED ${(speed / 0.05 * 0.99).toFixed(2)}c`;
  sound.engine(holding ? 0.6 : 0);
}

/* ---------------------------------------------------------------- 02 Gravity well */
const grav = setup($('#cGravity'));
let bodies = [];
let aim = null;
const COLORS = ['#9b6bff', '#2dd4bf', '#f472b6', '#60a5fa', '#a3e635', '#ffb199'];
const G = 2600;
function addBody(x, y, vx, vy) {
  bodies.push({ x, y, vx, vy, r: 3 + Math.random() * 5, c: COLORS[(Math.random() * COLORS.length) | 0], trail: [] });
  if (bodies.length > 60) bodies.shift();
}
grav.c.addEventListener('pointerdown', (e) => { grav.c.setPointerCapture(e.pointerId); const p = grav.local(e); aim = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; });
grav.c.addEventListener('pointermove', (e) => { if (aim) { const p = grav.local(e); aim.x1 = p.x; aim.y1 = p.y; } });
grav.c.addEventListener('pointerup', () => {
  if (!aim) return;
  addBody(aim.x0, aim.y0, (aim.x0 - aim.x1) * 0.05, (aim.y0 - aim.y1) * 0.05);
  sound.note([0, 3, 7, 10, 12][(Math.random() * 5) | 0]);
  aim = null;
});
function orbitSpawn() {
  const cx = grav.w / 2, cy = grav.h / 2;
  for (let i = 0; i < 5; i++) {
    const r = 60 + Math.random() * Math.min(cx, cy) * 0.8, a = Math.random() * Math.PI * 2;
    const v = Math.sqrt(G / r) * (0.92 + Math.random() * 0.16);
    addBody(cx + Math.cos(a) * r, cy + Math.sin(a) * r, -Math.sin(a) * v, Math.cos(a) * v);
  }
}
$('#gravRandom').addEventListener('click', orbitSpawn);
$('#gravClear').addEventListener('click', () => { bodies = []; });
grav.onResize = () => { if (!bodies.length) orbitSpawn(); };
grav.onResize();
const gravCount = $('#gravCount');
function drawGravity(t) {
  const { x, w, h } = grav; const cx = w / 2, cy = h / 2;
  x.clearRect(0, 0, w, h);
  const glow = x.createRadialGradient(cx, cy, 4, cx, cy, 70);
  glow.addColorStop(0, '#fff3dc'); glow.addColorStop(0.3, '#ff9a6b'); glow.addColorStop(0.6, 'rgba(255,122,89,.35)'); glow.addColorStop(1, 'rgba(255,122,89,0)');
  x.fillStyle = glow; x.beginPath(); x.arc(cx, cy, 70, 0, 6.283); x.fill();
  const steps = reduced ? 1 : 2;
  for (let k = 0; k < steps; k++) {
    bodies.forEach((b) => {
      const dx = cx - b.x, dy = cy - b.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
      const a = G / Math.max(d2, 200);
      b.vx += (dx / d) * a * 0.5; b.vy += (dy / d) * a * 0.5;
      b.x += b.vx * 0.5; b.y += b.vy * 0.5;
      b.dead = d < 16 || b.x < -w || b.x > w * 2 || b.y < -h || b.y > h * 2;
    });
  }
  bodies = bodies.filter((b) => !b.dead);
  bodies.forEach((b) => {
    b.trail.push([b.x, b.y]); if (b.trail.length > 70) b.trail.shift();
    x.strokeStyle = b.c; x.lineWidth = 1.2; x.globalAlpha = 0.35;
    x.beginPath(); b.trail.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke();
    x.globalAlpha = 1; x.fillStyle = b.c; x.shadowColor = b.c; x.shadowBlur = 12;
    x.beginPath(); x.arc(b.x, b.y, b.r, 0, 6.283); x.fill(); x.shadowBlur = 0;
  });
  if (aim) {
    x.strokeStyle = 'rgba(255,177,153,.8)'; x.setLineDash([4, 6]); x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(aim.x0, aim.y0); x.lineTo(aim.x0 + (aim.x0 - aim.x1), aim.y0 + (aim.y0 - aim.y1)); x.stroke(); x.setLineDash([]);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(aim.x0, aim.y0, 5, 0, 6.283); x.fill();
  }
  gravCount.textContent = `${bodies.length} PLANET${bodies.length === 1 ? '' : 'S'} IN ORBIT`;
}

/* ---------------------------------------------------------------- 03 Type stretcher */
const word = $('#stretchWord');
const sW = $('#sWght'), sD = $('#sWdth'), follow = $('#sFollow');
function applyType(wg, wd) { word.style.fontVariationSettings = `'wght' ${wg}, 'wdth' ${wd}`; }
applyType(sW.value, sD.value);
[sW, sD].forEach((el) => el.addEventListener('input', () => { follow.checked = false; applyType(sW.value, sD.value); }));
word.parentElement.addEventListener('pointermove', (e) => {
  if (!follow.checked || reduced) return;
  const r = word.parentElement.getBoundingClientRect();
  const wd = Math.round(50 + clamp((e.clientX - r.left) / r.width) * 100);
  const wg = Math.round(900 - clamp((e.clientY - r.top) / r.height) * 800);
  sW.value = wg; sD.value = wd; applyType(wg, wd);
});
word.addEventListener('input', () => { if (word.textContent.length > 24) word.textContent = word.textContent.slice(0, 24); });

/* ---------------------------------------------------------------- 04 Star synth */
const sky = setup($('#cStars'));
let points = [], path = [], playing = -1;
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
function newSky() {
  points = Array.from({ length: 22 }, () => ({ x: 0.06 + Math.random() * 0.88, y: 0.12 + Math.random() * 0.78, r: 2 + Math.random() * 2.5, glow: 0 }));
  path = [];
}
newSky();
sky.c.addEventListener('pointerdown', (e) => {
  const p = sky.local(e);
  let best = -1, bd = 40;
  points.forEach((s, i) => { const d = Math.hypot(s.x * sky.w - p.x, s.y * sky.h - p.y); if (d < bd) { bd = d; best = i; } });
  if (best < 0) return;
  path.push(best); ping(best);
});
function ping(i) {
  const s = points[i]; s.glow = 1;
  sound.note(SCALE[Math.round((1 - s.y) * (SCALE.length - 1))] - 5, 0.08);
}
$('#starsNew').addEventListener('click', newSky);
$('#starsPlay').addEventListener('click', () => {
  if (!path.length) return;
  let k = 0; playing = 0;
  const step = () => { if (k >= path.length) { playing = -1; return; } playing = k; ping(path[k]); k += 1; setTimeout(step, 260); };
  step();
});
function drawStars() {
  const { x, w, h } = sky;
  x.clearRect(0, 0, w, h);
  x.strokeStyle = 'rgba(196,186,255,.55)'; x.lineWidth = 1.2;
  x.beginPath();
  path.forEach((i, k) => { const s = points[i]; (k ? x.lineTo(s.x * w, s.y * h) : x.moveTo(s.x * w, s.y * h)); });
  x.stroke();
  points.forEach((s) => {
    s.glow *= 0.94;
    const px = s.x * w, py = s.y * h;
    if (s.glow > 0.02) {
      const g = x.createRadialGradient(px, py, 0, px, py, 30 * s.glow + 4);
      g.addColorStop(0, `rgba(255,177,153,${s.glow})`); g.addColorStop(1, 'rgba(255,122,89,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, 30 * s.glow + 4, 0, 6.283); x.fill();
    }
    x.fillStyle = path.includes(points.indexOf(s)) ? '#ffb199' : 'rgba(238,240,255,.85)';
    x.beginPath(); x.arc(px, py, s.r + s.glow * 3, 0, 6.283); x.fill();
  });
}

function loop(t) {
  if (warp.vis) drawWarp(); else sound.engine(0);
  if (grav.vis) drawGravity(t);
  if (sky.vis) drawStars();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
