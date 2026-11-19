// Celestial — wedding planner. Everything is stored in this browser (localStorage).
(() => {
  'use strict';
  const KEY = 'celestial.v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VIEWS = [
    ['overview', 'Overview', 'fa-house'],
    ['guests', 'Guests', 'fa-user-group'],
    ['seating', 'Seating', 'fa-chair'],
    ['budget', 'Budget', 'fa-wallet'],
    ['checklist', 'Checklist', 'fa-list-check'],
  ];
  const MEALS = ['Beef', 'Salmon', 'Vegetarian', 'Vegan', 'Kids'];
  const SIDES = ['Bride', 'Groom', 'Both'];
  const PHASES = ['12+ months', '9–12 months', '6–9 months', '3–6 months', '1–3 months', 'Final month', 'Wedding week'];
  const CATS = ['Venue', 'Catering', 'Photography', 'Attire', 'Flowers', 'Music', 'Stationery', 'Rings', 'Transport', 'Cake', 'Decor', 'Other'];

  /* ---------------------------------------------------------- sample data */
  function nextSaturday(daysAhead) {
    const d = new Date(); d.setHours(14, 0, 0, 0); d.setDate(d.getDate() + daysAhead);
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
    return d.toISOString().slice(0, 16);
  }
  function sample() {
    const tables = [
      { id: 't1', name: 'Top table', seats: 8 }, { id: 't2', name: 'Table 1', seats: 10 },
      { id: 't3', name: 'Table 2', seats: 10 }, { id: 't4', name: 'Table 3', seats: 10 }, { id: 't5', name: 'Table 4', seats: 8 },
    ];
    const g = (name, side, rsvp, meal, plusOne = false, table = null, notes = '') => ({ id: uid(), name, side, rsvp, meal, plusOne, table, notes });
    const guests = [
      g('Mary Kelly', 'Bride', 'yes', 'Beef', true, 't1', 'Mother of the bride'), g('John Kelly', 'Bride', 'yes', 'Beef', false, 't1'),
      g('Siobhán Murphy', 'Bride', 'yes', 'Salmon', true, 't1', 'Maid of honour'), g('Patrick Byrne', 'Groom', 'yes', 'Beef', false, 't1', 'Best man'),
      g('Helen Byrne', 'Groom', 'yes', 'Vegetarian', true, 't1'), g('Niamh O’Brien', 'Bride', 'yes', 'Vegetarian', false, 't2'),
      g('Conor Walsh', 'Groom', 'yes', 'Beef', true, 't2'), g('Emma Ryan', 'Bride', 'yes', 'Salmon', false, 't2'),
      g('Seán Doyle', 'Groom', 'yes', 'Beef', false, 't2'), g('Aisling Daly', 'Both', 'yes', 'Vegan', true, null, 'Nut allergy'),
      g('Ciara McCarthy', 'Bride', 'yes', 'Salmon', false, null), g('Darragh Quinn', 'Groom', 'yes', 'Beef', true, null),
      g('Orla Brennan', 'Bride', 'pending', 'Beef', false), g('Michael Nolan', 'Groom', 'pending', 'Beef', true),
      g('Grace Lynch', 'Both', 'yes', 'Vegetarian', false, 't3'), g('Tomás Healy', 'Groom', 'yes', 'Beef', false, 't3'),
      g('Sarah Fitzgerald', 'Bride', 'yes', 'Salmon', true, 't3'), g('Liam Gallagher', 'Groom', 'no', 'Beef', false),
      g('Róisín Farrell', 'Bride', 'pending', 'Vegetarian', false), g('David Kavanagh', 'Groom', 'yes', 'Beef', false, null),
      g('Chloe Power', 'Both', 'yes', 'Kids', false, null, 'Age 7'), g('Eoin Burke', 'Groom', 'pending', 'Salmon', false),
      g('Laura Carroll', 'Bride', 'no', 'Salmon', false), g('Kevin Duffy', 'Groom', 'yes', 'Beef', true, 't4'),
      g('Aoibhinn Moran', 'Bride', 'yes', 'Vegan', false, 't4'), g('Brian Keane', 'Groom', 'pending', 'Beef', true),
    ];
    const b = (category, item, estimate, actual, paid) => ({ id: uid(), category, item, estimate, actual, paid });
    const budget = [
      b('Venue', 'Willow Hall hire', 7500, 7500, true), b('Catering', 'Dinner and evening food', 6200, 0, false),
      b('Photography', 'Photographer, full day', 2200, 600, false), b('Attire', 'Dress and alterations', 2400, 2150, true),
      b('Attire', 'Suits', 900, 0, false), b('Flowers', 'Bouquets and table flowers', 1200, 0, false),
      b('Music', 'Band and DJ', 2000, 500, false), b('Stationery', 'Invitations and place cards', 450, 420, true),
      b('Rings', 'Wedding bands', 1300, 1300, true), b('Cake', 'Three-tier cake', 550, 0, false),
      b('Transport', 'Wedding car', 400, 0, false), b('Decor', 'Lighting and candles', 600, 0, false),
    ];
    const t = (title, phase, done = false, category = '') => ({ id: uid(), title, phase, done, category });
    const tasks = [
      t('Set the budget', '12+ months', true, 'Planning'), t('Book the venue', '12+ months', true, 'Venue'), t('Draft the guest list', '12+ months', true, 'Guests'),
      t('Book the photographer', '9–12 months', true, 'Vendors'), t('Choose the wedding party', '9–12 months', true, 'People'), t('Book the band', '9–12 months', false, 'Vendors'),
      t('Send save-the-dates', '6–9 months', true, 'Guests'), t('Order the dress', '6–9 months', true, 'Attire'), t('Book the florist', '6–9 months', false, 'Vendors'),
      t('Plan the honeymoon', '6–9 months', false, 'Travel'), t('Send invitations', '3–6 months', false, 'Guests'), t('Choose the menu', '3–6 months', false, 'Catering'),
      t('Order the cake', '3–6 months', false, 'Catering'), t('Buy the rings', '3–6 months', true, 'Attire'), t('Chase outstanding RSVPs', '1–3 months', false, 'Guests'),
      t('Finalise the seating plan', '1–3 months', false, 'Guests'), t('Final dress fitting', 'Final month', false, 'Attire'), t('Confirm timings with vendors', 'Final month', false, 'Vendors'),
      t('Pack for the honeymoon', 'Wedding week', false, 'Travel'), t('Give final numbers to the venue', 'Wedding week', false, 'Venue'),
    ];
    return { v: 1, settings: { names: 'Aoife & Ciarán', date: nextSaturday(210), venue: 'Willow Hall', budget: 28000, currency: '€' }, guests, tables, budget, tasks };
  }

  /* ---------------------------------------------------------- state */
  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || sample(); } catch { state = sample(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } };
  const money = (n) => `${state.settings.currency}${Math.round(n).toLocaleString()}`;
  const heads = (g) => 1 + (g.plusOne ? 1 : 0);
  const tableUsed = (id) => state.guests.filter((g) => g.table === id && g.rsvp !== 'no').reduce((s, g) => s + heads(g), 0);

  let view = (location.hash.slice(1) || 'overview');
  if (!VIEWS.some((v) => v[0] === view)) view = 'overview';
  const filters = { q: '', rsvp: 'all', side: 'all', showDone: true, includePending: false };
  let selectedChip = null;

  /* ---------------------------------------------------------- toast */
  let toastT;
  function toast(msg, icon = 'fa-check') {
    const el = $('#toast'); el.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i>${esc(msg)}`;
    el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ---------------------------------------------------------- nav */
  function renderNav() {
    const html = VIEWS.map(([id, label, icon]) => `<button type="button" data-view="${id}" ${id === view ? 'aria-current="page"' : ''}><i class="fas ${icon}" aria-hidden="true"></i><span>${label}</span></button>`).join('');
    $('#nav').innerHTML = html; $('#tabbar').innerHTML = html;
    $('#sideNames').textContent = state.settings.names;
    $('#sideDate').textContent = fmtDate(state.settings.date);
  }
  const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (!b) return;
    go(b.dataset.view);
  });
  function go(v) {
    view = v; history.replaceState(null, '', `#${v}`); selectedChip = null;
    render(); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); $('#main').focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------- header */
  function header(title, sub, actions = '') {
    return `<header class="top"><div><h1>${title}</h1><p>${sub}</p></div><div class="top-actions">${actions}<button class="btn btn-ghost" type="button" data-act="settings" aria-label="Wedding details"><i class="fas fa-gear" aria-hidden="true"></i><span>Details</span></button></div></header>`;
  }

  /* ---------------------------------------------------------- overview */
  function donut(parts, size = 150, stroke = 18) {
    const total = parts.reduce((s, p) => s + p.v, 0) || 1;
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    let off = 0;
    const segs = parts.map((p) => {
      const len = (p.v / total) * c;
      const s = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${p.c}" stroke-width="${stroke}" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" stroke-linecap="butt"/>`;
      off += len; return s;
    }).join('');
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="RSVP breakdown" style="transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#f4ede2" stroke-width="${stroke}"/>${segs}</svg>`;
  }
  function overview() {
    const s = state.settings;
    const yes = state.guests.filter((g) => g.rsvp === 'yes'), pend = state.guests.filter((g) => g.rsvp === 'pending'), no = state.guests.filter((g) => g.rsvp === 'no');
    const att = yes.reduce((t, g) => t + heads(g), 0);
    const seated = yes.filter((g) => g.table).reduce((t, g) => t + heads(g), 0);
    const est = state.budget.reduce((t, b) => t + Number(b.estimate || 0), 0);
    const spent = state.budget.reduce((t, b) => t + Number(b.actual || 0), 0);
    const done = state.tasks.filter((t) => t.done).length;
    const next = state.tasks.filter((t) => !t.done).slice(0, 5);
    return `${header(`Welcome back`, `${esc(s.names)} · ${esc(s.venue)}`)}
      <section class="hero"><small>The big day</small><h2>${esc(s.names)}</h2><p>${fmtDate(s.date)} · ${esc(s.venue)}</p>
        <div class="count" id="count" aria-live="off"><div><b data-k="d">0</b><span>Days</span></div><div><b data-k="h">0</b><span>Hours</span></div><div><b data-k="m">0</b><span>Minutes</span></div><div><b data-k="s">0</b><span>Seconds</span></div></div>
      </section>
      <div class="grid g-4" style="margin-bottom:18px">
        <div class="card stat"><i class="fas fa-user-check" aria-hidden="true"></i><b>${att}</b><span>Guests attending</span></div>
        <div class="card stat"><i class="fas fa-envelope-open-text" aria-hidden="true"></i><b>${pend.length}</b><span>RSVPs to chase</span></div>
        <div class="card stat"><i class="fas fa-wallet" aria-hidden="true"></i><b>${money(spent)}</b><span>Spent of ${money(s.budget)}</span><div class="bar ${est > s.budget ? 'over' : ''}"><i style="width:${Math.min(100, (spent / s.budget) * 100)}%"></i></div></div>
        <div class="card stat"><i class="fas fa-list-check" aria-hidden="true"></i><b>${Math.round((done / Math.max(1, state.tasks.length)) * 100)}%</b><span>${done} of ${state.tasks.length} tasks done</span><div class="bar"><i style="width:${(done / Math.max(1, state.tasks.length)) * 100}%"></i></div></div>
      </div>
      <div class="grid g-2">
        <div class="card"><h2>Up next <small><button class="btn btn-ghost" type="button" data-view="checklist" style="height:34px">See all</button></small></h2>
          ${next.length ? next.map((t) => `<div class="task-mini"><button class="check" type="button" data-act="toggle-task" data-id="${t.id}" aria-label="Mark ${esc(t.title)} done"></button><span class="t">${esc(t.title)}</span><small>${esc(t.phase)}</small></div>`).join('') : '<div class="empty"><i class="fas fa-champagne-glasses"></i>Everything is done. Enjoy the day!</div>'}
        </div>
        <div class="card"><h2>RSVPs <small>${state.guests.length} invited</small></h2>
          <div class="donut-wrap">${donut([{ v: yes.length, c: '#4f8a6a' }, { v: pend.length, c: '#b8945a' }, { v: no.length, c: '#b06060' }])}
            <div class="legend"><div><i style="background:#4f8a6a"></i>Attending<span>${yes.length}</span></div><div><i style="background:#b8945a"></i>Pending<span>${pend.length}</span></div><div><i style="background:#b06060"></i>Declined<span>${no.length}</span></div><div><i style="background:#2b2550"></i>Seated<span>${seated}/${att}</span></div></div>
          </div>
          <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap"><button class="btn btn-primary" type="button" data-act="add-guest"><i class="fas fa-plus" aria-hidden="true"></i>Add guest</button><button class="btn btn-ghost" type="button" data-view="seating">Open seating plan</button></div>
        </div>
      </div>
      <p class="demo-banner">This is a demo with sample data. Edit anything, or open <b>Details</b> to start fresh.</p>`;
  }
  let countT;
  function tickCount() {
    const el = $('#count'); if (!el) return;
    let ms = Math.max(0, new Date(state.settings.date) - new Date());
    const d = Math.floor(ms / 864e5); ms -= d * 864e5;
    const h = Math.floor(ms / 36e5); ms -= h * 36e5;
    const m = Math.floor(ms / 6e4); ms -= m * 6e4;
    const s = Math.floor(ms / 1e3);
    const set = (k, v) => { const b = el.querySelector(`[data-k="${k}"]`); if (b.textContent !== String(v)) b.textContent = v; };
    set('d', d); set('h', h); set('m', m); set('s', s);
  }

  /* ---------------------------------------------------------- guests */
  function guestsView() {
    const list = state.guests.filter((g) => (filters.rsvp === 'all' || g.rsvp === filters.rsvp) && (filters.side === 'all' || g.side === filters.side) && g.name.toLowerCase().includes(filters.q.toLowerCase()));
    const tName = (id) => state.tables.find((t) => t.id === id)?.name || '—';
    const att = state.guests.filter((g) => g.rsvp === 'yes').reduce((t, g) => t + heads(g), 0);
    const meals = MEALS.map((m) => [m, state.guests.filter((g) => g.rsvp === 'yes' && g.meal === m).reduce((t, g) => t + heads(g), 0)]).filter((x) => x[1]);
    return `${header('Guests', `${state.guests.length} invitations · ${att} attending (with plus-ones)`, `<button class="btn btn-ghost" type="button" data-act="export"><i class="fas fa-file-arrow-down" aria-hidden="true"></i><span>Export CSV</span></button><button class="btn btn-primary" type="button" data-act="add-guest"><i class="fas fa-plus" aria-hidden="true"></i><span>Add guest</span></button>`)}
      <div class="pills" aria-label="Meal choices for attending guests">${meals.map(([m, n]) => `<span class="pill">${m} <b>${n}</b></span>`).join('')}</div>
      <div class="toolbar">
        <label class="search"><i class="fas fa-magnifying-glass" aria-hidden="true"></i><input id="q" type="search" placeholder="Search guests" value="${esc(filters.q)}" aria-label="Search guests"></label>
        <select id="fRsvp" aria-label="Filter by RSVP"><option value="all">All RSVPs</option><option value="yes">Attending</option><option value="pending">Pending</option><option value="no">Declined</option></select>
        <select id="fSide" aria-label="Filter by side"><option value="all">Both sides</option>${SIDES.map((s) => `<option>${s}</option>`).join('')}</select>
      </div>
      <div class="card" style="padding:12px 10px">
        ${list.length ? `<table class="guest-table"><thead><tr><th>Guest</th><th>RSVP</th><th class="hide-sm">Meal</th><th class="hide-sm">Table</th><th></th></tr></thead><tbody>
        ${list.map((g) => `<tr><td><div class="name">${esc(g.name)} ${g.plusOne ? '<span class="tag">+1</span>' : ''}<small>${esc(g.side)}${g.notes ? ` · ${esc(g.notes)}` : ''}</small></div></td>
          <td class="c-rsvp"><div class="seg" role="group" aria-label="RSVP for ${esc(g.name)}">${['yes', 'pending', 'no'].map((v) => `<button type="button" data-act="rsvp" data-id="${g.id}" data-v="${v}" class="${g.rsvp === v ? 'on' : ''}" aria-pressed="${g.rsvp === v}">${{ yes: 'Attending', pending: 'Pending', no: 'Declined' }[v]}</button>`).join('')}</div></td>
          <td class="hide-sm"><span class="tag"><i class="fas fa-utensils" aria-hidden="true"></i>${esc(g.meal)}</span></td>
          <td class="hide-sm">${esc(tName(g.table))}</td>
          <td class="row-actions"><button class="icon-btn" type="button" data-act="edit-guest" data-id="${g.id}" aria-label="Edit ${esc(g.name)}"><i class="fas fa-pen"></i></button><button class="icon-btn" type="button" data-act="del-guest" data-id="${g.id}" aria-label="Remove ${esc(g.name)}"><i class="fas fa-trash-can"></i></button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty"><i class="fas fa-user-plus"></i>No guests match. Try another search or add a guest.</div>'}
      </div>`;
  }
  function guestModal(g) {
    const isNew = !g; g = g || { name: '', side: 'Both', rsvp: 'pending', meal: 'Beef', plusOne: false, notes: '' };
    openModal(`<form method="dialog" id="gForm"><div class="modal-h"><h3>${isNew ? 'Add a guest' : 'Edit guest'}</h3><button class="icon-btn" value="cancel" aria-label="Close"><i class="fas fa-xmark"></i></button></div>
      <div class="modal-b">
        <div class="field"><label for="gName">Full name</label><input id="gName" required value="${esc(g.name)}" autocomplete="off"></div>
        <div class="two"><div class="field"><label for="gSide">Side</label><select id="gSide">${SIDES.map((s) => `<option ${s === g.side ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label for="gRsvp">RSVP</label><select id="gRsvp">${[['yes', 'Attending'], ['pending', 'Pending'], ['no', 'Declined']].map(([v, l]) => `<option value="${v}" ${v === g.rsvp ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
        <div class="field"><label for="gMeal">Meal</label><select id="gMeal">${MEALS.map((m) => `<option ${m === g.meal ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
        <label class="switch"><input type="checkbox" id="gPlus" ${g.plusOne ? 'checked' : ''}> Bringing a plus-one</label>
        <div class="field"><label for="gNotes">Notes (dietary needs, role…)</label><textarea id="gNotes">${esc(g.notes)}</textarea></div>
      </div>
      <div class="modal-f"><button class="btn btn-ghost" value="cancel">Cancel</button><button class="btn btn-primary" value="ok">${isNew ? 'Add guest' : 'Save'}</button></div></form>`, (ok) => {
      if (!ok) return;
      const data = { name: $('#gName').value.trim(), side: $('#gSide').value, rsvp: $('#gRsvp').value, meal: $('#gMeal').value, plusOne: $('#gPlus').checked, notes: $('#gNotes').value.trim() };
      if (!data.name) return;
      if (isNew) { state.guests.unshift({ id: uid(), table: null, ...data }); toast(`${data.name} added`); }
      else { Object.assign(g, data); if (g.rsvp === 'no') g.table = null; toast('Guest updated'); }
      save(); render();
    });
  }
  function exportCSV() {
    const rows = [['Name', 'Side', 'RSVP', 'Meal', 'Plus one', 'Table', 'Notes']].concat(state.guests.map((g) => [g.name, g.side, g.rsvp, g.meal, g.plusOne ? 'Yes' : 'No', state.tables.find((t) => t.id === g.table)?.name || '', g.notes]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'celestial-guest-list.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('Guest list exported');
  }

  /* ---------------------------------------------------------- seating */
  function seatingView() {
    const eligible = (g) => g.rsvp === 'yes' || (filters.includePending && g.rsvp === 'pending');
    const pool = state.guests.filter((g) => eligible(g) && !g.table);
    const chip = (g, inTable) => `<span class="chip ${selectedChip === g.id ? 'sel' : ''}" draggable="true" data-chip="${g.id}" tabindex="0" role="button" aria-pressed="${selectedChip === g.id}" aria-label="${esc(g.name)}${g.plusOne ? ' plus one' : ''}${inTable ? '' : ', unseated. Select, then choose a table.'}">${esc(g.name)}${g.plusOne ? ' <em>+1</em>' : ''}${g.rsvp === 'pending' ? ' <em>?</em>' : ''}${inTable ? `<button type="button" data-act="unseat" data-id="${g.id}" aria-label="Remove ${esc(g.name)} from table"><i class="fas fa-xmark"></i></button>` : ''}</span>`;
    const seatDots = (n, used) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return `<span class="seat ${i < used ? 'on' : ''}" style="left:${50 + Math.cos(a) * 46}%;top:${50 + Math.sin(a) * 46}%"></span>`; }).join('');
    return `${header('Seating plan', 'Drag guests onto a table, or tap a guest and then tap a table.', `<button class="btn btn-primary" type="button" data-act="add-table"><i class="fas fa-plus" aria-hidden="true"></i><span>Add table</span></button>`)}
      <div class="seat-layout">
        <div class="card pool" data-drop="pool"><h2>Unseated <small>${pool.reduce((t, g) => t + heads(g), 0)} people</small></h2>
          <label class="switch" style="margin-bottom:14px;font-size:13.5px"><input type="checkbox" id="incPend" ${filters.includePending ? 'checked' : ''}> Include pending RSVPs</label>
          <div class="chips">${pool.length ? pool.map((g) => chip(g, false)).join('') : '<p class="empty" style="padding:10px 0"><i class="fas fa-circle-check"></i>Everyone has a seat.</p>'}</div>
        </div>
        <div class="tables">${state.tables.map((t) => {
          const seated = state.guests.filter((g) => g.table === t.id && g.rsvp !== 'no');
          const used = seated.reduce((s, g) => s + heads(g), 0);
          return `<div class="card tbl ${selectedChip ? 'target' : ''}" data-drop="${t.id}" ${selectedChip ? `role="button" tabindex="0" aria-label="Seat selected guest at ${esc(t.name)}"` : ''}>
            <div class="tbl-head"><b>${esc(t.name)}</b><div><button class="icon-btn" type="button" data-act="edit-table" data-id="${t.id}" aria-label="Edit ${esc(t.name)}"><i class="fas fa-pen"></i></button><button class="icon-btn" type="button" data-act="del-table" data-id="${t.id}" aria-label="Delete ${esc(t.name)}"><i class="fas fa-trash-can"></i></button></div></div>
            <div class="ring" aria-hidden="true">${seatDots(t.seats, used)}<div class="table-top">${used}/${t.seats}</div></div>
            <p class="cap ${used >= t.seats ? 'full' : ''}">${used >= t.seats ? 'Full' : `${t.seats - used} seat${t.seats - used === 1 ? '' : 's'} free`}</p>
            <div class="chips">${seated.map((g) => chip(g, true)).join('')}</div></div>`;
        }).join('')}</div>
      </div>`;
  }
  function seat(guestId, tableId) {
    const g = state.guests.find((x) => x.id === guestId); if (!g) return;
    if (tableId === 'pool') { g.table = null; save(); render(); return; }
    const t = state.tables.find((x) => x.id === tableId);
    if (!t || g.table === tableId) return;
    if (tableUsed(tableId) + heads(g) > t.seats) { toast(`${t.name} doesn’t have room for ${g.plusOne ? 'two more' : 'one more'}`, 'fa-triangle-exclamation'); return; }
    g.table = tableId; selectedChip = null; save(); render(); toast(`${g.name} seated at ${t.name}`);
  }
  function tableModal(t) {
    const isNew = !t; t = t || { name: `Table ${state.tables.length}`, seats: 10 };
    openModal(`<form method="dialog"><div class="modal-h"><h3>${isNew ? 'Add a table' : 'Edit table'}</h3><button class="icon-btn" value="cancel" aria-label="Close"><i class="fas fa-xmark"></i></button></div>
      <div class="modal-b"><div class="field"><label for="tName">Table name</label><input id="tName" value="${esc(t.name)}" required></div><div class="field"><label for="tSeats">Seats</label><input id="tSeats" type="number" min="2" max="20" value="${t.seats}"></div></div>
      <div class="modal-f"><button class="btn btn-ghost" value="cancel">Cancel</button><button class="btn btn-primary" value="ok">${isNew ? 'Add table' : 'Save'}</button></div></form>`, (ok) => {
      if (!ok) return;
      const name = $('#tName').value.trim() || 'Table', seats = Math.max(2, Math.min(20, Number($('#tSeats').value) || 8));
      if (isNew) state.tables.push({ id: uid(), name, seats }); else Object.assign(t, { name, seats });
      save(); render(); toast(isNew ? 'Table added' : 'Table updated');
    });
  }

  /* ---------------------------------------------------------- budget */
  function budgetView() {
    const s = state.settings;
    const est = state.budget.reduce((t, b) => t + Number(b.estimate || 0), 0);
    const spent = state.budget.reduce((t, b) => t + Number(b.actual || 0), 0);
    const cats = CATS.map((c) => { const items = state.budget.filter((b) => b.category === c); return { c, e: items.reduce((t, b) => t + Number(b.estimate || 0), 0), a: items.reduce((t, b) => t + Number(b.actual || 0), 0) }; }).filter((x) => x.e || x.a).sort((a, b) => b.e - a.e);
    const max = Math.max(1, ...cats.map((x) => Math.max(x.e, x.a)));
    return `${header('Budget', `Total budget ${money(s.budget)}`)}
      <div class="grid g-4" style="margin-bottom:18px">
        <div class="card stat"><i class="fas fa-coins" aria-hidden="true"></i><b>${money(s.budget)}</b><span>Total budget</span></div>
        <div class="card stat"><i class="fas fa-calculator" aria-hidden="true"></i><b>${money(est)}</b><span>Estimated costs</span><div class="bar ${est > s.budget ? 'over' : ''}"><i style="width:${Math.min(100, (est / s.budget) * 100)}%"></i></div></div>
        <div class="card stat"><i class="fas fa-receipt" aria-hidden="true"></i><b>${money(spent)}</b><span>Paid so far</span></div>
        <div class="card stat"><i class="fas fa-piggy-bank" aria-hidden="true"></i><b style="color:${s.budget - est < 0 ? 'var(--no)' : 'inherit'}">${money(s.budget - est)}</b><span>${s.budget - est < 0 ? 'Over budget' : 'Left to allocate'}</span></div>
      </div>
      <div class="grid g-2">
        <div class="card"><h2>Expenses <small>${state.budget.length} items</small></h2>
          <table class="budget-table"><thead><tr><th>Item</th><th class="hide-sm">Estimate</th><th>Paid</th><th></th></tr></thead><tbody>
          ${state.budget.map((b) => `<tr><td><div class="name">${esc(b.item)}<small>${esc(b.category)}</small></div></td>
            <td class="hide-sm"><input class="inline-input" type="number" min="0" value="${b.estimate}" data-edit="estimate" data-id="${b.id}" aria-label="Estimate for ${esc(b.item)}"></td>
            <td><input class="inline-input" type="number" min="0" value="${b.actual}" data-edit="actual" data-id="${b.id}" aria-label="Amount paid for ${esc(b.item)}"></td>
            <td class="row-actions"><button class="paid ${b.paid ? 'on' : ''}" type="button" data-act="paid" data-id="${b.id}" aria-pressed="${b.paid}" aria-label="Paid in full"><i class="fas fa-check" style="font-size:11px"></i></button> <button class="icon-btn" type="button" data-act="del-item" data-id="${b.id}" aria-label="Delete ${esc(b.item)}"><i class="fas fa-trash-can"></i></button></td></tr>`).join('')}
          </tbody></table>
          <form class="add-row" id="addItem"><select id="iCat" aria-label="Category">${CATS.map((c) => `<option>${c}</option>`).join('')}</select><input id="iName" placeholder="New expense" aria-label="Expense name" required><input id="iEst" type="number" min="0" placeholder="Estimate" aria-label="Estimate"><button class="btn btn-primary" type="submit"><i class="fas fa-plus" aria-hidden="true"></i>Add</button></form>
        </div>
        <div class="card"><h2>By category</h2>
          ${cats.map((x) => `<div class="cat-row"><span>${x.c}</span><div class="track" title="${money(x.a)} paid of ${money(x.e)}"><i class="est" style="width:${(x.e / max) * 100}%"></i><i class="act" style="width:${(x.a / max) * 100}%"></i></div><span class="money">${money(x.e)}</span></div>`).join('')}
          <div class="legend" style="margin-top:16px;grid-template-columns:1fr 1fr"><div><i style="background:#f3e7d2"></i>Estimated</div><div><i style="background:#b8945a"></i>Paid</div></div>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------- checklist */
  function checklistView() {
    const done = state.tasks.filter((t) => t.done).length;
    return `${header('Checklist', `${done} of ${state.tasks.length} tasks complete`, `<button class="btn btn-ghost" type="button" data-act="toggle-done"><i class="fas ${filters.showDone ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i><span>${filters.showDone ? 'Hide done' : 'Show done'}</span></button>`)}
      <div class="card" style="margin-bottom:18px"><div class="bar" style="margin:0;height:12px"><i style="width:${(done / Math.max(1, state.tasks.length)) * 100}%"></i></div>
        <form class="add-row" id="addTask" style="grid-template-columns:1fr 180px auto"><input id="tTitle" placeholder="Add a task, e.g. Book a hair stylist" aria-label="New task" required><select id="tPhase" aria-label="When">${PHASES.map((p) => `<option>${p}</option>`).join('')}</select><button class="btn btn-primary" type="submit"><i class="fas fa-plus" aria-hidden="true"></i>Add</button></form>
      </div>
      ${PHASES.map((p) => {
        const items = state.tasks.filter((t) => t.phase === p && (filters.showDone || !t.done));
        const all = state.tasks.filter((t) => t.phase === p);
        if (!all.length) return '';
        return `<section class="card phase"><h3>${p}<small>${all.filter((t) => t.done).length}/${all.length}</small></h3>
          ${items.length ? items.map((t) => `<div class="task ${t.done ? 'done' : ''}"><button class="check" type="button" data-act="toggle-task" data-id="${t.id}" aria-pressed="${t.done}" aria-label="${esc(t.title)}"><i class="fas fa-check"></i></button><span class="t">${esc(t.title)}</span>${t.category ? `<span class="tag hide-sm">${esc(t.category)}</span>` : ''}<button class="icon-btn" type="button" data-act="del-task" data-id="${t.id}" aria-label="Delete ${esc(t.title)}"><i class="fas fa-trash-can"></i></button></div>`).join('') : '<p style="color:var(--muted);margin:6px 14px">All done here.</p>'}
        </section>`;
      }).join('')}`;
  }

  /* ---------------------------------------------------------- settings */
  function settingsModal() {
    const s = state.settings;
    openModal(`<form method="dialog"><div class="modal-h"><h3>Wedding details</h3><button class="icon-btn" value="cancel" aria-label="Close"><i class="fas fa-xmark"></i></button></div>
      <div class="modal-b">
        <div class="field"><label for="sNames">Couple</label><input id="sNames" value="${esc(s.names)}"></div>
        <div class="two"><div class="field"><label for="sDate">Date and time</label><input id="sDate" type="datetime-local" value="${esc(s.date)}"></div><div class="field"><label for="sVenue">Venue</label><input id="sVenue" value="${esc(s.venue)}"></div></div>
        <div class="two"><div class="field"><label for="sBudget">Total budget</label><input id="sBudget" type="number" min="0" value="${s.budget}"></div><div class="field"><label for="sCur">Currency</label><select id="sCur">${['€', '$', '£'].map((c) => `<option ${c === s.currency ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:14px"><button class="btn btn-ghost" type="button" data-act="reset-demo">Reload sample data</button><button class="btn btn-ghost" type="button" data-act="clear-all" style="color:var(--no)">Start fresh</button></div>
      </div>
      <div class="modal-f"><button class="btn btn-ghost" value="cancel">Cancel</button><button class="btn btn-primary" value="ok">Save</button></div></form>`, (ok) => {
      if (!ok) return;
      Object.assign(s, { names: $('#sNames').value.trim() || s.names, date: $('#sDate').value || s.date, venue: $('#sVenue').value.trim(), budget: Number($('#sBudget').value) || 0, currency: $('#sCur').value });
      save(); render(); toast('Details saved');
    });
  }

  /* ---------------------------------------------------------- modal helper */
  let onClose = null;
  function openModal(html, cb) {
    const d = $('#modal'); d.innerHTML = html; onClose = cb; d.showModal();
    setTimeout(() => d.querySelector('input, select')?.focus(), 30);
  }
  $('#modal').addEventListener('close', () => { const cb = onClose; onClose = null; cb?.($('#modal').returnValue === 'ok'); });

  /* ---------------------------------------------------------- actions */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) {
      // Tap-to-seat: a selected guest goes to the tapped table.
      const tbl = e.target.closest('.tbl.target');
      if (tbl && selectedChip && !e.target.closest('[data-chip]')) seat(selectedChip, tbl.dataset.drop);
      return;
    }
    const id = el.dataset.id, a = el.dataset.act;
    const g = state.guests.find((x) => x.id === id);
    switch (a) {
      case 'settings': settingsModal(); break;
      case 'add-guest': guestModal(); break;
      case 'edit-guest': guestModal(g); break;
      case 'del-guest': if (confirm(`Remove ${g.name} from the guest list?`)) { state.guests = state.guests.filter((x) => x.id !== id); save(); render(); toast('Guest removed'); } break;
      case 'rsvp': g.rsvp = el.dataset.v; if (g.rsvp === 'no') g.table = null; save(); render(); break;
      case 'export': exportCSV(); break;
      case 'add-table': tableModal(); break;
      case 'edit-table': tableModal(state.tables.find((t) => t.id === id)); break;
      case 'del-table': { const t = state.tables.find((x) => x.id === id); if (confirm(`Delete ${t.name}? Its guests go back to unseated.`)) { state.guests.forEach((x) => { if (x.table === id) x.table = null; }); state.tables = state.tables.filter((x) => x.id !== id); save(); render(); } break; }
      case 'unseat': e.stopPropagation(); seat(id, 'pool'); break;
      case 'paid': { const b = state.budget.find((x) => x.id === id); b.paid = !b.paid; if (b.paid && !Number(b.actual)) b.actual = b.estimate; save(); render(); break; }
      case 'del-item': state.budget = state.budget.filter((x) => x.id !== id); save(); render(); toast('Expense removed'); break;
      case 'toggle-task': { const t = state.tasks.find((x) => x.id === id); t.done = !t.done; save(); render(); if (t.done) toast('Nice, one less thing to do'); break; }
      case 'del-task': state.tasks = state.tasks.filter((x) => x.id !== id); save(); render(); break;
      case 'toggle-done': filters.showDone = !filters.showDone; render(); break;
      case 'reset-demo': if (confirm('Replace everything with the sample wedding?')) { state = sample(); save(); $('#modal').close(); render(); toast('Sample data loaded'); } break;
      case 'clear-all': if (confirm('Clear all guests, tables, expenses and tasks? This can’t be undone.')) { state = { ...sample(), guests: [], tables: [{ id: uid(), name: 'Table 1', seats: 10 }], budget: [], tasks: [] }; state.settings.names = 'Your wedding'; save(); $('#modal').close(); render(); toast('Starting fresh'); } break;
    }
  });
  // Chip selection (tap) and keyboard
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-chip]');
    if (!c || e.target.closest('[data-act]')) return;
    selectedChip = selectedChip === c.dataset.chip ? null : c.dataset.chip; render();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const c = e.target.closest('[data-chip]'), t = e.target.closest('.tbl.target');
    if (c) { e.preventDefault(); c.click(); } else if (t && selectedChip) { e.preventDefault(); seat(selectedChip, t.dataset.drop); }
  });
  // Drag and drop
  document.addEventListener('dragstart', (e) => { const c = e.target.closest('[data-chip]'); if (!c) return; e.dataTransfer.setData('text/plain', c.dataset.chip); e.dataTransfer.effectAllowed = 'move'; c.classList.add('dragging'); });
  document.addEventListener('dragend', (e) => e.target.closest?.('[data-chip]')?.classList.remove('dragging'));
  document.addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); $$('.over').forEach((x) => x !== z && x.classList.remove('over')); z.classList.add('over'); });
  document.addEventListener('dragleave', (e) => { const z = e.target.closest('[data-drop]'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
  document.addEventListener('drop', (e) => { const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); z.classList.remove('over'); seat(e.dataTransfer.getData('text/plain'), z.dataset.drop); });
  // Inputs
  document.addEventListener('input', (e) => {
    if (e.target.id === 'q') { filters.q = e.target.value; const pos = e.target.selectionStart; render(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'fRsvp') { filters.rsvp = t.value; render(); }
    if (t.id === 'fSide') { filters.side = t.value; render(); }
    if (t.id === 'incPend') { filters.includePending = t.checked; render(); }
    if (t.dataset.edit) { const b = state.budget.find((x) => x.id === t.dataset.id); b[t.dataset.edit] = Math.max(0, Number(t.value) || 0); save(); render(); }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'addItem') { e.preventDefault(); state.budget.push({ id: uid(), category: $('#iCat').value, item: $('#iName').value.trim(), estimate: Number($('#iEst').value) || 0, actual: 0, paid: false }); save(); render(); toast('Expense added'); }
    if (e.target.id === 'addTask') { e.preventDefault(); state.tasks.push({ id: uid(), title: $('#tTitle').value.trim(), phase: $('#tPhase').value, done: false, category: '' }); save(); render(); toast('Task added'); }
  });

  /* ---------------------------------------------------------- render */
  let lastView = null;
  function render() {
    renderNav();
    const html = { overview, guests: guestsView, seating: seatingView, budget: budgetView, checklist: checklistView }[view]();
    const main = $('#main');
    main.innerHTML = `<div class="${view !== lastView ? 'view' : ''}">${html}</div>`;
    lastView = view;
    if (view === 'guests') { $('#fRsvp').value = filters.rsvp; $('#fSide').value = filters.side; }
    document.title = `${VIEWS.find((v) => v[0] === view)[1]} · Celestial`;
    clearInterval(countT);
    if (view === 'overview') { tickCount(); countT = setInterval(tickCount, 1000); }
  }
  render();
})();
