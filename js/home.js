import { initShared, initVariableType, reduced, finePointer, pointer, clamp, lerp, smooth, sound } from './core.js';

const { warp } = initShared();
const $ = (s, r = document) => r.querySelector(s);
const vh = () => innerHeight;

/* ================================================================ Launch countdown */
(function launch() {
  const el = $('.launch');
  if (!el) return;
  let seen = false;
  try { seen = sessionStorage.getItem('er-launched') === '1'; sessionStorage.setItem('er-launched', '1'); } catch { /* ignore */ }
  if (reduced || seen) { el.classList.add('done'); return; }
  const n = $('.launch__count', el);
  let i = 3;
  const t = setInterval(() => {
    i -= 1;
    if (i > 0) n.textContent = i;
    else if (i === 0) { n.innerHTML = '<span class="grad">GO</span>'; }
    else { clearInterval(t); el.classList.add('done'); }
  }, 320);
})();

/* ================================================================ Variable type */
initVariableType();

/* ================================================================ Project data */
const PROJECTS = [
  { id: 'campusnav', name: 'CampusNav', icon: 'assets/campusnavlogo.png', color: '#2dd4bf', url: 'campusnav/', status: 'live', kind: 'Mobile app',
    desc: 'A student-friendly navigation app that helps first-year students find their way around campus, with AR navigation, events and search.' },
  { id: 'leadtrack', name: 'LeadTrack', icon: 'assets/leadtrackericon.png', color: '#60a5fa', url: 'leadtracker/', status: 'live', kind: 'Sales tool',
    desc: 'Built while working in sales and marketing at NuSolas as an easier way to track qualified leads.' },
  { id: 'embertales', name: 'EmberTales', icon: 'assets/campstoryicon.png', color: '#ff7a59', url: 'embertales/', status: 'live', kind: 'Interactive story',
    desc: 'A cinematic campfire horror experience shaped by you: add names, choose the scare level, dim the lights and let the fire crackle as the tale unfolds.' },
  { id: 'celestial', name: 'Celestial', icon: 'assets/celestiallogo.png', color: '#c4b5fd', url: null, status: 'build', kind: 'Wedding planner',
    desc: 'A wedding planner app that helps couples organise every detail of their big day, from guest lists to seating charts.' },
  { id: 'fittrack', name: 'FitTrack', icon: 'assets/fitness.png', color: '#a3e635', url: null, status: 'build', kind: 'Fitness app',
    desc: 'A workout app that helps you plan, track and level up your fitness routine.' },
  { id: 'globefolio', name: 'Globefolio', icon: 'assets/other.png', color: '#f472b6', url: 'globefolio/', status: 'live', kind: 'Design portfolio',
    desc: 'Graphic designs made for social media pages, promotional posters and newsletters, displayed on a spinning globe for extra style.' },
];

/* ================================================================ Hero: particle portrait */
const hero = $('.hero');
const heroState = { p: 0, ready: false, render: null };
const rows = [...document.querySelectorAll('.hero__row')];
const hint = $('.hero__hint');
const heroMeta = [$('.hero__meta'), $('.hero__top')];
let whooshed = false;

async function initPortrait() {
  const canvas = $('#portrait');
  if (reduced) { document.documentElement.classList.add('no-webgl'); return; }
  let THREE;
  try { THREE = await import('three'); } catch { document.documentElement.classList.add('no-webgl'); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' }); }
  catch { document.documentElement.classList.add('no-webgl'); return; }

  const img = new Image();
  img.src = 'assets/img/portrait-cut.png';
  await img.decode().catch(() => null);
  if (!img.naturalWidth) { document.documentElement.classList.add('no-webgl'); return; }

  const mobile = innerWidth < 760;
  const cols = mobile ? 170 : 270;
  const rowsN = Math.round(cols * img.naturalHeight / img.naturalWidth);
  const oc = document.createElement('canvas'); oc.width = cols; oc.height = rowsN;
  const ox = oc.getContext('2d', { willReadFrequently: true });
  ox.drawImage(img, 0, 0, cols, rowsN);
  const data = ox.getImageData(0, 0, cols, rowsN).data;

  const pos = [], col = [], rnd = [];
  for (let y = 0; y < rowsN; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      if (data[i + 3] < 120) continue;
      pos.push((x - cols / 2) / cols + (Math.random() - 0.5) / cols, (rowsN / 2 - y) / rowsN, 0);
      col.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
      const th = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, s = Math.sqrt(1 - u * u);
      const dx = (x - cols / 2) / cols, dy = (rowsN / 2 - y) / rowsN;
      rnd.push(s * Math.cos(th) + dx * 1.6, s * Math.sin(th) * 0.8 + dy * 1.2, clamp(u, -0.6, 0.5), Math.random());
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute('aRand', new THREE.Float32BufferAttribute(rnd, 4));

  const uniforms = {
    uTime: { value: 0 }, uProgress: { value: 0 }, uSize: { value: 3 }, uPR: { value: 1 },
    uScale: { value: new THREE.Vector2(400, 430) }, uOffY: { value: 0 },
    uMouse: { value: new THREE.Vector2(9999, 9999) }, uMouseStrength: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: /* glsl */`
      uniform float uTime, uProgress, uSize, uPR, uOffY, uMouseStrength;
      uniform vec2 uScale, uMouse;
      attribute vec3 aColor; attribute vec4 aRand;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float seed = aRand.w;
        vec3 p = vec3(position.x * uScale.x, position.y * uScale.y + uOffY, 0.0);
        p.z += sin(uTime * 1.2 + seed * 40.0) * 3.0;
        p.xy += vec2(sin(uTime * 0.8 + seed * 20.0), cos(uTime * 0.9 + seed * 30.0)) * 0.6;
        vec2 d = p.xy - uMouse; float dist = length(d);
        float f = smoothstep(58.0, 0.0, dist) * uMouseStrength;
        p.xy += normalize(d + 0.0001) * f * 34.0;
        p.z += f * 50.0;
        float t = clamp((uProgress - seed * 0.35) / 0.65, 0.0, 1.0);
        float e = t * t * (3.0 - 2.0 * t);
        vec3 q = p + aRand.xyz * (260.0 + seed * 1300.0) * e;
        float a = e * (1.2 + seed * 2.4);
        float cs = cos(a), sn = sin(a);
        q.xy = mat2(cs, -sn, sn, cs) * q.xy;
        vec4 mv = modelViewMatrix * vec4(q, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(48.0, uSize * uPR * (1.0 + e * 1.4) * (1000.0 / -mv.z));
        float lum = dot(aColor, vec3(0.299, 0.587, 0.114));
        vec3 lift = mix(vec3(0.42, 0.30, 0.95), vec3(1.0, 0.48, 0.35), seed);
        vColor = mix(aColor, lift, smoothstep(0.32, 0.0, lum) * 0.6 + e * 0.55) + 0.03;
        vAlpha = 1.0 - e * 0.7;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, smoothstep(0.5, 0.15, d) * vAlpha);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  const scene = new THREE.Scene(); scene.add(points);
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 5000); camera.position.z = 1000;
  let visH = 1, visW = 1;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const pr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    visH = 2 * 1000 * Math.tan((35 / 2) * Math.PI / 180); visW = visH * camera.aspect;
    let H = visH * 0.84, W = H * cols / rowsN;
    if (W > visW * 0.92) { W = visW * 0.92; H = W * rowsN / cols; }
    uniforms.uScale.value.set(W, H);
    uniforms.uOffY.value = -visH / 2 + H / 2;
    uniforms.uPR.value = pr;
    uniforms.uSize.value = (H / rowsN) * (h / visH) * 1.5;
  }
  resize(); addEventListener('resize', resize);

  let mouseS = 0;
  heroState.render = (t) => {
    uniforms.uTime.value = t / 1000;
    uniforms.uProgress.value = heroState.p;
    const r = canvas.getBoundingClientRect();
    const inside = pointer.active && pointer.y > r.top && pointer.y < r.bottom;
    mouseS = lerp(mouseS, inside && heroState.p < 0.1 ? 1 : 0, 0.08);
    uniforms.uMouseStrength.value = mouseS;
    uniforms.uMouse.value.set(((pointer.x - r.left) / r.width - 0.5) * visW, -((pointer.y - r.top) / r.height - 0.5) * visH);
    renderer.render(scene, camera);
  };
  heroState.ready = true;
}
initPortrait();

function updateHero() {
  const total = hero.offsetHeight - vh();
  const p = clamp(scrollY / total);
  heroState.p = reduced ? 0 : smooth(0.02, 0.85, p);
  if (reduced) return;
  const e = heroState.p;
  rows[0].style.transform = `translate3d(${-e * 34}vw, ${-e * 6}vh, 0)`;
  rows[1].style.transform = `translate3d(${e * 34}vw, ${e * 6}vh, 0)`;
  rows.forEach((r) => { r.style.opacity = String(1 - e); });
  const rawP = clamp(scrollY / total);
  $('#portrait').style.opacity = String(1 - smooth(0.86, 1, rawP));
  heroMeta.forEach((m) => { if (m) m.style.opacity = String(1 - smooth(0, 0.3, e)); });
  hint.style.opacity = String(smooth(0.6, 0.95, e));
  hint.style.transform = `translate(-50%, ${-50 + (1 - smooth(0.6, 1, e)) * 20}%)`;
  if (e > 0.12 && !whooshed) { whooshed = true; sound.whoosh(0.2); }
  if (e < 0.04) whooshed = false;
  if (warp) warp.target = e > 0.05 && e < 0.95 ? 0.6 : 0;
}

/* ================================================================ Statement words */
const statement = $('[data-words]');
const words = [];
if (statement) {
  const walk = (node, accent) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.append(w); return; }
          const s = document.createElement('span'); s.className = 'word' + (accent ? ' accent' : ''); s.textContent = w;
          frag.append(s); words.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n, accent || n.tagName === 'EM');
    });
  };
  walk(statement, false);
  statement.querySelectorAll('em').forEach((em) => em.replaceWith(...em.childNodes));
}
function updateStatement() {
  if (!statement) return;
  const r = statement.getBoundingClientRect();
  const p = reduced ? 1 : clamp((vh() * 0.85 - r.top) / (r.height + vh() * 0.35));
  const lit = Math.round(p * words.length);
  words.forEach((w, i) => w.classList.toggle('lit', i < lit));
}

/* ================================================================ Mission log (horizontal) */
const track = $('#track');
const hsec = $('#missions');
track.innerHTML = PROJECTS.map((p, i) => `
  <article class="mission" id="m-${p.id}" style="--c:${p.color}">
    <div class="mission__planet" aria-hidden="true"><img src="${p.icon}" alt="" loading="lazy"></div>
    <span class="mission__num">${String(i + 1).padStart(2, '0')} · ${p.kind}</span>
    <div class="mission__body">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="mission__foot">
        ${p.status === 'live' ? '<span class="chip chip--live">Live</span>' : '<span class="chip chip--build">Under construction</span>'}
        ${p.url ? `<a class="btn btn--glow btn--sm" href="${p.url}" data-cursor="View" data-magnetic>View project <span class="arrow" aria-hidden="true">→</span></a>` : ''}
      </div>
    </div>
  </article>`).join('') + `
  <article class="mission mission--end">
    <span class="label">Mission 07</span>
    <h3 style="margin-top:16px">Next mission:<br><span class="grad">yours?</span></h3>
    <p>Got an idea that needs building or a brand that needs a boost? Let's talk.</p>
    <a class="btn btn--ghost btn--sm" href="#contact" data-magnetic>Open a channel <span class="arrow" aria-hidden="true">→</span></a>
  </article>`;
const missionNow = $('#missionNow');
let hDist = 0;
function layoutH() {
  if (reduced) return;
  hDist = Math.max(0, track.scrollWidth - innerWidth);
  hsec.style.height = `${hDist + vh()}px`;
}
function updateH() {
  if (reduced) return;
  const top = hsec.getBoundingClientRect().top;
  const x = clamp(-top, 0, hDist);
  track.style.transform = `translate3d(${-x}px,0,0)`;
  const idx = Math.min(PROJECTS.length, Math.round((x / Math.max(1, hDist)) * PROJECTS.length));
  missionNow.textContent = String(Math.max(1, Math.min(6, idx + 1))).padStart(2, '0');
}
function scrollToMission(i) {
  const card = track.children[i];
  if (reduced) { card.scrollIntoView({ behavior: 'auto', block: 'center' }); return; }
  const secTop = hsec.getBoundingClientRect().top + scrollY;
  const target = secTop + clamp(card.offsetLeft - innerWidth * 0.12, 0, hDist);
  scrollTo({ top: target, behavior: 'smooth' });
}

/* ================================================================ Space map */
const stage = $('#orbitStage');
const svg = $('#orbitSvg');
const card = $('#orbitCard');
const planets = PROJECTS.map((p, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'planet'; b.dataset.cursor = 'Fly';
  b.setAttribute('aria-label', `${p.name}: jump to mission briefing`);
  b.style.setProperty('--c', p.color);
  b.innerHTML = `<span class="planet__body"><img src="${p.icon}" alt=""></span>${i === 3 || i === 0 ? '<span class="planet__ring"></span>' : ''}<span class="planet__tag">${p.name}</span>`;
  stage.append(b);
  const orbit = i % 3, opposite = i >= 3;
  const o = { el: b, p, orbit, a: (opposite ? Math.PI : 0) + orbit * 1.9, speed: [0.00016, 0.00011, 0.00007][orbit] };
  b.addEventListener('mouseenter', () => showCard(o));
  b.addEventListener('focus', () => showCard(o));
  b.addEventListener('mouseleave', hideCard);
  b.addEventListener('blur', hideCard);
  b.addEventListener('click', () => { sound.whoosh(0.12); scrollToMission(i); });
  return o;
});
let hovered = null, geom = null;
function showCard(o) {
  hovered = o;
  card.querySelector('.label').textContent = o.p.status === 'live' ? 'Planet · Live' : 'Planet · Under construction';
  card.querySelector('h3').textContent = o.p.name;
  card.querySelector('p').textContent = o.p.desc;
  card.classList.add('show');
}
function hideCard() { hovered = null; card.classList.remove('show'); }
function layoutOrbit() {
  const w = stage.clientWidth, h = stage.clientHeight;
  const narrow = w < 700;
  const maxA = narrow ? w * 0.4 : Math.min(w * 0.42, 640);
  const radii = [0.46, 0.73, 1].map((k) => maxA * k);
  const flat = narrow ? Math.min(1.55, (h * 0.44) / maxA) : 0.36;
  geom = { cx: w / 2, cy: h / 2, radii, flat, size: narrow ? 52 : 86 };
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = radii.map((r) => `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${r}" ry="${r * flat}"/>`).join('');
  planets.forEach((o, i) => o.el.style.setProperty('--s', `${geom.size * [1, 0.9, 1.1, 0.95, 0.8, 1.05][i]}px`));
}
let orbitVisible = false;
new IntersectionObserver((e) => { orbitVisible = e[0].isIntersecting; }).observe(stage);
function updateOrbit(dt) {
  if (!geom || (!orbitVisible && geom.drawn)) return;
  geom.drawn = true;
  planets.forEach((o) => {
    if (!hovered && !reduced) o.a += o.speed * dt;
    const r = geom.radii[o.orbit];
    const x = geom.cx + Math.cos(o.a) * r, y = geom.cy + Math.sin(o.a) * r * geom.flat;
    const depth = Math.sin(o.a);
    const s = 0.72 + (depth + 1) * 0.22;
    o.el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s.toFixed(3)})`;
    o.el.style.zIndex = depth > 0 ? '60' : '40';
    o.el.style.opacity = String(0.55 + (depth + 1) * 0.225);
    o.x = x; o.y = y;
  });
  if (hovered) {
    const cw = 260, left = clamp(hovered.x + 50, 10, stage.clientWidth - cw - 10);
    const top = clamp(hovered.y - 60, 10, stage.clientHeight - 150);
    card.style.left = `${hovered.x + 50 + cw > stage.clientWidth ? clamp(hovered.x - cw - 50, 10, 9999) : left}px`;
    card.style.top = `${top}px`;
  }
}

/* ================================================================ 3D phone */
const phoneSec = $('#campusnav');
const phone = $('#phone');
const screens = [...phone.querySelectorAll('.phone__screen img')];
const feats = [...document.querySelectorAll('#features li')];
let screenIdx = 0;
function updatePhone() {
  const r = phoneSec.getBoundingClientRect();
  if (r.bottom < 0 || r.top > vh()) return;
  const p = clamp(-r.top / (r.height - vh()));
  if (reduced) return;
  const s = p * 3.0;
  const base = Math.min(3, Math.floor(s));
  const f = s - base;
  const turn = base + (base < 3 ? smooth(0.62, 1, f) : 0);
  const sway = -22 + 44 * f * (base < 3 ? 1 : 0.6);
  const ry = turn * 360 + sway * (1 - smooth(0.62, 1, f) * (base < 3 ? 1 : 0));
  phone.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  phone.style.setProperty('--rx', `${(8 * Math.sin(p * Math.PI * 2)).toFixed(2)}deg`);
  phone.style.setProperty('--rz', `${(-4 + 8 * p).toFixed(2)}deg`);
  const idx = Math.min(3, Math.round(turn));
  if (idx !== screenIdx) {
    screenIdx = idx;
    screens.forEach((im, i) => im.classList.toggle('on', i === idx));
    feats.forEach((li, i) => li.classList.toggle('on', i === idx));
    sound.hover();
  }
}

/* ================================================================ Journey globe */
const D2R = Math.PI / 180;
const PLACES = {
  ireland: { lon: -8.9, lat: 52.7, label: 'IRELAND' },
  maine: { lon: -69.72, lat: 44.54, label: 'MAINE, USA', dy: -12 },
  pa: { lon: -75.49, lat: 40.61, label: 'ALLENTOWN, PA', align: 'right', dy: 20 },
};
const globe = { c: $('#globe'), dots: null, w: 0, h: 0, dpr: 1, lon: -12, lat: 48, tLon: -12, tLat: 48, maine: 0, flight: 0, step: 0, visible: false };
const gx = globe.c.getContext('2d');
fetch('assets/data/land-dots.json').then((r) => r.json()).then((arr) => {
  const n = arr.length / 2; const d = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const lo = arr[i * 2] / 10 * D2R, la = arr[i * 2 + 1] / 10 * D2R;
    d[i * 4] = lo; d[i * 4 + 1] = Math.sin(la); d[i * 4 + 2] = Math.cos(la);
    const dI = Math.hypot(arr[i * 2] / 10 - PLACES.ireland.lon, (arr[i * 2 + 1] / 10 - PLACES.ireland.lat) * 1.6);
    const dP = Math.hypot(arr[i * 2] / 10 - PLACES.pa.lon, (arr[i * 2 + 1] / 10 - PLACES.pa.lat) * 1.4);
    d[i * 4 + 3] = dI < 4.2 ? 1 : dP < 2.6 ? 2 : 0;
  }
  globe.dots = d;
}).catch(() => {});
new IntersectionObserver((e) => { globe.visible = e[0].isIntersecting; }, { rootMargin: '100px' }).observe($('#journey'));
function sizeGlobe() {
  globe.dpr = Math.min(devicePixelRatio || 1, 2);
  globe.w = globe.c.clientWidth; globe.h = globe.c.clientHeight;
  globe.c.width = globe.w * globe.dpr; globe.c.height = globe.h * globe.dpr;
}
const toVec = (lon, lat) => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)];
const fromVec = ([x, y, z]) => [Math.atan2(y, x) / D2R, Math.asin(clamp(z, -1, 1)) / D2R];
function slerp(a, b, t) {
  const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  const om = Math.acos(dot), so = Math.sin(om);
  if (so < 1e-6) return a;
  const k1 = Math.sin((1 - t) * om) / so, k2 = Math.sin(t * om) / so;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}
const vI = toVec(PLACES.ireland.lon, PLACES.ireland.lat), vP = toVec(PLACES.pa.lon, PLACES.pa.lat), vM = toVec(PLACES.maine.lon, PLACES.maine.lat);

function drawGlobe(t) {
  const { w, h, dpr } = globe;
  if (!w) return;
  const x = gx; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
  const R = Math.min(w, h) * (w < 600 ? 0.44 : 0.4);
  const cx = w / 2, cy = h / 2;
  const l0 = globe.lon * D2R, p0 = globe.lat * D2R, sp0 = Math.sin(p0), cp0 = Math.cos(p0);
  const proj = (lon, sinLat, cosLat, alt = 0) => {
    const dl = lon - l0, cdl = Math.cos(dl);
    const cosc = sp0 * sinLat + cp0 * cosLat * cdl;
    const k = R * (1 + alt);
    return [cx + k * cosLat * Math.sin(dl), cy - k * (cp0 * sinLat - sp0 * cosLat * cdl), cosc];
  };
  const projLL = (lon, lat, alt) => proj(lon * D2R, Math.sin(lat * D2R), Math.cos(lat * D2R), alt);

  // atmosphere + body
  const glow = x.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
  glow.addColorStop(0, 'rgba(155,107,255,0.35)'); glow.addColorStop(1, 'rgba(155,107,255,0)');
  x.fillStyle = glow; x.beginPath(); x.arc(cx, cy, R * 1.35, 0, 6.283); x.fill();
  const body = x.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
  body.addColorStop(0, '#1d1850'); body.addColorStop(1, '#070818');
  x.fillStyle = body; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
  x.strokeStyle = 'rgba(196,186,255,0.25)'; x.lineWidth = 1; x.stroke();

  // graticule
  x.strokeStyle = 'rgba(196,186,255,0.07)'; x.lineWidth = 1;
  for (let la = -60; la <= 75; la += 15) {
    x.beginPath(); let pen = false;
    for (let lo = -180; lo <= 180; lo += 4) { const [px, py, c] = projLL(lo, la, 0); if (c > 0) { pen ? x.lineTo(px, py) : x.moveTo(px, py); pen = true; } else pen = false; }
    x.stroke();
  }
  for (let lo = -180; lo < 180; lo += 15) {
    x.beginPath(); let pen = false;
    for (let la = -80; la <= 80; la += 4) { const [px, py, c] = projLL(lo, la, 0); if (c > 0) { pen ? x.lineTo(px, py) : x.moveTo(px, py); pen = true; } else pen = false; }
    x.stroke();
  }

  // land dots
  const d = globe.dots;
  if (d) {
    const ds = Math.max(1, R / 230);
    for (let i = 0; i < d.length; i += 4) {
      const [px, py, c] = proj(d[i], d[i + 1], d[i + 2]);
      if (c <= 0.02) continue;
      const tag = d[i + 3];
      if (tag === 1) x.fillStyle = `rgba(255,140,110,${0.45 + c * 0.55})`;
      else if (tag === 2) x.fillStyle = `rgba(190,160,255,${(0.3 + c * 0.7) * (0.35 + globe.flight * 0.65)})`;
      else x.fillStyle = `rgba(196,190,240,${0.12 + c * 0.5})`;
      const s = ds * (0.6 + c * 0.9) * (tag ? 1.35 : 1);
      x.fillRect(px - s / 2, py - s / 2, s, s);
    }
  }

  // arc helper
  const arc = (a, b, upto, alt, style, dash) => {
    x.save(); x.strokeStyle = style; x.lineWidth = 2; if (dash) x.setLineDash(dash);
    x.beginPath(); let pen = false, head = null, prev = null;
    const N = 80;
    for (let i = 0; i <= N * upto; i++) {
      const tt = i / N; const [lo, la] = fromVec(slerp(a, b, tt));
      const pt = projLL(lo, la, alt * Math.sin(Math.PI * tt));
      if (pt[2] > -0.15) { pen ? x.lineTo(pt[0], pt[1]) : x.moveTo(pt[0], pt[1]); pen = true; } else pen = false;
      prev = head; head = pt;
    }
    x.stroke(); x.restore();
    return [prev, head];
  };

  // Maine summers: dashed loop there and back
  if (globe.maine > 0.01) {
    x.globalAlpha = globe.maine;
    const off = reduced ? 0 : -(t / 60) % 16;
    x.lineDashOffset = off;
    arc(vI, vM, 1, 0.1, 'rgba(255,177,153,0.65)', [4, 8]);
    x.globalAlpha = 1;
  }

  // Conquest flight
  if (globe.flight > 0.001) {
    const [prev, head] = arc(vI, vP, globe.flight, 0.14, 'rgba(255,255,255,0.0)');
    // gradient trail
    const N = 80; const upto = globe.flight;
    for (let i = 1; i <= N * upto; i++) {
      const t0 = (i - 1) / N, t1 = i / N;
      const [lo0, la0] = fromVec(slerp(vI, vP, t0)); const [lo1, la1] = fromVec(slerp(vI, vP, t1));
      const a = projLL(lo0, la0, 0.14 * Math.sin(Math.PI * t0)), b = projLL(lo1, la1, 0.14 * Math.sin(Math.PI * t1));
      if (a[2] < -0.15) continue;
      const k = i / (N * upto);
      x.strokeStyle = `rgba(${Math.round(155 + 100 * k)},${Math.round(107 + 15 * k)},${Math.round(255 - 166 * k)},${0.25 + 0.75 * k})`;
      x.lineWidth = 1 + k * 2.2;
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
    }
    if (head && prev && globe.flight < 0.995) {
      const ang = Math.atan2(head[1] - prev[1], head[0] - prev[0]);
      drawPlane(x, head[0], head[1], ang, Math.max(14, R / 18));
    }
  }

  // pins
  const pin = (pl, on, color) => {
    if (on <= 0.01) return;
    const [px, py, c] = projLL(pl.lon, pl.lat, 0);
    if (c <= 0) return;
    const pulse = reduced ? 0.5 : (t / 1400) % 1;
    x.globalAlpha = on;
    x.strokeStyle = color; x.lineWidth = 1.5;
    x.beginPath(); x.arc(px, py, 4 + pulse * 18, 0, 6.283); x.globalAlpha = on * (1 - pulse); x.stroke();
    x.globalAlpha = on; x.fillStyle = color; x.beginPath(); x.arc(px, py, 4.5, 0, 6.283); x.fill();
    x.fillStyle = '#eef0ff'; x.font = '500 11px "JetBrains Mono", monospace';
    const right = pl.align === 'right' || (!pl.align && px > cx + R * 0.5);
    x.textAlign = right ? 'right' : 'left';
    x.fillText(pl.label, px + (right ? -12 : 12), py + (pl.dy ?? -10));
    x.globalAlpha = 1;
  };
  pin(PLACES.ireland, 1, '#ff7a59');
  pin(PLACES.maine, globe.maine, '#ffb199');
  pin(PLACES.pa, smooth(0.85, 1, globe.flight), '#c6a8ff');
}
function drawPlane(x, px, py, ang, s) {
  x.save(); x.translate(px, py); x.rotate(ang + Math.PI / 2);
  x.shadowColor = 'rgba(255,122,89,0.9)'; x.shadowBlur = 16;
  x.fillStyle = '#fff';
  x.beginPath();
  x.moveTo(0, -s); x.quadraticCurveTo(s * 0.12, -s * 0.8, s * 0.12, -s * 0.3);
  x.lineTo(s * 0.95, s * 0.15); x.lineTo(s * 0.95, s * 0.32); x.lineTo(s * 0.12, s * 0.12);
  x.lineTo(s * 0.1, s * 0.7); x.lineTo(s * 0.38, s * 0.9); x.lineTo(s * 0.38, s * 1.02); x.lineTo(0, s * 0.92);
  x.lineTo(-s * 0.38, s * 1.02); x.lineTo(-s * 0.38, s * 0.9); x.lineTo(-s * 0.1, s * 0.7);
  x.lineTo(-s * 0.12, s * 0.12); x.lineTo(-s * 0.95, s * 0.32); x.lineTo(-s * 0.95, s * 0.15); x.lineTo(-s * 0.12, -s * 0.3);
  x.quadraticCurveTo(-s * 0.12, -s * 0.8, 0, -s);
  x.fill(); x.restore();
}
const steps = [...document.querySelectorAll('.step')];
const flightStep = $('.step--flight');
const flightBar = $('#flightBar');
const hud = { lat: $('#hudLat'), lon: $('#hudLon'), place: $('#hudPlace') };
let tookOff = false;
function updateJourney() {
  if (!globe.visible) { sound.engine(0); return; }
  const mid = vh() * (innerWidth < 900 ? 0.72 : 0.5);
  let best = 0, bestD = Infinity;
  steps.forEach((s, i) => { const r = s.getBoundingClientRect(); const dd = Math.abs(r.top + r.height / 2 - mid); if (dd < bestD) { bestD = dd; best = i; } });
  steps.forEach((s, i) => s.classList.toggle('on', i === best));
  const fr = flightStep.getBoundingClientRect();
  const fp = clamp((vh() * 0.95 - fr.top) / (vh() * 0.85));
  globe.flight = reduced ? (fp > 0.3 ? 1 : 0) : fp;
  flightBar.style.width = `${globe.flight * 100}%`;
  const place = steps[best].dataset.place;
  globe.maine = lerp(globe.maine, best >= 1 ? 1 : 0, 0.08);
  if (place === 'flight' || globe.flight > 0.02) {
    const [lo, la] = fromVec(slerp(vI, vP, clamp(globe.flight * 1.05)));
    globe.tLon = lerp(-12, lo, 0.85); globe.tLat = la - 4;
  } else if (place === 'maine' || place === 'atlantic') { globe.tLon = -38; globe.tLat = 46; }
  else { globe.tLon = -12; globe.tLat = 48; }
  if (globe.flight > 0.04 && !tookOff) { tookOff = true; sound.whoosh(0.14); }
  if (globe.flight < 0.01) tookOff = false;
  sound.engine(globe.flight > 0.02 && globe.flight < 0.98 ? 0.7 : 0);
  const label = globe.flight > 0.97 ? PLACES.pa.label : globe.flight > 0.03 ? 'IN FLIGHT ✈' : place === 'maine' || place === 'atlantic' ? 'NORTH ATLANTIC' : 'IRELAND';
  hud.place.innerHTML = `<b>${label}</b>`;
}
function tickGlobe(t) {
  if (!globe.visible) return;
  const k = reduced ? 1 : 0.07;
  globe.lon = lerp(globe.lon, globe.tLon, k); globe.lat = lerp(globe.lat, globe.tLat, k);
  hud.lat.textContent = `${Math.abs(globe.lat).toFixed(1)}°${globe.lat >= 0 ? 'N' : 'S'}`;
  hud.lon.textContent = `${Math.abs(globe.lon).toFixed(1)}°${globe.lon >= 0 ? 'E' : 'W'}`;
  drawGlobe(t);
}

/* ================================================================ Zero-gravity skills */
const zerog = $('#zerog');
const physics = { engine: null, items: [], running: false, visible: false, walls: [] };
function initPhysics() {
  const M = window.Matter;
  if (!M || reduced) { document.documentElement.classList.add('no-physics'); return; }
  const { Engine, Bodies, Composite, Constraint, Body } = M;
  const engine = Engine.create(); engine.gravity.y = 1;
  physics.engine = engine;
  const tagsEl = [...document.querySelectorAll('#tags .tag')];
  function walls() {
    physics.walls.forEach((w) => Composite.remove(engine.world, w));
    const W = zerog.clientWidth, H = zerog.clientHeight, t = 200;
    physics.walls = [
      Bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, { isStatic: true }),
      Bodies.rectangle(W / 2, -t / 2, W + t * 2, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, H / 2, t, H * 2, { isStatic: true }),
      Bodies.rectangle(W + t / 2, H / 2, t, H * 2, { isStatic: true }),
    ];
    Composite.add(engine.world, physics.walls);
    physics.items.forEach(({ body }) => {
      Body.setPosition(body, { x: clamp(body.position.x, 40, W - 40), y: clamp(body.position.y, 40, H - 40) });
    });
  }
  function drop() {
    const W = zerog.clientWidth;
    tagsEl.forEach((el, i) => {
      setTimeout(() => {
        const w = el.offsetWidth, h = el.offsetHeight;
        const body = Bodies.rectangle(40 + Math.random() * (W - 80), 90 + Math.random() * 40, w, h, {
          chamfer: { radius: h / 2 }, restitution: 0.45, friction: 0.08, frictionAir: 0.012, density: 0.002,
        });
        Body.setAngle(body, (Math.random() - 0.5) * 0.8);
        Composite.add(engine.world, body);
        physics.items.push({ el, body, w, h });
        el.classList.add('ready');
        bindDrag(el, body);
      }, reduced ? 0 : i * 110);
    });
  }
  let drag = null;
  function local(e) { const r = zerog.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function bindDrag(el, body) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); el.setPointerCapture(e.pointerId);
      const p = local(e);
      const off = { x: p.x - body.position.x, y: p.y - body.position.y };
      const c = Math.cos(-body.angle), s = Math.sin(-body.angle);
      drag = Constraint.create({ pointA: p, bodyB: body, pointB: { x: off.x * c - off.y * s, y: off.x * s + off.y * c }, stiffness: 0.12, damping: 0.08, length: 0 });
      Composite.add(engine.world, drag);
      sound.hover();
    });
    el.addEventListener('pointermove', (e) => { if (drag && drag.bodyB === body) drag.pointA = local(e); });
    const end = () => { if (drag && drag.bodyB === body) { Composite.remove(engine.world, drag); drag = null; } };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  walls(); addEventListener('resize', walls);
  const io = new IntersectionObserver((e) => {
    physics.visible = e[0].isIntersecting;
    if (physics.visible && !physics.running) { physics.running = true; drop(); }
  }, { threshold: 0.25 });
  io.observe(zerog);
  const gbtn = $('#gravityBtn');
  gbtn.addEventListener('click', () => {
    const off = engine.gravity.y !== 0;
    engine.gravity.y = off ? 0 : 1;
    gbtn.textContent = off ? 'Turn gravity on' : 'Turn gravity off';
    gbtn.setAttribute('aria-pressed', String(off));
    physics.items.forEach(({ body }) => {
      body.frictionAir = off ? 0.002 : 0.012;
      if (off) Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 6 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
    });
  });
}
function updatePhysics() {
  if (!physics.engine || !physics.visible) return;
  window.Matter.Engine.update(physics.engine, 1000 / 60);
  for (const { el, body, w, h } of physics.items) {
    el.style.transform = `translate3d(${body.position.x - w / 2}px, ${body.position.y - h / 2}px, 0) rotate(${body.angle}rad)`;
  }
}

/* ================================================================ Lab mini previews */
const minis = [...document.querySelectorAll('[data-mini]')].map((c) => ({ c, x: c.getContext('2d'), kind: c.dataset.mini, vis: false, seed: Math.random() * 1000 }));
const mio = new IntersectionObserver((es) => es.forEach((e) => { const m = minis.find((mm) => mm.c === e.target); if (m) m.vis = e.isIntersecting; }));
minis.forEach((m) => mio.observe(m.c));
function sizeMinis() { minis.forEach((m) => { const d = Math.min(devicePixelRatio || 1, 2); m.w = m.c.clientWidth; m.h = m.c.clientHeight; m.c.width = m.w * d; m.c.height = m.h * d; m.x.setTransform(d, 0, 0, d, 0, 0); }); }
function drawMinis(t) {
  minis.forEach((m) => {
    if (!m.vis || !m.w) return;
    const { x, w, h } = m; const tt = reduced ? 2000 : t;
    x.clearRect(0, 0, w, h);
    if (m.kind === 'warp') {
      for (let i = 0; i < 90; i++) {
        const a = (i * 137.5) * D2R, sp = ((tt / 1200 + i * 0.173) % 1);
        const r0 = sp * sp * Math.max(w, h) * 0.8, r1 = r0 * 0.82;
        x.strokeStyle = `rgba(${200 + (i % 3) * 20},${180 - (i % 4) * 20},255,${sp})`; x.lineWidth = 1 + sp * 1.5;
        x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * r1, h * 0.42 + Math.sin(a) * r1); x.lineTo(w / 2 + Math.cos(a) * r0, h * 0.42 + Math.sin(a) * r0); x.stroke();
      }
    } else if (m.kind === 'gravity') {
      const cx = w / 2, cy = h * 0.4;
      const g = x.createRadialGradient(cx, cy, 2, cx, cy, 34); g.addColorStop(0, '#ffe7c2'); g.addColorStop(0.4, '#ff7a59'); g.addColorStop(1, 'rgba(255,122,89,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 34, 0, 6.283); x.fill();
      [[50, 0.9, '#9b6bff'], [80, 0.55, '#2dd4bf'], [112, 0.35, '#f472b6']].forEach(([r, sp, c], i) => {
        x.strokeStyle = 'rgba(196,186,255,.14)'; x.beginPath(); x.ellipse(cx, cy, r, r * 0.5, 0, 0, 6.283); x.stroke();
        const a = tt / 1000 * sp + i * 2; x.fillStyle = c; x.beginPath(); x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.5, 5 + i, 0, 6.283); x.fill();
      });
    } else if (m.kind === 'stretch') {
      x.fillStyle = '#eef0ff'; x.textBaseline = 'middle'; x.textAlign = 'center';
      const letters = 'Aa'; const fs = Math.min(w, h) * 0.42;
      x.font = `900 ${fs}px Anybody, sans-serif`;
      letters.split('').forEach((ch, i) => {
        const sx = 0.6 + 0.6 * (0.5 + 0.5 * Math.sin(tt / 700 + i * 1.5));
        x.save(); x.translate(w * (0.32 + i * 0.36), h * 0.4); x.scale(sx, 1);
        x.fillStyle = i ? '#ff7a59' : '#9b6bff'; x.fillText(ch, 0, 0); x.restore();
      });
    } else {
      const pts = Array.from({ length: 9 }, (_, i) => [w * (0.15 + ((Math.sin(m.seed + i * 3.1) + 1) / 2) * 0.7), h * (0.12 + ((Math.cos(m.seed * 0.7 + i * 2.3) + 1) / 2) * 0.5)]);
      const n = Math.floor((tt / 450) % 12);
      x.strokeStyle = 'rgba(196,186,255,.55)'; x.lineWidth = 1; x.beginPath();
      pts.slice(0, Math.min(n, 9)).forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke();
      pts.forEach(([px, py], i) => { const on = i < n; x.fillStyle = on ? '#ffb199' : 'rgba(238,240,255,.5)'; x.beginPath(); x.arc(px, py, on ? 3.5 : 2, 0, 6.283); x.fill(); });
    }
  });
}

/* ================================================================ Guestbook (giscus) */
// To switch the guestbook on: enable Discussions on the repo, install the giscus app
// (https://github.com/apps/giscus), create a "Guestbook" category, then paste its ID here.
const GUESTBOOK = { repo: 'eoghanruss/eoghanruss.github.io', repoId: 'R_kgDOQmT6Dg', category: 'Guestbook', categoryId: '' };
if (GUESTBOOK.categoryId) {
  const panel = $('#guestPanel'); panel.innerHTML = '';
  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js'; s.async = true; s.crossOrigin = 'anonymous';
  Object.entries({ repo: GUESTBOOK.repo, 'repo-id': GUESTBOOK.repoId, category: GUESTBOOK.category, 'category-id': GUESTBOOK.categoryId,
    mapping: 'specific', term: 'Guestbook', 'reactions-enabled': '1', 'emit-metadata': '0', 'input-position': 'top', theme: 'transparent_dark', lang: 'en', loading: 'lazy' })
    .forEach(([k, v]) => s.setAttribute(`data-${k}`, v));
  panel.append(s);
}

/* ================================================================ Contact form */
const form = $('#contactForm');
const status = $('#formStatus');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type=submit]');
  const label = btn.innerHTML;
  btn.disabled = true; btn.textContent = 'Transmitting…'; status.textContent = '';
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (res.ok) { sound.whoosh(0.15); location.href = '/success/'; return; }
    const err = await res.json().catch(() => ({}));
    status.textContent = err.errors?.[0]?.message || 'That didn’t send. Please try again, or email me directly.';
  } catch {
    status.textContent = 'Network hiccup. Check your connection, or email me directly.';
  }
  btn.disabled = false; btn.innerHTML = label;
});

/* ================================================================ Chat */
const chat = $('#chat'), chatBtn = $('#chatBtn'), chatLog = $('#chatLog'), chatInput = $('#chatInput');
const setChat = (open) => { chat.classList.toggle('open', open); chatBtn.setAttribute('aria-expanded', String(open)); if (open) setTimeout(() => chatInput.focus(), 200); };
chatBtn.addEventListener('click', () => setChat(!chat.classList.contains('open')));
$('#chatClose').addEventListener('click', () => { setChat(false); chatBtn.focus(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && chat.classList.contains('open')) { setChat(false); chatBtn.focus(); } });
$('#chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = chatInput.value.trim(); if (!q) return;
  const me = document.createElement('div'); me.className = 'msg msg--me'; me.textContent = q; chatLog.append(me);
  chatInput.value = ''; chatLog.scrollTop = chatLog.scrollHeight;
  const bot = document.createElement('div'); bot.className = 'msg msg--bot'; bot.textContent = '…'; chatLog.append(bot);
  setTimeout(() => {
    // getBotResponse returns trusted, hand-written HTML from js/bot.js
    bot.innerHTML = typeof window.getBotResponse === 'function' ? window.getBotResponse(q.toLowerCase()) : 'Send Eoghan a message through the contact form!';
    chatLog.scrollTop = chatLog.scrollHeight; sound.hover();
  }, 500);
});

/* ================================================================ Clock */
const clock = $('#clock');
const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
const tickClock = () => { clock.textContent = fmt.format(new Date()); };
tickClock(); setInterval(tickClock, 15000);

/* ================================================================ Main loop */
function layout() { layoutH(); layoutOrbit(); sizeGlobe(); sizeMinis(); }
layout();
addEventListener('resize', layout);
addEventListener('load', layout);
document.fonts?.ready.then(layout);
initPhysics();

let last = performance.now();
function loop(t) {
  const dt = Math.min(50, t - last); last = t;
  updateHero();
  if (heroState.ready && scrollY < hero.offsetHeight) heroState.render(t);
  updateStatement();
  updateOrbit(dt);
  updateH();
  updatePhone();
  updateJourney();
  tickGlobe(t);
  updatePhysics();
  drawMinis(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
