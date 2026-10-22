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

  const DEFAULT_SETTINGS = { bestOf: 0, quickValues: '', cutoff: 32, teamScoring: 'sum', teamTopN: 3, rosterSize: 0, game: 'none', customStats: '', customGameName: '' };
  const TEAM_COLORS = ['#6c4dff', '#ff4d8d', '#12b886', '#ff9f1c', '#2ec5ff', '#f03e3e', '#3b82f6', '#be4bdb', '#40c057', '#fab005', '#15aabf', '#495057'];
  // Färgord i lagnamnet styr färgen, t.ex. "Lag Röd" blir rött
  const NAMED_COLORS = [
    [/röd|röda|red/i, '#f03e3e'], [/blå|blue/i, '#3b82f6'], [/grön|gröna|green/i, '#40c057'], [/gul|gula|yellow/i, '#fab005'],
    [/orange/i, '#ff9f1c'], [/lila|purple/i, '#be4bdb'], [/rosa|pink/i, '#ff4d8d'], [/turkos/i, '#15aabf'], [/svart|black/i, '#495057'],
  ];
  function colorForTeam(name, index) {
    const hit = NAMED_COLORS.find(([re]) => re.test(name));
    return hit ? hit[1] : TEAM_COLORS[index % TEAM_COLORS.length];
  }

  function newTournament(name, mode) {
    return {
      id: L.uid(),
      name: name,
      mode: mode === 'team' ? 'team' : 'individual',
      createdAt: Date.now(),
      players: [],
      teams: [],
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
    if (t.playoff && !t.playoff.kind) t.playoff.kind = 'player';
    if (!t.name) t.name = 'Turnering';
    if (t.mode !== 'team') t.mode = 'individual';
    if (t.format !== 'stages') t.format = 'league';
    t.stages = Array.isArray(t.stages) ? t.stages : [];
    t.statMaps = Array.isArray(t.statMaps) ? t.statMaps : [];
    if (!t.presetId) t.presetId = t.format === 'league' ? 'league' : 'custom';
    t.teams = Array.isArray(t.teams) ? t.teams : [];
    // Äldre versioner hade ett fritt "klubb"-fält – gör om det till lag
    t.players.forEach((p) => {
      if (p.club && !p.teamId) p.teamId = ensureTeam(t, p.club).id;
      delete p.club;
      if (p.teamId && !t.teams.some((x) => x.id === p.teamId)) delete p.teamId;
    });
    return t;
  }

  function freshDb() {
    const t = newTournament('Min turnering');
    return normalizeDb({ version: 1, activeId: t.id, tournaments: { [t.id]: t }, settings: { theme: 'auto' } });
  }

  function normalizeDb(d) {
    if (!d || typeof d !== 'object' || !d.tournaments || typeof d.tournaments !== 'object') return null;
    Object.entries(d.tournaments).forEach(([id, t]) => {
      t.id = id;
      normalize(t);
    });
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

  const ui = { wizard: null, statSort: null, statTeam: null, statMin: 1, stageIdx: null, tab: 'table', roundId: null, playerSearch: '', pointsSearch: '', pointsSort: 'name', big: false, playersView: 'players', tableView: 'players' };
  try {
    const saved = JSON.parse(localStorage.getItem(UI_KEY) || '{}');
    if (saved.tab) ui.tab = saved.tab;
    if (saved.roundId) ui.roundId = saved.roundId;
    if (saved.pointsSort) ui.pointsSort = saved.pointsSort;
    if (saved.playersView) ui.playersView = saved.playersView;
    if (saved.tableView) ui.tableView = saved.tableView;
  } catch (e) { /* ignorera */ }
  function saveUi() {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify({ tab: ui.tab, roundId: ui.roundId, pointsSort: ui.pointsSort, playersView: ui.playersView, tableView: ui.tableView }));
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
  const teamById = (t, id) => (t.teams || []).find((x) => x.id === id);
  const pname = (t, id) => {
    const p = playerById(t, id) || teamById(t, id);
    return p ? p.name : '(borttagen)';
  };
  const isTeamMode = (t) => t.mode === 'team';
  // Lag inom en individuell turnering (lagtävling)
  const hasTeams = (t) => !isTeamMode(t) && t.teams.length > 0;
  // Ord som skiljer sig mellan individuell turnering och lagturnering
  const W = (t) =>
    isTeamMode(t)
      ? { one: 'lag', One: 'Lag', def: 'laget', defs: 'lagen' }
      : { one: 'spelare', One: 'Spelare', def: 'spelaren', defs: 'spelarna' };

  function ensureTeam(t, name) {
    name = String(name).trim().replace(/\s+/g, ' ');
    let team = t.teams.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (!team) {
      team = { id: L.uid(), name: name, color: colorForTeam(name, t.teams.length) };
      t.teams.push(team);
    }
    return team;
  }

  function teamTag(t, p) {
    if (isTeamMode(t)) {
      const size = t.settings.rosterSize;
      const n = (p.members || []).length;
      const badge = size ? `<span class="roster ${n < size ? 'short' : ''}">${n}/${size}</span> ` : '';
      return n || size ? `<div class="sub">${badge}${esc((p.members || []).join(', '))}</div>` : '';
    }
    const team = p.teamId && teamById(t, p.teamId);
    return team ? `<div class="sub"><span class="team-tag"><i style="background:${esc(team.color)}"></i>${esc(team.name)}</span></div>` : '';
  }
  const teamDot = (team) => `<i class="team-dot" style="background:${esc(team.color)}"></i>`;

  function fmt(n) {
    if (n == null || !isFinite(n)) return '–';
    return Number.isInteger(n) ? String(n) : String(L.round2(n)).replace('.', ',');
  }

  // Svenska ordningstal: 1:a, 2:a, 3:e … 11:e, 12:e, 21:a
  function ordinal(n) {
    const end = (n % 10 === 1 || n % 10 === 2) && n % 100 !== 11 && n % 100 !== 12 ? 'a' : 'e';
    return n + ':' + end;
  }

  const splitNames = (str) =>
    String(str || '')
      .split(/[\n,;]+/)
      .map((x) => x.trim().replace(/\s+/g, ' '))
      .filter(Boolean);

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
    // Där nedladdningar är spärrade (t.ex. inbäddad sida) visas innehållet för kopiering
    if (window.TURNERING_NO_DOWNLOAD) {
      openModal({
        title: name,
        body: `<p class="small muted">Kopiera texten och spara den, t.ex. i Anteckningar. Den kan klistras in igen under Importera.</p><textarea class="share-text" readonly id="saveText">${esc(content)}</textarea>`,
        actions: [
          {
            label: 'Kopiera',
            cls: 'primary',
            onClick: (w) => {
              const ta = $('#saveText', w);
              ta.select();
              Promise.resolve(navigator.clipboard && navigator.clipboard.writeText(content)).then(() => toast('Kopierat'), () => toast('Markerat – kopiera med Ctrl+C / håll inne'));
              return false;
            },
          },
        ],
      });
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
    if (meta) meta.content = dark ? '#0b0b1d' : '#eef0ff';
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
    $('#tabbar [data-tab="players"] span').textContent = W(t).One;
    const staged = isStages(t);
    $('#tabbar [data-tab="points"] span').textContent = staged ? 'Matcher' : 'Poäng';
    $('#tabbar [data-tab="table"] span').textContent = staged ? 'Bracket' : 'Tabell';
    $('#tabbar [data-tab="playoff"] span').textContent = staged ? 'Format' : 'Slutspel';
    const statsOn = !!gameOf(t);
    $('#tabbar [data-tab="stats"]').hidden = !statsOn;
    $('#tabbar').classList.toggle('six', statsOn);
    if (!statsOn && ui.tab === 'stats') ui.tab = 'table';
    document.body.classList.toggle('big', ui.big);
    document.body.classList.toggle('wizard', !!ui.wizard);
    const view = $('#view');
    view.className = 'view view-' + (ui.wizard ? 'wizard' : ui.tab);
    view.onclick = view.oninput = view.onchange = view.onkeydown = view.onsubmit = null;
    $('#topActions').innerHTML = '';
    if (ui.wizard) {
      $('#tName').textContent = 'Ny turnering';
      return renderWizard(view);
    }
    const renderers = staged
      ? { players: renderPlayers, points: renderStageMatches, table: renderStageBracket, playoff: renderStageFormat, stats: renderStats, more: renderMore }
      : { players: renderPlayers, points: renderPoints, table: renderTable, playoff: renderPlayoff, stats: renderStats, more: renderMore };
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

  function playersSeg(t) {
    if (isTeamMode(t)) return '';
    return `<div class="seg top-seg">
      <button data-action="pview" data-v="players" class="${ui.playersView !== 'teams' ? 'on' : ''}">Spelare (${t.players.length})</button>
      <button data-action="pview" data-v="teams" class="${ui.playersView === 'teams' ? 'on' : ''}">Lag (${t.teams.length})</button>
    </div>`;
  }

  function renderPlayers(view, t) {
    if (!isTeamMode(t) && ui.playersView === 'teams') return renderTeams(view, t);
    const w = W(t);
    const active = t.players.filter((p) => p.active !== false).length;
    view.innerHTML = `
      ${playersSeg(t)}
      <section class="card">
        <form class="add-row" id="addForm" autocomplete="off">
          <input type="text" id="newPlayer" placeholder="Namn på ${isTeamMode(t) ? 'nytt lag' : 'ny spelare'}" enterkeyhint="done" maxlength="60">
          <button class="btn primary" type="submit">${icon('add')}Lägg till</button>
        </form>
        <div class="row wrap" style="margin-top:10px">
          <button class="btn small ghost" data-action="bulk">Lägg till flera</button>
          <button class="btn small ghost" data-action="shufflePick">${icon('dice')}Slumpa ${w.one}</button>
        </div>
      </section>
      ${t.players.length ? `
      <div class="list-head">
        <span class="count">${active} aktiva${active !== t.players.length ? ` / ${t.players.length}` : ''}</span>
        <input type="search" id="playerSearch" placeholder="Sök ${w.one}" value="${esc(ui.playerSearch)}">
      </div>
      <ul class="list" id="playerList"></ul>` : emptyState('people', `Inga ${w.one} än`, isTeamMode(t) ? 'Skriv in lagnamn ovan. Medlemmar kan läggas till per lag.' : 'Skriv in namn ovan, eller lägg till många på en gång.', 'Lägg till flera', 'bulk')}
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
      t.players.push(isTeamMode(t) ? { id: L.uid(), name: name, members: [], active: true } : { id: L.uid(), name: name, active: true });
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
      if (a.dataset.action === 'pview') {
        ui.playersView = a.dataset.v;
        saveUi();
        render();
      } else if (a.dataset.action === 'bulk') bulkAddDialog(t);
      else if (a.dataset.action === 'shufflePick') randomPlayerDialog(t);
      else if (a.dataset.action === 'edit') editPlayerDialog(t, id);
      else if (a.dataset.action === 'toggle') {
        const p = playerById(t, id);
        p.active = p.active === false;
        commit(p.active ? `${p.name} är aktiv${isTeamMode(t) ? 't' : ''} igen` : `${p.name} är inaktiv${isTeamMode(t) ? 't' : ''} (räknas inte i tabellen)`);
      }
    };
  }

  function fillPlayerList(t) {
    const ul = $('#playerList');
    if (!ul) return;
    const q = ui.playerSearch.trim().toLowerCase();
    const list = t.players
      .map((p, i) => ({ p: p, i: i }))
      .filter((x) => {
        if (!q) return true;
        const team = x.p.teamId && teamById(t, x.p.teamId);
        return x.p.name.toLowerCase().includes(q) || (team && team.name.toLowerCase().includes(q)) || (x.p.members || []).some((m) => m.toLowerCase().includes(q));
      });
    ul.innerHTML = list.length
      ? list
          .map(
            ({ p, i }) => `
        <li class="${p.active === false ? 'inactive' : ''}">
          <span class="num">${i + 1}</span>
          <div class="grow tap" data-action="edit" data-id="${p.id}">
            <div class="name">${esc(p.name)}</div>
            ${teamTag(t, p)}
          </div>
          <label class="check" title="Aktiv"><input type="checkbox" data-action="toggle" data-id="${p.id}" ${p.active !== false ? 'checked' : ''}></label>
          <button class="icon-btn" data-action="edit" data-id="${p.id}" aria-label="Redigera">${icon('edit')}</button>
        </li>`
          )
          .join('')
      : `<li class="muted">Inget matchar sökningen</li>`;
  }

  function bulkAddDialog(t) {
    const team = isTeamMode(t);
    openModal({
      title: team ? 'Lägg till flera lag' : 'Lägg till flera spelare',
      body: team
        ? `<p class="muted small">Ett lag per rad. Skriv medlemmar efter ett kolon, t.ex. <i>Lag Röd: Anna, Erik, Sara</i>.</p>
             <textarea id="bulkText" placeholder="Lag Röd: Anna, Erik&#10;Lag Blå: Sara, Johan&#10;…" autofocus></textarea>`
        : `<p class="muted small">Ett namn per rad. Lägg till lag efter ett kommatecken, t.ex. <i>Anna Svensson, Lag Röd</i> – laget skapas automatiskt.</p>
             <textarea id="bulkText" placeholder="Anna Svensson&#10;Erik Johansson, Lag Röd&#10;…" autofocus></textarea>`,
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
              let name;
              let extra = '';
              if (team) {
                const i = line.indexOf(':');
                name = (i >= 0 ? line.slice(0, i) : line).trim().replace(/\s+/g, ' ');
                extra = i >= 0 ? line.slice(i + 1) : '';
              } else {
                const parts = line.split(/[,;\t]/);
                name = (parts[0] || '').trim().replace(/\s+/g, ' ');
                extra = parts.slice(1).join(' ').trim();
              }
              if (!name) return;
              if (existing.has(name.toLowerCase())) {
                dup++;
                return;
              }
              existing.add(name.toLowerCase());
              const p = { id: L.uid(), name: name, active: true };
              if (team) p.members = splitNames(extra);
              else if (extra) p.teamId = ensureTeam(t, extra).id;
              t.players.push(p);
              added++;
            });
            commit(`${added} ${team ? 'lag' : 'spelare'} tillagda` + (dup ? ` (${dup} dubbletter hoppades över)` : ''));
          },
        },
      ],
    });
  }

  function editPlayerDialog(t, id) {
    const p = playerById(t, id);
    if (!p) return;
    const inPlayoff = t.playoff && t.playoff.seeds.includes(id);
    const team = isTeamMode(t);
    const extraField = team
      ? `<label class="field"><span>Spelare i laget, en per rad${t.settings.rosterSize ? ` (${t.settings.rosterSize} st)` : ''}</span><textarea id="epMembers" style="min-height:110px">${esc((p.members || []).join('\n'))}</textarea></label>`
      : `<label class="field"><span>Lag</span>
          <select id="epTeam">
            <option value="">Inget lag</option>
            ${t.teams.map((x) => `<option value="${x.id}" ${p.teamId === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}
            <option value="__new">+ Nytt lag…</option>
          </select>
        </label>
        <label class="field" id="epNewTeamWrap" hidden><span>Namn på nytt lag</span><input type="text" id="epNewTeam" maxlength="60"></label>`;
    openModal({
      title: team ? 'Redigera lag' : 'Redigera spelare',
      body: `
        <label class="field"><span>Namn</span><input type="text" id="epName" value="${esc(p.name)}" maxlength="60"></label>
        ${extraField}
        <label class="check"><input type="checkbox" id="epActive" ${p.active !== false ? 'checked' : ''}> Aktiv (räknas i tabellen)</label>
        <button class="btn danger-text ghost block" id="epDelete" style="margin-top:10px">${icon('del')}Ta bort ${team ? 'lag' : 'spelare'}</button>`,
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
            if (team) p.members = splitNames($('#epMembers', w).value);
            else {
              const sel = $('#epTeam', w).value;
              if (sel === '__new') {
                const nn = $('#epNewTeam', w).value.trim();
                if (!nn) {
                  toast('Skriv ett namn på det nya laget');
                  return false;
                }
                p.teamId = ensureTeam(t, nn).id;
              } else if (sel) p.teamId = sel;
              else delete p.teamId;
            }
            p.active = $('#epActive', w).checked;
            commit('Sparat');
          },
        },
      ],
      onOpen: (w, close) => {
        const sel = $('#epTeam', w);
        if (sel) sel.onchange = () => ($('#epNewTeamWrap', w).hidden = sel.value !== '__new');
        $('#epDelete', w).onclick = () => {
          close();
          confirmDialog(
            team ? 'Ta bort lag?' : 'Ta bort spelare?',
            `${p.name} och alla ${team ? 'lagets' : 'hens'} poäng tas bort.` + (inPlayoff ? ` ${team ? 'Laget' : 'Spelaren'} finns också i slutspelet.` : ''),
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
      toast(`Inga aktiva ${W(t).one}`);
      return;
    }
    const pick = () => pool[Math.floor(Math.random() * pool.length)].name;
    openModal({
      title: `Slumpa ${W(t).one}`,
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

  /* ------------------------------- Lag ------------------------------- */

  function renderTeams(view, t) {
    const unassigned = t.players.filter((p) => p.active !== false && !(p.teamId && teamById(t, p.teamId))).length;
    view.innerHTML = `
      ${playersSeg(t)}
      <section class="card">
        <form class="add-row" id="addTeamForm" autocomplete="off">
          <input type="text" id="newTeam" placeholder="Namn på nytt lag" enterkeyhint="done" maxlength="60">
          <button class="btn primary" type="submit">${icon('add')}Lägg till</button>
        </form>
        <div class="row wrap" style="margin-top:10px">
          <button class="btn small ghost" data-action="autoTeams">${icon('shuffle')}Fördela spelare i lag</button>
        </div>
      </section>
      ${t.teams.length ? `
        <div class="list-head"><span class="count">${t.teams.length} lag</span>${unassigned ? `<span class="small muted">· ${unassigned} spelare saknar lag</span>` : ''}</div>
        <ul class="list">
          ${t.teams
            .map((team) => {
              const members = t.players.filter((p) => p.teamId === team.id);
              const names = members.slice(0, 5).map((p) => p.name).join(', ') + (members.length > 5 ? ' …' : '');
              return `<li class="tap" data-action="editTeam" data-id="${team.id}">
                <span class="team-swatch" style="background:${esc(team.color)}"></span>
                <div class="grow"><div class="name">${esc(team.name)}</div><div class="sub">${members.length} spelare${names ? ' · ' + esc(names) : ''}</div></div>
                ${icon('edit')}
              </li>`;
            })
            .join('')}
        </ul>
        <p class="small muted" style="text-align:center">Lagens poäng räknas ihop från spelarnas poäng och visas under Tabell → Lag.</p>`
        : emptyState('people', 'Inga lag än', 'Skapa lag och placera spelarna i dem – då får du en lagtabell där lagens poäng räknas ihop.', 'Fördela spelare automatiskt', 'autoTeams')}
    `;
    view.onsubmit = (e) => {
      e.preventDefault();
      const name = $('#newTeam').value.trim().replace(/\s+/g, ' ');
      if (!name) return;
      if (t.teams.some((x) => x.name.toLowerCase() === name.toLowerCase())) {
        toast(`"${name}" finns redan`);
        return;
      }
      ensureTeam(t, name);
      save();
      render();
      toast(`${name} skapat`);
      $('#newTeam').focus();
    };
    view.onclick = (e) => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      if (a.dataset.action === 'pview') {
        ui.playersView = a.dataset.v;
        saveUi();
        render();
      } else if (a.dataset.action === 'autoTeams') autoTeamsDialog(t);
      else if (a.dataset.action === 'editTeam') editTeamDialog(t, a.dataset.id);
    };
  }

  function editTeamDialog(t, teamId) {
    const team = teamById(t, teamId);
    if (!team) return;
    let color = team.color;
    const players = t.players.slice().sort((a, b) => a.name.localeCompare(b.name, 'sv', { numeric: true }));
    openModal({
      title: 'Redigera lag',
      body: `
        <label class="field"><span>Namn</span><input type="text" id="etName" value="${esc(team.name)}" maxlength="60"></label>
        <div class="field"><span>Färg</span>
          <div class="swatches">${TEAM_COLORS.map((c) => `<button type="button" data-color="${c}" class="${c === color ? 'on' : ''}" style="background:${c}" aria-label="Färg"></button>`).join('')}</div>
        </div>
        <div class="field"><span>Medlemmar (${t.players.filter((p) => p.teamId === team.id).length})</span>
          <div class="member-box">
            ${players.length ? players
              .map((p) => {
                const other = p.teamId && p.teamId !== team.id && teamById(t, p.teamId);
                return `<label class="check member-row"><input type="checkbox" value="${p.id}" ${p.teamId === team.id ? 'checked' : ''}><span class="grow">${esc(p.name)}</span>${other ? `<span class="small muted">${esc(other.name)}</span>` : ''}</label>`;
              })
              .join('') : '<p class="muted small">Lägg till spelare först.</p>'}
          </div>
        </div>
        <button class="btn danger-text ghost block" id="etDelete">${icon('del')}Ta bort lag</button>`,
      actions: [
        { label: 'Avbryt' },
        {
          label: 'Spara',
          cls: 'primary',
          onClick: (w) => {
            const name = $('#etName', w).value.trim().replace(/\s+/g, ' ');
            if (!name) return false;
            if (t.teams.some((x) => x !== team && x.name.toLowerCase() === name.toLowerCase())) {
              toast('Det namnet finns redan');
              return false;
            }
            team.name = name;
            team.color = color;
            $$('.member-row input', w).forEach((cb) => {
              const p = playerById(t, cb.value);
              if (cb.checked) p.teamId = team.id;
              else if (p.teamId === team.id) delete p.teamId;
            });
            commit('Laget sparat');
          },
        },
      ],
      onOpen: (w, close) => {
        $$('.swatches button', w).forEach((b) =>
          b.addEventListener('click', () => {
            color = b.dataset.color;
            $$('.swatches button', w).forEach((x) => x.classList.toggle('on', x === b));
          })
        );
        $('#etDelete', w).onclick = () => {
          close();
          confirmDialog('Ta bort lag?', `${team.name} tas bort. Spelarna och deras poäng finns kvar, men utan lag.`, 'Ta bort', () => {
            checkpoint();
            t.players.forEach((p) => {
              if (p.teamId === team.id) delete p.teamId;
            });
            t.teams = t.teams.filter((x) => x !== team);
            commit(`${team.name} borttaget`, true);
          });
        };
      },
    });
  }

  // Placerar grupper av spelar-id i lag. replace = ersätt hela lagindelningen.
  function applyGroupsAsTeams(t, groups, names, replace) {
    checkpoint();
    if (replace) {
      t.players.forEach((p) => delete p.teamId);
      t.teams = [];
    }
    groups.forEach((g, i) => {
      let team = t.teams[i];
      if (!team) {
        const name = (names && names[i]) || 'Lag ' + (i + 1);
        team = { id: L.uid(), name: name, color: colorForTeam(name, i) };
        t.teams.push(team);
      }
      g.forEach((pid) => {
        const p = playerById(t, pid);
        if (p) p.teamId = team.id;
      });
    });
  }

  function autoTeamsDialog(t) {
    const rows = L.computeStandings(t);
    if (rows.length < 2) {
      toast('Det behövs minst 2 aktiva spelare');
      return;
    }
    openModal({
      title: 'Fördela spelare i lag',
      body: `
        <label class="field"><span>Antal lag</span><input type="number" id="atCount" min="2" max="${rows.length}" value="${Math.max(2, t.teams.length || 2)}"></label>
        <label class="field"><span>Fördelning</span>
          <select id="atHow">
            <option value="random">Slumpad</option>
            <option value="snake">Jämna lag efter tabellen (ormfördelning)</option>
          </select>
        </label>
        <label class="field"><span>Vilka spelare</span>
          <select id="atScope">
            <option value="all">Alla aktiva spelare (gör om indelningen)</option>
            <option value="free">Bara spelare som saknar lag</option>
          </select>
        </label>
        <p class="small muted">Befintliga lag återanvänds. Saknas lag skapas de som Lag 1, Lag 2 …</p>`,
      actions: [
        { label: 'Avbryt' },
        {
          label: 'Fördela',
          cls: 'primary',
          onClick: (w) => {
            const n = Math.max(2, Math.min(rows.length, Math.round(Number($('#atCount', w).value) || 2)));
            const how = $('#atHow', w).value;
            const scope = $('#atScope', w).value;
            if (scope === 'all') {
              applyGroupsAsTeams(t, L.makeGroups(rows.map((r) => r.id), n, how), null, false);
            } else {
              const free = rows.filter((r) => !(r.player.teamId && teamById(t, r.player.teamId))).map((r) => r.id);
              if (!free.length) {
                toast('Alla spelare har redan ett lag');
                return false;
              }
              applyGroupsAsTeams(t, Array.from({ length: n }, () => []), null, false);
              const order = how === 'snake' ? free : L.shuffle(free);
              const teams = t.teams.slice(0, n);
              order.forEach((pid) => {
                const size = (team) => t.players.filter((p) => p.teamId === team.id && p.active !== false).length;
                const target = teams.reduce((best, team) => (size(team) < size(best) ? team : best), teams[0]);
                playerById(t, pid).teamId = target.id;
              });
            }
            ui.playersView = 'teams';
            saveUi();
            commit('Spelarna är fördelade i lag', true);
          },
        },
      ],
    });
  }

  /* ----------------------------- Poäng ------------------------------ */

  function renderPoints(view, t) {
    const activePlayers = t.players.filter((p) => p.active !== false);
    if (!activePlayers.length) {
      view.innerHTML = emptyState('people', `Lägg till ${W(t).one} först`, `Poäng matas in per omgång för varje aktiv${isTeamMode(t) ? 't lag' : ' spelare'}.`, `Gå till ${W(t).One}`, 'goPlayers');
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
          ${hasTeams(t) ? `<option value="team" ${ui.pointsSort === 'team' ? 'selected' : ''}>Lag</option>` : ''}
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
    let n = t.rounds.length + 1;
    while (t.rounds.some((x) => x.name === 'Omgång ' + n)) n++;
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
    if (txt) txt.textContent = `${filled} av ${active.length} ${W(t).one} har poäng`;
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
    else if (ui.pointsSort === 'team' && hasTeams(t)) {
      const tn = (p) => (p.teamId && teamById(t, p.teamId) ? teamById(t, p.teamId).name : '\uffff');
      list.sort((a, b) => tn(a).localeCompare(tn(b), 'sv', { numeric: true }) || a.name.localeCompare(b.name, 'sv', { numeric: true }));
    }
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
            <div class="name">${!isTeamMode(t) && p.teamId && teamById(t, p.teamId) ? teamDot(teamById(t, p.teamId)) : ''}${esc(p.name)}</div>
            <div class="sub" data-total="${p.id}"></div>
            ${quick.length ? `<div class="quick">${quick.map((q) => `<button data-action="quick" data-pid="${p.id}" data-v="${q}">${fmt(q)}</button>`).join('')}</div>` : ''}
          </div>
          <input class="score-input ${L.isNum(v) ? 'filled' : ''}" type="number" step="any" data-pid="${p.id}" value="${L.isNum(v) ? v : ''}" placeholder="–" enterkeyhint="next" aria-label="Poäng för ${esc(p.name)}">
        </li>`;
          })
          .join('')
      : '<li class="muted">Inget matchar sökningen</li>';
    updateScoreTotals(t, round);
  }

  /* ----------------------------- Tabell ----------------------------- */

  function cutoffFor(t, kind) {
    kind = kind || 'player';
    if (t.playoff) return (t.playoff.kind || 'player') === kind ? t.playoff.seeds.length : 0;
    return kind === 'player' && t.settings.cutoff > 0 ? t.settings.cutoff : 0;
  }

  function tableSeg(t) {
    if (!hasTeams(t) || ui.big) return '';
    return `<div class="seg top-seg">
      <button data-action="tview" data-v="players" class="${ui.tableView !== 'teams' ? 'on' : ''}">Individuellt</button>
      <button data-action="tview" data-v="teams" class="${ui.tableView === 'teams' ? 'on' : ''}">Lag</button>
    </div>`;
  }

  function tableClicks(view, t, onRow) {
    view.onclick = (e) => {
      if (e.target.closest('[data-action="exitBig"]')) {
        exitBig();
        return;
      }
      const seg = e.target.closest('[data-action="tview"]');
      if (seg) {
        ui.tableView = seg.dataset.v;
        saveUi();
        render();
        return;
      }
      const tr = e.target.closest('tr[data-id]');
      if (tr) onRow(tr.dataset.id);
    };
  }

  function bigButton() {
    topAction('full', 'Storbildsläge', () => {
      ui.big = true;
      keepScreenOn(true);
      render();
    });
  }

  function renderTable(view, t) {
    if (hasTeams(t) && ui.tableView === 'teams') return renderTeamTable(view, t);
    const rows = L.standingsWithMovement(t);
    topAction('share', 'Dela tabell', () => shareText(t.name + ' – tabell', standingsText(t, rows)));
    bigButton();
    if (!rows.length) {
      view.innerHTML = emptyState('chart', 'Tabellen är tom', `Lägg till ${W(t).one} och mata in poäng, så räknas tabellen ut automatiskt.`, `Lägg till ${W(t).one}`, 'goPlayers');
      view.onclick = (e) => e.target.closest('[data-action="goPlayers"]') && setTab('players');
      return;
    }
    const cutoff = cutoffFor(t);
    const scoredRounds = t.rounds.filter(L.roundHasScores).length;
    const info = [];
    info.push(`${rows.length} ${W(t).one}`);
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
          <td class="l"><div class="pname">${esc(r.name)}${mv}</div>${clubLine(t, r.player)}</td>
          <td>${r.played}</td>
          <td class="hide-narrow">${fmt(r.best)}</td>
          <td>${fmt(r.avg)}</td>
          <td class="total">${fmt(r.total)}</td>
        </tr>`;
    });
    view.innerHTML = `
      ${ui.big ? `<div class="big-title">${esc(t.name)}</div>` : ''}
      ${tableSeg(t)}
      <div class="small muted" style="margin:0 4px 8px">${info.join(' · ')}</div>
      <table class="standings">
        <thead><tr><th>#</th><th class="l">${W(t).One}</th><th>Omg</th><th class="hide-narrow">Bäst</th><th>Snitt</th><th>Poäng</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
      ${ui.big ? `<button class="btn big-exit" data-action="exitBig">${icon('exitFull')}Avsluta</button>` : `<p class="small muted" style="text-align:center">Tryck på ${isTeamMode(t) ? 'ett lag' : 'en spelare'} för detaljer</p>`}
    `;
    tableClicks(view, t, (id) => playerStatsDialog(t, id));
  }

  function clubLine(t, p) {
    if (isTeamMode(t)) return p.members && p.members.length ? `<div class="pclub">${esc(p.members.join(', '))}</div>` : '';
    const team = p.teamId && teamById(t, p.teamId);
    return team ? `<div class="pclub">${teamDot(team)}${esc(team.name)}</div>` : '';
  }

  function teamScoringText(t) {
    const s = t.settings;
    if (s.teamScoring === 'avg') return 'lagpoäng = snitt per medlem';
    if (s.teamScoring === 'top') return `lagpoäng = de ${s.teamTopN} bästa i laget`;
    return 'lagpoäng = summan av medlemmarna';
  }

  function renderTeamTable(view, t) {
    const rows = L.standingsWithMovement(t, L.computeTeamStandings);
    topAction('share', 'Dela lagtabell', () => shareText(t.name + ' – lagtabell', standingsText(t, rows, 'team')));
    bigButton();
    const cutoff = cutoffFor(t, 'team');
    let body = '';
    rows.forEach((r, i) => {
      if (cutoff && i === cutoff && cutoff < rows.length) {
        body += `<tr class="cutoff"><td colspan="5"><div>▲ Slutspelsgräns – topp ${cutoff} ▲</div></td></tr>`;
      }
      const mv = r.move > 0 ? `<span class="move up">▲${r.move}</span>` : r.move < 0 ? `<span class="move down">▼${-r.move}</span>` : '';
      body += `
        <tr class="tap r${r.rank} ${cutoff && i >= cutoff ? 'out' : ''}" data-id="${r.id}">
          <td class="rank"><span>${r.tied ? '=' : ''}${r.rank}</span></td>
          <td class="l"><div class="pname">${teamDot(r.team)}${esc(r.name)}${mv}</div></td>
          <td>${r.size}</td>
          <td class="hide-narrow">${fmt(r.best)}</td>
          <td class="total">${fmt(r.total)}</td>
        </tr>`;
    });
    view.innerHTML = `
      ${ui.big ? `<div class="big-title">${esc(t.name)} – lag</div>` : ''}
      ${tableSeg(t)}
      <div class="small muted" style="margin:0 4px 8px">${rows.length} lag · ${teamScoringText(t)}</div>
      <table class="standings">
        <thead><tr><th>#</th><th class="l">Lag</th><th>Medl</th><th class="hide-narrow">Bäst</th><th>Poäng</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
      ${ui.big ? `<button class="btn big-exit" data-action="exitBig">${icon('exitFull')}Avsluta</button>` : '<p class="small muted" style="text-align:center">Tryck på ett lag för att se medlemmarna.</p>'}
    `;
    tableClicks(view, t, (id) => teamStatsDialog(t, id));
  }

  function teamStatsDialog(t, id) {
    const rows = L.computeTeamStandings(t);
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    openModal({
      title: r.name,
      body: `
        <div class="stat-grid">
          <div class="stat"><b>${r.rank}</b><span>Placering</span></div>
          <div class="stat"><b>${fmt(r.total)}</b><span>Lagpoäng</span></div>
          <div class="stat"><b>${r.size}</b><span>Medlemmar</span></div>
        </div>
        ${r.members.length ? `<table class="mini-table"><thead><tr><th class="l">Spelare</th><th>Omg</th><th>Poäng</th><th>Plac.</th></tr></thead><tbody>
          ${r.members.map((m) => `<tr><td class="l">${esc(m.name)}</td><td>${m.played}</td><td>${fmt(m.total)}</td><td>${ordinal(m.rank)}</td></tr>`).join('')}
        </tbody></table>` : '<p class="muted">Laget har inga aktiva spelare.</p>'}
        <p class="small muted" style="margin-top:10px">${teamScoringText(t)[0].toUpperCase() + teamScoringText(t).slice(1)}. Ändras under Mer.</p>`,
      actions: [{ label: 'Redigera lag', onClick: () => { setTimeout(() => editTeamDialog(t, id), 0); } }],
    });
  }

  function exitBig() {
    ui.big = false;
    keepScreenOn(timer.running);
    render();
  }

  function standingsText(t, rows, kind) {
    const lines = [`${t.name} – ${kind === 'team' ? 'Lagtabell' : 'Tabell'}`, ''];
    const cutoff = cutoffFor(t, kind);
    rows.forEach((r, i) => {
      if (cutoff && i === cutoff) lines.push('— slutspelsgräns —');
      lines.push(kind === 'team' ? `${r.rank}. ${r.name}  ${fmt(r.total)} p (${r.size} spelare)` : `${r.rank}. ${r.name}  ${fmt(r.total)} p (${r.played} omg)`);
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
        ${clubLine(t, r.player).replace('class="pclub"', 'class="muted" style="margin-bottom:10px"')}
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
          label: isTeamMode(t) ? 'Redigera lag' : 'Redigera spelare',
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
        <div class="grow small muted">${po.seeds.length} ${po.kind === 'team' || isTeamMode(t) ? 'lag' : 'spelare'} · ${po.seeding === 'random' ? 'slumpad lottning' : 'seedat efter tabellen'} · ${res.playedMatches}/${res.totalMatches} matcher spelade</div>
      </div>
      ${bracketCanvas(t, leagueTreeNodes(res))}
      <p class="small muted">Tryck på en match för att skriva in resultat. Svep åt sidan för att se hela trädet.</p>
      <div class="row wrap">
        <button class="btn danger-text ghost" data-action="deletePo">${icon('del')}Ta bort slutspel</button>
      </div>
    `;
    view.onclick = (e) => {
      const mEl = e.target.closest('[data-action="match"]');
      if (mEl) {
        matchDialog(t, mEl.dataset.id);
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
    applyBracketScroll(view);
  }

  function renderPlayoffSetup(view, t) {
    if (!poDraft) poDraft = { kind: 'player', count: t.settings.cutoff || 32, seeding: 'standard', thirdPlace: true };
    const kind = hasTeams(t) && poDraft.kind === 'team' ? 'team' : 'player';
    const unit = kind === 'team' || isTeamMode(t) ? 'lag' : 'spelare';
    const rows = kind === 'team' ? L.computeTeamStandings(t) : L.computeStandings(t);
    const kindSeg = hasTeams(t)
      ? `<div class="seg top-seg">
          <button data-action="kind" data-v="player" class="${kind === 'player' ? 'on' : ''}">Spelare</button>
          <button data-action="kind" data-v="team" class="${kind === 'team' ? 'on' : ''}">Lag</button>
        </div>`
      : '';
    if (rows.length < 2) {
      view.innerHTML = kindSeg + emptyState('trophy', 'Inget slutspel än', `Det behövs minst 2 ${unit} i tabellen för att skapa ett slutspel.`, kind === 'team' ? 'Skapa lag' : `Lägg till ${W(t).one}`, 'goPlayers');
      view.onclick = (e) => {
        const k = e.target.closest('[data-action="kind"]');
        if (k) {
          poDraft.kind = k.dataset.v;
          render();
        } else if (e.target.closest('[data-action="goPlayers"]')) {
          if (kind === 'team') ui.playersView = 'teams';
          setTab('players');
        }
      };
      return;
    }
    poDraft.count = Math.max(2, Math.min(poDraft.count, rows.length));
    const presets = [4, 8, 16, 32, 64].filter((n) => n <= rows.length);
    const n = poDraft.count;
    const size = L.nextPow2(n);
    const qualified = rows.slice(0, n);
    let warn = '';
    if (n < rows.length && rows[n - 1].total === rows[n].total) {
      const tiedNames = rows.filter((r) => r.total === rows[n - 1].total).map((r) => r.name);
      warn = `<div class="warn">⚠️ Delad poäng vid gränsen: ${esc(tiedNames.join(', '))} har ${fmt(rows[n - 1].total)} p. Särskiljs på ${kind === 'team' ? 'lagets bästa spelare' : 'bästa omgång, sedan snitt'}. Justera poängen om ni vill avgöra på annat sätt.</div>`;
    }
    const byes = size - n;

    view.innerHTML = `
      ${kindSeg}
      <section class="card">
        <h3>Skapa slutspel${kind === 'team' ? ' mellan lag' : ''}</h3>
        <p>De bästa ${unit === 'lag' ? 'lagen' : 'spelarna'} i ${kind === 'team' ? 'lagtabellen' : 'tabellen'} placeras automatiskt in i slutspelsträdet.</p>
        <label class="field"><span>Antal ${unit} till slutspel</span></label>
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
        ${byes ? `<p class="small" style="margin-top:8px">${byes} topp-seedade ${unit} går direkt vidare (walk over) eftersom ${n} inte är en jämn trädstorlek (${size}).</p>` : ''}
        <button class="btn primary block" data-action="create" style="margin-top:10px">${icon('trophy')}Skapa slutspel med ${n} ${unit}</button>
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
      if (a.dataset.action === 'kind') {
        poDraft.kind = a.dataset.v;
        poDraft.count = a.dataset.v === 'team' ? Infinity : t.settings.cutoff || 32;
        render();
      } else if (a.dataset.action === 'count') {
        poDraft.count = Number(a.dataset.n);
        render();
      } else if (a.dataset.action === 'create') {
        const ids = rows.slice(0, poDraft.count).map((r) => r.id);
        t.playoff = L.createPlayoff(ids, { seeding: poDraft.seeding, thirdPlace: poDraft.thirdPlace });
        t.playoff.kind = kind;
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
            <div class="sub">${x.format === 'stages' ? esc(presetName(x)) + ' · ' : x.mode === 'team' ? 'Lagturnering · ' : ''}${x.players.length} ${W(x).one}${x.format === 'stages' ? '' : ` · ${x.rounds.length} ${x.rounds.length === 1 ? 'omgång' : 'omgångar'}${x.playoff ? ' · slutspel' : ''}`}</div></div>
            ${x.id === db.activeId ? '<span class="small" style="color:var(--primary);font-weight:700">AKTIV</span>' : ''}
          </li>`
          )
          .join('')}
      </ul>
      <div class="row wrap" style="margin-top:10px">
        <button class="btn small primary" data-action="newT">${icon('add')}Ny turnering</button>
        <button class="btn small" data-action="renameT">Byt namn</button>
        <button class="btn small" data-action="copyT">Kopiera ${W(t).one} till ny</button>
        <button class="btn small danger-text" data-action="deleteT">Ta bort</button>
      </div>

      <div class="section-title">Typ av turnering (${esc(t.name)})</div>
      <section class="card">
        <div class="seg" style="margin-bottom:8px">
          <button data-action="mode" data-v="individual" class="${!isTeamMode(t) ? 'on' : ''}">Individuell</button>
          <button data-action="mode" data-v="team" class="${isTeamMode(t) ? 'on' : ''}">Lagturnering</button>
        </div>
        <p class="small" style="margin:0">${isTeamMode(t)
          ? 'Lagen är deltagarna och varje lag har en spelarlista.'
          : isStages(t) ? 'Varje spelare tävlar för sig själv.' : 'Spelarna är deltagarna. Placera dem i lag under Spelare → Lag för att även få en lagtabell och kunna spela slutspel mellan lag.'}</p>
        ${isTeamMode(t) ? `<label class="field" style="margin:12px 0 0"><span>Spelare per lag (0 = valfritt)</span><input type="number" min="0" id="setRoster" value="${t.settings.rosterSize || 0}"></label>` : ''}
        <div class="row" style="margin-top:12px"><div class="grow"><div class="small muted">Format</div><b>${esc(isStages(t) ? presetName(t) : 'Poängliga')}</b></div><button class="btn small" data-action="changeFormat">Byt format</button></div>
      </section>

      ${statsSettingsHtml(t)}

      <div class="section-title">Verktyg</div>
      <ul class="list">
        <li class="tap" data-action="timer">${icon('timer')}<div class="grow"><div class="name">Matchtimer</div><div class="sub">Nedräkning med larm</div></div></li>
        <li class="tap" data-action="groups">${icon('shuffle')}<div class="grow"><div class="name">Lottning & grupper</div><div class="sub">Slumpa par eller dela in i grupper</div></div></li>
        <li class="tap" data-action="random">${icon('dice')}<div class="grow"><div class="name">Slumpa ${isTeamMode(t) ? 'ett lag' : 'en spelare'}</div><div class="sub">T.ex. vem som börjar</div></div></li>
      </ul>

      ${isStages(t) ? '' : `<div class="section-title">Poängräkning (${esc(t.name)})</div>
      <section class="card">
        <label class="field"><span>Räkna bara bästa X omgångar (0 = alla)</span><input type="number" min="0" id="setBestOf" value="${t.settings.bestOf || 0}"></label>
        <label class="field"><span>Snabbknappar för poäng (t.ex. 3, 1, 0)</span><input type="text" id="setQuick" value="${esc(t.settings.quickValues)}" placeholder="Tomt = inga snabbknappar"></label>
        <label class="field" style="margin-bottom:0"><span>Visa slutspelsgräns i tabellen efter plats (0 = ingen)</span><input type="number" min="0" id="setCutoff" value="${t.settings.cutoff || 0}"></label>
        ${!isTeamMode(t) ? `
        <label class="field" style="margin:12px 0 0"><span>Lagpoäng i lagtabellen</span>
          <select id="setTeamScoring">
            <option value="sum" ${t.settings.teamScoring === 'sum' ? 'selected' : ''}>Summan av alla medlemmars poäng</option>
            <option value="avg" ${t.settings.teamScoring === 'avg' ? 'selected' : ''}>Snitt per medlem (rättvist vid olika lagstorlek)</option>
            <option value="top" ${t.settings.teamScoring === 'top' ? 'selected' : ''}>Summan av de X bästa i laget</option>
          </select>
        </label>
        ${t.settings.teamScoring === 'top' ? `<label class="field" style="margin:12px 0 0"><span>X = antal som räknas per lag</span><input type="number" min="1" id="setTeamTopN" value="${t.settings.teamTopN}"></label>` : ''}` : ''}
      </section>`}

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
            ui.stageIdx = null;
            poDraft = null;
            commit(`Bytte till ${T().name}`);
          }
          break;
        case 'newT':
          newTournamentDialog();
          break;
        case 'clearKey':
          try {
            localStorage.removeItem(KEY_STORE);
          } catch (err) {
            /* ignorera */
          }
          commit('API-nyckeln är borttagen');
          break;
        case 'changeFormat':
          presetPicker((p) => {
            const go = () => {
              checkpoint();
              applyPreset(t, p);
              poDraft = null;
              commit(`Format: ${p.name}`, true);
            };
            if (t.stages.some((s) => s.status !== 'setup') || (t.format === 'league' && t.rounds.length && p.format !== 'league'))
              confirmDialog('Byta format?', 'Pågående faser nollställs. Deltagare och poängomgångar finns kvar.', 'Byt format', go);
            else go();
          }, isStages(t) ? t.presetId : 'league');
          break;
        case 'mode':
          if (a.dataset.v !== t.mode) {
            t.mode = a.dataset.v;
            poDraft = null;
            commit(isTeamMode(t) ? 'Nu är det en lagturnering' : 'Nu är det en individuell turnering');
          }
          break;
        case 'renameT':
          promptDialog('Byt namn på turnering', 'Namn', t.name, (v) => {
            t.name = v;
            commit('Sparat');
          });
          break;
        case 'copyT':
          promptDialog(`Ny turnering med samma ${W(t).one}`, 'Namn', t.name + ' (2)', (v) => {
            const nt = newTournament(v, t.mode);
            nt.players = t.players.map((p) => {
              const c = { id: L.uid(), name: p.name, active: true };
              if (p.teamId) c.teamId = p.teamId;
              if (p.members) c.members = p.members.slice();
              return c;
            });
            nt.teams = t.teams.map((x) => Object.assign({}, x));
            nt.settings = Object.assign({}, t.settings);
            nt.format = t.format;
            nt.presetId = t.presetId;
            nt.stages = t.stages.map((s) => {
              const c = SG.newStage(s.type, s.name);
              c.cfg = Object.assign({}, s.cfg);
              return c;
            });
            db.tournaments[nt.id] = nt;
            db.activeId = nt.id;
            ui.roundId = null;
            poDraft = null;
            commit(`${v} skapad med ${nt.players.length} ${W(nt).one}`);
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
      } else if (id === 'setGame') {
        t.settings.game = e.target.value;
        commit(t.settings.game === 'none' ? 'Statistik avstängd' : 'Spel valt – statistik finns under Stats');
      } else if (id === 'setCustomName') {
        t.settings.customGameName = e.target.value.trim();
        commit('Sparat');
      } else if (id === 'setCustomStats') {
        t.settings.customStats = e.target.value.trim();
        commit('Sparat');
      } else if (id === 'setApiKey') {
        const v = e.target.value.trim();
        if (v && !v.startsWith('••')) {
          try {
            localStorage.setItem(KEY_STORE, v);
          } catch (err) {
            /* ignorera */
          }
          commit('API-nyckeln är sparad på den här enheten');
        }
      } else if (id === 'setModel') {
        try {
          localStorage.setItem(MODEL_STORE, e.target.value.trim() || DEFAULT_MODEL);
        } catch (err) {
          /* ignorera */
        }
        commit('Modell sparad');
      } else if (id === 'setRoster') {
        t.settings.rosterSize = Math.max(0, Math.round(Number(e.target.value) || 0));
        commit('Sparat');
      } else if (id === 'setTeamScoring') {
        t.settings.teamScoring = e.target.value;
        commit('Lagpoäng uppdaterad');
      } else if (id === 'setTeamTopN') {
        t.settings.teamTopN = Math.max(1, Math.round(Number(e.target.value) || 1));
        commit('Lagpoäng uppdaterad');
      }
    };
  }

  function newTournamentDialog() {
    startWizard();
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
    const head = ['Placering', 'Namn', isTeamMode(t) ? 'Medlemmar' : 'Lag', 'Omgångar', 'Bäst', 'Snitt', 'Totalt'].concat(t.rounds.map((r) => r.name));
    const lines = [head.map(cell).join(';')];
    rows.forEach((r) => {
      const extra = isTeamMode(t) ? (r.player.members || []).join(', ') : r.player.teamId && teamById(t, r.player.teamId) ? teamById(t, r.player.teamId).name : '';
      lines.push([r.rank, r.name, extra, r.played, r.best, r.avg, r.total].concat(r.perRound).map(cell).join(';'));
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
      const id = data.id || L.uid();
      data = { tournaments: { [id]: data }, activeId: id };
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
              // Före start ändras också längden som Nollställ går tillbaka till
              if (!timer.done && timer.remaining === timer.duration) timer.duration = Math.max(1000, timer.duration + d);
              timer.remaining = Math.max(1000, timer.remaining + d);
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
      toast(`Det behövs minst 2 aktiva ${W(t).one}`);
      return;
    }
    let last = null;
    let lastGroups = null;
    openModal({
      title: 'Lottning & grupper',
      body: `
        <label class="field"><span>Typ</span>
          <select id="gMode">
            <option value="pairs">Par (1 mot 1)</option>
            <option value="size">Grupper med X ${W(t).one}</option>
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
          $('#gNumLabel', w).textContent = mode === 'size' ? `${W(t).One} per grupp` : 'Antal grupper';
        };
        $('#gMode', w).addEventListener('change', upd);
        upd();
        w.addEventListener('click', (e) => {
          if (!e.target.closest('[data-gsave]') || !lastGroups) return;
          const names = lastGroups.map((g, i) => 'Lag ' + String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : ''));
          applyGroupsAsTeams(t, lastGroups, names, true);
          ui.playersView = 'teams';
          saveUi();
          modalStack[modalStack.length - 1]();
          commit(`${lastGroups.length} lag skapade från grupperna`, true);
        });
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
      lastGroups = mode === 'pairs' || isTeamMode(t) ? null : groups;
      if (lastGroups) {
        $('#gOut', w).insertAdjacentHTML(
          'beforeend',
          `<button class="btn block" data-gsave style="margin-top:12px">${icon('people')}Spara grupperna som lag</button><p class="small muted">Ersätter nuvarande lagindelning (kan ångras).</p>`
        );
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Faser: gruppspel, Swiss, utslagning, dubbelutslagning, heat         */
  /* ------------------------------------------------------------------ */

  const SG = window.TStages;
  const isStages = (t) => t.format === 'stages';
  const BO_OPTIONS = [1, 2, 3, 5, 7];

  function sameSet(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    const s = new Set(a);
    return b.every((x) => s.has(x));
  }

  // Deltagare som går in i fas i (före eventuell egen seedning)
  function defaultEntrants(t, i) {
    if (i === 0) return t.players.filter((p) => p.active !== false).map((p) => p.id);
    const prev = t.stages[i - 1];
    if (!prev || !prev.data) return [];
    return SG.resolve(prev).qualifiers;
  }

  function seedsFor(t, i) {
    const st = t.stages[i];
    const def = defaultEntrants(t, i);
    return st.customSeeds && sameSet(st.customSeeds, def) ? st.customSeeds : def;
  }

  function canStart(t, i) {
    const st = t.stages[i];
    if (!st || st.status !== 'setup') return false;
    if (i > 0) {
      const prev = t.stages[i - 1];
      if (prev.status === 'setup' || !SG.resolve(prev).done) return false;
    }
    return seedsFor(t, i).length >= 2;
  }

  function activeStageIndex(t) {
    let idx = -1;
    t.stages.forEach((s, i) => s.status !== 'setup' && (idx = i));
    return idx;
  }

  function stageLocked(t, i) {
    const next = t.stages[i + 1];
    return !!(next && next.status !== 'setup');
  }

  function boText(bo) {
    if (!bo) return '';
    return `Bo${bo}`;
  }

  function stageSummary(st) {
    const c = st.cfg;
    switch (st.type) {
      case 'gsl':
        return `${c.groups} grupper · topp ${c.advancePerGroup} vidare · ${boText(c.bo)}`;
      case 'rr':
        return `${c.groups} ${c.groups === 1 ? 'grupp' : 'grupper'} · topp ${c.advancePerGroup} vidare · ${boText(c.bo)} · ${c.pointsWin}/${c.pointsDraw}/${c.pointsLoss} p${c.doubleRound ? ' · dubbelmöten' : ''}`;
      case 'swiss':
        return `${c.winsToAdvance} vinster vidare · ${c.lossesToElim} förluster ute · ${boText(c.bo)}, avgörande ${boText(c.decisiveBo)}`;
      case 'single':
        return `${boText(c.bo)} · semifinal ${boText(c.semiBo)} · final ${boText(c.finalBo)}${c.third ? ' · bronsmatch' : ''}`;
      case 'double':
        return `${boText(c.bo)} · övre final ${boText(c.ubFinalBo)} · undre final ${boText(c.lbFinalBo)} · final ${boText(c.gfBo)}${c.gfReset ? ' (med omstart)' : ''}`;
      case 'heats':
        return `${c.heatSize} per heat · topp ${c.advancePerHeat} vidare · ${c.races} ${c.races === 1 ? 'race' : 'race'} per heat`;
      case 'lobbies':
        return `${lobbyLabel(c.size)} · ${c.rounds} ${c.rounds === 1 ? 'omgång' : 'omgångar'} · max ${c.maxPoints} p · ${c.advance > 0 ? `topp ${c.advance} vidare` : 'alla vidare'}`;
    }
    return '';
  }

  const lobbyLabel = (size) => Array(Math.max(2, size || 4)).fill('1').join('v') + '-lobbyer';

  function presetName(t) {
    const p = SG.PRESETS.find((x) => x.id === t.presetId);
    return p ? p.name : 'Anpassat';
  }

  function applyPreset(t, preset) {
    if (preset.format === 'league') {
      t.format = 'league';
      t.stages = [];
    } else {
      t.format = 'stages';
      t.stages = SG.stagesFromPreset(preset);
    }
    t.presetId = preset.id;
    if (!t.players.length && preset.mode) t.mode = preset.mode;
    if (preset.rosterSize) t.settings.rosterSize = preset.rosterSize;
    if (preset.game) t.settings.game = preset.game;
  }

  function presetPicker(onPick, current) {
    openModal({
      title: 'Välj format',
      body: `<div class="preset-list">${SG.PRESETS.map(
        (p) => `<button class="preset ${p.id === current ? 'on' : ''}" data-preset="${p.id}">
          <b>${esc(p.name)}</b><span>${esc(p.desc)}</span>
          <span class="preset-tags">${p.mode === 'team' ? `<i>Lag${p.rosterSize ? ' om ' + p.rosterSize : ''}</i>` : '<i>Individuell</i>'}${(p.stages || []).map((s) => `<i>${esc(SG.TYPES[s.type].short)}</i>`).join('')}</span>
        </button>`
      ).join('')}</div>`,
      onOpen: (w, close) =>
        $$('[data-preset]', w).forEach((b) =>
          b.addEventListener('click', () => {
            close();
            onPick(SG.PRESETS.find((p) => p.id === b.dataset.preset));
          })
        ),
    });
  }

  function participantName(t, id) {
    return id ? pname(t, id) : '';
  }

  /* ----------------------------- Format ----------------------------- */

  function renderStageFormat(view, t) {
    const started = t.stages.some((s) => s.status !== 'setup');
    const last = t.stages[t.stages.length - 1];
    const lastR = last && last.data ? SG.resolve(last) : null;
    let html = '';
    if (lastR && lastR.done) html += championBanner(t, lastR) + placementsCard(t, lastR);

    html += `
      <section class="card">
        <div class="row">
          <div class="grow"><h3 style="margin:0">${esc(presetName(t))}</h3><div class="small muted">${t.stages.length} ${t.stages.length === 1 ? 'fas' : 'faser'} · ${defaultEntrants(t, 0).length} ${W(t).one} anmälda</div></div>
          <button class="btn small" data-action="preset">Byt format</button>
        </div>
      </section>`;

    t.stages.forEach((st, i) => {
      const R = st.data ? SG.resolve(st) : null;
      const status = st.status === 'setup' ? (canStart(t, i) ? 'Redo att starta' : 'Ej startad') : R && R.done ? 'Klar' : 'Pågår';
      const pill = st.status === 'setup' ? (canStart(t, i) ? 'ready' : 'idle') : R && R.done ? 'done' : 'live';
      html += `
        <section class="card stage-card">
          <div class="row">
            <span class="stage-no">${i + 1}</span>
            <div class="grow"><h3 style="margin:0">${esc(st.name)}</h3><div class="small muted">${esc(SG.TYPES[st.type].label)}</div></div>
            <span class="pill ${pill}">${status}</span>
          </div>
          <p class="small" style="margin:8px 0 0">${esc(stageSummary(st))}</p>
          ${st.status === 'setup' ? stageConfigForm(t, st, i) : ''}
          ${st.status === 'setup' && canStart(t, i) ? seedingEditor(t, i) : ''}
          ${st.status === 'setup' && !canStart(t, i) ? `<p class="small muted" style="margin-top:10px">${i === 0 ? `Lägg till minst 2 ${W(t).one} för att starta.` : 'Startar när föregående fas är klar.'}</p>` : ''}
          <div class="row wrap" style="margin-top:12px">
            ${st.status === 'setup' && canStart(t, i) ? `<button class="btn primary" data-action="startStage" data-i="${i}">${icon('trophy')}Starta ${esc(st.name.toLowerCase())}</button>` : ''}
            ${st.status !== 'setup' ? `<button class="btn small" data-action="openStage" data-i="${i}">Visa ${R && R.done ? 'resultat' : 'bracket'}</button>` : ''}
            ${st.status !== 'setup' ? `<button class="btn small danger-text" data-action="resetStage" data-i="${i}">Återställ fas</button>` : ''}
            ${st.status === 'setup' ? `
              <button class="icon-btn" data-action="moveStage" data-i="${i}" data-d="-1" aria-label="Flytta upp" ${i === 0 ? 'disabled' : ''}>▲</button>
              <button class="icon-btn" data-action="moveStage" data-i="${i}" data-d="1" aria-label="Flytta ner" ${i === t.stages.length - 1 ? 'disabled' : ''}>▼</button>
              <button class="btn small ghost danger-text" data-action="delStage" data-i="${i}">${icon('del')}Ta bort fas</button>` : ''}
          </div>
        </section>`;
    });

    html += `<button class="btn block" data-action="addStage" ${started && last && last.status !== 'setup' && lastR && lastR.done ? '' : ''}>${icon('add')}Lägg till fas</button>`;
    if (!t.stages.length) html += `<p class="small muted" style="text-align:center">Välj en mall eller lägg till faser själv.</p>`;
    view.innerHTML = html;

    view.onclick = (e) => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      const i = Number(a.dataset.i);
      const st = t.stages[i];
      switch (a.dataset.action) {
        case 'preset':
          presetPicker((p) => {
            const go = () => {
              checkpoint();
              applyPreset(t, p);
              commit(`Format: ${p.name}`, true);
            };
            if (started) confirmDialog('Byta format?', 'Alla faser och resultat i turneringen nollställs. Deltagarna finns kvar.', 'Byt format', go);
            else go();
          }, t.presetId);
          break;
        case 'addStage':
          addStageDialog(t);
          break;
        case 'delStage':
          checkpoint();
          t.stages.splice(i, 1);
          t.presetId = 'custom';
          commit('Fasen borttagen', true);
          break;
        case 'moveStage': {
          const j = i + Number(a.dataset.d);
          if (j < 0 || j >= t.stages.length || t.stages[j].status !== 'setup') return;
          [t.stages[i], t.stages[j]] = [t.stages[j], t.stages[i]];
          t.presetId = 'custom';
          commit();
          break;
        }
        case 'startStage': {
          const seeds = seedsFor(t, i);
          const problem = startProblem(st, seeds.length);
          if (problem) {
            toast(problem);
            return;
          }
          SG.start(st, seeds);
          ui.stageIdx = i;
          commit(`${st.name} har startat!`);
          break;
        }
        case 'openStage':
          ui.stageIdx = i;
          setTab('table');
          break;
        case 'resetStage':
          confirmDialog(
            'Återställa fasen?',
            `Alla resultat i ${st.name}${i < t.stages.length - 1 ? ' och senare faser' : ''} tas bort.`,
            'Återställ',
            () => {
              checkpoint();
              for (let k = i; k < t.stages.length; k++) SG.reset(t.stages[k]);
              commit(`${st.name} återställd`, true);
            }
          );
          break;
        case 'seedUp':
        case 'seedDown': {
          const seeds = seedsFor(t, i).slice();
          const k = Number(a.dataset.k);
          const j = k + (a.dataset.action === 'seedUp' ? -1 : 1);
          if (j < 0 || j >= seeds.length) return;
          [seeds[k], seeds[j]] = [seeds[j], seeds[k]];
          st.customSeeds = seeds;
          save();
          render();
          break;
        }
        case 'seedShuffle':
          st.customSeeds = L.shuffle(seedsFor(t, i));
          commit('Seedningen slumpades');
          break;
        case 'seedReset':
          st.customSeeds = null;
          commit('Seedningen återställd');
          break;
      }
    };
    view.onchange = (e) => {
      const el = e.target;
      if (!el.dataset.cfg) return;
      const st = t.stages[Number(el.dataset.i)];
      const key = el.dataset.cfg;
      if (key === 'name') st.name = el.value.trim() || SG.TYPES[st.type].short;
      else if (el.type === 'checkbox') st.cfg[key] = el.checked;
      else if (el.dataset.kind === 'text') st.cfg[key] = el.value;
      else {
        const v = Math.round(Number(el.value));
        if (!isFinite(v)) return;
        st.cfg[key] = Math.max(Number(el.min || 0), v);
      }
      t.presetId = t.presetId === 'league' ? 'custom' : t.presetId;
      commit();
    };
  }

  function startProblem(st, n) {
    const c = st.cfg;
    if (st.type === 'heats' && c.advancePerHeat >= c.heatSize) return 'Antal som går vidare måste vara mindre än heatstorleken';
    if (st.type === 'double' && n < 3) return 'Dubbelutslagning kräver minst 3 deltagare';
    if (st.type === 'swiss' && n < 4) return 'Swiss kräver minst 4 deltagare';
    if ((st.type === 'gsl' || st.type === 'rr') && c.groups < 1) return 'Minst 1 grupp';
    return '';
  }

  function cfgField(i, key, label, value, opts) {
    opts = opts || {};
    if (opts.bo) {
      return `<label class="field"><span>${label}</span><select data-cfg="${key}" data-i="${i}">${BO_OPTIONS.map((b) => `<option value="${b}" ${b === value ? 'selected' : ''}>Bo${b}</option>`).join('')}</select></label>`;
    }
    if (opts.check) return `<label class="check"><input type="checkbox" data-cfg="${key}" data-i="${i}" ${value ? 'checked' : ''}> ${label}</label>`;
    if (opts.text) return `<label class="field"><span>${label}</span><input type="text" data-kind="text" data-cfg="${key}" data-i="${i}" value="${esc(value)}"></label>`;
    return `<label class="field"><span>${label}</span><input type="number" inputmode="numeric" data-cfg="${key}" data-i="${i}" min="${opts.min != null ? opts.min : 0}" value="${value}"></label>`;
  }

  function stageConfigForm(t, st, i) {
    const c = st.cfg;
    const n = seedsFor(t, i).length || defaultEntrants(t, 0).length;
    const isLast = i === t.stages.length - 1;
    let f = cfgField(i, 'name', 'Namn på fasen', st.name, { text: true }).replace('data-kind="text" data-cfg="name"', 'data-cfg="name"');
    let hint = '';
    switch (st.type) {
      case 'gsl':
        f += `<div class="cfg-grid">${cfgField(i, 'groups', 'Antal grupper', c.groups, { min: 1 })}${cfgField(i, 'advancePerGroup', 'Vidare per grupp', c.advancePerGroup, { min: 1 })}</div>`;
        f += `<div class="cfg-grid">${cfgField(i, 'bo', 'Matcher', c.bo, { bo: true })}${cfgField(i, 'deciderBo', 'Avgörande match', c.deciderBo, { bo: true })}</div>`;
        if (n) hint = `${n} ${W(t).one} → ${c.groups} grupper om ca ${Math.ceil(n / c.groups)}. ${c.groups * c.advancePerGroup} går vidare.${Math.ceil(n / c.groups) > 4 ? ' GSL-grupper har max 4 – lägg till fler grupper.' : ''}`;
        break;
      case 'rr':
        f += `<div class="cfg-grid">${cfgField(i, 'groups', 'Antal grupper', c.groups, { min: 1 })}${cfgField(i, 'advancePerGroup', 'Vidare per grupp', c.advancePerGroup, { min: 0 })}</div>`;
        f += cfgField(i, 'bo', 'Matcher', c.bo, { bo: true });
        f += `<div class="cfg-grid three">${cfgField(i, 'pointsWin', 'Poäng vinst', c.pointsWin)}${cfgField(i, 'pointsDraw', 'Oavgjort', c.pointsDraw)}${cfgField(i, 'pointsLoss', 'Förlust', c.pointsLoss)}</div>`;
        f += cfgField(i, 'allowDraw', 'Tillåt oavgjort', c.allowDraw, { check: true }) + cfgField(i, 'doubleRound', 'Mötas två gånger (hemma/borta)', c.doubleRound, { check: true });
        if (n) hint = `${n} ${W(t).one} → ${c.groups} ${c.groups === 1 ? 'grupp' : 'grupper'} om ca ${Math.ceil(n / c.groups)}.`;
        break;
      case 'swiss':
        f += `<div class="cfg-grid">${cfgField(i, 'winsToAdvance', 'Vinster för att gå vidare', c.winsToAdvance, { min: 1 })}${cfgField(i, 'lossesToElim', 'Förluster för att åka ut', c.lossesToElim, { min: 1 })}</div>`;
        f += `<div class="cfg-grid">${cfgField(i, 'bo', 'Matcher', c.bo, { bo: true })}${cfgField(i, 'decisiveBo', 'Avgörande matcher', c.decisiveBo, { bo: true })}</div>`;
        hint = 'Avgörande = matcher där någon kan gå vidare eller åka ut.';
        break;
      case 'single':
        f += `<div class="cfg-grid three">${cfgField(i, 'bo', 'Matcher', c.bo, { bo: true })}${cfgField(i, 'semiBo', 'Semifinal', c.semiBo, { bo: true })}${cfgField(i, 'finalBo', 'Final', c.finalBo, { bo: true })}</div>`;
        f += cfgField(i, 'third', 'Match om tredjepris', c.third, { check: true });
        if (!isLast) f += cfgField(i, 'advance', 'Antal vidare till nästa fas (0 = alla)', c.advance);
        if (n) hint = `${n} ${W(t).one}${L.nextPow2(n) > n ? ` – ${L.nextPow2(n) - n} topp-seedade får walk over` : ''}.`;
        break;
      case 'double':
        f += `<div class="cfg-grid">${cfgField(i, 'bo', 'Matcher', c.bo, { bo: true })}${cfgField(i, 'ubFinalBo', 'Övre final', c.ubFinalBo, { bo: true })}</div>`;
        f += `<div class="cfg-grid">${cfgField(i, 'lbFinalBo', 'Undre final', c.lbFinalBo, { bo: true })}${cfgField(i, 'gfBo', 'Final', c.gfBo, { bo: true })}</div>`;
        f += cfgField(i, 'gfReset', 'Omstart om laget från undre trädet vinner finalen', c.gfReset, { check: true });
        if (!isLast) f += cfgField(i, 'advance', 'Antal vidare till nästa fas (0 = alla)', c.advance);
        if (n) hint = `${n} ${W(t).one}${L.nextPow2(Math.max(n, 4)) > n ? ` – ${L.nextPow2(Math.max(n, 4)) - n} topp-seedade får walk over` : ''}.`;
        break;
      case 'heats':
        f += `<div class="cfg-grid three">${cfgField(i, 'heatSize', 'Per heat', c.heatSize, { min: 2 })}${cfgField(i, 'advancePerHeat', 'Vidare per heat', c.advancePerHeat, { min: 1 })}${cfgField(i, 'races', 'Race per heat', c.races, { min: 1 })}</div>`;
        f += cfgField(i, 'points', 'Poäng per placering (1:a, 2:a, 3:e …)', c.points, { text: true });
        if (!isLast) f += cfgField(i, 'advance', 'Antal vidare till nästa fas (0 = alla)', c.advance);
        if (n) hint = heatPlan(n, c);
        break;
      case 'lobbies':
        f += `<div class="cfg-grid three">${cfgField(i, 'size', 'Per lobby', c.size, { min: 2 })}${cfgField(i, 'rounds', 'Omgångar', c.rounds, { min: 1 })}${cfgField(i, 'maxPoints', 'Maxpoäng per lobby', c.maxPoints, { min: 1 })}</div>`;
        f += cfgField(i, 'advance', 'Antal vidare till nästa fas (0 = alla)', c.advance);
        if (n) {
          const sizes = SG.splitLobbies(Array(n).fill(0), Math.max(2, c.size)).map((g) => g.length);
          hint = `${n} deltagare → ${sizes.length} ${sizes.length === 1 ? 'lobby' : 'lobbyer'} (${sizes.join('+')}) per omgång, slumpade. ${c.advance > 0 && c.advance < n ? `De ${c.advance} med flest poäng går vidare.` : 'Alla går vidare, seedade efter poäng.'}`;
        }
        break;
    }
    return `<details class="cfg"><summary>Inställningar</summary><div class="cfg-body">${f}${hint ? `<p class="small muted" style="margin:0">${esc(hint)}</p>` : ''}</div></details>`;
  }

  function heatPlan(n, c) {
    if (c.advancePerHeat >= c.heatSize) return 'Antal som går vidare måste vara mindre än antal per heat.';
    const steps = [];
    let left = n;
    for (let guard = 0; guard < 12 && left > c.heatSize; guard++) {
      const heats = Math.ceil(left / c.heatSize);
      steps.push(`${left} → ${heats} heat`);
      const next = Math.min(left, heats * c.advancePerHeat);
      if (next >= left) break;
      left = next;
    }
    steps.push(`final med ${left}`);
    return steps.join(' · ');
  }

  function seedingEditor(t, i) {
    const seeds = seedsFor(t, i);
    const st = t.stages[i];
    return `<details class="cfg" ${st.customSeeds ? 'open' : ''}><summary>Seedning (${seeds.length})</summary><div class="cfg-body">
      <div class="row wrap"><button class="btn small" data-action="seedShuffle" data-i="${i}">${icon('shuffle')}Slumpa</button>${st.customSeeds ? `<button class="btn small ghost" data-action="seedReset" data-i="${i}">Återställ</button>` : ''}</div>
      <ol class="seed-list">${seeds
        .map(
          (id, k) => `<li><span class="seedno">${k + 1}</span><span class="grow">${esc(pname(t, id))}</span>
          <button class="icon-btn" data-action="seedUp" data-i="${i}" data-k="${k}" aria-label="Upp" ${k === 0 ? 'disabled' : ''}>▲</button>
          <button class="icon-btn" data-action="seedDown" data-i="${i}" data-k="${k}" aria-label="Ner" ${k === seeds.length - 1 ? 'disabled' : ''}>▼</button></li>`
        )
        .join('')}</ol>
      <p class="small muted" style="margin:0">${i === 0 ? `Ordningen kommer från listan under ${W(t).One}.` : 'Ordningen kommer från resultatet i föregående fas.'} Seed 1 är starkast.</p>
    </div></details>`;
  }

  function addStageDialog(t) {
    openModal({
      title: 'Lägg till fas',
      body: `<div class="preset-list">${Object.entries(SG.TYPES)
        .map(([k, v]) => `<button class="preset" data-type="${k}"><b>${esc(v.label)}</b><span>${esc(v.desc)}</span></button>`)
        .join('')}</div>`,
      onOpen: (w, close) =>
        $$('[data-type]', w).forEach((b) =>
          b.addEventListener('click', () => {
            close();
            const st = SG.newStage(b.dataset.type);
            if (t.stages.length) st.name = b.dataset.type === 'single' || b.dataset.type === 'double' ? 'Slutspel' : st.name;
            t.stages.push(st);
            t.format = 'stages';
            t.presetId = 'custom';
            commit(`${SG.TYPES[st.type].label} tillagd`);
          })
        ),
    });
  }

  function championBanner(t, R) {
    if (!R.champion) return '';
    const second = R.placements[1] || [];
    const third = R.placements[2] || [];
    return `
      <div class="champion">
        ${icon('trophy')}
        <div class="small">Vinnare</div>
        <div class="cname">${esc(pname(t, R.champion))}</div>
        <div class="podium">
          ${second.length ? `<span>🥈 ${esc(second.map((id) => pname(t, id)).join(', '))}</span>` : ''}
          ${third.length ? `<span>🥉 ${esc(third.map((id) => pname(t, id)).join(', '))}</span>` : ''}
        </div>
      </div>`;
  }

  function placementsCard(t, R) {
    let pos = 1;
    const rows = R.placements
      .map((tier) => {
        const label = tier.length > 1 ? `${pos}–${pos + tier.length - 1}` : `${pos}`;
        pos += tier.length;
        return `<li><span class="seedno">${label}.</span><span>${esc(tier.map((id) => pname(t, id)).join(', '))}</span></li>`;
      })
      .join('');
    return `<section class="card"><h3>Slutplaceringar</h3><ol class="qual-list">${rows}</ol>
      <button class="btn small" data-share-final style="margin-top:10px">${icon('share')}Dela resultat</button></section>`;
  }

  function finalText(t, R) {
    let pos = 1;
    const lines = [`${t.name} – Resultat`, ''];
    R.placements.forEach((tier) => {
      const label = tier.length > 1 ? `${pos}–${pos + tier.length - 1}` : `${pos}`;
      pos += tier.length;
      lines.push(`${label}. ${tier.map((id) => pname(t, id)).join(', ')}`);
    });
    return lines.join('\n');
  }

  /* ----------------------------- Matcher ---------------------------- */

  function pickStage(t) {
    const started = t.stages.map((s, i) => i).filter((i) => t.stages[i].status !== 'setup');
    if (!started.length) return -1;
    if (ui.stageIdx == null || !started.includes(ui.stageIdx)) ui.stageIdx = started[started.length - 1];
    return ui.stageIdx;
  }

  function stageChips(t, cur) {
    if (t.stages.length < 2) return '';
    return `<div class="chips">${t.stages
      .map((s, i) => `<button class="chip ${i === cur ? 'on' : ''}" data-action="selStage" data-i="${i}" ${s.status === 'setup' ? 'disabled' : ''}>${esc(s.name)}${s.status === 'setup' ? ' 🔒' : ''}</button>`)
      .join('')}</div>`;
  }

  function noStageState(view, t) {
    view.innerHTML = emptyState('trophy', 'Ingen fas har startat', t.stages.length ? 'Gå till Format för att kontrollera inställningar och seedning och starta första fasen.' : 'Välj ett format först, t.ex. Valorant Champions, CS Major eller Mario Kart.', 'Gå till Format', 'goFormat');
    view.onclick = (e) => e.target.closest('[data-action="goFormat"]') && setTab('playoff');
  }

  function nextStageBanner(t, i, R) {
    if (!R.done) return '';
    const next = t.stages[i + 1];
    if (!next) return '';
    if (next.status !== 'setup') return '';
    return `<div class="banner">${icon('trophy')}<div class="grow"><b>${esc(t.stages[i].name)} är klar!</b><div class="small">${R.qualifiers.length} går vidare till ${esc(next.name)}.</div></div><button class="btn small primary" data-action="goFormat">Till nästa fas</button></div>`;
  }

  function matchLine(t, m, i) {
    const name = (id, side) => {
      if (id) return esc(pname(t, id));
      return m.state === 'bye' ? '<i class="muted">Walk over</i>' : '<span class="muted">-</span>';
    };
    const cls = (id) => (m.winner && id === m.winner ? 'win' : m.winner && id ? 'lose' : '');
    const score = (v) => (v != null ? fmt(v) : '');
    return `<button class="mline ${m.state}" data-action="match" data-i="${i}" data-id="${m.id}">
      <span class="mline-meta">${esc(m.groupName ? m.groupName + ' · ' : '')}${esc(m.label || '')}${m.bo ? ` · ${boText(m.bo)}` : ''}</span>
      <span class="mline-row ${cls(m.a)}"><span class="pn">${name(m.a)}</span><span class="ps">${score(m.sa)}</span></span>
      <span class="mline-row ${cls(m.b)}"><span class="pn">${name(m.b)}</span><span class="ps">${score(m.sb)}</span></span>
      ${m.draw ? '<span class="mline-meta">Oavgjort</span>' : ''}
      ${m.note ? `<span class="mline-note">${esc(m.note)}</span>` : ''}
    </button>`;
  }

  function decorate(R) {
    if (R.groups) R.groups.forEach((g) => g.matches.forEach((m) => (m.groupName = g.name)));
    if (R.groups) {
      const byId = {};
      R.groups.forEach((g) => g.matches.forEach((m) => (byId[m.id] = g.name)));
      R.matches.forEach((m) => byId[m.id] && (m.groupName = byId[m.id]));
    }
    return R;
  }

  function renderStageMatches(view, t) {
    const i = pickStage(t);
    if (i < 0) return noStageState(view, t);
    const st = t.stages[i];
    const R = decorate(SG.resolve(st));
    let html = stageChips(t, i) + nextStageBanner(t, i, R);
    if (st.type === 'lobbies') {
      html += `<p class="small muted" style="margin:0 4px 10px">Tryck på en lobby och skriv in poängen som spelet visar (max ${st.cfg.maxPoints}).</p>`;
      html += lobbyRoundsHtml(t, R, i, st) + lobbyTable(t, R, st);
    } else if (st.type === 'heats') {
      const rd = R.rounds[R.rounds.length - 1];
      html += `<div class="section-title">${esc(rd.name)} ${rd.complete ? '· klar' : ''}</div>`;
      html += `<div class="heat-grid">${rd.heats.map((h) => heatCard(t, h, i, st)).join('')}</div>`;
      if (R.rounds.length > 1) html += `<p class="small muted" style="text-align:center">Tidigare rundor syns under Bracket.</p>`;
    } else if (st.type === 'single' || st.type === 'double') {
      const ready = R.matches.filter((m) => m.state === 'ready').length;
      html += `<p class="small muted" style="margin:0 4px 10px">${R.done ? 'Alla matcher är spelade.' : `${ready} ${ready === 1 ? 'match' : 'matcher'} redo att spelas.`} Tryck på en match för att skriva in resultat.</p>`;
      html += bracketCanvas(t, stageTreeNodes(st, R), { stage: i });
    } else {
      const ready = R.matches.filter((m) => m.state === 'ready');
      const done = R.matches.filter((m) => m.state === 'done').reverse();
      const pending = R.matches.filter((m) => m.state === 'pending');
      html += `<div class="section-title">Att spela (${ready.length})</div>`;
      html += ready.length ? `<div class="mlist">${ready.map((m) => matchLine(t, m, i)).join('')}</div>` : `<p class="small muted">${R.done ? 'Alla matcher är spelade.' : 'Inga matcher redo just nu.'}</p>`;
      if (pending.length) html += `<p class="small muted">${pending.length} ${pending.length === 1 ? 'match väntar' : 'matcher väntar'} på tidigare resultat.</p>`;
      if (done.length) html += `<div class="section-title">Spelade (${done.length})</div><div class="mlist">${done.map((m) => matchLine(t, m, i)).join('')}</div>`;
    }
    view.innerHTML = html;
    applyBracketScroll(view);
    view.onclick = (e) => stageClick(e, t);
  }

  function stageClick(e, t) {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    if (e.target.closest('[data-share-final]')) return;
    const i = Number(a.dataset.i);
    if (a.dataset.action === 'selStage') {
      ui.stageIdx = i;
      render();
    } else if (a.dataset.action === 'goFormat') setTab('playoff');
    else if (a.dataset.action === 'match') stageMatchDialog(t, i, a.dataset.id);
    else if (a.dataset.action === 'heat') heatDialog(t, i, a.dataset.id);
    else if (a.dataset.action === 'lobby') lobbyDialog(t, i, a.dataset.id);
  }

  function lobbyRoundsHtml(t, R, i, st) {
    // Omgångar som inte är klara först
    const order = R.rounds.filter((rd) => !rd.complete).concat(R.rounds.filter((rd) => rd.complete));
    return order
      .map((rd) => `<div class="section-title">${esc(rd.name)}${rd.complete ? ' · klar' : ''}</div><div class="heat-grid">${rd.heats.map((h) => heatCard(t, h, i, st)).join('')}</div>`)
      .join('');
  }

  function lobbyTable(t, R, st) {
    const adv = R.qualifiers.length;
    return `<section class="card"><h3>Poängställning</h3><table class="mini-table gtable"><thead><tr><th>#</th><th class="l">${W(t).One}</th>${R.rounds.length > 1 ? '<th>Spelat</th><th>Bästa</th>' : ''}<th>Poäng</th></tr></thead><tbody>${R.table
      .map(
        (r) =>
          `<tr class="${r.status}"><td>${r.pos}</td><td class="l">${esc(pname(t, r.id))}</td>${R.rounds.length > 1 ? `<td>${r.played}/${R.rounds.length}</td><td>${fmt(r.best)}</td>` : ''}<td><b>${fmt(r.total)}</b></td></tr>`
      )
      .join('')}</tbody></table>
      <p class="small muted" style="margin:8px 0 0">${R.done ? `De ${adv} bästa går vidare (grönt).` : `De ${st.cfg.advance > 0 ? Math.min(st.cfg.advance, R.table.length) : R.table.length} med flest poäng går vidare när alla lobbyer är klara.`}</p></section>`;
  }

  function lobbyDialog(t, i, lobbyId) {
    const st = t.stages[i];
    const R = SG.resolve(st);
    let lobby = null;
    R.rounds.forEach((rd) => rd.heats.forEach((h) => h.id === lobbyId && (lobby = h)));
    if (!lobby) return;
    if (stageLocked(t, i)) return toast('Nästa fas har startat – återställ den under Format för att ändra här');
    const max = st.cfg.maxPoints;
    const prev = (st.results[lobbyId] && st.results[lobbyId].points) || {};
    openModal({
      title: `Lobby ${lobby.index + 1}${R.rounds.length > 1 ? ` · omgång ${lobby.round + 1}` : ''}`,
      body: `<p class="small muted" style="margin-top:0">Skriv in poängen som spelet visar efter sista racet (0–${max}).</p>
        <div class="pos-list">${lobby.players
          .map(
            (p) => `<label class="pos-row"><div class="grow"><b>${esc(pname(t, p))}</b></div>
            <input type="number" inputmode="numeric" min="0" max="${max}" data-p="${p}" value="${prev[p] != null ? prev[p] : ''}" placeholder="–" style="width:90px;text-align:center"></label>`
          )
          .join('')}</div>`,
      actions: [
        {
          label: 'Rensa',
          onClick: () => {
            const before = SG.resolve(st);
            delete st.results[lobbyId];
            afterStageChange(t, i, before);
          },
        },
        {
          label: 'Spara',
          cls: 'primary',
          onClick: (w) => {
            const points = {};
            for (const inp of $$('input[data-p]', w)) {
              if (inp.value.trim() === '') continue;
              const v = parseNum(inp.value);
              if (!L.isNum(v) || v < 0 || v > max) {
                toast(`Poängen måste vara mellan 0 och ${max}`);
                return false;
              }
              points[inp.dataset.p] = v;
            }
            const before = SG.resolve(st);
            if (Object.keys(points).length) SG.setLobbyResult(st, lobbyId, points);
            else delete st.results[lobbyId];
            afterStageChange(t, i, before);
          },
        },
      ],
      onOpen: (w) => {
        const inputs = $$('input[data-p]', w);
        const first = inputs.find((x) => x.value === '') || inputs[0];
        if (first) setTimeout(() => first.focus(), 50);
        inputs.forEach((inp, k) =>
          inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && inputs[k + 1]) {
              e.preventDefault();
              inputs[k + 1].focus();
            }
          })
        );
      },
    });
  }

  function heatCard(t, h, i, st) {
    if (h.lobby)
      return `<button class="heat ${h.complete ? 'done' : ''}" data-action="lobby" data-i="${i}" data-id="${h.id}">
      <span class="heat-head"><b>Lobby ${h.index + 1}</b><span class="small muted">${h.complete ? 'Klar' : h.started ? 'Pågår' : 'Ej spelad'}</span></span>
      ${h.rows
        .map((r) => `<span class="heat-row ${r.status}"><span class="hpos">${h.complete ? r.pos : ''}</span><span class="pn">${esc(pname(t, r.id))}</span><span class="ps">${r.total != null ? fmt(r.total) + ' p' : ''}</span></span>`)
        .join('')}
    </button>`;
    return `<button class="heat ${h.complete ? 'done' : ''} ${h.isFinal ? 'final' : ''}" data-action="heat" data-i="${i}" data-id="${h.id}">
      <span class="heat-head"><b>${h.isFinal ? 'Final' : 'Heat ' + (h.index + 1)}</b><span class="small muted">${h.complete ? 'Klar' : h.started ? 'Pågår' : 'Ej kört'}</span></span>
      ${h.rows
        .map(
          (r) => `<span class="heat-row ${r.status}"><span class="hpos">${h.started ? r.pos : ''}</span><span class="pn">${esc(pname(t, r.id))}</span><span class="ps">${h.started ? fmt(r.total) + ' p' : ''}</span></span>`
        )
        .join('')}
    </button>`;
  }

  function afterStageChange(t, i, before) {
    const st = t.stages[i];
    let guard = 0;
    while (SG.progress(st) && guard++ < 20);
    save();
    render();
    const R = SG.resolve(st);
    const isLast = i === t.stages.length - 1;
    if (R.done && !(before && before.done)) {
      if (isLast && R.champion) {
        toast(`🏆 ${pname(t, R.champion)} vinner ${t.name}!`);
        vibrate([200, 100, 200]);
      } else toast(`${st.name} är klar! ${isLast ? '' : 'Starta nästa fas under Format.'}`);
    } else if (before && st.type !== 'heats' && st.type !== 'lobbies') {
      const lost = before.matches.filter((m) => m.state === 'done').length - R.matches.filter((m) => m.state === 'done').length;
      if (lost > 0) toast(`Obs: ${lost} senare ${lost === 1 ? 'match' : 'matcher'} påverkades och måste spelas om`);
    }
  }

  function stageMatchDialog(t, i, id) {
    const st = t.stages[i];
    const before = decorate(SG.resolve(st));
    const m = before.matches.find((x) => x.id === id);
    if (!m) return;
    if (m.state === 'bye') return toast(`${pname(t, m.winner)} går vidare på walk over`);
    if (m.state === 'pending' || m.state === 'empty' || m.state === 'skip') return toast('Matchen är inte klar – tidigare matcher måste spelas först');
    if (stageLocked(t, i)) return toast('Nästa fas har startat – återställ den under Format för att ändra här');
    if (SG.isLocked(st, m)) return toast('Senare omgångar bygger på detta resultat och kan inte ändras');
    const need = SG.winsNeeded(m.bo);
    const allowDraw = st.type === 'rr' && st.cfg.allowDraw;
    let selected = m.draw ? 'draw' : m.winner;
    const side = (s) => {
      const pid = m[s];
      const score = s === 'a' ? m.sa : m.sb;
      return `
        <div class="mp-side ${selected === pid ? 'sel' : ''}" data-id="${pid}">
          <svg class="crown" viewBox="0 0 24 24"><path d="${ICONS.crown}"/></svg>
          <div class="grow">${esc(pname(t, pid))}<div class="small muted">Seed ${before.seedOf[pid] || '–'}${rosterLine(t, pid)}</div></div>
          <input type="number" step="any" min="0" placeholder="–" data-side="${s}" value="${score != null ? score : ''}" aria-label="Resultat">
        </div>`;
    };
    openModal({
      title: (m.groupName ? m.groupName + ' · ' : '') + (m.label || 'Match'),
      body: `
        <p class="small muted" style="margin-top:0">${m.bo > 1 ? `Best of ${m.bo} – först till ${need} vunna kartor/matcher.` : 'En match (Bo1). Skriv t.ex. rundor 13–9.'}</p>
        <div class="mp">${side('a')}${side('b')}</div>
        ${allowDraw ? `<button class="btn small block ${selected === 'draw' ? 'primary' : ''}" id="drawBtn" style="margin-top:10px">Oavgjort</button>` : ''}
        <label class="field" style="margin-top:12px"><span>Kommentar (valfritt, t.ex. kartor)</span><input type="text" id="mNote" value="${esc(m.note || '')}" placeholder="Mirage 13–9, Inferno 11–13, Nuke 13–7"></label>
        ${gameOf(t) ? `<button class="btn block" id="mStats">${icon('chart')}Ladda upp scoreboard för en karta${statCount(t, i, m.id) ? ` (${statCount(t, i, m.id)} sparade)` : ''}</button>` : ''}`,
      actions: [
        {
          label: 'Rensa',
          onClick: () => {
            SG.setResult(st, m, null, null, null, '');
            afterStageChange(t, i, before);
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
              toast('Välj vinnare genom att trycka på laget');
              return false;
            }
            SG.setResult(st, m, selected, sa, sb, $('#mNote', w).value.trim());
            afterStageChange(t, i, before);
          },
        },
      ],
      onOpen: (w, close) => {
        const sb = $('#mStats', w);
        if (sb)
          sb.onclick = () => {
            close();
            statsEntryDialog(t, { match: { stage: i, match: m.id }, pick: true });
          };
        const sync = () => {
          $$('.mp-side', w).forEach((el) => el.classList.toggle('sel', el.dataset.id === selected));
          const d = $('#drawBtn', w);
          if (d) d.classList.toggle('primary', selected === 'draw');
        };
        $$('.mp-side', w).forEach((el) =>
          el.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            selected = el.dataset.id;
            sync();
          })
        );
        const d = $('#drawBtn', w);
        if (d) d.addEventListener('click', () => ((selected = 'draw'), sync()));
        $$('input[data-side]', w).forEach((inp) =>
          inp.addEventListener('input', () => {
            const sa = parseNum($('input[data-side="a"]', w).value);
            const sb = parseNum($('input[data-side="b"]', w).value);
            if (!L.isNum(sa) || !L.isNum(sb)) return;
            if (sa !== sb) selected = sa > sb ? m.a : m.b;
            else if (allowDraw) selected = 'draw';
            sync();
          })
        );
      },
    });
  }

  const statCount = (t, i, matchId) => t.statMaps.filter((m) => m.matchKey === i + ':' + matchId).length;

  function rosterLine(t, id) {
    const p = playerById(t, id);
    if (!p || !p.members || !p.members.length) return '';
    return ' · ' + esc(p.members.join(', '));
  }

  function heatDialog(t, i, heatId) {
    const st = t.stages[i];
    const R = SG.resolve(st);
    let heat = null;
    R.rounds.forEach((rd) => rd.heats.forEach((h) => h.id === heatId && (heat = h)));
    if (!heat) return;
    if (stageLocked(t, i) || SG.isLocked(st, heat)) return toast('Senare rundor bygger på detta heat och kan inte ändras');
    const n = heat.players.length;
    const raceCount = st.cfg.races;
    const pts = SG.parsePoints(st.cfg.points);
    const prev = (st.results[heatId] && st.results[heatId].races) || [];
    const races = Array.from({ length: raceCount }, (_, r) => Object.assign({}, prev[r] || {}));
    let cur = 0;
    const players = heat.players.slice();
    const body = () => `
      ${raceCount > 1 ? `<div class="seg">${races.map((_, r) => `<button data-race="${r}" class="${r === cur ? 'on' : ''}">Race ${r + 1}</button>`).join('')}</div>` : ''}
      <p class="small muted" style="margin-top:0">Tryck på placeringen för varje ${isTeamMode(t) ? 'lag' : 'spelare'}${raceCount > 1 ? ` i race ${cur + 1}` : ''}.</p>
      <div class="pos-list">${players
        .map((p) => {
          const total = races.reduce((s, race) => s + (race[p] ? pts[race[p] - 1] || 0 : 0), 0);
          return `<div class="pos-row"><div class="grow"><b>${esc(pname(t, p))}</b><div class="small muted">${fmt(total)} p totalt</div></div>
            <div class="pos-btns">${Array.from({ length: n }, (_, k) => `<button data-p="${p}" data-pos="${k + 1}" class="${races[cur][p] === k + 1 ? 'on' : ''}">${k + 1}</button>`).join('')}</div></div>`;
        })
        .join('')}</div>
      <p class="small muted">Poäng: ${pts.slice(0, n).map((x, k) => `${k + 1}:a ${x}`).join(' · ')}</p>`;
    openModal({
      title: (heat.isFinal ? 'Final' : `Heat ${heat.index + 1}`) + (R.rounds.length > 1 && !heat.isFinal ? ` · runda ${heat.round + 1}` : ''),
      body: `<div id="heatBody">${body()}</div>`,
      actions: [
        {
          label: 'Rensa',
          onClick: () => {
            const before = SG.resolve(st);
            delete st.results[heatId];
            afterStageChange(t, i, before);
          },
        },
        {
          label: 'Spara',
          cls: 'primary',
          onClick: () => {
            const before = SG.resolve(st);
            SG.setHeatResult(st, heatId, races);
            afterStageChange(t, i, before);
          },
        },
      ],
      onOpen: (w) => {
        const box = $('#heatBody', w);
        box.addEventListener('click', (e) => {
          const rb = e.target.closest('[data-race]');
          if (rb) {
            cur = Number(rb.dataset.race);
            box.innerHTML = body();
            return;
          }
          const b = e.target.closest('[data-pos]');
          if (!b) return;
          const p = b.dataset.p;
          const pos = Number(b.dataset.pos);
          const race = races[cur];
          if (race[p] === pos) delete race[p];
          else {
            // Byt plats med den som hade placeringen
            const other = Object.keys(race).find((q) => race[q] === pos);
            if (other) {
              if (race[p]) race[other] = race[p];
              else delete race[other];
            }
            race[p] = pos;
            // Sista lediga placeringen fylls i automatiskt
            const free = players.filter((q) => !race[q]);
            if (free.length === 1) {
              const used = new Set(Object.values(race));
              for (let k = 1; k <= n; k++) if (!used.has(k)) race[free[0]] = k;
            }
          }
          box.innerHTML = body();
        });
      },
    });
  }

  /* ----------------------------- Bracket ---------------------------- */

  function renderStageBracket(view, t) {
    const i = pickStage(t);
    if (i < 0) return noStageState(view, t);
    const st = t.stages[i];
    const R = decorate(SG.resolve(st));
    const last = i === t.stages.length - 1;
    topAction('share', 'Dela', () => shareText(`${t.name} – ${st.name}`, R.done && last ? finalText(t, R) : stageText(t, st, R)));
    let html = stageChips(t, i) + nextStageBanner(t, i, R);
    if (R.done && last) html += championBanner(t, R);
    html += `<div class="small muted" style="margin:0 4px 10px">${esc(SG.TYPES[st.type].label)} · ${esc(stageSummary(st))}</div>`;

    if (st.type === 'gsl' || st.type === 'rr') {
      html += `<div class="group-grid">${R.groups
        .map((g) => {
          const table =
            st.type === 'gsl'
              ? `<table class="mini-table gtable"><thead><tr><th class="l">#</th><th class="l">${W(t).One}</th><th>V–F</th></tr></thead><tbody>${g.rows
                  .map((r, k) => `<tr class="${r.status}"><td class="l">${r.pos || k + 1}</td><td class="l">${esc(pname(t, r.id))}</td><td>${r.w}–${r.l}</td></tr>`)
                  .join('')}</tbody></table>`
              : `<table class="mini-table gtable"><thead><tr><th class="l">#</th><th class="l">${W(t).One}</th><th>S</th><th>V</th>${st.cfg.allowDraw ? '<th>O</th>' : ''}<th>F</th><th>+/−</th><th>P</th></tr></thead><tbody>${g.rows
                  .map(
                    (r) =>
                      `<tr class="${r.status}"><td class="l">${r.pos}</td><td class="l">${esc(pname(t, r.id))}</td><td>${r.played}</td><td>${r.w}</td>${st.cfg.allowDraw ? `<td>${r.d}</td>` : ''}<td>${r.l}</td><td>${r.mf - r.ma > 0 ? '+' : ''}${r.mf - r.ma}</td><td><b>${r.pts}</b></td></tr>`
                  )
                  .join('')}</tbody></table>`;
          return `<section class="card group-card"><h3>${esc(g.name)}</h3>${table}<div class="mlist compact">${g.matches.map((m) => matchLine(t, m, i)).join('')}</div></section>`;
        })
        .join('')}</div>`;
      html += `<p class="small muted" style="text-align:center">Grönt = vidare · Rött = utslagen</p>`;
    } else if (st.type === 'swiss') {
      html += `<section class="card"><h3>Ställning</h3><table class="mini-table gtable"><thead><tr><th class="l">${W(t).One}</th><th>V–F</th><th>Buchholz</th><th>Status</th></tr></thead><tbody>${R.table
        .map(
          (r) =>
            `<tr class="${r.status}"><td class="l">${esc(pname(t, r.id))}</td><td><b>${r.w}–${r.l}</b></td><td>${r.buchholz > 0 ? '+' : ''}${r.buchholz}</td><td>${r.status === 'advanced' ? 'Vidare' : r.status === 'out' ? 'Ute' : 'Spelar'}</td></tr>`
        )
        .join('')}</tbody></table></section>`;
      for (let r = R.rounds - 1; r >= 0; r--) {
        const ms = R.matches.filter((m) => m.round === r);
        html += `<div class="section-title">Omgång ${r + 1}</div><div class="mlist">${ms.map((m) => matchLine(t, m, i)).join('')}</div>`;
      }
    } else if (st.type === 'single' || st.type === 'double') {
      html += bracketCanvas(t, stageTreeNodes(st, R), { stage: i });
    } else if (st.type === 'lobbies') {
      html += lobbyTable(t, R, st) + lobbyRoundsHtml(t, R, i, st);
    } else if (st.type === 'heats') {
      R.rounds
        .slice()
        .reverse()
        .forEach((rd) => {
          html += `<div class="section-title">${esc(rd.name)}</div><div class="heat-grid">${rd.heats.map((h) => heatCard(t, h, i, st)).join('')}</div>`;
        });
      html += `<p class="small muted" style="text-align:center">Grönt = vidare till nästa runda</p>`;
    }
    if (R.done && last) html += placementsCard(t, R);
    view.innerHTML = html;
    applyBracketScroll(view);
    view.onclick = (e) => {
      if (e.target.closest('[data-share-final]')) return shareText(`${t.name} – resultat`, finalText(t, R));
      stageClick(e, t);
    };
  }

  function stageText(t, st, R) {
    const lines = [`${t.name} – ${st.name}`, ''];
    const ml = (m) => `${m.a ? pname(t, m.a) : '?'} – ${m.b ? pname(t, m.b) : m.state === 'bye' ? 'walk over' : '?'}${m.sa != null || m.sb != null ? `  ${fmt(m.sa)}–${fmt(m.sb)}` : ''}`;
    if (R.groups) {
      R.groups.forEach((g) => {
        lines.push(g.name.toUpperCase());
        g.rows.forEach((r, k) => lines.push(`  ${r.pos || k + 1}. ${pname(t, r.id)}${r.pts != null ? `  ${r.pts} p` : `  ${r.w}–${r.l}`}`));
        lines.push('');
      });
    } else if (st.type === 'swiss') {
      R.table.forEach((r) => lines.push(`${r.w}–${r.l}  ${pname(t, r.id)}${r.status === 'advanced' ? '  ✓' : r.status === 'out' ? '  ✗' : ''}`));
    } else if (st.type === 'lobbies') {
      R.table.forEach((r) => lines.push(`${r.pos}. ${pname(t, r.id)}  ${fmt(r.total)} p${r.status === 'advanced' ? '  ✓' : ''}`));
    } else if (st.type === 'heats') {
      R.rounds.forEach((rd) => {
        lines.push(rd.name.toUpperCase());
        rd.heats.forEach((h) => lines.push(`  ${h.isFinal ? 'Final' : 'Heat ' + (h.index + 1)}: ${h.rows.map((r) => `${pname(t, r.id)} ${fmt(r.total)}p`).join(', ')}`));
      });
    } else {
      R.matches.filter((m) => m.state === 'done' || m.state === 'ready').forEach((m) => lines.push(`${m.label}: ${ml(m)}`));
    }
    return lines.join('\n');
  }

  /* ---------------------- Slutspelsträd (ritat) ---------------------- */
  // Ritar hela trädet med linjer mellan matcherna. Okända lag visas som "-".
  // nodes: {id, sec: 'ub'|'lb'|'gf'|'third', col, index, srcs: [id], label, bo, a, b, sa, sb, winner, state, seedA, seedB}

  const BW = 176; // kortets bredd
  const BH = 62; // kortets höjd
  const GX = 46; // mellanrum mellan kolumner
  const GY = 14; // minsta mellanrum mellan kort
  const HEAD = 40; // plats för kolumnrubriker

  function layoutBracket(nodes) {
    const pos = {};
    const heads = [];
    let top = 0;
    let maxCol = 0;
    let bottom = 0;
    ['ub', 'lb'].forEach((sec) => {
      const list = nodes.filter((n) => n.sec === sec);
      if (!list.length) return;
      const cols = [...new Set(list.map((n) => n.col))].sort((a, b) => a - b);
      const y0 = top + HEAD;
      let secBottom = y0;
      cols.forEach((c) => {
        let cursor = y0;
        const inCol = list.filter((n) => n.col === c).sort((a, b) => a.index - b.index);
        inCol.forEach((n) => {
          const ys = n.srcs.map((s) => pos[s]).filter((p) => p && p.sec === sec).map((p) => p.y);
          let y = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : cursor;
          y = Math.max(y, cursor);
          pos[n.id] = { x: c * (BW + GX), y: y, sec: sec };
          cursor = y + BH + GY;
          secBottom = Math.max(secBottom, cursor);
        });
        const first = inCol[0];
        heads.push({ x: c * (BW + GX), y: top, label: first.label, sub: inCol, bo: first.bo });
        maxCol = Math.max(maxCol, c);
      });
      top = secBottom + 26;
      bottom = secBottom;
    });
    // Final (dubbelutslagning) placeras till höger, mitt emellan övre och undre final
    const gfs = nodes.filter((n) => n.sec === 'gf');
    gfs.forEach((n, k) => {
      const ys = n.srcs.map((s) => pos[s]).filter(Boolean).map((p) => p.y);
      const y = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : HEAD;
      const col = maxCol + 1 + k;
      pos[n.id] = { x: col * (BW + GX), y: y, sec: 'gf' };
      heads.push({ x: col * (BW + GX), y: y - 26, label: n.label, sub: [n], bo: n.bo, inline: true });
    });
    if (gfs.length) maxCol += gfs.length;
    // Match om tredjepris under finalen
    nodes
      .filter((n) => n.sec === 'third')
      .forEach((n) => {
        const fin = nodes.filter((x) => x.sec === 'ub').reduce((a, b) => (b.col > a.col ? b : a));
        const fp = pos[fin.id];
        const y = Math.max(fp.y + BH + 60, HEAD);
        pos[n.id] = { x: fp.x, y: y, sec: 'third' };
        heads.push({ x: fp.x, y: y - 26, label: n.label, sub: [n], bo: n.bo, inline: true });
        bottom = Math.max(bottom, y + BH + GY);
      });
    Object.values(pos).forEach((p) => (bottom = Math.max(bottom, p.y + BH + GY)));
    return { pos: pos, heads: heads, width: (maxCol + 1) * (BW + GX) - GX, height: bottom };
  }

  function bracketCanvas(t, nodes, opts) {
    opts = opts || {};
    const L2 = layoutBracket(nodes);
    const byId = {};
    nodes.forEach((n) => (byId[n.id] = n));
    // Linjer: från vinnaren i en match till nästa match
    const lines = [];
    nodes.forEach((n) => {
      const p = L2.pos[n.id];
      n.srcs.forEach((s) => {
        const q = L2.pos[s];
        if (!p || !q) return;
        const x1 = q.x + BW;
        const y1 = q.y + BH / 2;
        const x2 = p.x;
        const y2 = p.y + BH / 2;
        const mx = x2 - GX / 2;
        const on = byId[s].state === 'done' || byId[s].state === 'bye';
        lines.push(`<path class="${on ? 'on' : ''}" d="M${x1} ${y1} H${mx} V${y2} H${x2}"/>`);
      });
    });
    const row = (n, side) => {
      const id = n[side];
      const score = side === 'a' ? n.sa : n.sb;
      const seed = side === 'a' ? n.seedA : n.seedB;
      let cls = '';
      if (!id) cls = 'tbd';
      else if (n.winner === id) cls = 'win';
      else if (n.winner) cls = 'lose';
      return `<span class="bm-row ${cls}"><span class="bm-seed">${id && seed ? seed : ''}</span><span class="pn">${id ? esc(pname(t, id)) : '-'}</span><span class="ps">${id && score != null ? fmt(score) : ''}</span></span>`;
    };
    const cards = nodes
      .map((n) => {
        const p = L2.pos[n.id];
        if (!p) return '';
        const isFinal = n.isFinal ? 'final' : '';
        return `<button class="bm ${n.state} ${isFinal}" style="left:${p.x}px;top:${p.y}px;width:${BW}px;height:${BH}px" data-action="match" data-i="${opts.stage != null ? opts.stage : ''}" data-id="${n.id}" aria-label="${esc(n.label)}">${row(n, 'a')}${row(n, 'b')}</button>`;
      })
      .join('');
    const heads = L2.heads
      .map((h) => {
        const real = h.sub.filter((m) => m.state !== 'bye' && m.state !== 'empty' && m.state !== 'skip');
        const done = real.filter((m) => m.state === 'done').length;
        return `<div class="bh ${h.inline ? 'inline' : ''}" style="left:${h.x}px;top:${h.y}px;width:${BW}px"><b>${esc(h.label)}</b><span>${h.bo ? 'Bo' + h.bo + ' · ' : ''}${done}/${real.length}</span></div>`;
      })
      .join('');
    // Scrolla fram till första match som ska spelas
    const next = nodes.find((n) => n.state === 'ready');
    const scrollX = next && L2.pos[next.id] ? Math.max(0, L2.pos[next.id].x - 30) : 0;
    return `<div class="bc-wrap" data-scroll="${scrollX}"><div class="bc" style="width:${L2.width}px;height:${L2.height}px">
      <svg class="bc-lines" width="${L2.width}" height="${L2.height}" aria-hidden="true">${lines.join('')}</svg>${heads}${cards}</div></div>
      <div class="bc-legend small muted"><span><i class="lg ready"></i>Redo att spelas</span><span><i class="lg done"></i>Spelad</span><span>- = ej klart än</span></div>`;
  }

  function applyBracketScroll(view) {
    $$('.bc-wrap', view).forEach((w) => (w.scrollLeft = Number(w.dataset.scroll) || 0));
  }

  // Bygger trädets noder från en fas (utslagning eller dubbelutslagning)
  function stageTreeNodes(st, R) {
    const lastUb = st.type === 'single' ? st.data.rounds - 1 : st.data.k - 1;
    return R.matches
      .filter((m) => m.state !== 'skip' || m.section !== 'gf')
      .map((m) => ({
        id: m.id,
        sec: m.section,
        col: m.round,
        index: m.index || 0,
        srcs: m.src.filter((s) => s.w).map((s) => s.w),
        label: m.label,
        bo: m.bo,
        a: m.a,
        b: m.b,
        sa: m.sa,
        sb: m.sb,
        winner: m.winner,
        state: m.state === 'empty' ? 'bye' : m.state,
        seedA: m.a ? R.seedOf[m.a] : null,
        seedB: m.b ? R.seedOf[m.b] : null,
        isFinal: (st.type === 'single' && m.section === 'ub' && m.round === lastUb) || m.section === 'gf',
      }));
  }

  // Poängligans slutspel i samma ritade form
  function leagueTreeNodes(res) {
    const nodes = [];
    res.rounds.forEach((rd, r) =>
      rd.matches.forEach((m, k) =>
        nodes.push({
          id: m.key,
          sec: 'ub',
          col: r,
          index: k,
          srcs: r === 0 ? [] : [`${r - 1}-${2 * k}`, `${r - 1}-${2 * k + 1}`],
          label: rd.name,
          bo: 0,
          a: m.a,
          b: m.b,
          sa: m.sa,
          sb: m.sb,
          winner: m.bye ? null : m.winner,
          state: m.bye ? 'bye' : m.winner ? 'done' : m.ready ? 'ready' : 'pending',
          seedA: m.seedA,
          seedB: m.seedB,
          isFinal: r === res.rounds.length - 1,
        })
      )
    );
    if (res.third && res.third.applicable) {
      const m = res.third;
      nodes.push({ id: 'third', sec: 'third', col: 0, index: 0, srcs: [], label: 'Match om tredjepris', bo: 0, a: m.a, b: m.b, sa: m.sa, sb: m.sb, winner: m.winner, state: m.winner ? 'done' : m.ready ? 'ready' : 'pending', seedA: m.seedA, seedB: m.seedB });
    }
    return nodes;
  }

  /* ------------------------------------------------------------------ */
  /* Spelarstatistik och topplistor                                     */
  /* ------------------------------------------------------------------ */

  const ST = window.TStats;
  const KEY_STORE = 'turneringsapp.apikey';
  const MODEL_STORE = 'turneringsapp.aimodel';
  const DEFAULT_MODEL = 'claude-haiku-5-5';
  // Modeller där servern kan köra om en nekad förfrågan på en annan modell
  const FALLBACK_MODELS = ['claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5', 'claude-fable-5-1'];

  const getApiKey = () => {
    try {
      return localStorage.getItem(KEY_STORE) || '';
    } catch (e) {
      return '';
    }
  };
  const getModel = () => {
    try {
      return localStorage.getItem(MODEL_STORE) || DEFAULT_MODEL;
    } catch (e) {
      return DEFAULT_MODEL;
    }
  };
  const gameOf = (t) => ST.gameFor(t.settings);

  // Vilket sätt att läsa av bilder som finns: claude.ai-sidans Claude, egen API-nyckel eller inget
  let readerPromise = null;
  function aiReader() {
    if (readerPromise) return readerPromise;
    readerPromise = (async () => {
      if (window.claude && typeof window.claude.use === 'function') {
        try {
          const sample = await window.claude.use('sample');
          if (sample) {
            const lim = await sample.limits().catch(() => null);
            if (lim && lim.images) return { kind: 'sample', sample: sample };
          }
        } catch (e) {
          /* inte tillgängligt här */
        }
      }
      return null;
    })();
    return readerPromise;
  }
  async function readerKind() {
    const r = await aiReader();
    if (r) return r;
    if (getApiKey() && window.AnthropicSDK) return { kind: 'api' };
    return null;
  }

  // Bilden som base64. Skärmklipp (PNG) skickas oförändrade så att liten text
  // förblir skarp; stora bilder skalas ner till max 1568 px.
  const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;
  function imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1568 / Math.max(img.width, img.height));
        const keep = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) && scale === 1 && file.size <= MAX_IMAGE_BYTES;
        if (keep) {
          URL.revokeObjectURL(url);
          const fr = new FileReader();
          fr.onload = () => resolve({ data: String(fr.result).split(',')[1], mediaType: file.type });
          fr.onerror = () => reject({ code: 'image_rejected' });
          fr.readAsDataURL(file);
          return;
        }
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        let out = file.type === 'image/png' ? c.toDataURL('image/png') : '';
        let mediaType = 'image/png';
        if (!out || out.length * 0.75 > MAX_IMAGE_BYTES) {
          out = c.toDataURL('image/jpeg', 0.92);
          mediaType = 'image/jpeg';
        }
        resolve({ data: out.split(',')[1], mediaType: mediaType });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject({ code: 'image_rejected' });
      };
      img.src = url;
    });
  }

  function participantInfo(t, ids) {
    return ids.filter(Boolean).map((id) => {
      const p = playerById(t, id);
      return { id: id, name: pname(t, id), members: isTeamMode(t) ? (p && p.members) || [] : [pname(t, id)] };
    });
  }

  /** Läser av en scoreboard med Claude och returnerar ett utkast att granska. */
  async function readScoreboard(t, file, participants, signal) {
    const game = gameOf(t);
    const reader = await readerKind();
    if (!reader) throw { code: 'no_ai' };
    const teams = participants.map((p) => ({ name: p.name, members: p.members }));
    let reading;
    if (reader.kind === 'sample') {
      reading = await reader.sample.json(ST.scoreboardPrompt(game, teams, true), { images: [file], signal: signal, cache: false });
    } else {
      const Anthropic = window.AnthropicSDK.default || window.AnthropicSDK;
      const client = new Anthropic({ apiKey: getApiKey(), dangerouslyAllowBrowser: true });
      const image = await imageToBase64(file);
      const model = getModel();
      const params = {
        model: model,
        max_tokens: 16000,
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: ST.scoreboardSchema(game) } },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
              { type: 'text', text: ST.scoreboardPrompt(game, teams, false) },
            ],
          },
        ],
      };
      if (FALLBACK_MODELS.includes(model)) {
        params.betas = ['server-side-fallback-2026-07-01'];
        params.fallbacks = 'default';
      }
      let response;
      try {
        response = await client.beta.messages.create(params, { signal: signal });
      } catch (e) {
        if (signal && signal.aborted) throw { code: 'cancelled' };
        if (e instanceof Anthropic.AuthenticationError) throw { code: 'bad_key' };
        if (e instanceof Anthropic.PermissionDeniedError) throw { code: 'bad_key' };
        if (e instanceof Anthropic.RateLimitError) throw { code: 'rate_limited' };
        if (e instanceof Anthropic.BadRequestError) throw { code: 'bad_request', message: e.message };
        if (e instanceof Anthropic.APIConnectionError) throw { code: 'offline' };
        throw { code: 'upstream_error', message: e && e.message };
      }
      if (response.stop_reason === 'refusal') throw { code: 'refused' };
      if (response.stop_reason === 'max_tokens') throw { code: 'invalid_json' };
      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');
      try {
        reading = JSON.parse(text);
      } catch (e) {
        throw { code: 'invalid_json' };
      }
    }
    return ST.normalizeReading(reading, game, participants);
  }

  const AI_ERRORS = {
    no_ai: 'Automatisk avläsning är inte påslagen – fyll i siffrorna själv eller lägg till en API-nyckel under Mer.',
    bad_key: 'API-nyckeln fungerar inte. Kontrollera den under Mer → Spel & statistik.',
    rate_limited: 'För många förfrågningar just nu. Vänta en stund och försök igen.',
    offline: 'Ingen internetanslutning – fyll i siffrorna själv.',
    refused: 'Claude kunde inte läsa bilden. Prova en annan skärmbild eller fyll i själv.',
    invalid_json: 'Avläsningen blev ofullständig. Försök igen eller fyll i själv.',
    image_rejected: 'Bilden kunde inte användas. Välj en JPEG- eller PNG-skärmbild.',
    not_granted: 'Du tillät inte att sidan använder Claude. Fyll i siffrorna själv.',
    sampling_disabled: 'Claude är inte tillgängligt för ditt konto. Fyll i siffrorna själv.',
    images_unavailable: 'Bildavläsning är inte tillgänglig här. Fyll i siffrorna själv.',
    bad_request: 'Förfrågan nekades. Kontrollera modellnamnet under Mer.',
  };

  /* ----------------------------- Stats-flik -------------------------- */

  function renderStats(view, t) {
    const game = gameOf(t);
    if (!game) {
      view.innerHTML = emptyState('chart', 'Ingen statistik påslagen', 'Välj vilket spel turneringen spelas i under Mer → Spel & statistik.', 'Gå till Mer', 'goMore');
      view.onclick = (e) => e.target.closest('[data-action="goMore"]') && setTab('more');
      return;
    }
    const maps = t.statMaps;
    const derived = ST.derivedFor(game);
    const cols = derived.length ? [derived[0], ...game.stats, ...derived.slice(1)] : game.stats.slice();
    if (!ui.statSort || (ui.statSort !== 'maps' && !cols.some((c) => c.key === ui.statSort))) ui.statSort = cols[0].key;
    const board = ST.leaderboard(maps, game).filter((r) => !ui.statTeam || r.teamId === ui.statTeam);
    const minMaps = Math.min(ui.statMin || 1, Math.max(1, maps.length));
    const sorted = ST.sortBoard(board, ui.statSort, minMaps);
    const teamIds = [...new Set(ST.leaderboard(maps, game).map((r) => r.teamId).filter(Boolean))];

    // Höjdpunkter
    const tile = (label, key, minM) => {
      const best = ST.sortBoard(board, key, minM)[0];
      if (!best || best.values[key] == null) return '';
      return `<div class="stat hl"><span>${esc(label)}</span><b>${fmt(best.values[key])}</b><em>${esc(best.name)}</em></div>`;
    };
    const avgStat = game.stats.find((s) => s.kind === 'avg');
    const hl = [
      game.stats.some((s) => s.key === 'k') ? tile('Flest kills', 'k', 1) : tile(game.stats[0].long, game.stats[0].key, 1),
      derived.length ? tile('Bäst K/D', 'kd', Math.min(2, Math.max(1, maps.length))) : '',
      avgStat ? tile(`Högst ${avgStat.label}`, avgStat.key, 1) : '',
    ].join('');

    view.innerHTML = `
      <section class="card">
        <div class="row">
          <div class="grow"><h3 style="margin:0">${esc(game.name)}-statistik</h3><div class="small muted">${maps.length} ${maps.length === 1 ? 'karta' : 'kartor'} · ${board.length} spelare</div></div>
        </div>
        <div class="row wrap" style="margin-top:12px">
          <button class="btn primary" data-action="upload">${icon('upload')}Ladda upp / klistra in scoreboard</button>
          <button class="btn" data-action="manual">${icon('edit')}Fyll i själv</button>
        </div>
        <p class="small muted" id="aiStatus" style="margin:10px 0 0"></p>
      </section>
      ${maps.length ? `
        ${hl ? `<div class="stat-grid hl-grid">${hl}</div>` : ''}
        <div class="chips">${cols
          .concat([{ key: 'maps', label: 'Kartor' }])
          .map((c) => `<button class="chip ${ui.statSort === c.key ? 'on' : ''}" data-action="sort" data-k="${c.key}">${esc(c.label)}</button>`)
          .join('')}</div>
        <div class="row wrap" style="margin:0 2px 10px">
          ${teamIds.length > 1 ? `<select id="statTeam" style="width:auto"><option value="">Alla lag</option>${teamIds.map((id) => `<option value="${id}" ${ui.statTeam === id ? 'selected' : ''}>${esc(pname(t, id))}</option>`).join('')}</select>` : ''}
          <select id="statMin" style="width:auto">${[1, 2, 3, 5].map((n) => `<option value="${n}" ${minMaps === n ? 'selected' : ''}>Minst ${n} ${n === 1 ? 'karta' : 'kartor'}</option>`).join('')}</select>
        </div>
        <div class="table-scroll"><table class="standings lb">
          <thead><tr><th>#</th><th class="l">Spelare</th><th class="${ui.statSort === 'maps' ? 'sorted' : ''}">Kartor</th>${cols.map((c) => `<th class="${ui.statSort === c.key ? 'sorted' : ''}" title="${esc(c.long)}">${esc(c.label)}</th>`).join('')}</tr></thead>
          <tbody>${sorted
            .map(
              (r, i) => `<tr class="r${i + 1}"><td class="rank"><span>${i + 1}</span></td>
                <td class="l"><div class="pname">${esc(r.name)}</div>${r.teamId ? `<div class="pclub">${esc(pname(t, r.teamId))}</div>` : ''}</td>
                <td class="${ui.statSort === 'maps' ? 'sorted' : ''}">${r.maps}</td>
                ${cols.map((c) => `<td class="${ui.statSort === c.key ? 'sorted' : ''}">${r.values[c.key] == null ? '–' : (c.key === 'diff' && r.values[c.key] > 0 ? '+' : '') + fmt(r.values[c.key])}</td>`).join('')}</tr>`
            )
            .join('')}</tbody>
        </table></div>
        ${sorted.length < board.length ? `<p class="small muted">${board.length - sorted.length} spelare har färre kartor än gränsen och visas inte.</p>` : ''}
        <div class="section-title">Registrerade kartor</div>
        <ul class="list">${maps
          .slice()
          .reverse()
          .map((m) => {
            const teams = (m.teams || []).map((tm) => `${esc(tm.teamId ? pname(t, tm.teamId) : tm.name || '?')}${tm.score != null ? ' ' + fmt(tm.score) : ''}`).join(' – ');
            const top = ST.sortBoard(ST.leaderboard([m], game), game.stats[0].key)[0];
            return `<li class="tap" data-action="editMap" data-id="${m.id}"><div class="grow"><div class="name">${esc(m.label || 'Karta')}${m.matchLabel ? ` <span class="small muted">· ${esc(m.matchLabel)}</span>` : ''}</div>
              <div class="sub">${teams}${top ? ` · bäst: ${esc(top.name)} (${fmt(top.values[game.stats[0].key])} ${esc(game.stats[0].label)})` : ''}</div></div>${icon('edit')}</li>`;
          })
          .join('')}</ul>` : `<div class="empty">${icon('chart')}<h3>Inga kartor än</h3><div>Ladda upp en skärmbild av scoreboarden efter en karta. ${esc(game.hint)}</div></div>`}
    `;
    readerKind().then((r) => {
      const el = $('#aiStatus');
      if (!el) return;
      const tip = window.matchMedia && window.matchMedia('(pointer: coarse)').matches ? '' : ' Tips: Win+Shift+S och sedan Ctrl+V här.';
      el.textContent = (r
        ? r.kind === 'sample'
          ? 'Bilder läses av med ditt Claude-konto. Du granskar siffrorna innan de sparas.'
          : 'Bilder läses av med Claude via din API-nyckel. Du granskar siffrorna innan de sparas.'
        : 'Automatisk avläsning är av: lägg till en Claude API-nyckel under Mer → Spel & statistik, eller fyll i siffrorna själv bredvid bilden.') + tip;
    });
    view.onclick = (e) => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      if (a.dataset.action === 'upload') statsEntryDialog(t, { pick: true });
      else if (a.dataset.action === 'manual') statsEntryDialog(t, {});
      else if (a.dataset.action === 'sort') {
        ui.statSort = a.dataset.k;
        render();
      } else if (a.dataset.action === 'editMap') statsEntryDialog(t, { mapId: a.dataset.id });
    };
    view.onchange = (e) => {
      if (e.target.id === 'statTeam') ui.statTeam = e.target.value || null;
      else if (e.target.id === 'statMin') ui.statMin = Number(e.target.value);
      else return;
      render();
    };
  }

  // Matcher där båda lagen är kända – för att koppla en karta till en match
  function linkableMatches(t) {
    const out = [];
    if (!isStages(t)) return out;
    t.stages.forEach((st, i) => {
      if (!st.data || st.type === 'heats') return;
      SG.resolve(st).matches.forEach((m) => {
        if (m.a && m.b && (m.state === 'ready' || m.state === 'done')) {
          out.push({ key: i + ':' + m.id, stage: i, match: m.id, a: m.a, b: m.b, label: `${st.name} · ${m.label}: ${pname(t, m.a)} – ${pname(t, m.b)}` });
        }
      });
    });
    return out;
  }

  /**
   * Lägg till eller ändra en karta. opts: {mapId} för att ändra, {match: {stage, match}}
   * för att koppla till en match, {pick: true} för att öppna bildväljaren direkt.
   */
  function statsEntryDialog(t, opts) {
    const game = gameOf(t);
    if (!game) return toast('Välj spel under Mer först');
    const existing = opts.mapId ? t.statMaps.find((m) => m.id === opts.mapId) : null;
    const matches = linkableMatches(t);
    const allIds = t.players.filter((p) => p.active !== false).map((p) => p.id);
    let draft;
    if (existing) {
      draft = JSON.parse(JSON.stringify(existing));
      draft.rows.forEach((r) => (r.team = Math.max(0, draft.teams.findIndex((tm) => tm.teamId === r.teamId))));
    } else {
      const link = opts.match ? matches.find((m) => m.stage === opts.match.stage && m.match === opts.match.match) : null;
      draft = { id: null, label: '', matchKey: link ? link.key : '', teams: [], rows: [] };
      const ids = link ? [link.a, link.b] : [];
      for (let k = 0; k < 2; k++) draft.teams.push({ teamId: ids[k] || null, name: '', score: null });
      fillRosterRows();
    }
    let imageUrl = null;
    let ctl = null;
    let status = '';
    let useImage = () => {};
    const onPaste = (e) => {
      const f = pastedImage(e);
      if (!f) return;
      e.preventDefault();
      useImage(f);
    };

    function fillRosterRows() {
      draft.teams.forEach((tm, ti) => {
        if (draft.rows.some((r) => r.team === ti) || !tm.teamId) return;
        const members = isTeamMode(t) ? ((playerById(t, tm.teamId) || {}).members || []) : [pname(t, tm.teamId)];
        members.forEach((name) => draft.rows.push({ name: name, team: ti, stats: {} }));
      });
    }
    const rosterNames = () => {
      const s = new Set();
      draft.teams.forEach((tm) => {
        if (!tm.teamId) return;
        (isTeamMode(t) ? ((playerById(t, tm.teamId) || {}).members || []) : [pname(t, tm.teamId)]).forEach((n) => s.add(n));
      });
      return [...s];
    };

    function body() {
      const statHead = game.stats.map((s) => `<th title="${esc(s.long)}">${esc(s.label)}</th>`).join('');
      return `
        <input type="file" id="sbFile" accept="image/*" hidden>
        ${imageUrl ? '' : `<div class="sb-drop" data-sb="pick">${icon('upload')}<b>Klistra in skärmklippet (Ctrl+V)</b><span>…eller dra hit en bild, eller tryck för att välja fil</span></div>`}
        <div class="sb-image">
          ${imageUrl ? `<img src="${imageUrl}" alt="Scoreboard">` : ''}
          ${imageUrl ? `<button class="btn small" data-sb="pick">${icon('upload')}Byt bild</button>` : ''}
          ${imageUrl ? `<button class="btn small primary" data-sb="read">${icon('shuffle')}Läs av igen</button>` : ''}
        </div>
        ${status ? `<div class="sb-status">${status}</div>` : ''}
        <div class="cfg-grid">
          <label class="field"><span>Karta</span><input type="text" data-sb-f="label" value="${esc(draft.label)}" placeholder="t.ex. Mirage"></label>
          <label class="field"><span>Match (valfritt)</span><select data-sb-f="match"><option value="">Ingen</option>${matches.map((m) => `<option value="${m.key}" ${draft.matchKey === m.key ? 'selected' : ''}>${esc(m.label)}</option>`).join('')}</select></label>
        </div>
        <datalist id="sbNames">${rosterNames().map((n) => `<option value="${esc(n)}">`).join('')}</datalist>
        ${draft.teams
          .map(
            (tm, ti) => `
          <div class="sb-team">
            <div class="row">
              <select data-sb-team="${ti}" class="grow"><option value="">${esc(isTeamMode(t) ? 'Välj lag…' : 'Välj…')}</option>${allIds.map((id) => `<option value="${id}" ${tm.teamId === id ? 'selected' : ''}>${esc(pname(t, id))}</option>`).join('')}</select>
              <input type="number" class="sb-score" min="0" data-sb-score="${ti}" value="${tm.score != null ? tm.score : ''}" placeholder="Rundor" aria-label="Rundor/poäng">
            </div>
            <div class="table-scroll"><table class="sb-table"><thead><tr><th class="l">Spelare</th>${statHead}<th></th></tr></thead><tbody>
              ${draft.rows
                .map((r, ri) =>
                  r.team !== ti
                    ? ''
                    : `<tr><td class="l"><input type="text" list="sbNames" data-sb-name="${ri}" value="${esc(r.name)}" placeholder="Namn"></td>${game.stats
                        .map((s) => `<td><input type="number" step="any" min="0" data-sb-stat="${ri}" data-k="${s.key}" value="${r.stats[s.key] != null ? r.stats[s.key] : ''}"></td>`)
                        .join('')}<td><button class="icon-btn" data-sb="del" data-r="${ri}" aria-label="Ta bort rad">${icon('close')}</button></td></tr>`
                )
                .join('')}
            </tbody></table></div>
            <button class="btn small ghost" data-sb="add" data-t="${ti}">${icon('add')}Lägg till spelare</button>
          </div>`
          )
          .join('')}
        ${existing ? `<button class="btn danger-text ghost block" data-sb="remove">${icon('del')}Ta bort kartan</button>` : ''}`;
    }

    const modal = openModal({
      title: existing ? 'Ändra kartstatistik' : 'Lägg till kartstatistik',
      body: `<div id="sbBody">${body()}</div>`,
      actions: [
        { label: 'Avbryt', onClick: () => ctl && ctl.abort() },
        {
          label: 'Spara',
          cls: 'primary',
          onClick: () => {
            const rows = draft.rows.filter((r) => r.name && r.name.trim());
            if (!rows.length) {
              toast('Lägg till minst en spelare');
              return false;
            }
            const link = matches.find((m) => m.key === draft.matchKey);
            const entry = {
              id: draft.id || L.uid(),
              at: draft.at || Date.now(),
              label: draft.label.trim(),
              matchKey: draft.matchKey || '',
              matchLabel: link ? link.label.split(' · ').slice(1).join(' · ') : draft.matchLabel || '',
              teams: draft.teams.map((tm) => ({ teamId: tm.teamId || null, name: tm.teamId ? pname(t, tm.teamId) : tm.name || '', score: tm.score })),
              rows: rows.map((r) => ({ name: r.name.trim(), teamId: (draft.teams[r.team] && draft.teams[r.team].teamId) || null, stats: r.stats })),
            };
            const idx = t.statMaps.findIndex((m) => m.id === entry.id);
            if (idx >= 0) t.statMaps[idx] = entry;
            else t.statMaps.push(entry);
            if (ctl) ctl.abort();
            commit(`Statistik sparad för ${rows.length} spelare`);
          },
        },
      ],
      onClose: () => {
        if (ctl) ctl.abort();
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        document.removeEventListener('paste', onPaste);
      },
      onOpen: (w) => {
        const box = $('#sbBody', w);
        const redraw = () => (box.innerHTML = body());
        let file = null;

        async function read() {
          if (!file) return;
          if (ctl) ctl.abort();
          ctl = new AbortController();
          const myCtl = ctl;
          status = `<span class="spinner"></span> Claude läser av scoreboarden… <button class="btn small ghost" data-sb="stop">Stoppa</button>`;
          redraw();
          const ids = draft.teams.map((tm) => tm.teamId).filter(Boolean);
          const participants = participantInfo(t, ids.length ? ids : allIds);
          try {
            const res = await readScoreboard(t, file, participants, myCtl.signal);
            if (myCtl.signal.aborted) return;
            if (res.label) draft.label = res.label;
            draft.teams = res.teams.length ? res.teams.map((tm) => ({ teamId: tm.teamId, name: tm.name, score: tm.score })) : draft.teams;
            draft.rows = res.rows.map((r) => ({ name: r.name, team: r.team, stats: r.stats }));
            const unmatched = res.rows.filter((r) => r.name === r.ingame && !rosterNames().includes(r.name)).length;
            status = `✅ ${res.rows.length} spelare avlästa. Kontrollera siffrorna mot bilden innan du sparar.${unmatched ? ` ${unmatched} namn hittades inte i laguppställningen – rätta vid behov.` : ''}`;
          } catch (e) {
            if (ctl !== myCtl) return; // en nyare avläsning har tagit över
            if (e && e.code === 'cancelled') status = 'Avläsningen stoppades.';
            else status = '⚠️ ' + (AI_ERRORS[e && e.code] || 'Avläsningen misslyckades. Fyll i siffrorna själv.');
          }
          ctl = null;
          redraw();
        }

        useImage = (f) => {
          if (!f || !/^image\//.test(f.type)) return toast('Det där är ingen bild');
          file = f;
          if (imageUrl) URL.revokeObjectURL(imageUrl);
          imageUrl = URL.createObjectURL(file);
          read();
        };
        box.addEventListener('dragover', (e) => {
          e.preventDefault();
          box.classList.add('dragging');
        });
        box.addEventListener('dragleave', () => box.classList.remove('dragging'));
        box.addEventListener('drop', (e) => {
          e.preventDefault();
          box.classList.remove('dragging');
          useImage(e.dataTransfer.files && e.dataTransfer.files[0]);
        });
        box.addEventListener('change', (e) => {
          const el = e.target;
          if (el.id === 'sbFile') {
            useImage(el.files && el.files[0]);
          } else if (el.dataset.sbTeam != null) {
            const ti = Number(el.dataset.sbTeam);
            draft.teams[ti].teamId = el.value || null;
            fillRosterRows();
            redraw();
          } else if (el.dataset.sbF === 'match') {
            draft.matchKey = el.value;
            const link = matches.find((m) => m.key === el.value);
            if (link && !draft.rows.length) {
              draft.teams = [link.a, link.b].map((id) => ({ teamId: id, name: '', score: null }));
              fillRosterRows();
              redraw();
            }
          }
        });
        box.addEventListener('input', (e) => {
          const el = e.target;
          if (el.dataset.sbF === 'label') draft.label = el.value;
          else if (el.dataset.sbName != null) draft.rows[Number(el.dataset.sbName)].name = el.value;
          else if (el.dataset.sbStat != null) {
            const v = parseNum(el.value);
            draft.rows[Number(el.dataset.sbStat)].stats[el.dataset.k] = L.isNum(v) ? v : null;
          } else if (el.dataset.sbScore != null) {
            const v = parseNum(el.value);
            draft.teams[Number(el.dataset.sbScore)].score = L.isNum(v) ? v : null;
          }
        });
        box.addEventListener('click', (e) => {
          const b = e.target.closest('[data-sb]');
          if (!b) return;
          const act = b.dataset.sb;
          if (act === 'pick') $('#sbFile', w).click();
          else if (act === 'read') read();
          else if (act === 'stop') ctl && ctl.abort();
          else if (act === 'add') {
            draft.rows.push({ name: '', team: Number(b.dataset.t), stats: {} });
            redraw();
          } else if (act === 'del') {
            draft.rows.splice(Number(b.dataset.r), 1);
            redraw();
          } else if (act === 'remove') {
            confirmDialog('Ta bort kartan?', 'Statistiken från den här kartan tas bort från topplistan.', 'Ta bort', () => {
              checkpoint();
              t.statMaps = t.statMaps.filter((m) => m.id !== existing.id);
              modal.close();
              commit('Kartan borttagen', true);
            });
          }
        });
        document.addEventListener('paste', onPaste);
        if (opts.file) useImage(opts.file);
        // På mobil öppnas bildväljaren direkt; på datorn väntar dialogen på Ctrl+V
        else if (opts.pick && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) setTimeout(() => $('#sbFile', w).click(), 50);
      },
    });
  }

  function pastedImage(e) {
    const items = Array.from((e.clipboardData && e.clipboardData.items) || []);
    const item = items.find((i) => i.kind === 'file' && /^image\//.test(i.type));
    return item ? item.getAsFile() : null;
  }

  // Ctrl+V på Stats-fliken öppnar avläsningen direkt med bilden
  document.addEventListener('paste', (e) => {
    if (ui.tab !== 'stats' || modalStack.length || !gameOf(T())) return;
    const f = pastedImage(e);
    if (!f) return;
    e.preventDefault();
    statsEntryDialog(T(), { file: f });
  });

  function statsSettingsHtml(t) {
    const g = t.settings.game || 'none';
    const key = getApiKey();
    return `
      <div class="section-title">Spel & statistik (${esc(t.name)})</div>
      <section class="card">
        <label class="field"><span>Spel</span>
          <select id="setGame">
            <option value="none" ${g === 'none' ? 'selected' : ''}>Ingen spelarstatistik</option>
            ${Object.entries(ST.GAMES).map(([id, gm]) => `<option value="${id}" ${g === id ? 'selected' : ''}>${esc(gm.long)}</option>`).join('')}
            <option value="custom" ${g === 'custom' ? 'selected' : ''}>Eget spel…</option>
          </select>
        </label>
        ${g === 'custom' ? `
          <label class="field"><span>Spelets namn</span><input type="text" id="setCustomName" value="${esc(t.settings.customGameName || '')}" placeholder="t.ex. Overwatch"></label>
          <label class="field"><span>Statistik att spara (kommaseparerat)</span><input type="text" id="setCustomStats" value="${esc(t.settings.customStats || '')}" placeholder="Eliminations, Deaths, Damage, Healing"></label>` : ''}
        ${g !== 'none' ? `<p class="small muted" style="margin:0">Statistiken visas under fliken Stats. Ladda upp en skärmbild av scoreboarden efter varje karta.</p>` : ''}
      </section>
      ${g !== 'none' ? `
      <section class="card">
        <h3>Automatisk avläsning med Claude</h3>
        <p class="small">I webbversionen på claude.ai läses bilderna av med ditt Claude-konto, utan nyckel. I Android-appen och i HTML-filen behövs en egen API-nyckel.</p>
        <label class="field"><span>Claude API-nyckel</span><input type="password" id="setApiKey" autocomplete="off" placeholder="sk-ant-…" value="${key ? '••••••••' + esc(key.slice(-4)) : ''}"></label>
        <label class="field"><span>Modell</span><input type="text" id="setModel" value="${esc(getModel())}"></label>
        ${key ? `<button class="btn small danger-text ghost" data-action="clearKey">Ta bort nyckeln</button>` : ''}
        <p class="small muted" style="margin:6px 0 0">Nyckeln sparas bara på den här enheten, följer inte med i säkerhetskopior och skickas bara till Anthropic. Skapa en på console.anthropic.com. Med standardmodellen (claude-haiku-5-5) kostar en avläsning ungefär 1–2 öre; claude-opus-5-5 läser svår text bättre men kostar ca 40–70 öre per bild.</p>
      </section>` : ''}`;
  }

  /* ------------------------------------------------------------------ */
  /* Ny turnering: först typ, sedan detaljer                            */
  /* ------------------------------------------------------------------ */

  const PRESET_ICONS = {
    league: 'chart',
    champions: 'trophy',
    major: 'shuffle',
    mariokart: 'dice',
    'groups-playoff': 'people',
    single: 'trophy',
    double: 'trophy',
    custom: 'edit',
  };

  // En orörd standardturnering ("Min turnering" utan innehåll) räknas inte som en riktig turnering
  function isPristine(t) {
    return (
      t.name === 'Min turnering' &&
      !(t.players || []).length &&
      !(t.rounds || []).length &&
      !(t.stages || []).length &&
      !t.playoff &&
      !(t.statMaps && t.statMaps.length)
    );
  }

  function startWizard() {
    const real = Object.values(db.tournaments).filter((t) => !isPristine(t));
    ui.wizard = { step: 1, preset: null, mode: 'individual', roster: 5, game: 'none', name: '', cancelable: real.length > 0 };
    window.scrollTo(0, 0);
    render();
  }

  function cancelWizard() {
    ui.wizard = null;
    render();
  }

  function presetTags(p) {
    const tags = [p.mode === 'team' ? `Lag${p.rosterSize ? ' om ' + p.rosterSize : ''}` : 'Spelare'];
    (p.stages || []).forEach((s) => tags.push(SG.TYPES[s.type].short));
    if (p.format === 'league') tags.push('Omgångar', 'Tabell', 'Slutspel');
    return tags.map((x) => `<i>${esc(x)}</i>`).join('');
  }

  function renderWizard(view) {
    const wz = ui.wizard;
    if (wz.step === 1) {
      view.innerHTML = `
        <section class="wizard-head">
          <div class="wizard-step">Steg 1 av 2</div>
          <h2>Vilken typ av turnering vill du skapa?</h2>
          <p class="muted">Du kan ändra format och inställningar senare.</p>
        </section>
        <div class="wizard-grid">
          ${SG.PRESETS.map(
            (p) => `<button class="wizard-card" data-wz="preset" data-id="${p.id}">
              <span class="wizard-icon">${icon(PRESET_ICONS[p.id] || 'trophy')}</span>
              <b>${esc(p.name)}</b>
              <span class="wizard-desc">${esc(p.desc)}</span>
              <span class="preset-tags">${presetTags(p)}</span>
            </button>`
          ).join('')}
        </div>
        ${wz.cancelable ? `<button class="btn ghost block" data-wz="cancel" style="margin-top:14px">Avbryt</button>` : ''}`;
    } else {
      const p = wz.preset;
      const suggestion = p.id === 'league' ? 'Höstligan' : p.name + ' ' + new Date().getFullYear();
      view.innerHTML = `
        <section class="wizard-head">
          <div class="wizard-step">Steg 2 av 2</div>
          <h2>${esc(p.name)}</h2>
          <p class="muted">${esc(p.desc)}</p>
        </section>
        <section class="card">
          <label class="field"><span>Namn på turneringen</span><input type="text" id="wzName" maxlength="60" value="${esc(wz.name)}" placeholder="${esc(suggestion)}"></label>
          <div class="field"><span>Deltagare</span>
            <div class="seg" style="margin:0">
              <button type="button" data-wz="mode" data-v="individual" class="${wz.mode === 'individual' ? 'on' : ''}">Spelare</button>
              <button type="button" data-wz="mode" data-v="team" class="${wz.mode === 'team' ? 'on' : ''}">Lag</button>
            </div>
          </div>
          ${wz.mode === 'team' ? `<label class="field"><span>Spelare per lag (0 = valfritt)</span><input type="number" id="wzRoster" min="0" value="${wz.roster}"></label>` : ''}
          <label class="field" style="margin-bottom:0"><span>Spel (för spelarstatistik)</span>
            <select id="wzGame"><option value="none">Ingen statistik</option>${Object.entries(ST.GAMES).map(([id, g]) => `<option value="${id}" ${wz.game === id ? 'selected' : ''}>${esc(g.long)}</option>`).join('')}</select>
          </label>
        </section>
        <button class="btn primary block" data-wz="create">${icon('trophy')}Skapa turnering</button>
        <button class="btn ghost block" data-wz="back" style="margin-top:8px">← Välj en annan typ</button>`;
      setTimeout(() => {
        const n = $('#wzName');
        if (n && !wz.name) n.focus();
      }, 50);
    }
    view.onclick = (e) => {
      const a = e.target.closest('[data-wz]');
      if (!a) return;
      const act = a.dataset.wz;
      if (act === 'cancel') cancelWizard();
      else if (act === 'preset') {
        const p = SG.PRESETS.find((x) => x.id === a.dataset.id);
        Object.assign(wz, { step: 2, preset: p, mode: p.mode || 'individual', roster: p.rosterSize || 5, game: p.game || 'none' });
        window.scrollTo(0, 0);
        render();
      } else if (act === 'back') {
        wz.step = 1;
        render();
      } else if (act === 'mode') {
        wz.mode = a.dataset.v;
        render();
      } else if (act === 'create') createFromWizard();
    };
    view.oninput = (e) => {
      if (e.target.id === 'wzName') wz.name = e.target.value;
      else if (e.target.id === 'wzRoster') wz.roster = Math.max(0, Math.round(Number(e.target.value) || 0));
    };
    view.onchange = (e) => {
      if (e.target.id === 'wzGame') wz.game = e.target.value;
    };
    view.onkeydown = (e) => {
      if (e.key === 'Enter' && e.target.id === 'wzName') createFromWizard();
    };
  }

  function createFromWizard() {
    const wz = ui.wizard;
    const input = $('#wzName');
    const name = wz.name.trim() || (input && input.placeholder) || wz.preset.name;
    const nt = newTournament(name, wz.mode);
    normalize(nt);
    applyPreset(nt, wz.preset);
    nt.mode = wz.mode;
    nt.settings.rosterSize = wz.mode === 'team' ? wz.roster : 0;
    nt.settings.game = wz.game;
    // Ta bort den orörda standardturneringen så att den inte ligger kvar som skräp
    Object.values(db.tournaments).forEach((t) => {
      if (isPristine(t)) delete db.tournaments[t.id];
    });
    db.tournaments[nt.id] = nt;
    db.activeId = nt.id;
    ui.wizard = null;
    ui.roundId = null;
    ui.stageIdx = null;
    poDraft = null;
    ui.tab = 'players';
    saveUi();
    commit(`${name} skapad – lägg till ${W(nt).one}`);
  }

  /* ------------------------------ Start ----------------------------- */

  $('#tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (b) setTab(b.dataset.tab);
  });
  $('#tournamentBtn').addEventListener('click', () => {
    if (!ui.wizard) setTab('more');
  });
  $('#timerChip').addEventListener('click', timerDialog);

  // Bakåtknappen på Android: stäng dialog → gå till tabellen → avsluta
  window.appBack = function () {
    if (ui.wizard && !modalStack.length) {
      if (ui.wizard.step === 2) {
        ui.wizard.step = 1;
        render();
        return true;
      }
      if (ui.wizard.cancelable) {
        cancelWizard();
        return true;
      }
      return false;
    }
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

  if (Object.values(db.tournaments).every(isPristine)) {
    ui.wizard = { step: 1, preset: null, mode: 'individual', roster: 5, game: 'none', name: '', cancelable: false };
  }
  render();
  timerTick();
})();
