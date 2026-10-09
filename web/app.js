(function () {
  'use strict';

  const L = window.TLogic;
  const STORAGE_KEY = 'turneringsapp.v1';
  const UI_KEY = 'turneringsapp.ui';
  const APP_VERSION = '1.0';
  const Bridge = window.AndroidBridge || null;

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICONS = {
    close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
    full: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
    exitFull: 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    del: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    trophy: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
    people: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    chart: 'M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z',
    pencil: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    timer: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61 1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
    shuffle: 'M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
    dice: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z',
    download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    upload: 'M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    crown: 'M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

  /* ------------------------------------------------------------------ */
  /* Data                                                                */
  /* ------------------------------------------------------------------ */

  const DEFAULT_SETTINGS = { bestOf: 0, quickValues: '', cutoff: 32 };

  function newTournament(name) {
    return {
      id: L.uid(),
      name: name,
      createdAt: Date.now(),
      players: [],
      rounds: [],
      settings: Object.assign({}, DEFAULT_SETTINGS),
      playoff: null,
    };
  }

  function normalize(t) {
    t.players = Array.isArray(t.players) ? t.players : [];
    t.rounds = Array.isArray(t.rounds) ? t.rounds : [];
    t.rounds.forEach((r) => (r.scores = r.scores || {}));
    t.settings = Object.assign({}, DEFAULT_SETTINGS, t.settings || {});
    if (t.playoff === undefined) t.playoff = null;
    if (!t.name) t.name = 'Turnering';
    return t;
  }

  function freshDb() {
    const t = newTournament('Min turnering');
    return { version: 1, activeId: t.id, tournaments: { [t.id]: t }, settings: { theme: 'auto' } };
  }

  function normalizeDb(d) {
    if (!d || typeof d !== 'object' || !d.tournaments || typeof d.tournaments !== 'object') return null;
    Object.values(d.tournaments).forEach(normalize);
    if (!Object.keys(d.tournaments).length) {
      const t = newTournament('Min turnering');
      d.tournaments[t.id] = t;
    }
    if (!d.tournaments[d.activeId]) d.activeId = Object.keys(d.tournaments)[0];
    d.settings = Object.assign({ theme: 'auto' }, d.settings || {});
    d.version = 1;
    return d;
  }

  function load() {
    try {
      const d = normalizeDb(JSON.parse(localStorage.getItem(STORAGE_KEY)));
      if (d) return d;
    } catch (e) { /* tom eller trasig lagring */ }
    return freshDb();
  }

  let db = load();
  const T = () => db.tournaments[db.activeId];

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      toast('Kunde inte spara: ' + e.message);
    }
  }

  const ui = { tab: 'table', roundId: null, playerSearch: '', pointsSearch: '', pointsSort: 'name', big: false };
  try {
    const saved = JSON.parse(localStorage.getItem(UI_KEY) || '{}');
    if (saved.tab) ui.tab = saved.tab;
    if (saved.roundId) ui.roundId = saved.roundId;
    if (saved.pointsSort) ui.pointsSort = saved.pointsSort;
  } catch (e) { /* ignorera */ }
  function saveUi() {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify({ tab: ui.tab, roundId: ui.roundId, pointsSort: ui.pointsSort }));
    } catch (e) { /* ignorera */ }
  }

  // Ångra: en ögonblicksbild före destruktiva ändringar
  let undoSnap = null;
  function checkpoint() {
    undoSnap = JSON.stringify(db);
  }
  function undo() {
    if (!undoSnap) return;
    db = normalizeDb(JSON.parse(undoSnap));
    undoSnap = null;
    save();
    render();
    toast('Ångrat');
  }
  function commit(msg, canUndo) {
    save();
    render();
    if (msg) toast(msg, canUndo ? { label: 'Ångra', fn: undo } : null);
  }

  const playerById = (t, id) => t.players.find((p) => p.id === id);
  const pname = (t, id) => {
    const p = playerById(t, id);
    return p ? p.name : '(borttagen)';
  };

  function fmt(n) {
    if (n == null || !isFinite(n)) return '–';
    return Number.isInteger(n) ? String(n) : String(L.round2(n)).replace('.', ',');
  }

  // Svenska ordningstal: 1:a, 2:a, 3:e … 11:e, 12:e, 21:a
  function ordinal(n) {
    const end = (n % 10 === 1 || n % 10 === 2) && n % 100 !== 11 && n % 100 !== 12 ? 'a' : 'e';
    return n + ':' + end;
  }

  function parseNum(str) {
    const s = String(str).trim().replace(',', '.').replace('−', '-');
    if (s === '') return null;
    const n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  /* ------------------------------------------------------------------ */
  /* UI-hjälpare                                                         */
  /* ------------------------------------------------------------------ */

  let toastTimer = null;
  function toast(msg, action) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button>${esc(action.label)}</button>` : '');
    el.hidden = false;
    if (action) {
      el.querySelector('button').onclick = () => {
        el.hidden = true;
        action.fn();
      };
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), action ? 6000 : 2600);
  }

  const modalStack = [];
  function openModal(opts) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      `<div class="modal" role="dialog" aria-modal="true">` +
      `<div class="modal-head"><h2>${esc(opts.title)}</h2><button class="icon-btn" data-close aria-label="Stäng">${icon('close')}</button></div>` +
      `<div class="modal-body">${opts.body || ''}</div>` +
      (opts.actions && opts.actions.length ? '<div class="modal-actions"></div>' : '') +
      `</div>`;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      wrap.remove();
      const i = modalStack.indexOf(close);
      if (i >= 0) modalStack.splice(i, 1);
      if (opts.onClose) opts.onClose();
    };
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap || e.target.closest('[data-close]')) close();
    });
    const act = wrap.querySelector('.modal-actions');
    (opts.actions || []).forEach((a) => {
      const b = document.createElement('button');
      b.className = 'btn ' + (a.cls || '');
      b.textContent = a.label;
      b.onclick = () => {
        if (a.onClick && a.onClick(wrap) === false) return;
        close();
      };
      act.appendChild(b);
    });
    $('#modalRoot').appendChild(wrap);
    modalStack.push(close);
    if (opts.onOpen) opts.onOpen(wrap, close);
    const f = wrap.querySelector('[autofocus]');
    if (f) setTimeout(() => f.focus(), 60);
    return { el: wrap, close: close };
  }

  function confirmDialog(title, text, okLabel, onOk, cls) {
    openModal({
      title: title,
      body: `<p>${esc(text)}</p>`,
      actions: [{ label: 'Avbryt' }, { label: okLabel, cls: cls || 'danger', onClick: onOk }],
    });
  }

  function promptDialog(title, label, value, onOk) {
    openModal({
      title: title,
      body: `<label class="field"><span>${esc(label)}</span><input type="text" id="promptInput" value="${esc(value)}" autofocus enterkeyhint="done"></label>`,
      actions: [
        { label: 'Avbryt' },
        {
          label: 'Spara',
          cls: 'primary',
          onClick: (w) => {
            const v = $('#promptInput', w).value.trim();
            if (!v) return false;
            onOk(v);
          },
        },
      ],
      onOpen: (w, close) => {
        $('#promptInput', w).addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const v = e.target.value.trim();
            if (!v) return;
            close();
            onOk(v);
          }
        });
      },
    });
  }

  function saveFile(name, mime, content) {
    if (Bridge && Bridge.saveFile) {
      Bridge.saveFile(name, mime, content);
      return;
    }
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
    toast('Fil nedladdad');
  }
  window.onAndroidFileSaved = (ok) => toast(ok ? 'Filen sparades' : 'Filen sparades inte');

  async function shareText(title, text) {
    if (Bridge && Bridge.shareText) {
      Bridge.shareText(title, text);
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: title, text: text });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    openModal({
      title: title,
      body: `<textarea class="share-text" readonly>${esc(text)}</textarea>`,
      actions: [
        {
          label: 'Kopiera',
          cls: 'primary',
          onClick: (w) => {
            const ta = $('textarea', w);
            ta.select();
            try {
              navigator.clipboard.writeText(text).then(() => toast('Kopierat'), () => document.execCommand('copy'));
            } catch (e) {
              document.execCommand('copy');
              toast('Kopierat');
            }
          },
        },
      ],
    });
  }

  function vibrate(pattern) {
    try {
      if (Bridge && Bridge.vibrate) Bridge.vibrate(Array.isArray(pattern) ? pattern[0] : pattern);
      else if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) { /* ignorera */ }
  }

  function keepScreenOn(on) {
    try {
      if (Bridge && Bridge.keepScreenOn) Bridge.keepScreenOn(!!on);
    } catch (e) { /* ignorera */ }
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                           */
  /* ------------------------------------------------------------------ */

  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    const pref = db.settings.theme;
    const dark = pref === 'dark' || (pref === 'auto' && media && media.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#16223f' : '#1e5eff';
  }
  if (media && media.addEventListener) media.addEventListener('change', applyTheme);

  function setTab(tab) {
    ui.tab = tab;
    saveUi();
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    applyTheme();
    const t = T();
    $('#tName').textContent = t.name;
    document.title = t.name + ' – Turnering';
    $$('#tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === ui.tab));
    document.body.classList.toggle('big', ui.big);
    const view = $('#view');
    view.className = 'view view-' + ui.tab;
    view.onclick = view.oninput = view.onchange = view.onkeydown = view.onsubmit = null;
    $('#topActions').innerHTML = '';
    const renderers = { players: renderPlayers, points: renderPoints, table: renderTable, playoff: renderPlayoff, more: renderMore };
    (renderers[ui.tab] || renderTable)(view, t);
  }

  function topAction(name, label, fn) {
    const b = document.createElement('button');
    b.className = 'icon-btn';
    b.setAttribute('aria-label', label);
    b.title = label;
    b.innerHTML = icon(name);
    b.onclick = fn;
    $('#topActions').appendChild(b);
  }

  function emptyState(iconName, title, text, btnLabel, btnAction) {
    return (
      `<div class="empty">${icon(iconName)}<h3>${esc(title)}</h3><div>${esc(text)}</div>` +
      (btnLabel ? `<button class="btn primary" data-action="${btnAction}">${esc(btnLabel)}</button>` : '') +
      `</div>`
    );
  }

  /* ---------------------------- Spelare ----------------------------- */

  function renderPlayers(view, t) {
    const active = t.players.filter((p) => p.active !== false).length;
    view.innerHTML = `
      <section class="card">
        <form class="add-row" id="addForm" autocomplete="off">
          <input type="text" id="newPlayer" placeholder="Namn på ny spelare" enterkeyhint="done" maxlength="60">
          <button class="btn primary" type="submit">${icon('add')}Lägg till</button>
        </form>
        <div class="row wrap" style="margin-top:10px">
          <button class="btn small ghost" data-action="bulk">Lägg till flera</button>
          <button class="btn small ghost" data-action="shufflePick">${icon('dice')}Slumpa spelare</button>
        </div>
      </section>
      ${t.players.length ? `
      <div class="list-head">
        <span class="count">${active} aktiva${active !== t.players.length ? ` / ${t.players.length}` : ''}</span>
        <input type="search" id="playerSearch" placeholder="Sök spelare" value="${esc(ui.playerSearch)}">
      </div>
      <ul class="list" id="playerList"></ul>` : emptyState('people', 'Inga spelare än', 'Skriv in namn ovan, eller lägg till många på en gång.', 'Lägg till flera', 'bulk')}
    `;
    fillPlayerList(t);

    view.onsubmit = (e) => {
      e.preventDefault();
      const input = $('#newPlayer');
      const name = input.value.trim().replace(/\s+/g, ' ');
      if (!name) return;
      if (t.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        toast(`"${name}" finns redan`);
        return;
      }
      t.players.push({ id: L.uid(), name: name, club: '', active: true });
      save();
      render();
      toast(`${name} tillagd`);
      $('#newPlayer').focus();
    };
    view.oninput = (e) => {
      if (e.target.id === 'playerSearch') {
        ui.playerSearch = e.target.value;
        fillPlayerList(t);
      }
    };
    view.onclick = (e) => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      const id = a.dataset.id;
      if (a.dataset.action === 'bulk') bulkAddDialog(t);
      else if (a.dataset.action === 'shufflePick') randomPlayerDialog(t);
      else if (a.dataset.action === 'edit') editPlayerDialog(t, id);
      else if (a.dataset.action === 'toggle') {
        const p = playerById(t, id);
        p.active = p.active === false;
        commit(p.active ? `${p.name} är aktiv igen` : `${p.name} är inaktiv (räknas inte i tabellen)`);
      }
    };
  }

  function fillPlayerList(t) {
    const ul = $('#playerList');
    if (!ul) return;
    const q = ui.playerSearch.trim().toLowerCase();
    const list = t.players
      .map((p, i) => ({ p: p, i: i }))
      .filter((x) => !q || x.p.name.toLowerCase().includes(q) || (x.p.club || '').toLowerCase().includes(q));
    ul.innerHTML = list.length
      ? list
          .map(
            ({ p, i }) => `
        <li class="${p.active === false ? 'inactive' : ''}">
          <span class="num">${i + 1}</span>
          <div class="grow tap" data-action="edit" data-id="${p.id}">
            <div class="name">${esc(p.name)}</div>
            ${p.club ? `<div class="sub">${esc(p.club)}</div>` : ''}
          </div>
          <label class="check" title="Aktiv"><input type="checkbox" data-action="toggle" data-id="${p.id}" ${p.active !== false ? 'checked' : ''}></label>
          <button class="icon-btn" data-action="edit" data-id="${p.id}" aria-label="Redigera">${icon('edit')}</button>
        </li>`
          )
          .join('')
      : `<li class="muted">Ingen spelare matchar sökningen</li>`;
  }

  function bulkAddDialog(t) {
    openModal({
      title: 'Lägg till flera spelare',
      body: `<p class="muted small">Ett namn per rad. Lägg till klubb/lag efter ett kommatecken, t.ex. <i>Anna Svensson, IFK</i>.</p>
             <textarea id="bulkText" placeholder="Anna Svensson&#10;Erik Johansson, BK Ross&#10;…" autofocus></textarea>`,
      actions: [
        { label: 'Avbryt' },
        {
          label: 'Lägg till',
          cls: 'primary',
          onClick: (w) => {
            const lines = $('#bulkText', w).value.split(/\r?\n/);
            const existing = new Set(t.players.map((p) => p.name.toLowerCase()));
            let added = 0;
            let dup = 0;
            lines.forEach((line) => {
              const parts = line.split(/[,;\t]/);
              const name = (parts[0] || '').trim().replace(/\s+/g, ' ');
              const club = parts.slice(1).join(' ').trim();
              if (!name) return;
              if (existing.has(name.toLowerCase())) {
                dup++;
                return;
              }
              existing.add(name.toLowerCase());
              t.players.push({ id: L.uid(), name: name, club: club, active: true });
              added++;
            });
            commit(`${added} spelare tillagda` + (dup ? ` (${dup} dubbletter hoppades över)` : ''));
          },
        },
      ],
    });
  }

  function editPlayerDialog(t, id) {
    const p = playerById(t, id);
    if (!p) return;
    const inPlayoff = t.playoff && t.playoff.seeds.includes(id);
    openModal({
      title: 'Redigera spelare',
      body: `
        <label class="field"><span>Namn</span><input type="text" id="epName" value="${esc(p.name)}" maxlength="60"></label>
        <label class="field"><span>Klubb / lag (valfritt)</span><input type="text" id="epClub" value="${esc(p.club || '')}" maxlength="60"></label>
        <label class="check"><input type="checkbox" id="epActive" ${p.active !== false ? 'checked' : ''}> Aktiv (räknas i tabellen)</label>
        <button class="btn danger-text ghost block" id="epDelete" style="margin-top:10px">${icon('del')}Ta bort spelare</button>`,
      actions: [
        { label: 'Avbryt' },
        {
          label: 'Spara',
          cls: 'primary',
          onClick: (w) => {
            const name = $('#epName', w).value.trim().replace(/\s+/g, ' ');
            if (!name) return false;
            if (t.players.some((x) => x !== p && x.name.toLowerCase() === name.toLowerCase())) {
              toast('Det namnet finns redan');
              return false;
            }
            p.name = name;
            p.club = $('#epClub', w).value.trim();
            p.active = $('#epActive', w).checked;
            commit('Sparat');
          },
        },
      ],
      onOpen: (w, close) => {
        $('#epDelete', w).onclick = () => {
          close();
          confirmDialog(
            'Ta bort spelare?',
            `${p.name} och alla hens poäng tas bort.` + (inPlayoff ? ' Spelaren finns också i slutspelet.' : ''),
            'Ta bort',
            () => {
              checkpoint();
              t.players = t.players.filter((x) => x.id !== id);
              t.rounds.forEach((r) => delete r.scores[id]);
              commit(`${p.name} borttagen`, true);
            }
          );
        };
      },
    });
  }

  function randomPlayerDialog(t) {
    const pool = t.players.filter((p) => p.active !== false);
    if (!pool.length) {
      toast('Inga aktiva spelare');
      return;
    }
    const pick = () => pool[Math.floor(Math.random() * pool.length)].name;
    openModal({
      title: 'Slumpa spelare',
      body: `<div class="random-name" id="rndName">${esc(pick())}</div>`,
      actions: [
        { label: 'Stäng' },
        {
          label: 'Slumpa igen',
          cls: 'primary',
          onClick: (w) => {
            const el = $('#rndName', w);
            let n = 0;
            const spin = setInterval(() => {
              el.textContent = pick();
              if (++n > 12) clearInterval(spin);
            }, 60);
            return false;
          },
        },
      ],
    });
  }

  /* ----------------------------- Poäng ------------------------------ */

  function renderPoints(view, t) {
    const activePlayers = t.players.filter((p) => p.active !== false);
    if (!activePlayers.length) {
      view.innerHTML = emptyState('people', 'Lägg till spelare först', 'Poäng matas in per omgång för varje aktiv spelare.', 'Gå till Spelare', 'goPlayers');
      view.onclick = (e) => e.target.closest('[data-action="goPlayers"]') && setTab('players');
      return;
    }
    if (!t.rounds.length) {
      view.innerHTML = emptyState('pencil', 'Inga omgångar än', 'Skapa en omgång och skriv in poängen – tabellen uppdateras automatiskt.', 'Skapa omgång 1', 'addRound');
      view.onclick = (e) => e.target.closest('[data-action="addRound"]') && addRound(t);
      return;
    }
    let round = t.rounds.find((r) => r.id === ui.roundId);
    if (!round) {
      round = t.rounds[t.rounds.length - 1];
      ui.roundId = round.id;
    }

    view.innerHTML = `
      <div class="chips" id="roundChips">
        ${t.rounds
          .map((r) => `<button class="chip ${r === round ? 'on' : ''}" data-action="selRound" data-id="${r.id}">${esc(r.name)}${L.roundHasScores(r) && r !== round ? '<span class="dot"></span>' : ''}</button>`)
          .join('')}
        <button class="chip add" data-action="addRound">+ Ny omgång</button>
      </div>
      <section class="card">
        <div class="row">
          <h3 class="grow" style="margin:0">${esc(round.name)}</h3>
          <button class="icon-btn" data-action="renameRound" aria-label="Byt namn">${icon('edit')}</button>
          <button class="icon-btn" data-action="deleteRound" aria-label="Ta bort omgång">${icon('del')}</button>
        </div>
        <div class="small muted" id="roundProgressText"></div>
        <div class="progress"><div id="roundProgress"></div></div>
      </section>
      <div class="list-head">
        <input type="search" id="pointsSearch" placeholder="Sök" value="${esc(ui.pointsSearch)}">
        <select id="pointsSort" style="width:auto">
          <option value="name" ${ui.pointsSort === 'name' ? 'selected' : ''}>Namn</option>
          <option value="rank" ${ui.pointsSort === 'rank' ? 'selected' : ''}>Placering</option>
          <option value="empty" ${ui.pointsSort === 'empty' ? 'selected' : ''}>Ej ifyllda först</option>
          <option value="order" ${ui.pointsSort === 'order' ? 'selected' : ''}>Inlagd ordning</option>
        </select>
      </div>
      <ul class="list score-list" id="scoreList"></ul>
      <p class="small muted" style="text-align:center">Tomt fält = spelade inte. Tabellen uppdateras direkt.</p>
    `;
    fillScoreList(t, round);
    const chip = $('#roundChips .chip.on');
    if (chip) chip.scrollIntoView({ inline: 'center', block: 'nearest' });

    view.onclick = (e) => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      const act = a.dataset.action;
      if (act === 'selRound') {
        ui.roundId = a.dataset.id;
        saveUi();
        render();
      } else if (act === 'addRound') addRound(t);
      else if (act === 'renameRound')
        promptDialog('Byt namn på omgång', 'Namn', round.name, (v) => {
          round.name = v;
          commit('Sparat');
        });
      else if (act === 'deleteRound')
        confirmDialog('Ta bort omgång?', `${round.name} och alla dess poäng tas bort.`, 'Ta bort', () => {
          checkpoint();
          t.rounds = t.rounds.filter((r) => r !== round);
          ui.roundId = null;
          commit(`${round.name} borttagen`, true);
        });
      else if (act === 'quick') {
        const input = $(`input[data-pid="${a.dataset.pid}"]`);
        input.value = a.dataset.v;
        setScore(t, round, a.dataset.pid, input);
        const next = nextScoreInput(input);
        if (next) next.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    view.oninput = (e) => {
      if (e.target.id === 'pointsSearch') {
        ui.pointsSearch = e.target.value;
        fillScoreList(t, round);
      } else if (e.target.classList.contains('score-input')) {
        setScore(t, round, e.target.dataset.pid, e.target);
      }
    };
    view.onchange = (e) => {
      if (e.target.id === 'pointsSort') {
        ui.pointsSort = e.target.value;
        saveUi();
        fillScoreList(t, round);
      }
    };
    view.onkeydown = (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('score-input')) {
        e.preventDefault();
        const next = nextScoreInput(e.target);
        if (next) {
          next.focus();
          next.select();
        } else e.target.blur();
      }
    };
  }

  function nextScoreInput(input) {
    const all = $$('#scoreList .score-input');
    return all[all.indexOf(input) + 1] || null;
  }

  function addRound(t) {
    const n = t.rounds.length + 1;
    const r = { id: L.uid(), name: 'Omgång ' + n, scores: {} };
    t.rounds.push(r);
    ui.roundId = r.id;
    saveUi();
    commit(`${r.name} skapad`);
  }

  function setScore(t, round, pid, input) {
    const v = parseNum(input.value);
    if (Number.isNaN(v)) return;
    if (v === null) delete round.scores[pid];
    else round.scores[pid] = v;
    input.classList.toggle('filled', v !== null);
    save();
    updateScoreTotals(t, round);
  }

  function updateScoreTotals(t, round) {
    const rows = L.computeStandings(t);
    const byId = {};
    rows.forEach((r) => (byId[r.id] = r));
    $$('#scoreList [data-total]').forEach((el) => {
      const r = byId[el.dataset.total];
      if (r) el.textContent = `Totalt ${fmt(r.total)} · ${ordinal(r.rank)}`;
    });
    const active = t.players.filter((p) => p.active !== false);
    const filled = active.filter((p) => L.isNum(round.scores[p.id])).length;
    const txt = $('#roundProgressText');
    if (txt) txt.textContent = `${filled} av ${active.length} spelare har poäng`;
    const bar = $('#roundProgress');
    if (bar) bar.style.width = (active.length ? (filled / active.length) * 100 : 0) + '%';
  }

  function fillScoreList(t, round) {
    const ul = $('#scoreList');
    if (!ul) return;
    const rows = L.computeStandings(t);
    const rankOf = {};
    rows.forEach((r, i) => (rankOf[r.id] = i));
    let list = t.players.filter((p) => p.active !== false);
    const q = ui.pointsSearch.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    if (ui.pointsSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'sv', { numeric: true }));
    else if (ui.pointsSort === 'rank') list.sort((a, b) => rankOf[a.id] - rankOf[b.id]);
    else if (ui.pointsSort === 'empty')
      list.sort((a, b) => (L.isNum(round.scores[a.id]) ? 1 : 0) - (L.isNum(round.scores[b.id]) ? 1 : 0) || a.name.localeCompare(b.name, 'sv', { numeric: true }));
    const quick = String(t.settings.quickValues || '')
      .split(/[;,\s]+/)
      .map((s) => parseNum(s))
      .filter((n) => n !== null && !Number.isNaN(n));
    ul.innerHTML = list.length
      ? list
          .map((p) => {
            const v = round.scores[p.id];
            return `
        <li>
          <div class="grow">
            <div class="name">${esc(p.name)}</div>
            <div class="sub" data-total="${p.id}"></div>
            ${quick.length ? `<div class="quick">${quick.map((q) => `<button data-action="quick" data-pid="${p.id}" data-v="${q}">${fmt(q)}</button>`).join('')}</div>` : ''}
          </div>
          <input class="score-input ${L.isNum(v) ? 'filled' : ''}" type="number" step="any" data-pid="${p.id}" value="${L.isNum(v) ? v : ''}" placeholder="–" enterkeyhint="next" aria-label="Poäng för ${esc(p.name)}">
        </li>`;
          })
          .join('')
      : '<li class="muted">Ingen spelare matchar sökningen</li>';
    updateScoreTotals(t, round);
  }

  /* ----------------------------- Tabell ----------------------------- */

  function cutoffFor(t) {
    if (t.playoff) return t.playoff.seeds.length;
    return t.settings.cutoff > 0 ? t.settings.cutoff : 0;
  }

  function renderTable(view, t) {
    const rows = L.standingsWithMovement(t);
    topAction('share', 'Dela tabell', () => shareText(t.name + ' – tabell', standingsText(t, rows)));
    topAction('full', 'Storbildsläge', () => {
      ui.big = true;
      keepScreenOn(true);
      render();
    });
    if (!rows.length) {
      view.innerHTML = emptyState('chart', 'Tabellen är tom', 'Lägg till spelare och mata in poäng, så räknas tabellen ut automatiskt.', 'Lägg till spelare', 'goPlayers');
      view.onclick = (e) => e.target.closest('[data-action="goPlayers"]') && setTab('players');
      return;
    }
    const cutoff = cutoffFor(t);
    const scoredRounds = t.rounds.filter(L.roundHasScores).length;
    const info = [];
    info.push(`${rows.length} spelare`);
    info.push(`${scoredRounds} ${scoredRounds === 1 ? 'omgång' : 'omgångar'} spelade`);
    if (t.settings.bestOf > 0) info.push(`räknar bästa ${t.settings.bestOf}`);

    let body = '';
    rows.forEach((r, i) => {
      if (cutoff && i === cutoff && cutoff < rows.length) {
        body += `<tr class="cutoff"><td colspan="6"><div>▲ Slutspelsgräns – topp ${cutoff} ▲</div></td></tr>`;
      }
      const mv = r.move > 0 ? `<span class="move up">▲${r.move}</span>` : r.move < 0 ? `<span class="move down">▼${-r.move}</span>` : '';
      body += `
        <tr class="tap r${r.rank} ${cutoff && i >= cutoff ? 'out' : ''}" data-id="${r.id}">
          <td class="rank"><span>${r.tied ? '=' : ''}${r.rank}</span></td>
          <td class="l"><div class="pname">${esc(r.name)}${mv}</div>${r.player.club ? `<div class="pclub">${esc(r.player.club)}</div>` : ''}</td>
          <td>${r.played}</td>
          <td class="hide-narrow">${fmt(r.best)}</td>
          <td>${fmt(r.avg)}</td>
          <td class="total">${fmt(r.total)}</td>
        </tr>`;
    });
    view.innerHTML = `
      ${ui.big ? `<div class="big-title">${esc(t.name)}</div>` : ''}
      <div class="small muted" style="margin:0 4px 8px">${info.join(' · ')}</div>
      <table class="standings">
        <thead><tr><th>#</th><th class="l">Spelare</th><th>Omg</th><th class="hide-narrow">Bäst</th><th>Snitt</th><th>Poäng</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
      ${ui.big ? `<button class="btn big-exit" data-action="exitBig">${icon('exitFull')}Avsluta</button>` : '<p class="small muted" style="text-align:center">Tryck på en spelare för detaljer</p>'}
    `;
    view.onclick = (e) => {
      if (e.target.closest('[data-action="exitBig"]')) {
        exitBig();
        return;
      }
      const tr = e.target.closest('tr[data-id]');
      if (tr) playerStatsDialog(t, tr.dataset.id);
    };
  }

  function exitBig() {
    ui.big = false;
    keepScreenOn(timer.running);
    render();
  }

  function standingsText(t, rows) {
    const lines = [`${t.name} – Tabell`, ''];
    const cutoff = cutoffFor(t);
    rows.forEach((r, i) => {
      if (cutoff && i === cutoff) lines.push('— slutspelsgräns —');
      lines.push(`${r.rank}. ${r.name}  ${fmt(r.total)} p (${r.played} omg)`);
    });
    return lines.join('\n');
  }

  function playerStatsDialog(t, id) {
    const rows = L.computeStandings(t);
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    const hist = L.rankHistory(t, id);
    const roundsHtml = t.rounds
      .map((rd, i) => {
        const v = rd.scores[id];
        return `<tr><td class="l">${esc(rd.name)}</td><td>${L.isNum(v) ? fmt(v) : '<span class="muted">–</span>'}</td><td>${hist[i] != null ? ordinal(hist[i]) : '–'}</td></tr>`;
      })
      .join('');
    openModal({
      title: r.name,
      body: `
        ${r.player.club ? `<p class="muted">${esc(r.player.club)}</p>` : ''}
        <div class="stat-grid">
          <div class="stat"><b>${r.rank}</b><span>Placering</span></div>
          <div class="stat"><b>${fmt(r.total)}</b><span>Poäng</span></div>
          <div class="stat"><b>${r.played}</b><span>Omgångar</span></div>
          <div class="stat"><b>${fmt(r.avg)}</b><span>Snitt</span></div>
          <div class="stat"><b>${fmt(r.best)}</b><span>Bästa</span></div>
          <div class="stat"><b>${fmt(r.worst)}</b><span>Sämsta</span></div>
        </div>
        ${t.rounds.length ? `<table class="mini-table"><thead><tr><th class="l">Omgång</th><th>Poäng</th><th>Plac. efter</th></tr></thead><tbody>${roundsHtml}</tbody></table>` : '<p class="muted">Inga omgångar än.</p>'}
      `,
      actions: [
        {
          label: 'Redigera spelare',
          onClick: () => {
            setTimeout(() => editPlayerDialog(t, id), 0);
          },
        },
      ],
    });
  }

  /* ---------------------------- Slutspel ---------------------------- */

  let poDraft = null;

  function renderPlayoff(view, t) {
    if (!t.playoff) return renderPlayoffSetup(view, t);
    const po = t.playoff;
    const res = L.resolvePlayoff(po);
    topAction('share', 'Dela slutspel', () => shareText(t.name + ' – slutspel', playoffText(t, res)));

    const nameRow = (m, side) => {
      const id = m[side];
      const seed = side === 'a' ? m.seedA : m.seedB;
      const score = side === 'a' ? m.sa : m.sb;
      let cls = '';
      let label;
      if (id) {
        label = esc(pname(t, id));
        if (m.winner === id) cls = 'win';
        else if (m.winner) cls = 'lose';
      } else {
        cls = 'tbd';
        label = m.bye ? 'Walk over' : 'Väntar…';
      }
      return `<div class="m-row ${cls}"><span class="seed">${seed || ''}</span><span class="pn">${label}</span><span class="ps">${score != null ? fmt(score) : ''}</span></div>`;
    };
    const matchHtml = (m) =>
      `<button class="match ${m.winner ? 'done' : ''} ${m.ready ? 'ready' : ''} ${m.bye ? 'bye' : ''}" data-key="${m.key}">${nameRow(m, 'a')}${nameRow(m, 'b')}</button>`;

    let champion = '';
    if (res.champion) {
      champion = `
        <div class="champion">
          ${icon('trophy')}
          <div class="small">Vinnare</div>
          <div class="cname">${esc(pname(t, res.champion))}</div>
          <div class="podium">
            <span>🥈 ${esc(pname(t, res.runnerUp))}</span>
            ${res.thirdPlace ? `<span>🥉 ${esc(pname(t, res.thirdPlace))}</span>` : ''}
          </div>
        </div>`;
    }

    view.innerHTML = `
      ${champion}
      <div class="row" style="margin:0 4px 10px">
        <div class="grow small muted">${po.seeds.length} spelare · ${po.seeding === 'random' ? 'slumpad lottning' : 'seedat efter tabellen'} · ${res.playedMatches}/${res.totalMatches} matcher spelade</div>
      </div>
      <div class="bracket-wrap">
        <div class="bracket">
          ${res.rounds
            .map(
              (rd) => `
            <div class="b-col">
              <h4>${rd.name}<small>${rd.played}/${rd.matches.filter((m) => !m.bye).length} klara</small></h4>
              <div class="b-matches">${rd.matches.map(matchHtml).join('')}</div>
            </div>`
            )
            .join('')}
        </div>
      </div>
      ${res.third && res.third.applicable ? `
        <section class="card" style="max-width:260px">
          <h3>Match om tredjepris</h3>
          ${matchHtml(res.third)}
        </section>` : ''}
      <p class="small muted">Tryck på en match för att skriva in resultat. Svep åt sidan för att se hela trädet.</p>
      <div class="row wrap">
        <button class="btn danger-text ghost" data-action="deletePo">${icon('del')}Ta bort slutspel</button>
      </div>
    `;
    view.onclick = (e) => {
      const mEl = e.target.closest('.match[data-key]');
      if (mEl) {
        matchDialog(t, mEl.dataset.key);
        return;
      }
      const a = e.target.closest('[data-action="deletePo"]');
      if (a)
        confirmDialog('Ta bort slutspelet?', 'Alla slutspelsresultat försvinner. Tabellen påverkas inte.', 'Ta bort', () => {
          checkpoint();
          t.playoff = null;
          commit('Slutspelet borttaget', true);
        });
    };
    // Scrolla till första ospelade omgången
    const wrap = $('.bracket-wrap', view);
    const firstOpen = res.rounds.findIndex((rd) => rd.matches.some((m) => m.ready && !m.winner));
    if (wrap && firstOpen > 0) {
      const col = $$('.b-col', wrap)[firstOpen];
      if (col) wrap.scrollLeft = Math.max(0, col.offsetLeft - 24);
    }
  }

  function renderPlayoffSetup(view, t) {
    const rows = L.computeStandings(t);
    if (rows.length < 2) {
      view.innerHTML = emptyState('trophy', 'Inget slutspel än', 'Det behövs minst 2 aktiva spelare i tabellen för att skapa ett slutspel.', 'Lägg till spelare', 'goPlayers');
      view.onclick = (e) => e.target.closest('[data-action="goPlayers"]') && setTab('players');
      return;
    }
    if (!poDraft) poDraft = { count: Math.min(t.settings.cutoff || 32, rows.length), seeding: 'standard', thirdPlace: true };
    poDraft.count = Math.max(2, Math.min(poDraft.count, rows.length));
    const presets = [4, 8, 16, 32, 64].filter((n) => n <= rows.length);
    const n = poDraft.count;
    const size = L.nextPow2(n);
    const qualified = rows.slice(0, n);
    let warn = '';
    if (n < rows.length && rows[n - 1].total === rows[n].total) {
      const tiedNames = rows.filter((r) => r.total === rows[n - 1].total).map((r) => r.name);
      warn = `<div class="warn">⚠️ Delad poäng vid gränsen: ${esc(tiedNames.join(', '))} har ${fmt(rows[n - 1].total)} p. Särskiljs på bästa omgång, sedan snitt. Justera poängen om ni vill avgöra på annat sätt.</div>`;
    }
    const byes = size - n;

    view.innerHTML = `
      <section class="card">
        <h3>Skapa slutspel</h3>
        <p>De bästa spelarna i tabellen placeras automatiskt in i slutspelsträdet.</p>
        <label class="field"><span>Antal spelare till slutspel</span></label>
        <div class="seg">
          ${presets.map((p) => `<button data-action="count" data-n="${p}" class="${p === n ? 'on' : ''}">${p}</button>`).join('')}
          ${rows.length <= 64 && !presets.includes(rows.length) ? `<button data-action="count" data-n="${rows.length}" class="${rows.length === n ? 'on' : ''}">Alla (${rows.length})</button>` : ''}
        </div>
        <label class="field"><span>Eget antal (2–${Math.min(rows.length, 256)})</span><input type="number" id="poCount" min="2" max="${rows.length}" value="${n}"></label>
        <label class="field"><span>Lottning</span>
          <select id="poSeeding">
            <option value="standard" ${poDraft.seeding === 'standard' ? 'selected' : ''}>Seedat efter tabellen (1 mot ${n}, 2 mot ${n - 1} …)</option>
            <option value="random" ${poDraft.seeding === 'random' ? 'selected' : ''}>Slumpad lottning</option>
          </select>
        </label>
        <label class="check"><input type="checkbox" id="poThird" ${poDraft.thirdPlace ? 'checked' : ''}> Spela match om tredjepris</label>
        ${byes ? `<p class="small" style="margin-top:8px">${byes} topp-seedade spelare går direkt vidare (walk over) eftersom ${n} inte är en jämn trädstorlek (${size}).</p>` : ''}
        <button class="btn primary block" data-action="create" style="margin-top:10px">${icon('trophy')}Skapa slutspel med ${n} spelare</button>
      </section>
      ${warn}
      <section class="card">
        <h3>Kvalificerade (${n})</h3>
        <ol class="qual-list">
          ${qualified.map((r, i) => `<li><span class="seedno">${i + 1}.</span><span>${esc(r.name)}</span><span class="pts">${fmt(r.total)} p</span></li>`).join('')}
        </ol>
      </section>
    `;
    view.onclick = (e) => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      if (a.dataset.action === 'count') {
        poDraft.count = Number(a.dataset.n);
        render();
      } else if (a.dataset.action === 'create') {
        const ids = rows.slice(0, poDraft.count).map((r) => r.id);
        t.playoff = L.createPlayoff(ids, { seeding: poDraft.seeding, thirdPlace: poDraft.thirdPlace });
        poDraft = null;
        commit('Slutspelet är skapat!');
      }
    };
    view.onchange = (e) => {
      if (e.target.id === 'poCount') {
        const v = Math.round(Number(e.target.value));
        if (v >= 2) {
          poDraft.count = Math.min(v, rows.length);
          render();
        }
      } else if (e.target.id === 'poSeeding') {
        poDraft.seeding = e.target.value;
      } else if (e.target.id === 'poThird') {
        poDraft.thirdPlace = e.target.checked;
      }
    };
  }

  function matchDialog(t, key) {
    const po = t.playoff;
    const before = L.resolvePlayoff(po);
    const m = L.findMatch(before, key);
    if (!m) return;
    if (m.bye) {
      toast(`${pname(t, m.winner)} går vidare på walk over`);
      return;
    }
    if (!m.ready) {
      toast('Matchen är inte klar – tidigare matcher måste spelas först');
      return;
    }
    const title = key === 'third' ? 'Match om tredjepris' : before.rounds[m.round].name + (before.rounds[m.round].matches.length > 1 ? ` – match ${m.index + 1}` : '');
    let selected = m.winner;
    const side = (s) => {
      const id = m[s];
      const score = s === 'a' ? m.sa : m.sb;
      const seed = s === 'a' ? m.seedA : m.seedB;
      return `
        <div class="mp-side ${selected === id ? 'sel' : ''}" data-id="${id}">
          <svg class="crown" viewBox="0 0 24 24"><path d="${ICONS.crown}"/></svg>
          <div class="grow">${esc(pname(t, id))}<div class="small muted">Seed ${seed}</div></div>
          <input type="number" step="any" placeholder="–" data-side="${s}" value="${score != null ? score : ''}" aria-label="Resultat">
        </div>`;
    };
    openModal({
      title: title,
      body: `<div class="mp">${side('a')}${side('b')}</div><p class="small muted" style="margin-top:10px">Skriv resultat (valfritt) och tryck på vinnaren. Högst resultat väljs automatiskt.</p>`,
      actions: [
        {
          label: 'Rensa',
          onClick: () => {
            L.setResult(po, m, null, null, null);
            afterResult(t, before);
          },
        },
        {
          label: 'Spara',
          cls: 'primary',
          onClick: (w) => {
            const sa = parseNum($('input[data-side="a"]', w).value);
            const sb = parseNum($('input[data-side="b"]', w).value);
            if (Number.isNaN(sa) || Number.isNaN(sb)) {
              toast('Ogiltigt resultat');
              return false;
            }
            if (!selected) {
              toast('Välj vinnare genom att trycka på spelaren');
              return false;
            }
            L.setResult(po, m, selected, sa, sb);
            afterResult(t, before);
          },
        },
      ],
      onOpen: (w) => {
        const sync = () => $$('.mp-side', w).forEach((el) => el.classList.toggle('sel', el.dataset.id === selected));
        $$('.mp-side', w).forEach((el) =>
          el.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            selected = el.dataset.id;
            sync();
          })
        );
        $$('input', w).forEach((inp) =>
          inp.addEventListener('input', () => {
            const sa = parseNum($('input[data-side="a"]', w).value);
            const sb = parseNum($('input[data-side="b"]', w).value);
            if (L.isNum(sa) && L.isNum(sb) && sa !== sb) {
              selected = sa > sb ? m.a : m.b;
              sync();
            }
          })
        );
      },
    });
  }

  function afterResult(t, before) {
    const after = L.resolvePlayoff(t.playoff);
    save();
    render();
    const lost = before.playedMatches - after.playedMatches;
    if (after.champion && !before.champion) {
      toast(`🏆 ${pname(t, after.champion)} vinner turneringen!`);
      vibrate([200, 100, 200]);
    } else if (lost > 0) {
      toast(`Obs: ${lost} senare ${lost === 1 ? 'match' : 'matcher'} påverkades och måste spelas om`);
    }
  }

  function playoffText(t, res) {
    const lines = [`${t.name} – Slutspel`, ''];
    const line = (m) => {
      if (m.bye) return `${pname(t, m.winner)} – walk over`;
      const a = m.a ? pname(t, m.a) : '?';
      const b = m.b ? pname(t, m.b) : '?';
      const score = m.sa != null || m.sb != null ? `  ${fmt(m.sa)}–${fmt(m.sb)}` : '';
      const w = m.winner ? `  → ${pname(t, m.winner)}` : '';
      return `${a} – ${b}${score}${w}`;
    };
    res.rounds.forEach((rd) => {
      lines.push(rd.name.toUpperCase());
      rd.matches.forEach((m) => lines.push('  ' + line(m)));
      lines.push('');
    });
    if (res.third && res.third.applicable) {
      lines.push('MATCH OM TREDJEPRIS', '  ' + line(res.third), '');
    }
    if (res.champion) lines.push(`🏆 Vinnare: ${pname(t, res.champion)}`);
    return lines.join('\n');
  }

  /* ------------------------------- Mer ------------------------------ */

  function renderMore(view, t) {
    const list = Object.values(db.tournaments).sort((a, b) => b.createdAt - a.createdAt);
    view.innerHTML = `
      <div class="section-title">Turneringar</div>
      <ul class="list">
        ${list
          .map(
            (x) => `
          <li class="tap ${x.id === db.activeId ? 'current' : ''}" data-action="switch" data-id="${x.id}">
            <div class="grow"><div class="name">${esc(x.name)}</div>
            <div class="sub">${x.players.length} spelare · ${x.rounds.length} omgångar${x.playoff ? ' · slutspel' : ''}</div></div>
            ${x.id === db.activeId ? '<span class="small" style="color:var(--primary);font-weight:700">AKTIV</span>' : ''}
          </li>`
          )
          .join('')}
      </ul>
      <div class="row wrap" style="margin-top:10px">
        <button class="btn small primary" data-action="newT">${icon('add')}Ny turnering</button>
        <button class="btn small" data-action="renameT">Byt namn</button>
        <button class="btn small" data-action="copyT">Kopiera spelare till ny</button>
        <button class="btn small danger-text" data-action="deleteT">Ta bort</button>
      </div>

      <div class="section-title">Verktyg</div>
      <ul class="list">
        <li class="tap" data-action="timer">${icon('timer')}<div class="grow"><div class="name">Matchtimer</div><div class="sub">Nedräkning med larm</div></div></li>
        <li class="tap" data-action="groups">${icon('shuffle')}<div class="grow"><div class="name">Lottning & grupper</div><div class="sub">Slumpa par eller dela in i grupper</div></div></li>
        <li class="tap" data-action="random">${icon('dice')}<div class="grow"><div class="name">Slumpa en spelare</div><div class="sub">T.ex. vem som börjar</div></div></li>
      </ul>

      <div class="section-title">Poängräkning (${esc(t.name)})</div>
      <section class="card">
        <label class="field"><span>Räkna bara bästa X omgångar (0 = alla)</span><input type="number" min="0" id="setBestOf" value="${t.settings.bestOf || 0}"></label>
        <label class="field"><span>Snabbknappar för poäng (t.ex. 3, 1, 0)</span><input type="text" id="setQuick" value="${esc(t.settings.quickValues)}" placeholder="Tomt = inga snabbknappar"></label>
        <label class="field" style="margin-bottom:0"><span>Visa slutspelsgräns i tabellen efter plats (0 = ingen)</span><input type="number" min="0" id="setCutoff" value="${t.settings.cutoff || 0}"></label>
      </section>

      <div class="section-title">Data & säkerhetskopia</div>
      <ul class="list">
        <li class="tap" data-action="export">${icon('download')}<div class="grow"><div class="name">Exportera säkerhetskopia</div><div class="sub">Alla turneringar som JSON-fil</div></div></li>
        <li class="tap" data-action="import">${icon('upload')}<div class="grow"><div class="name">Importera säkerhetskopia</div><div class="sub">Från fil eller inklistrad text</div></div></li>
        <li class="tap" data-action="csv">${icon('chart')}<div class="grow"><div class="name">Exportera tabell (CSV)</div><div class="sub">Öppnas i Excel / Google Kalkylark</div></div></li>
      </ul>

      <div class="section-title">Utseende</div>
      <section class="card">
        <div class="seg" style="margin:0">
          ${[['auto', 'Automatiskt'], ['light', 'Ljust'], ['dark', 'Mörkt']]
            .map(([v, l]) => `<button data-action="theme" data-v="${v}" class="${db.settings.theme === v ? 'on' : ''}">${l}</button>`)
            .join('')}
        </div>
      </section>
      <p class="small muted" style="text-align:center;margin-top:20px">Turnering ${APP_VERSION} · All data sparas lokalt på enheten.<br>Gör en säkerhetskopia ibland!</p>
    `;

    view.onclick = (e) => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      switch (a.dataset.action) {
        case 'switch':
          if (a.dataset.id !== db.activeId) {
            db.activeId = a.dataset.id;
            ui.roundId = null;
            poDraft = null;
            commit(`Bytte till ${T().name}`);
          }
          break;
        case 'newT':
          promptDialog('Ny turnering', 'Namn', '', (v) => {
            const nt = newTournament(v);
            db.tournaments[nt.id] = nt;
            db.activeId = nt.id;
            ui.roundId = null;
            poDraft = null;
            commit(`${v} skapad`);
          });
          break;
        case 'renameT':
          promptDialog('Byt namn på turnering', 'Namn', t.name, (v) => {
            t.name = v;
            commit('Sparat');
          });
          break;
        case 'copyT':
          promptDialog('Ny turnering med samma spelare', 'Namn', t.name + ' (2)', (v) => {
            const nt = newTournament(v);
            nt.players = t.players.map((p) => ({ id: L.uid(), name: p.name, club: p.club || '', active: true }));
            nt.settings = Object.assign({}, t.settings);
            db.tournaments[nt.id] = nt;
            db.activeId = nt.id;
            ui.roundId = null;
            poDraft = null;
            commit(`${v} skapad med ${nt.players.length} spelare`);
          });
          break;
        case 'deleteT':
          confirmDialog('Ta bort turnering?', `"${t.name}" med alla spelare, poäng och slutspel tas bort.`, 'Ta bort', () => {
            checkpoint();
            delete db.tournaments[t.id];
            normalizeDb(db);
            ui.roundId = null;
            commit(`${t.name} borttagen`, true);
          });
          break;
        case 'timer':
          timerDialog();
          break;
        case 'groups':
          groupsDialog(t);
          break;
        case 'random':
          randomPlayerDialog(t);
          break;
        case 'export':
          saveFile(`turnering-backup-${dateStamp()}.json`, 'application/json', JSON.stringify(db, null, 1));
          break;
        case 'import':
          importDialog();
          break;
        case 'csv':
          saveFile(`${safeName(t.name)}-tabell-${dateStamp()}.csv`, 'text/csv', standingsCsv(t));
          break;
        case 'theme':
          db.settings.theme = a.dataset.v;
          commit();
          break;
      }
    };
    view.onchange = (e) => {
      const id = e.target.id;
      if (id === 'setBestOf') {
        t.settings.bestOf = Math.max(0, Math.round(Number(e.target.value) || 0));
        commit('Poängräkning uppdaterad');
      } else if (id === 'setQuick') {
        t.settings.quickValues = e.target.value.trim();
        commit('Snabbknappar sparade');
      } else if (id === 'setCutoff') {
        t.settings.cutoff = Math.max(0, Math.round(Number(e.target.value) || 0));
        poDraft = null;
        commit('Sparat');
      }
    };
  }

  function dateStamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  const safeName = (s) => s.replace(/[^\wåäöÅÄÖ-]+/g, '_').slice(0, 40) || 'turnering';

  function standingsCsv(t) {
    const rows = L.computeStandings(t);
    const cell = (v) => {
      const s = v == null ? '' : typeof v === 'number' ? String(v).replace('.', ',') : String(v);
      return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const head = ['Placering', 'Namn', 'Klubb', 'Omgångar', 'Bäst', 'Snitt', 'Totalt'].concat(t.rounds.map((r) => r.name));
    const lines = [head.map(cell).join(';')];
    rows.forEach((r) => {
      lines.push([r.rank, r.name, r.player.club || '', r.played, r.best, r.avg, r.total].concat(r.perRound).map(cell).join(';'));
    });
    return '﻿' + lines.join('\r\n');
  }

  function importDialog() {
    openModal({
      title: 'Importera säkerhetskopia',
      body: `
        <button class="btn block" id="pickFile">${icon('upload')}Välj fil…</button>
        <p class="small muted" style="margin:12px 0 6px">…eller klistra in innehållet i en säkerhetskopia:</p>
        <textarea id="importText" placeholder='{"tournaments": …}'></textarea>`,
      actions: [
        { label: 'Avbryt' },
        {
          label: 'Importera text',
          cls: 'primary',
          onClick: (w) => {
            const txt = $('#importText', w).value.trim();
            if (!txt) {
              toast('Klistra in text eller välj en fil');
              return false;
            }
            handleImport(txt);
          },
        },
      ],
      onOpen: (w, close) => {
        $('#pickFile', w).onclick = () => {
          const input = $('#importFile');
          input.value = '';
          input.onchange = () => {
            const file = input.files && input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              close();
              handleImport(String(reader.result));
            };
            reader.onerror = () => toast('Kunde inte läsa filen');
            reader.readAsText(file);
          };
          input.click();
        };
      },
    });
  }

  function handleImport(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      toast('Filen är inte en giltig säkerhetskopia');
      return;
    }
    // Stöd både hela databasen och en enskild turnering
    if (data && Array.isArray(data.players) && !data.tournaments) {
      data = { tournaments: { [data.id || L.uid()]: data }, activeId: data.id };
    }
    const incoming = normalizeDb(data);
    if (!incoming) {
      toast('Filen är inte en giltig säkerhetskopia');
      return;
    }
    const count = Object.keys(incoming.tournaments).length;
    openModal({
      title: 'Importera',
      body: `<p>Säkerhetskopian innehåller ${count} ${count === 1 ? 'turnering' : 'turneringar'}. Vill du lägga till dem eller ersätta allt som finns nu?</p>`,
      actions: [
        { label: 'Avbryt' },
        {
          label: 'Ersätt allt',
          cls: 'danger',
          onClick: () => {
            checkpoint();
            db = incoming;
            ui.roundId = null;
            poDraft = null;
            commit('Data importerad', true);
          },
        },
        {
          label: 'Lägg till',
          cls: 'primary',
          onClick: () => {
            checkpoint();
            let last = null;
            Object.values(incoming.tournaments).forEach((x) => {
              if (db.tournaments[x.id]) x.id = L.uid();
              db.tournaments[x.id] = x;
              last = x.id;
            });
            if (last) db.activeId = last;
            ui.roundId = null;
            poDraft = null;
            commit(`${count} ${count === 1 ? 'turnering' : 'turneringar'} importerade`, true);
          },
        },
      ],
    });
  }

  /* ------------------------------ Timer ----------------------------- */

  const timer = { duration: 10 * 60 * 1000, remaining: 10 * 60 * 1000, endAt: 0, running: false, done: false, tick: null };

  function timerRemaining() {
    return timer.running ? Math.max(0, timer.endAt - Date.now()) : timer.remaining;
  }

  function fmtTime(ms) {
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function timerStart() {
    if (timer.running) return;
    if (timer.remaining <= 0) timer.remaining = timer.duration;
    timer.endAt = Date.now() + timer.remaining;
    timer.running = true;
    timer.done = false;
    keepScreenOn(true);
    clearInterval(timer.tick);
    timer.tick = setInterval(timerTick, 250);
    timerTick();
  }

  function timerPause() {
    if (!timer.running) return;
    timer.remaining = timerRemaining();
    timer.running = false;
    clearInterval(timer.tick);
    keepScreenOn(ui.big);
    timerTick();
  }

  function timerReset(ms) {
    timer.running = false;
    timer.done = false;
    clearInterval(timer.tick);
    if (ms) timer.duration = ms;
    timer.remaining = timer.duration;
    keepScreenOn(ui.big);
    timerTick();
  }

  function timerTick() {
    const left = timerRemaining();
    if (timer.running && left <= 0) {
      timer.running = false;
      timer.remaining = 0;
      timer.done = true;
      clearInterval(timer.tick);
      keepScreenOn(ui.big);
      beep();
      vibrate([600, 200, 600, 200, 600]);
      toast('⏰ Tiden är ute!');
    }
    const txt = fmtTime(left);
    const disp = $('#timerDisplay');
    if (disp) {
      disp.textContent = txt;
      disp.classList.toggle('done', timer.done);
    }
    const btn = $('#timerToggle');
    if (btn) btn.textContent = timer.running ? 'Paus' : 'Starta';
    const chip = $('#timerChip');
    const show = timer.running || timer.done || (timer.remaining !== timer.duration && timer.remaining > 0);
    chip.hidden = !show;
    chip.textContent = '⏱ ' + txt;
    chip.classList.toggle('done', timer.done);
  }

  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      [0, 0.45, 0.9].forEach((t0) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        o.type = 'square';
        g.gain.setValueAtTime(0.25, ctx.currentTime + t0);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t0 + 0.35);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + t0);
        o.stop(ctx.currentTime + t0 + 0.36);
      });
      setTimeout(() => ctx.close(), 1600);
    } catch (e) { /* inget ljud */ }
  }

  function timerDialog() {
    openModal({
      title: 'Matchtimer',
      body: `
        <div class="timer-display" id="timerDisplay">${fmtTime(timerRemaining())}</div>
        <div class="seg">
          ${[1, 3, 5, 10, 15, 20, 30].map((m) => `<button data-min="${m}">${m} min</button>`).join('')}
        </div>
        <div class="row">
          <button class="btn grow" data-adj="-60000">−1 min</button>
          <button class="btn grow" data-adj="60000">+1 min</button>
        </div>`,
      actions: [
        { label: 'Nollställ', onClick: () => { timerReset(); return false; } },
        { label: timer.running ? 'Paus' : 'Starta', cls: 'primary', onClick: () => { timer.running ? timerPause() : timerStart(); return false; } },
      ],
      onOpen: (w) => {
        const actions = $$('.modal-actions .btn', w);
        actions[1].id = 'timerToggle';
        w.addEventListener('click', (e) => {
          const b = e.target.closest('[data-min],[data-adj]');
          if (!b) return;
          if (b.dataset.min) timerReset(Number(b.dataset.min) * 60000);
          else {
            const d = Number(b.dataset.adj);
            if (timer.running) timer.endAt = Math.max(Date.now() + 1000, timer.endAt + d);
            else {
              timer.remaining = Math.max(1000, timer.remaining + d);
              timer.duration = Math.max(1000, timer.duration + d);
              timer.done = false;
            }
            timerTick();
          }
        });
        timerTick();
      },
    });
  }

  /* ---------------------------- Lottning ---------------------------- */

  function groupsDialog(t) {
    const rows = L.computeStandings(t);
    if (rows.length < 2) {
      toast('Det behövs minst 2 aktiva spelare');
      return;
    }
    let last = null;
    openModal({
      title: 'Lottning & grupper',
      body: `
        <label class="field"><span>Typ</span>
          <select id="gMode">
            <option value="pairs">Par (1 mot 1)</option>
            <option value="size">Grupper med X spelare</option>
            <option value="count">X antal grupper</option>
          </select>
        </label>
        <label class="field" id="gNumWrap" hidden><span id="gNumLabel">Antal</span><input type="number" id="gNum" min="1" value="4"></label>
        <label class="field"><span>Fördelning</span>
          <select id="gHow">
            <option value="random">Helt slumpad</option>
            <option value="snake">Efter tabellen (jämna grupper, ormfördelning)</option>
          </select>
        </label>
        <div id="gOut"></div>`,
      actions: [
        { label: 'Dela', onClick: () => { if (last) shareText('Lottning', last); else toast('Lotta först'); return false; } },
        { label: 'Lotta', cls: 'primary', onClick: (w) => { draw(w); return false; } },
      ],
      onOpen: (w) => {
        const upd = () => {
          const mode = $('#gMode', w).value;
          $('#gNumWrap', w).hidden = mode === 'pairs';
          $('#gNumLabel', w).textContent = mode === 'size' ? 'Spelare per grupp' : 'Antal grupper';
        };
        $('#gMode', w).addEventListener('change', upd);
        upd();
      },
    });

    function draw(w) {
      const mode = $('#gMode', w).value;
      const how = $('#gHow', w).value;
      const num = Math.max(1, Math.round(Number($('#gNum', w).value) || 1));
      const ids = rows.map((r) => r.id);
      let groups;
      if (mode === 'pairs') groups = L.makeGroups(ids, Math.ceil(ids.length / 2), how);
      else if (mode === 'size') groups = L.makeGroups(ids, Math.ceil(ids.length / num), how);
      else groups = L.makeGroups(ids, num, how);
      const label = (i) => (mode === 'pairs' ? `Match ${i + 1}` : `Grupp ${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ''}`);
      $('#gOut', w).innerHTML =
        `<div class="groups">` +
        groups
          .map(
            (g, i) =>
              `<div class="group"><h4>${label(i)}</h4>${
                mode === 'pairs'
                  ? `<div>${esc(pname(t, g[0]))}</div><div class="muted small">mot</div><div>${g[1] ? esc(pname(t, g[1])) : '<i class="muted">frilott</i>'}</div>`
                  : `<ol>${g.map((id) => `<li>${esc(pname(t, id))}</li>`).join('')}</ol>`
              }</div>`
          )
          .join('') +
        `</div>`;
      last = groups
        .map((g, i) => (mode === 'pairs' ? `${label(i)}: ${pname(t, g[0])} – ${g[1] ? pname(t, g[1]) : 'frilott'}` : `${label(i)}: ${g.map((id) => pname(t, id)).join(', ')}`))
        .join('\n');
    }
  }

  /* ------------------------------ Start ----------------------------- */

  $('#tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (b) setTab(b.dataset.tab);
  });
  $('#tournamentBtn').addEventListener('click', () => setTab('more'));
  $('#timerChip').addEventListener('click', timerDialog);

  // Bakåtknappen på Android: stäng dialog → gå till tabellen → avsluta
  window.appBack = function () {
    if (modalStack.length) {
      modalStack[modalStack.length - 1]();
      return true;
    }
    if (ui.big) {
      exitBig();
      return true;
    }
    if (ui.tab !== 'table') {
      setTab('table');
      return true;
    }
    return false;
  };

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      db = load();
      render();
    }
  });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !Bridge) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  render();
  timerTick();
})();
