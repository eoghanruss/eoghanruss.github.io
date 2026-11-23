// Extras: theme toggle, page transitions, nav pill, count-ups, back-to-top ring,
// card spotlight, heading reveals and a command palette (Ctrl/Cmd + K).
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } } };
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ---------- 1. Theme toggle with a circular reveal ---------- */
  const actions = $('.nav-actions');
  let toggle = null;
  if (actions) {
    const hint = document.createElement('button');
    hint.type = 'button'; hint.className = 'kbd-hint'; hint.setAttribute('aria-label', 'Open quick navigation');
    hint.innerHTML = `<i class="fas fa-magnifying-glass" aria-hidden="true"></i> Search <kbd>${isMac ? '⌘' : 'Ctrl'} K</kbd>`;
    toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'theme-toggle';
    toggle.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i><i class="fas fa-sun" aria-hidden="true"></i>';
    actions.prepend(hint, toggle);
    hint.addEventListener('click', () => openPalette());
  }
  const setLabel = () => {
    if (!toggle) return;
    const dark = root.dataset.theme === 'dark';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('aria-pressed', String(dark));
    $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1424' : '#f4efe5');
  };
  setLabel();
  function applyTheme(next, x, y) {
    const commit = () => { root.dataset.theme = next; store.set('theme', next); setLabel(); document.dispatchEvent(new CustomEvent('themechange', { detail: next })); };
    if (reduced) { commit(); return; }
    if (document.startViewTransition) {
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const t = document.startViewTransition(commit);
      t.ready.then(() => {
        root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 750, easing: 'cubic-bezier(.65, 0, .25, 1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(() => {});
    } else {
      root.classList.add('theme-anim'); commit();
      setTimeout(() => root.classList.remove('theme-anim'), 600);
    }
  }
  const toggleTheme = (e) => {
    const r = toggle?.getBoundingClientRect();
    const x = e?.clientX || (r ? r.left + r.width / 2 : innerWidth - 60), y = e?.clientY || (r ? r.top + r.height / 2 : 40);
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', x, y);
  };
  toggle?.addEventListener('click', toggleTheme);
  // Follow the system setting until the visitor picks one.
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => { if (!store.get('theme')) { root.dataset.theme = e.matches ? 'dark' : 'light'; setLabel(); document.dispatchEvent(new CustomEvent('themechange')); } });

  /* ---------- 2. Page transitions ---------- */
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain'; curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<b>EOGHAN<span>.</span></b>';
  document.body.append(curtain);
  requestAnimationFrame(() => requestAnimationFrame(() => { root.classList.add('arrived'); }));
  setTimeout(() => root.classList.remove('arriving', 'arrived'), 1000);
  addEventListener('pageshow', (e) => { if (e.persisted) root.classList.remove('leaving', 'arriving'); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || reduced || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.protocol.startsWith('mailto')) return;
    if (url.pathname === location.pathname) return; // same page (anchors handled elsewhere)
    e.preventDefault();
    try { sessionStorage.setItem('curtain', '1'); } catch { /* ignore */ }
    root.classList.add('leaving');
    setTimeout(() => { location.href = url.href; }, 560);
  });

  /* ---------- 3. Sliding nav indicator ---------- */
  const navList = $('.nav-links');
  if (navList && fine) {
    const pill = document.createElement('span'); pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true');
    navList.append(pill); navList.classList.add('has-pill');
    const moveTo = (el) => {
      if (!el) { pill.style.opacity = '0'; return; }
      const r = el.getBoundingClientRect(), pr = navList.getBoundingClientRect();
      pill.style.width = `${r.width}px`; pill.style.transform = `translateX(${r.left - pr.left}px)`; pill.style.opacity = '1';
    };
    const current = () => $('.nav-link.active', navList);
    $$('.nav-link', navList).forEach((l) => l.addEventListener('pointerenter', () => moveTo(l)));
    navList.addEventListener('pointerleave', () => moveTo(current()));
    new MutationObserver(() => { if (!navList.matches(':hover')) moveTo(current()); }).observe(navList, { subtree: true, attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', () => moveTo(current()));
    setTimeout(() => moveTo(current()), 300);
  }

  /* ---------- 4. Count-up numbers ---------- */
  const counters = $$('.hero-stats b');
  if (counters.length && !reduced) {
    counters.forEach((b) => { b.dataset.end = b.textContent.trim(); b.textContent = '0'; });
    const run = () => counters.forEach((b, i) => {
      const end = Number(b.dataset.end) || 0, t0 = performance.now() + i * 120, dur = 1400;
      const step = (t) => { const k = Math.min(1, Math.max(0, (t - t0) / dur)); b.textContent = Math.round(end * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    setTimeout(run, 1000);
  }

  /* ---------- 5. Back to top with progress ring ---------- */
  const tt = document.createElement('button');
  tt.type = 'button'; tt.className = 'to-top'; tt.setAttribute('aria-label', 'Back to top');
  tt.innerHTML = '<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="track" cx="26" cy="26" r="23"/><circle class="prog" cx="26" cy="26" r="23"/></svg><i class="fas fa-arrow-up" aria-hidden="true"></i>';
  if (!document.body.classList.contains('gf')) document.body.append(tt);
  const prog = $('.prog', tt);
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight, k = max > 0 ? scrollY / max : 0;
    tt.classList.toggle('show', scrollY > innerHeight * 0.8);
    prog.style.strokeDashoffset = String(145 - 145 * k);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  tt.addEventListener('click', () => { window.siteLenis ? window.siteLenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------- 6. Cursor spotlight on cards ---------- */
  $$('.timeline-card, .contact-line, .contact-form, .skill-card, .feature, .stat, .sidebar, .building').forEach((el) => el.classList.add('spot'));
  if (fine) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest('.spot'); if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* ---------- 7. Heading reveals (word by word) ---------- */
  $$('.section-header h2, .page-hero h1').forEach((h) => {
    if (h.querySelector('.line-mask') || h.children.length > 1) return;
    const label = h.textContent.trim();
    h.setAttribute('aria-label', label);
    h.innerHTML = label.split(/\s+/).map((w, i) => `<span class="line-mask" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
  });
  // Eyebrow lines draw in with their section.
  if (!reduced) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
    $$('.eyebrow, .skill-card').forEach((el) => io.observe(el));
  } else $$('.eyebrow, .skill-card').forEach((el) => el.classList.add('show'));

  /* ---------- 8. Command palette ---------- */
  const home = location.pathname === '/' || location.pathname === '/index.html';
  const sec = (id) => (home ? `#${id}` : `/#${id}`);
  const ITEMS = [
    ['Go to', 'Home', 'Back to the top of the homepage', 'fa-house', home ? '#top' : '/'],
    ['Go to', 'Work', 'Previous projects', 'fa-briefcase', sec('projects')],
    ['Go to', 'Skills', 'What I do', 'fa-layer-group', sec('skills')],
    ['Go to', 'Journey', 'Experience and education', 'fa-route', sec('about')],
    ['Go to', 'Contact', 'Send me a message', 'fa-paper-plane', sec('contact')],
    ['Projects', 'CampusNav', 'Campus navigation app', 'fa-location-arrow', '/campusnav/'],
    ['Projects', 'LeadTrack', 'Leads tracking tool', 'fa-chart-simple', '/leadtracker/'],
    ['Projects', 'EmberTales', 'Interactive campfire stories', 'fa-fire', '/embertales/'],
    ['Projects', 'Celestial', 'Wedding planner', 'fa-heart', '/celestial/'],
    ['Projects', 'FitTrack', 'Workout tracker', 'fa-dumbbell', '/fittrack/'],
    ['Projects', 'Globefolio', '3D design portfolio', 'fa-globe', '/globefolio/'],
    ['Live demos', 'Try Celestial', 'Open the wedding planner', 'fa-play', '/democelestial/'],
    ['Live demos', 'Try FitTrack', 'Open the workout tracker', 'fa-play', '/demofittrack/'],
    ['Live demos', 'Try EmberTales', 'Tell a campfire story', 'fa-play', '/democampfire/'],
    ['Live demos', 'Try LeadTrack', 'Open the leads allocator', 'fa-play', '/demotracker/'],
    ['Actions', 'Toggle dark mode', 'Switch between light and navy', 'fa-circle-half-stroke', 'theme'],
    ['Actions', 'Copy my email', 'eoghanrussell@outlook.com', 'fa-copy', 'copy'],
    ['Actions', 'LinkedIn', 'Connect with me', 'fa-brands fa-linkedin-in', 'https://www.linkedin.com/in/eoghan-russell/'],
    ['Actions', 'Instagram', '@eoghanruss', 'fa-brands fa-instagram', 'https://www.instagram.com/eoghanruss'],
  ];
  const pal = document.createElement('dialog');
  pal.className = 'palette'; pal.setAttribute('aria-label', 'Quick navigation');
  pal.innerHTML = `<div class="pal-search"><i class="fas fa-magnifying-glass" aria-hidden="true"></i><input type="text" placeholder="Search pages, projects and actions…" aria-label="Search" role="combobox" aria-expanded="true" aria-controls="palList" autocomplete="off"><kbd>Esc</kbd></div>
    <div class="pal-list" id="palList" role="listbox" data-lenis-prevent></div>
    <div class="pal-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span></div>`;
  document.body.append(pal);
  const input = $('input', pal), list = $('.pal-list', pal);
  let shown = [], sel = 0;
  const draw = () => {
    const q = input.value.trim().toLowerCase();
    shown = ITEMS.filter((it) => !q || `${it[1]} ${it[2]} ${it[0]}`.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    let group = '';
    list.innerHTML = shown.length ? shown.map((it, i) => {
      const g = it[0] !== group ? `<div class="pal-group" role="presentation">${it[0]}</div>` : ''; group = it[0];
      const icon = it[3].includes('fa-brands') ? it[3] : `fas ${it[3]}`;
      return `${g}<div class="pal-item" role="option" id="pal-${i}" data-i="${i}" aria-selected="${i === sel}"><i class="${icon}" aria-hidden="true"></i><div><b>${it[1]}</b><small>${it[2]}</small></div></div>`;
    }).join('') : '<div class="pal-empty">No matches. Try “projects” or “dark”.</div>';
    input.setAttribute('aria-activedescendant', shown.length ? `pal-${sel}` : '');
    $(`#pal-${sel}`, list)?.scrollIntoView({ block: 'nearest' });
  };
  function openPalette() { input.value = ''; sel = 0; draw(); pal.showModal(); window.siteLenis?.stop(); setTimeout(() => input.focus(), 20); }
  pal.addEventListener('close', () => window.siteLenis?.start());
  const run = (it) => {
    if (!it) return;
    pal.close();
    const target = it[4];
    if (target === 'theme') { toggleTheme(); return; }
    if (target === 'copy') { navigator.clipboard?.writeText('eoghanrussell@outlook.com').catch(() => {}); flash('Email copied to clipboard'); return; }
    if (target.startsWith('http')) { window.open(target, '_blank', 'noopener'); return; }
    if (target.startsWith('#')) {
      const el = target === '#top' ? document.body : document.getElementById(target.slice(1));
      if (window.siteLenis) window.siteLenis.scrollTo(target === '#top' ? 0 : el, { offset: -70, duration: 1.4 });
      else el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const a = document.createElement('a'); a.href = target; document.body.append(a); a.click(); a.remove();
  };
  input.addEventListener('input', () => { sel = 0; draw(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); draw(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); draw(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(shown[sel]); }
  });
  list.addEventListener('click', (e) => { const it = e.target.closest('.pal-item'); if (it) run(shown[Number(it.dataset.i)]); });
  list.addEventListener('pointermove', (e) => { const it = e.target.closest('.pal-item'); if (it && Number(it.dataset.i) !== sel) { sel = Number(it.dataset.i); draw(); } });
  pal.addEventListener('click', (e) => { if (e.target === pal) pal.close(); });
  addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); pal.open ? pal.close() : openPalette(); }
    else if (e.key === '/' && !typing && !pal.open) { e.preventDefault(); openPalette(); }
  });
  function flash(msg) {
    const t = document.createElement('div');
    t.textContent = msg; t.setAttribute('role', 'status');
    Object.assign(t.style, { position: 'fixed', left: '50%', bottom: '30px', transform: 'translateX(-50%)', background: 'var(--text)', color: 'var(--bg)', padding: '12px 20px', borderRadius: '50px', zIndex: 3000, fontWeight: 600, boxShadow: 'var(--shadow-lg)' });
    document.body.append(t); setTimeout(() => t.remove(), 1800);
  }
})();
