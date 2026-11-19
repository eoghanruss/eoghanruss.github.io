// FitTrack — plan workouts, log sets, track progress and level up. Stored in this browser.
(() => {
  'use strict';
  const KEY = 'fittrack.v2';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DAY = 864e5;

  const VIEWS = [['dashboard', 'Home', 'fa-house'], ['workout', 'Workout', 'fa-dumbbell'], ['plans', 'Plans', 'fa-clipboard-list'], ['history', 'History', 'fa-clock-rotate-left'], ['progress', 'Progress', 'fa-chart-line']];
  const LIBRARY = {
    'Bench Press': 'Chest', 'Incline Dumbbell Press': 'Chest', 'Chest Fly': 'Chest', 'Overhead Press': 'Shoulders', 'Lateral Raise': 'Shoulders',
    'Tricep Pushdown': 'Arms', 'Bicep Curl': 'Arms', 'Hammer Curl': 'Arms', 'Deadlift': 'Back', 'Pull-up': 'Back', 'Barbell Row': 'Back',
    'Lat Pulldown': 'Back', 'Squat': 'Legs', 'Romanian Deadlift': 'Legs', 'Leg Press': 'Legs', 'Lunge': 'Legs', 'Calf Raise': 'Legs', 'Plank': 'Core', 'Hanging Leg Raise': 'Core',
  };

  /* ---------------------------------------------------------- XP */
  const XP_SET = 10, XP_WORKOUT = 50, XP_PR = 25;
  const levelOf = (xp) => Math.floor(1 + Math.sqrt(xp / 120));
  const levelFloor = (l) => 120 * (l - 1) ** 2;
  const TITLES = ['Rookie', 'Regular', 'Committed', 'Strong', 'Athlete', 'Machine', 'Elite', 'Legend'];
  const title = (l) => TITLES[Math.min(TITLES.length - 1, Math.floor((l - 1) / 2))];
  const e1rm = (w, r) => (r <= 0 ? 0 : w * (1 + Math.min(r, 12) / 30));

  /* ---------------------------------------------------------- sample data */
  function sample() {
    const tpl = (name, list) => ({ id: uid(), name, exercises: list.map(([n, sets, reps]) => ({ name: n, sets, reps })) });
    const templates = [
      tpl('Push', [['Bench Press', 4, 8], ['Overhead Press', 3, 8], ['Incline Dumbbell Press', 3, 10], ['Lateral Raise', 3, 12], ['Tricep Pushdown', 3, 12]]),
      tpl('Pull', [['Deadlift', 3, 5], ['Pull-up', 3, 8], ['Barbell Row', 3, 8], ['Bicep Curl', 3, 12]]),
      tpl('Legs', [['Squat', 4, 6], ['Romanian Deadlift', 3, 8], ['Leg Press', 3, 10], ['Calf Raise', 3, 15]]),
      tpl('Full Body', [['Squat', 3, 8], ['Bench Press', 3, 8], ['Barbell Row', 3, 10], ['Plank', 3, 1]]),
    ];
    const base = { 'Bench Press': 60, 'Overhead Press': 37.5, 'Incline Dumbbell Press': 22, 'Lateral Raise': 8, 'Tricep Pushdown': 25, 'Deadlift': 100, 'Pull-up': 0, 'Barbell Row': 55, 'Bicep Curl': 12, 'Squat': 80, 'Romanian Deadlift': 70, 'Leg Press': 140, 'Calf Raise': 60, 'Plank': 0 };
    const workouts = [];
    const pattern = [1, 3, 5, 6]; // days of week trained
    const today = new Date(); today.setHours(18, 0, 0, 0);
    let rot = 0;
    for (let w = 7; w >= 0; w--) {
      pattern.forEach((dow, i) => {
        const d = new Date(today); d.setDate(d.getDate() - today.getDay() + dow - w * 7);
        if (d > today || (w === 0 && i > 1)) return;
        if (w === 3 && i === 3) return; // a missed day keeps the data realistic
        const t = templates[rot % 3]; rot += 1;
        const weekIdx = 7 - w;
        workouts.push({
          id: uid(), name: t.name, date: d.toISOString(), duration: 48 + ((rot * 7) % 20),
          exercises: t.exercises.map((ex) => {
            const wt = base[ex.name] ? Math.round((base[ex.name] * (1 + weekIdx * 0.025)) / 2.5) * 2.5 : 0;
            return { name: ex.name, sets: Array.from({ length: ex.sets }, (_, s) => ({ weight: wt, reps: ex.name === 'Pull-up' ? 6 + Math.min(4, weekIdx >> 1) - (s > 1 ? 1 : 0) : Math.max(1, ex.reps - (s === ex.sets - 1 ? 1 : 0)), done: true })) };
          }),
        });
      });
    }
    const xp = workouts.reduce((t, wk) => t + XP_WORKOUT + wk.exercises.reduce((a, e) => a + e.sets.length * XP_SET, 0), 0) + 6 * XP_PR;
    const bodyweight = Array.from({ length: 8 }, (_, i) => ({ date: new Date(today - (49 - i * 7) * DAY).toISOString(), value: Math.round((82.4 - i * 0.35 + (i % 3 === 1 ? 0.3 : 0)) * 10) / 10 }));
    return { v: 1, profile: { name: 'Alex', unit: 'kg', goal: 4 }, xp, templates, workouts, active: null, bodyweight };
  }

  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || sample(); } catch { state = sample(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } };
  const U = () => state.profile.unit;
  let view = location.hash.slice(1) || 'dashboard';
  if (!VIEWS.some((v) => v[0] === view)) view = 'dashboard';
  let progressEx = 'Bench Press';

  /* ---------------------------------------------------------- helpers */
  const volume = (wk) => wk.exercises.reduce((t, e) => t + e.sets.filter((s) => s.done).reduce((a, s) => a + s.weight * s.reps, 0), 0);
  const setsDone = (wk) => wk.exercises.reduce((t, e) => t + e.sets.filter((s) => s.done).length, 0);
  const fmtDate = (d, o = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(d).toLocaleDateString(undefined, o);
  const fmtNum = (n) => Math.round(n).toLocaleString();
  const weekStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const sorted = () => [...state.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  function bests() {
    const out = {};
    [...state.workouts].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((wk) => wk.exercises.forEach((e) => e.sets.filter((s) => s.done).forEach((s) => {
      const v = e1rm(s.weight, s.reps);
      if (!out[e.name] || v > out[e.name].e) out[e.name] = { e: v, w: s.weight, r: s.reps, date: wk.date };
    })));
    return out;
  }
  function lastSets(name) {
    const wk = sorted().find((w) => w.exercises.some((e) => e.name === name));
    return wk ? wk.exercises.find((e) => e.name === name).sets : [];
  }
  function weekCounts(n = 8) {
    const start = weekStart(new Date());
    return Array.from({ length: n }, (_, i) => {
      const ws = new Date(start - (n - 1 - i) * 7 * DAY), we = new Date(+ws + 7 * DAY);
      const list = state.workouts.filter((w) => new Date(w.date) >= ws && new Date(w.date) < we);
      return { label: fmtDate(ws, { day: 'numeric', month: 'short' }), count: list.length, vol: list.reduce((t, w) => t + volume(w), 0) };
    });
  }
  function weekStreak() {
    const wc = weekCounts(52).reverse();
    let n = 0;
    for (let i = 0; i < wc.length; i++) {
      if (wc[i].count >= state.profile.goal) n += 1;
      else if (i === 0) continue; // the current week can still be in progress
      else break;
    }
    return n;
  }
  let toastT;
  function toast(msg, icon = 'fa-bolt') {
    const el = $('#toast'); el.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i>${esc(msg)}`;
    el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* ---------------------------------------------------------- charts */
  function barChart(data, key, w = 560, h = 200) {
    const max = Math.max(1, ...data.map((d) => d[key]));
    const pad = 28, bw = (w - pad) / data.length;
    const bars = data.map((d, i) => {
      const bh = (d[key] / max) * (h - 44);
      const x = pad + i * bw + bw * 0.2, y = h - 24 - bh, last = i === data.length - 1;
      return `<rect x="${x}" y="${y}" width="${bw * 0.6}" height="${Math.max(2, bh)}" rx="6" fill="${last ? '#c6f432' : 'rgba(198,244,50,.35)'}"><title>${d.label}: ${fmtNum(d[key])}</title></rect><text x="${x + bw * 0.3}" y="${h - 6}" text-anchor="middle">${d.label}</text>`;
    }).join('');
    const lines = [0.25, 0.5, 0.75, 1].map((f) => `<line class="grid-l" x1="${pad}" x2="${w}" y1="${h - 24 - f * (h - 44)}" y2="${h - 24 - f * (h - 44)}"/>`).join('');
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Weekly training volume">${lines}${bars}</svg>`;
  }
  function lineChart(points, w = 560, h = 220, color = '#c6f432', label = 'Progress') {
    if (points.length < 2) return '<div class="empty"><i class="fas fa-chart-line"></i>Log this a couple more times to see a trend.</div>';
    const ys = points.map((p) => p.y), min = Math.min(...ys), max = Math.max(...ys), span = max - min || 1;
    const pad = 34, X = (i) => pad + (i / (points.length - 1)) * (w - pad - 12), Y = (v) => 16 + (1 - (v - min) / span) * (h - 50);
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
    const area = `${d} L${X(points.length - 1)},${h - 30} L${X(0)},${h - 30} Z`;
    const ticks = [min, (min + max) / 2, max].map((v) => `<line class="grid-l" x1="${pad}" x2="${w}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pad - 6}" y="${Y(v) + 4}" text-anchor="end">${Math.round(v * 10) / 10}</text>`).join('');
    const every = Math.ceil(points.length / 6);
    const xl = points.map((p, i) => (i % every === 0 || i === points.length - 1 ? `<text x="${X(i)}" y="${h - 10}" text-anchor="middle">${fmtDate(p.x, { day: 'numeric', month: 'short' })}</text>` : '')).join('');
    const dots = points.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="${i === points.length - 1 ? 5 : 3}" fill="${color}"><title>${fmtDate(p.x)}: ${Math.round(p.y * 10) / 10}</title></circle>`).join('');
    const gid = `g${Math.random().toString(36).slice(2, 7)}`;
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(label)}"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${ticks}<path d="${area}" fill="url(#${gid})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}${xl}</svg>`;
  }
  function ring(value, goal, size = 96) {
    const r = size / 2 - 9, c = 2 * Math.PI * r, f = Math.min(1, value / Math.max(1, goal));
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#c6f432" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c * f} ${c}"/></svg>`;
  }

  /* ---------------------------------------------------------- nav */
  function renderNav() {
    const html = VIEWS.map(([id, label, icon]) => `<button type="button" data-view="${id}" ${id === view ? 'aria-current="page"' : ''}><i class="fas ${icon}" aria-hidden="true"></i><span>${label}${id === 'workout' && state.active ? ' •' : ''}</span></button>`).join('');
    $('#nav').innerHTML = html; $('#tabbar').innerHTML = html;
  }
  const header = (t, sub, actions = '') => `<header class="top"><div><h1>${t}</h1><p>${sub}</p></div><div class="top-actions">${actions}<button class="btn btn-dark" type="button" data-act="settings" aria-label="Settings"><i class="fas fa-gear" aria-hidden="true"></i><span>Settings</span></button></div></header>`;

  /* ---------------------------------------------------------- dashboard */
  function dashboard() {
    const lvl = levelOf(state.xp), lo = levelFloor(lvl), hi = levelFloor(lvl + 1);
    const wc = weekCounts(8), thisWeek = wc[wc.length - 1];
    const b = bests();
    const top = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'].filter((n) => b[n]);
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${header(`${hello}, ${esc(state.profile.name)}`, state.active ? 'You have a workout in progress.' : 'Ready for today’s session?', `<button class="btn btn-lime" type="button" data-view="workout"><i class="fas fa-play" aria-hidden="true"></i><span>${state.active ? 'Resume workout' : 'Start workout'}</span></button>`)}
      <div class="grid g-2" style="margin-bottom:16px">
        <div class="card level"><div class="lvl-row"><div class="badge"><div><small>LEVEL</small><b>${lvl}</b></div></div>
          <div style="flex:1"><h2>${title(lvl)}</h2><span style="color:var(--muted)">${fmtNum(state.xp)} XP earned · ${fmtNum(hi - state.xp)} XP to level ${lvl + 1}</span>
          <div class="xpbar"><i style="width:${((state.xp - lo) / (hi - lo)) * 100}%"></i></div><div class="xp-meta"><span>+${XP_SET} per set</span><span>+${XP_WORKOUT} per workout</span><span>+${XP_PR} per PR</span></div></div></div></div>
        <div class="card"><div class="ring-wrap">${ring(thisWeek.count, state.profile.goal)}<div class="ring-label"><b>${thisWeek.count}/${state.profile.goal}</b><span>workouts this week</span><br><span class="tag lime" style="margin-top:8px"><i class="fas fa-fire" aria-hidden="true"></i>${weekStreak()} week streak</span></div></div></div>
      </div>
      <div class="grid g-4" style="margin-bottom:16px">
        <div class="card stat"><i class="fas fa-dumbbell" aria-hidden="true"></i><b>${state.workouts.length}</b><span>Workouts logged</span></div>
        <div class="card stat"><i class="fas fa-weight-hanging" aria-hidden="true"></i><b>${fmtNum(thisWeek.vol)}</b><span>${U()} lifted this week</span></div>
        <div class="card stat"><i class="fas fa-layer-group" aria-hidden="true"></i><b>${state.workouts.reduce((t, w) => t + setsDone(w), 0)}</b><span>Sets completed</span></div>
        <div class="card stat"><i class="fas fa-trophy" aria-hidden="true"></i><b>${Object.keys(b).length}</b><span>Exercises tracked</span></div>
      </div>
      <div class="grid g-2">
        <div class="card"><h2>Weekly volume <small>${U()} × reps, last 8 weeks</small></h2>${barChart(wc, 'vol')}</div>
        <div class="card"><h2>Quick start</h2><div class="quick">${state.templates.map((t) => `<button type="button" data-act="start" data-id="${t.id}"><b>${esc(t.name)}</b><span>${t.exercises.length} exercises</span></button>`).join('')}</div>
          <h2 style="margin-top:20px">Best lifts <small>estimated 1-rep max</small></h2>
          <div class="pr-grid">${top.map((n) => `<div class="pr"><b>${Math.round(b[n].e)} ${U()}</b><span>${n}</span></div>`).join('')}</div></div>
      </div>
      <div class="card" style="margin-top:16px"><h2>Recent workouts <small><button class="btn btn-dark btn-sm" type="button" data-view="history">See all</button></small></h2>
        ${sorted().slice(0, 4).map((w) => `<div class="list-row"><span class="ic"><i class="fas fa-dumbbell" aria-hidden="true"></i></span><div><b>${esc(w.name)}</b><small>${fmtDate(w.date)} · ${w.duration} min</small></div><div class="r">${fmtNum(volume(w))} ${U()}<small>${setsDone(w)} sets</small></div></div>`).join('') || '<div class="empty"><i class="fas fa-dumbbell"></i>No workouts yet. Start your first one!</div>'}
      </div>`;
  }

  /* ---------------------------------------------------------- workout */
  function startWorkout(tplId) {
    const t = state.templates.find((x) => x.id === tplId);
    state.active = {
      name: t ? t.name : 'Workout', started: Date.now(),
      exercises: t ? t.exercises.map((e) => { const prev = lastSets(e.name); return { name: e.name, sets: Array.from({ length: e.sets }, (_, i) => ({ weight: prev[i]?.weight ?? prev[prev.length - 1]?.weight ?? 0, reps: e.reps, done: false })) }; }) : [],
    };
    save(); go('workout');
  }
  function workoutView() {
    const a = state.active;
    if (!a) {
      return `${header('Start a workout', 'Pick a plan or start empty and add exercises as you go.')}
        <div class="grid g-3">${state.templates.map((t) => `<div class="card tpl"><h2>${esc(t.name)}<small>${t.exercises.reduce((s, e) => s + e.sets, 0)} sets</small></h2><ul>${t.exercises.map((e) => `<li><b>${esc(e.name)}</b><span>${e.sets} × ${e.reps}</span></li>`).join('')}</ul><div class="btns"><button class="btn btn-lime" type="button" data-act="start" data-id="${t.id}"><i class="fas fa-play" aria-hidden="true"></i>Start</button></div></div>`).join('')}
        <div class="card tpl" style="justify-content:center;align-items:flex-start;border-style:dashed"><h2>Empty workout</h2><p style="color:var(--muted);margin:0">Build it as you train.</p><div class="btns"><button class="btn btn-dark" type="button" data-act="start" data-id=""><i class="fas fa-plus" aria-hidden="true"></i>Start empty</button></div></div></div>`;
    }
    const opts = Object.keys(LIBRARY).map((n) => `<option>${n}</option>`).join('');
    return `<div class="session-bar"><input id="sessName" value="${esc(a.name)}" aria-label="Workout name"><span class="timer"><i class="fas fa-clock" aria-hidden="true"></i><span id="elapsed">0:00</span></span><span class="sp"></span><button class="btn btn-red btn-sm" type="button" data-act="discard">Discard</button><button class="btn btn-lime" type="button" data-act="finish"><i class="fas fa-flag-checkered" aria-hidden="true"></i>Finish</button></div>
      ${a.exercises.map((e, ei) => {
        const prev = lastSets(e.name);
        return `<section class="card ex"><div class="ex-head"><div><b>${esc(e.name)}</b><small>${LIBRARY[e.name] || 'Custom'} · ${e.sets.filter((s) => s.done).length}/${e.sets.length} sets done</small></div><button class="icon-btn" type="button" data-act="rm-ex" data-ei="${ei}" aria-label="Remove ${esc(e.name)}"><i class="fas fa-trash-can"></i></button></div>
          <table class="sets"><thead><tr><th>Set</th><th class="prev-col">Last time</th><th>${U()}</th><th>Reps</th><th><span class="sr" style="position:absolute;left:-9999px">Done</span></th></tr></thead><tbody>
          ${e.sets.map((s, si) => `<tr class="${s.done ? 'done' : ''}"><td>${si + 1}</td><td class="prev prev-col">${prev[si] ? `${prev[si].weight} × ${prev[si].reps}` : '—'}</td>
            <td><input type="number" inputmode="decimal" step="0.5" min="0" value="${s.weight}" data-set="weight" data-ei="${ei}" data-si="${si}" aria-label="${esc(e.name)} set ${si + 1} weight"></td>
            <td><input type="number" inputmode="numeric" min="0" value="${s.reps}" data-set="reps" data-ei="${ei}" data-si="${si}" aria-label="${esc(e.name)} set ${si + 1} reps"></td>
            <td><button class="tick" type="button" data-act="tick" data-ei="${ei}" data-si="${si}" aria-pressed="${s.done}" aria-label="Mark set ${si + 1} done"><i class="fas fa-check"></i></button></td></tr>`).join('')}
          </tbody></table>
          <button class="btn btn-dark btn-sm" type="button" data-act="add-set" data-ei="${ei}" style="margin-top:6px"><i class="fas fa-plus" aria-hidden="true"></i>Add set</button></section>`;
      }).join('') || '<div class="card empty"><i class="fas fa-plus"></i>Add your first exercise below.</div>'}
      <div class="card add-ex"><select id="exPick" aria-label="Exercise to add">${opts}</select><button class="btn btn-lime" type="button" data-act="add-ex"><i class="fas fa-plus" aria-hidden="true"></i>Add exercise</button></div>`;
  }
  let elapsedT;
  function tickElapsed() {
    const el = $('#elapsed'); if (!el || !state.active) return;
    const s = Math.floor((Date.now() - state.active.started) / 1000);
    el.textContent = `${Math.floor(s / 3600) ? `${Math.floor(s / 3600)}:` : ''}${String(Math.floor((s % 3600) / 60)).padStart(Math.floor(s / 3600) ? 2 : 1, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  // Rest timer
  let restEnd = 0, restT = null;
  function startRest(sec = 90) { restEnd = Date.now() + sec * 1000; $('#rest').classList.add('show'); clearInterval(restT); restT = setInterval(tickRest, 250); tickRest(); }
  function stopRest() { clearInterval(restT); restT = null; $('#rest').classList.remove('show'); }
  function tickRest() {
    const left = Math.max(0, Math.round((restEnd - Date.now()) / 1000));
    $('#restTime').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (left <= 0) { stopRest(); beep(); toast('Rest over. Next set!', 'fa-stopwatch'); }
  }
  let actx;
  function beep() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18].forEach((t) => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, actx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.25, actx.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + t + 0.15); o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + 0.16); });
    } catch { /* audio unavailable */ }
    navigator.vibrate?.([120, 60, 120]);
  }
  function finish() {
    const a = state.active;
    const exs = a.exercises.map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) })).filter((e) => e.sets.length);
    if (!exs.length) { toast('Complete at least one set first', 'fa-circle-exclamation'); return; }
    const before = bests();
    const wk = { id: uid(), name: a.name || 'Workout', date: new Date().toISOString(), duration: Math.max(1, Math.round((Date.now() - a.started) / 60000)), exercises: exs };
    state.workouts.push(wk);
    const after = bests();
    const prs = Object.keys(after).filter((n) => wk.exercises.some((e) => e.name === n) && (!before[n] || after[n].e > before[n].e + 0.01));
    const gained = XP_WORKOUT + setsDone(wk) * XP_SET + prs.length * XP_PR;
    const oldLvl = levelOf(state.xp);
    state.xp += gained; state.active = null; save(); stopRest();
    const newLvl = levelOf(state.xp);
    openModal(`<div class="summary"><div class="big" aria-hidden="true">${newLvl > oldLvl ? '🏆' : '💪'}</div>${newLvl > oldLvl ? `<div class="levelup">Level up! You’re now level ${newLvl}</div>` : ''}<h3>Workout complete</h3><p style="color:var(--muted);margin:0">${esc(wk.name)} · ${wk.duration} min</p>
      <div class="summary-stats"><div><b>${setsDone(wk)}</b><span>Sets</span></div><div><b>${fmtNum(volume(wk))}</b><span>${U()} lifted</span></div><div><b>+${gained}</b><span>XP earned</span></div></div>
      ${prs.length ? `<p><span class="tag lime"><i class="fas fa-trophy" aria-hidden="true"></i>New personal best: ${prs.map(esc).join(', ')}</span></p>` : ''}</div>
      <div class="m-f" style="justify-content:center"><form method="dialog"><button class="btn btn-lime" value="ok">Nice!</button></form></div>`, () => go('dashboard'));
  }

  /* ---------------------------------------------------------- plans */
  function plansView() {
    return `${header('Plans', 'Reusable workouts. Start one in a tap.', `<button class="btn btn-lime" type="button" data-act="new-plan"><i class="fas fa-plus" aria-hidden="true"></i><span>New plan</span></button>`)}
      <div class="grid g-3">${state.templates.map((t) => `<div class="card tpl"><h2>${esc(t.name)}<small>${t.exercises.length} exercises</small></h2><ul>${t.exercises.map((e) => `<li><b>${esc(e.name)}</b><span>${e.sets} × ${e.reps}</span></li>`).join('')}</ul>
        <div class="btns"><button class="btn btn-lime btn-sm" type="button" data-act="start" data-id="${t.id}"><i class="fas fa-play" aria-hidden="true"></i>Start</button><button class="btn btn-dark btn-sm" type="button" data-act="edit-plan" data-id="${t.id}">Edit</button><button class="icon-btn" type="button" data-act="del-plan" data-id="${t.id}" aria-label="Delete ${esc(t.name)}"><i class="fas fa-trash-can"></i></button></div></div>`).join('')}</div>`;
  }
  function planModal(t) {
    const isNew = !t;
    const draft = t ? JSON.parse(JSON.stringify(t)) : { id: uid(), name: 'New plan', exercises: [{ name: 'Squat', sets: 3, reps: 8 }] };
    const opts = (sel) => Object.keys(LIBRARY).map((n) => `<option ${n === sel ? 'selected' : ''}>${n}</option>`).join('');
    const body = () => `<form method="dialog" id="planForm"><div class="m-h"><h3>${isNew ? 'New plan' : 'Edit plan'}</h3><button class="icon-btn" value="cancel" aria-label="Close"><i class="fas fa-xmark"></i></button></div>
      <div class="m-b"><div class="field"><label for="pName">Plan name</label><input id="pName" value="${esc(draft.name)}"></div>
        <div class="tpl-ex" style="font-size:12px;color:var(--muted);font-weight:700"><span>Exercise</span><span style="text-align:center">Sets</span><span style="text-align:center">Reps</span><span></span></div>
        ${draft.exercises.map((e, i) => `<div class="tpl-ex"><select data-pe="name" data-i="${i}" aria-label="Exercise ${i + 1}">${opts(e.name)}</select><input type="number" min="1" max="10" value="${e.sets}" data-pe="sets" data-i="${i}" aria-label="Sets"><input type="number" min="1" max="50" value="${e.reps}" data-pe="reps" data-i="${i}" aria-label="Reps"><button class="icon-btn" type="button" data-pe-rm="${i}" aria-label="Remove exercise"><i class="fas fa-xmark"></i></button></div>`).join('')}
        <button class="btn btn-dark btn-sm" type="button" id="peAdd" style="justify-self:start"><i class="fas fa-plus" aria-hidden="true"></i>Add exercise</button></div>
      <div class="m-f"><button class="btn btn-dark" value="cancel">Cancel</button><button class="btn btn-lime" value="ok">Save plan</button></div></form>`;
    openModal(body(), (ok) => {
      if (!ok) return;
      draft.name = draft.name.trim() || 'Plan';
      if (isNew) state.templates.push(draft); else Object.assign(t, draft);
      save(); render(); toast('Plan saved', 'fa-clipboard-check');
    });
    const d = $('#modal');
    d.oninput = (e) => { const i = e.target.dataset.i; if (e.target.id === 'pName') draft.name = e.target.value; if (e.target.dataset.pe) draft.exercises[i][e.target.dataset.pe] = e.target.dataset.pe === 'name' ? e.target.value : Math.max(1, Number(e.target.value) || 1); };
    d.onclick = (e) => {
      const rm = e.target.closest('[data-pe-rm]');
      if (rm) { draft.exercises.splice(Number(rm.dataset.peRm), 1); d.innerHTML = body(); }
      if (e.target.closest('#peAdd')) { draft.exercises.push({ name: 'Bench Press', sets: 3, reps: 10 }); d.innerHTML = body(); }
    };
  }

  /* ---------------------------------------------------------- history */
  function historyView() {
    const list = sorted();
    let month = '';
    return `${header('History', `${list.length} workouts · ${fmtNum(list.reduce((t, w) => t + volume(w), 0))} ${U()} lifted in total`)}
      <div class="card">${list.map((w) => {
        const m = fmtDate(w.date, { month: 'long', year: 'numeric' });
        const head = m !== month ? `<div class="month">${m}</div>` : ''; month = m;
        return `${head}<details class="hist"><summary class="list-row"><span class="ic"><i class="fas fa-dumbbell" aria-hidden="true"></i></span><div><b>${esc(w.name)}</b><small>${fmtDate(w.date, { weekday: 'long', day: 'numeric', month: 'short' })} · ${w.duration} min</small></div><div class="r">${fmtNum(volume(w))} ${U()}<small>${setsDone(w)} sets</small></div><i class="fas fa-chevron-down chev" aria-hidden="true"></i></summary>
          <div class="hist-body">${w.exercises.map((e) => `<div><b>${esc(e.name)}</b> · ${e.sets.map((s) => `${s.weight}${U()}×${s.reps}`).join(', ')}</div>`).join('')}<div><button class="btn btn-red btn-sm" type="button" data-act="del-wk" data-id="${w.id}">Delete workout</button></div></div></details>`;
      }).join('') || '<div class="empty"><i class="fas fa-clock-rotate-left"></i>Your finished workouts will show up here.</div>'}</div>`;
  }

  /* ---------------------------------------------------------- progress */
  function progressView() {
    const b = bests();
    const names = Object.keys(b).sort();
    if (!names.includes(progressEx)) progressEx = names[0] || 'Bench Press';
    const pts = [...state.workouts].sort((x, y) => new Date(x.date) - new Date(y.date)).map((w) => {
      const e = w.exercises.find((x) => x.name === progressEx);
      if (!e) return null;
      return { x: w.date, y: Math.max(...e.sets.map((s) => e1rm(s.weight, s.reps))) };
    }).filter(Boolean);
    const change = pts.length > 1 ? pts[pts.length - 1].y - pts[0].y : 0;
    const bw = [...state.bodyweight].sort((x, y) => new Date(x.date) - new Date(y.date));
    return `${header('Progress', 'Strength trends, personal bests and bodyweight.')}
      <div class="grid g-2" style="margin-bottom:16px">
        <div class="card"><h2><span>Estimated 1-rep max</span><select id="exSel" aria-label="Exercise">${names.map((n) => `<option ${n === progressEx ? 'selected' : ''}>${n}</option>`).join('')}</select></h2>
          <div style="display:flex;gap:10px;margin-bottom:6px;flex-wrap:wrap"><span class="tag lime">Best ${b[progressEx] ? Math.round(b[progressEx].e) : 0} ${U()}</span><span class="tag">${change >= 0 ? '+' : ''}${Math.round(change * 10) / 10} ${U()} since ${pts[0] ? fmtDate(pts[0].x, { day: 'numeric', month: 'short' }) : 'start'}</span></div>
          ${lineChart(pts, 560, 220, '#c6f432', `${progressEx} estimated one-rep max over time`)}</div>
        <div class="card"><h2>Bodyweight <small>${bw.length ? `${bw[bw.length - 1].value} ${U()}` : ''}</small></h2>${lineChart(bw.map((p) => ({ x: p.date, y: p.value })), 420, 200, '#6cc4ff', 'Bodyweight over time')}
          <form class="bw-form" id="bwForm" style="margin-top:12px"><input id="bwVal" type="number" step="0.1" min="20" placeholder="Today’s weight (${U()})" aria-label="Bodyweight" required><button class="btn btn-lime" type="submit">Log</button></form></div>
      </div>
      <div class="card"><h2>Personal bests <small>best set for each exercise</small></h2><div class="pr-grid">${names.map((n) => `<div class="pr"><b>${b[n].w ? `${b[n].w} ${U()}` : 'Bodyweight'} × ${b[n].r}</b><span>${n} · ${fmtDate(b[n].date, { day: 'numeric', month: 'short' })}</span></div>`).join('')}</div></div>`;
  }

  /* ---------------------------------------------------------- settings & modal */
  function settingsModal() {
    const p = state.profile;
    openModal(`<form method="dialog"><div class="m-h"><h3>Settings</h3><button class="icon-btn" value="cancel" aria-label="Close"><i class="fas fa-xmark"></i></button></div>
      <div class="m-b"><div class="field"><label for="sName">Your name</label><input id="sName" value="${esc(p.name)}"></div>
        <div class="two"><div class="field"><label for="sUnit">Units</label><select id="sUnit"><option value="kg" ${p.unit === 'kg' ? 'selected' : ''}>Kilograms</option><option value="lb" ${p.unit === 'lb' ? 'selected' : ''}>Pounds</option></select></div><div class="field"><label for="sGoal">Weekly goal</label><input id="sGoal" type="number" min="1" max="7" value="${p.goal}"></div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:12px"><button class="btn btn-dark btn-sm" type="button" data-act="reset-demo">Reload sample data</button><button class="btn btn-red btn-sm" type="button" data-act="clear-all">Start fresh</button></div></div>
      <div class="m-f"><button class="btn btn-dark" value="cancel">Cancel</button><button class="btn btn-lime" value="ok">Save</button></div></form>`, (ok) => {
      if (!ok) return;
      Object.assign(p, { name: $('#sName').value.trim() || p.name, unit: $('#sUnit').value, goal: Math.max(1, Math.min(7, Number($('#sGoal').value) || 4)) });
      save(); render(); toast('Settings saved', 'fa-check');
    });
  }
  let onClose = null;
  function openModal(html, cb) { const d = $('#modal'); d.oninput = null; d.onclick = null; d.innerHTML = html; onClose = cb; d.showModal(); }
  $('#modal').addEventListener('close', () => { const cb = onClose; onClose = null; cb?.($('#modal').returnValue === 'ok'); });

  /* ---------------------------------------------------------- events */
  function go(v) { view = v; history.replaceState(null, '', `#${v}`); render(); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); $('#main').focus({ preventScroll: true }); }
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-view]'); if (nav) { go(nav.dataset.view); return; }
    const el = e.target.closest('[data-act]'); if (!el) return;
    const { act, id } = el.dataset, ei = Number(el.dataset.ei), si = Number(el.dataset.si);
    const a = state.active;
    switch (act) {
      case 'settings': settingsModal(); break;
      case 'start': if (state.active && !confirm('You already have a workout in progress. Replace it?')) { go('workout'); break; } startWorkout(id); break;
      case 'tick': { const s = a.exercises[ei].sets[si]; s.done = !s.done; save(); render(); if (s.done) { startRest(90); toast(`+${XP_SET} XP`, 'fa-bolt'); } break; }
      case 'add-set': { const sets = a.exercises[ei].sets, last = sets[sets.length - 1]; sets.push({ weight: last?.weight ?? 0, reps: last?.reps ?? 8, done: false }); save(); render(); break; }
      case 'rm-ex': a.exercises.splice(ei, 1); save(); render(); break;
      case 'add-ex': { const name = $('#exPick').value, prev = lastSets(name); a.exercises.push({ name, sets: Array.from({ length: 3 }, (_, i) => ({ weight: prev[i]?.weight ?? 0, reps: prev[i]?.reps ?? 10, done: false })) }); save(); render(); break; }
      case 'discard': if (confirm('Discard this workout? Nothing will be saved.')) { state.active = null; save(); stopRest(); render(); } break;
      case 'finish': finish(); break;
      case 'rest-add': restEnd += 15000; tickRest(); break;
      case 'rest-sub': restEnd -= 15000; tickRest(); break;
      case 'rest-skip': stopRest(); break;
      case 'new-plan': planModal(); break;
      case 'edit-plan': planModal(state.templates.find((t) => t.id === id)); break;
      case 'del-plan': if (confirm('Delete this plan?')) { state.templates = state.templates.filter((t) => t.id !== id); save(); render(); } break;
      case 'del-wk': if (confirm('Delete this workout from your history?')) { state.workouts = state.workouts.filter((w) => w.id !== id); save(); render(); } break;
      case 'reset-demo': if (confirm('Replace everything with the sample data?')) { state = sample(); save(); $('#modal').close(); render(); toast('Sample data loaded'); } break;
      case 'clear-all': if (confirm('Delete all workouts, plans and progress? This can’t be undone.')) { const fresh = sample(); state = { ...fresh, xp: 0, workouts: [], bodyweight: [], active: null }; save(); $('#modal').close(); render(); toast('Fresh start'); } break;
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.set && state.active) { state.active.exercises[t.dataset.ei].sets[t.dataset.si][t.dataset.set] = Math.max(0, Number(t.value) || 0); save(); }
    if (t.id === 'sessName' && state.active) { state.active.name = t.value; save(); }
    if (t.id === 'exSel') { progressEx = t.value; render(); }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'bwForm') { e.preventDefault(); state.bodyweight.push({ date: new Date().toISOString(), value: Number($('#bwVal').value) }); save(); render(); toast('Bodyweight logged', 'fa-weight-scale'); }
  });

  /* ---------------------------------------------------------- render */
  let lastView = null;
  function render() {
    renderNav();
    const html = { dashboard, workout: workoutView, plans: plansView, history: historyView, progress: progressView }[view]();
    $('#main').innerHTML = `<div class="${view !== lastView ? 'view' : ''}">${html}</div>`;
    $('#main').classList.toggle('working', view === 'workout' && !!state.active);
    lastView = view;
    document.title = `${VIEWS.find((v) => v[0] === view)[1]} · FitTrack`;
    clearInterval(elapsedT);
    if (view === 'workout' && state.active) { tickElapsed(); elapsedT = setInterval(tickElapsed, 1000); }
  }
  render();
})();
