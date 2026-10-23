/*
 * Formatmotor: turneringar uppbyggda av faser (stages).
 *
 * Fastyper:
 *   gsl     – GSL-grupper om 4 (dubbelutslagning i gruppen), som Valorant Champions
 *   rr      – gruppspel där alla möter alla
 *   swiss   – schweiziskt system (t.ex. CS Major): X vinster vidare, Y förluster ute
 *   single  – enkelutslagning
 *   double  – dubbelutslagning (övre/undre träd + final)
 *   heats   – heat med flera deltagare (t.ex. Mario Kart): de bästa i varje heat går vidare
 *   lobbies – poängfas i slumpade lobbyer (t.ex. 1v1v1v1): spelets poäng summeras, de X bästa går vidare
 *
 * Ren logik utan DOM – används av appen och av testerna (Node).
 */
(function (root) {
  'use strict';

  const L = typeof module !== 'undefined' && module.exports ? require('./logic.js') : root.TLogic;

  const TYPES = {
    gsl: { label: 'GSL-grupper', short: 'GSL', desc: 'Grupper om 4 med dubbelutslagning – två vinster vidare, två förluster ute.' },
    rr: { label: 'Gruppspel (alla möter alla)', short: 'Grupper', desc: 'Alla i gruppen möter varandra. Poäng för vinst/oavgjort.' },
    swiss: { label: 'Swiss-system', short: 'Swiss', desc: 'Möter lag med samma resultat. X vinster går vidare, Y förluster åker ut (CS Major).' },
    single: { label: 'Utslagning', short: 'Utslagning', desc: 'Förlorar man är man ute.' },
    double: { label: 'Dubbelutslagning', short: 'Dubbelutslagning', desc: 'Övre och undre träd – man åker ut efter två förluster.' },
    heats: { label: 'Heat (flera per match)', short: 'Heat', desc: 'Flera deltagare per heat, de bästa går vidare (t.ex. Mario Kart).' },
    lobbies: { label: 'Poängfas (slumpade lobbyer)', short: 'Poängfas', desc: 'Slumpade lobbyer (t.ex. 1v1v1v1). Poängen från spelet summeras och de X bästa går vidare.' },
  };

  const MK_POINTS = [15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  function defaultCfg(type) {
    switch (type) {
      case 'gsl':
        return { groups: 4, advancePerGroup: 2, bo: 3, deciderBo: 3 };
      case 'rr':
        return { groups: 2, advancePerGroup: 2, bo: 1, pointsWin: 3, pointsDraw: 1, pointsLoss: 0, allowDraw: false, doubleRound: false };
      case 'swiss':
        return { winsToAdvance: 3, lossesToElim: 3, bo: 1, decisiveBo: 3 };
      case 'single':
        return { bo: 3, semiBo: 3, finalBo: 5, third: false, advance: 0 };
      case 'double':
        return { bo: 3, ubFinalBo: 3, lbFinalBo: 5, gfBo: 5, gfReset: false, advance: 0 };
      case 'heats':
        return { heatSize: 4, advancePerHeat: 2, races: 1, points: MK_POINTS.join(', '), advance: 0 };
      case 'lobbies':
        return { size: 4, rounds: 1, maxPoints: 60, advance: 8 };
      default:
        return {};
    }
  }

  const winsNeeded = (bo) => Math.floor((bo || 1) / 2) + 1;
  const groupLetter = (i) => String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '');

  function parsePoints(str) {
    const pts = String(str || '')
      .split(/[\s,;]+/)
      .map(Number)
      .filter((n) => isFinite(n));
    return pts.length ? pts : MK_POINTS.slice();
  }

  /* ------------------------------------------------------------------ */
  /* Grafbaserade träd: GSL, utslagning, dubbelutslagning                */
  /* ------------------------------------------------------------------ */
  // Källa för en plats i en match: {seed: i} | {w: matchId} | {l: matchId}

  function buildSingle(n, cfg, prefix) {
    prefix = prefix || 'u';
    const size = L.nextPow2(Math.max(n, 2));
    const order = L.seedOrder(size);
    const nodes = [];
    let prev = [];
    let r = 0;
    for (let count = size / 2; count >= 1; count /= 2, r++) {
      const cur = [];
      for (let m = 0; m < count; m++) {
        const id = `${prefix}${r}-${m}`;
        const src = r === 0 ? [{ seed: order[2 * m] - 1 }, { seed: order[2 * m + 1] - 1 }] : [{ w: prev[2 * m] }, { w: prev[2 * m + 1] }];
        let bo = cfg.bo;
        if (count === 1) bo = cfg.finalBo || cfg.bo;
        else if (count === 2) bo = cfg.semiBo || cfg.bo;
        nodes.push({ id: id, section: 'ub', round: r, index: m, label: L.roundName(count), bo: bo, src: src });
        cur.push(id);
      }
      prev = cur;
    }
    if (cfg.third && r >= 2) {
      const semis = nodes.filter((x) => x.round === r - 2);
      nodes.push({ id: 'third', section: 'third', round: r - 1, index: 0, label: 'Match om tredjepris', bo: cfg.semiBo || cfg.bo, src: [{ l: semis[0].id }, { l: semis[1].id }] });
    }
    return { nodes: nodes, rounds: r };
  }

  function buildDouble(n, cfg) {
    const size = L.nextPow2(Math.max(n, 4));
    const k = Math.log2(size);
    const nodes = [];
    const order = L.seedOrder(size);
    const ub = [];
    for (let r = 0; r < k; r++) {
      const count = size / Math.pow(2, r + 1);
      const ids = [];
      for (let m = 0; m < count; m++) {
        const id = `u${r}-${m}`;
        const src = r === 0 ? [{ seed: order[2 * m] - 1 }, { seed: order[2 * m + 1] - 1 }] : [{ w: ub[r - 1][2 * m] }, { w: ub[r - 1][2 * m + 1] }];
        const isFinal = count === 1;
        nodes.push({ id: id, section: 'ub', round: r, index: m, label: isFinal ? 'Övre final' : 'Övre ' + L.roundName(count).toLowerCase(), bo: isFinal ? cfg.ubFinalBo || cfg.bo : cfg.bo, src: src });
        ids.push(id);
      }
      ub.push(ids);
    }
    // Undre trädet
    const lbRounds = [];
    let lr = 0;
    const addLb = (pairs, isFinal) => {
      const ids = pairs.map((src, m) => {
        const id = `l${lr}-${m}`;
        nodes.push({ id: id, section: 'lb', round: lr, index: m, label: isFinal ? 'Undre final' : `Undre runda ${lr + 1}`, bo: isFinal ? cfg.lbFinalBo || cfg.bo : cfg.bo, src: src });
        return id;
      });
      lbRounds.push(ids);
      lr++;
      return ids;
    };
    let prev = addLb(
      ub[0].filter((_, i) => i % 2 === 0).map((_, i) => [{ l: ub[0][2 * i] }, { l: ub[0][2 * i + 1] }]),
      false
    );
    for (let r = 1; r < k; r++) {
      // Förlorare från övre trädet kliver in – omvänd ordning varannan runda för att undvika returmöten
      const drops = r % 2 === 1 ? ub[r].slice().reverse() : ub[r].slice();
      const isFinal = r === k - 1;
      prev = addLb(prev.map((id, i) => [{ w: id }, { l: drops[i] }]), isFinal);
      if (!isFinal) prev = addLb(prev.filter((_, i) => i % 2 === 0).map((_, i) => [{ w: prev[2 * i] }, { w: prev[2 * i + 1] }]), false);
    }
    const ubFinal = ub[k - 1][0];
    const lbFinal = prev[0];
    nodes.push({ id: 'gf', section: 'gf', round: 0, index: 0, label: 'Final', bo: cfg.gfBo || cfg.bo, src: [{ w: ubFinal }, { w: lbFinal }] });
    if (cfg.gfReset) {
      nodes.push({ id: 'gf2', section: 'gf', round: 1, index: 0, label: 'Final (omstart)', bo: cfg.gfBo || cfg.bo, src: [{ w: ubFinal }, { w: lbFinal }], onlyIfWon: { match: 'gf', by: { w: lbFinal } } });
    }
    return { nodes: nodes, ub: ub, lb: lbRounds, k: k };
  }

  function buildGsl(n, cfg) {
    const idx = Array.from({ length: n }, (_, i) => i);
    const groups = L.makeGroups(idx, Math.max(1, Math.min(cfg.groups, Math.ceil(n / 2))), 'snake').map((g) => g.slice().sort((a, b) => a - b));
    const nodes = [];
    groups.forEach((g, gi) => {
      const s = (i) => ({ seed: g[i] === undefined ? -1 : g[i] });
      const p = 'g' + gi + '-';
      const mk = (id, label, bo, src, round) => nodes.push({ id: p + id, section: 'group', group: gi, round: round, label: label, bo: bo, src: src });
      mk('o1', 'Öppningsmatch', cfg.bo, [s(0), s(3)], 0);
      mk('o2', 'Öppningsmatch', cfg.bo, [s(1), s(2)], 0);
      mk('w', 'Vinnarmatch', cfg.bo, [{ w: p + 'o1' }, { w: p + 'o2' }], 1);
      mk('e', 'Elimineringsmatch', cfg.bo, [{ l: p + 'o1' }, { l: p + 'o2' }], 1);
      mk('d', 'Avgörande match', cfg.deciderBo || cfg.bo, [{ l: p + 'w' }, { w: p + 'e' }], 2);
    });
    return { nodes: nodes, groups: groups };
  }

  // Löser upp ett träd: vilka möts, vem vann, vem väntar
  function resolveGraph(nodes, entrants, results) {
    const byId = {};
    nodes.forEach((n) => (byId[n.id] = n));
    const memo = {};
    const part = (src) => {
      if (src.seed !== undefined) return entrants[src.seed] === undefined ? null : entrants[src.seed];
      const m = get(src.w || src.l);
      if (m.state === 'pending' || m.state === 'ready') return undefined;
      return src.w ? m.winner : m.loser;
    };
    const get = (id) => {
      if (memo[id]) return memo[id];
      const node = byId[id];
      const a = part(node.src[0]);
      const b = part(node.src[1]);
      const m = Object.assign({}, node, { a: a, b: b, winner: null, loser: null, sa: null, sb: null, note: '' });
      if (node.onlyIfWon) {
        const prior = get(node.onlyIfWon.match);
        const needed = part(node.onlyIfWon.by);
        if (prior.state !== 'done') {
          m.state = 'pending';
          return (memo[id] = m);
        }
        if (prior.winner !== needed) {
          m.state = 'skip';
          return (memo[id] = m);
        }
      }
      if (a === undefined || b === undefined) m.state = 'pending';
      else if (a === null && b === null) m.state = 'empty';
      else if (a === null || b === null) {
        m.state = 'bye';
        m.winner = a || b;
      } else {
        const res = results[id];
        const valid = res && res.a === a && res.b === b;
        if (valid) {
          m.sa = res.sa;
          m.sb = res.sb;
          m.note = res.note || '';
        }
        if (valid && (res.winner === a || res.winner === b)) {
          m.state = 'done';
          m.winner = res.winner;
          m.loser = res.winner === a ? b : a;
        } else m.state = 'ready';
      }
      return (memo[id] = m);
    };
    return nodes.map((n) => get(n.id));
  }

  /* ------------------------------------------------------------------ */
  /* Gruppspel alla-mot-alla                                              */
  /* ------------------------------------------------------------------ */

  function roundRobinPairs(ids) {
    const list = ids.slice();
    if (list.length % 2) list.push(null);
    const n = list.length;
    const rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const pairs = [];
      for (let i = 0; i < n / 2; i++) {
        const a = list[i];
        const b = list[n - 1 - i];
        if (a !== null && b !== null) pairs.push(r % 2 ? [b, a] : [a, b]);
      }
      rounds.push(pairs);
      list.splice(1, 0, list.pop());
    }
    return rounds;
  }

  /**
   * Cirkel: lagen står i en ring och möter sina närmaste grannar (1–2, 2–3 … 5–1).
   * perTeam = antal matcher per lag. Delas upp i omgångar där ingen spelar två gånger.
   */
  function circlePairs(ids, perTeam) {
    const n = ids.length;
    const pairs = [];
    for (let d = 1; d <= Math.floor(perTeam / 2) && d < n / 2; d++) for (let i = 0; i < n; i++) pairs.push([ids[i], ids[(i + d) % n]]);
    if (perTeam % 2 && n % 2 === 0) for (let i = 0; i < n / 2; i++) pairs.push([ids[i], ids[i + n / 2]]);
    const rounds = [];
    pairs.forEach((pr) => {
      let r = rounds.find((rd) => rd.every(([a, b]) => a !== pr[0] && a !== pr[1] && b !== pr[0] && b !== pr[1]));
      if (!r) rounds.push((r = []));
      r.push(pr);
    });
    return rounds;
  }

  function buildRr(entrants, cfg) {
    const groups = L.makeGroups(entrants.slice(), Math.max(1, Math.min(cfg.groups, Math.floor(entrants.length / 2) || 1)), 'snake');
    const matches = [];
    groups.forEach((g, gi) => {
      const rounds = cfg.perTeam > 0 && cfg.perTeam < g.length - 1 ? circlePairs(g, cfg.perTeam) : roundRobinPairs(g);
      const all = cfg.doubleRound ? rounds.concat(rounds.map((r) => r.map(([a, b]) => [b, a]))) : rounds;
      all.forEach((pairs, ri) =>
        pairs.forEach(([a, b], mi) => matches.push({ id: `g${gi}-r${ri}-${mi}`, group: gi, round: ri, a: a, b: b, bo: cfg.bo, label: `Omgång ${ri + 1}` }))
      );
    });
    return { groups: groups, matches: matches };
  }

  function directMatch(m, results, allowDraw) {
    const res = results[m.id];
    const out = Object.assign({}, m, { winner: null, loser: null, draw: false, sa: null, sb: null, note: '' });
    if (m.b === null) {
      out.state = 'bye';
      out.winner = m.a;
      return out;
    }
    if (res && res.a === m.a && res.b === m.b) {
      out.sa = res.sa;
      out.sb = res.sb;
      out.note = res.note || '';
      if (res.winner === m.a || res.winner === m.b) {
        out.state = 'done';
        out.winner = res.winner;
        out.loser = res.winner === m.a ? m.b : m.a;
        return out;
      }
      if (res.draw && allowDraw) {
        out.state = 'done';
        out.draw = true;
        return out;
      }
    }
    out.state = 'ready';
    return out;
  }

  function tableFor(ids, matches, cfg, seedOf) {
    const rows = {};
    ids.forEach((id) => (rows[id] = { id: id, played: 0, w: 0, d: 0, l: 0, mf: 0, ma: 0, pts: 0 }));
    matches.forEach((m) => {
      if (m.state !== 'done' || !rows[m.a] || !rows[m.b]) return;
      const A = rows[m.a];
      const B = rows[m.b];
      A.played++;
      B.played++;
      A.mf += m.sa || 0;
      A.ma += m.sb || 0;
      B.mf += m.sb || 0;
      B.ma += m.sa || 0;
      if (m.draw) {
        A.d++;
        B.d++;
      } else if (m.winner === m.a) {
        A.w++;
        B.l++;
      } else {
        B.w++;
        A.l++;
      }
    });
    const list = Object.values(rows);
    list.forEach((r) => (r.pts = r.w * cfg.pointsWin + r.d * cfg.pointsDraw + r.l * cfg.pointsLoss));
    // Inbördes möte avgör mellan två lag på samma poäng
    const h2h = (a, b) => {
      const m = matches.find((x) => x.state === 'done' && !x.draw && ((x.a === a.id && x.b === b.id) || (x.a === b.id && x.b === a.id)));
      if (!m) return 0;
      return m.winner === a.id ? -1 : 1;
    };
    list.sort((a, b) => b.pts - a.pts || b.mf - b.ma - (a.mf - a.ma) || b.mf - a.mf || h2h(a, b) || seedOf[a.id] - seedOf[b.id]);
    list.forEach((r, i) => (r.pos = i + 1));
    return list;
  }

  /* ------------------------------------------------------------------ */
  /* Swiss                                                                */
  /* ------------------------------------------------------------------ */

  function swissRecords(stage, matches) {
    const cfg = stage.cfg;
    const rec = {};
    stage.entrants.forEach((id) => (rec[id] = { id: id, w: 0, l: 0, opp: [], mf: 0, ma: 0 }));
    matches.forEach((m) => {
      if (m.state === 'bye') {
        rec[m.a].w++;
        return;
      }
      if (m.state !== 'done') return;
      rec[m.winner].w++;
      rec[m.loser].l++;
      rec[m.a].opp.push(m.b);
      rec[m.b].opp.push(m.a);
      rec[m.a].mf += m.sa || 0;
      rec[m.a].ma += m.sb || 0;
      rec[m.b].mf += m.sb || 0;
      rec[m.b].ma += m.sa || 0;
    });
    Object.values(rec).forEach((r) => {
      r.buchholz = r.opp.reduce((s, o) => s + rec[o].w - rec[o].l, 0);
      r.status = r.w >= cfg.winsToAdvance ? 'advanced' : r.l >= cfg.lossesToElim ? 'out' : 'active';
    });
    return rec;
  }

  // Parar ihop en sorterad lista: första mot sista osv. Backtrackar för att undvika returmöten.
  function pairPool(pool, allowRematch) {
    if (!pool.length) return [];
    const top = pool[0];
    for (let j = pool.length - 1; j >= 1; j--) {
      if (!allowRematch && top.opp.includes(pool[j].id)) continue;
      const rest = pool.slice(1, j).concat(pool.slice(j + 1));
      const sub = pairPool(rest, allowRematch);
      if (sub) return [[top.id, pool[j].id]].concat(sub);
      if (allowRematch) break;
    }
    return null;
  }

  function swissPairRound(stage, rec, round) {
    const cfg = stage.cfg;
    const seedOf = {};
    stage.entrants.forEach((id, i) => (seedOf[id] = i));
    const active = Object.values(rec).filter((r) => r.status === 'active');
    // Grupper efter resultat (flest vinster först)
    const pools = {};
    active.forEach((r) => {
      const key = r.w + '-' + r.l;
      (pools[key] = pools[key] || []).push(r);
    });
    const keys = Object.keys(pools).sort((a, b) => {
      const [aw, al] = a.split('-').map(Number);
      const [bw, bl] = b.split('-').map(Number);
      return bw - aw || al - bl;
    });
    const pairs = [];
    let carry = [];
    keys.forEach((key, ki) => {
      let pool = carry.concat(pools[key].sort((a, b) => b.buchholz - a.buchholz || seedOf[a.id] - seedOf[b.id]));
      carry = [];
      if (pool.length % 2 && ki < keys.length - 1) carry = [pool.pop()];
      // Högst seedad möter lägst seedad, utan returmöten om det går
      const even = pool.length % 2 ? pool.slice(0, -1) : pool;
      if (pool.length % 2) carry = [pool[pool.length - 1]];
      (pairPool(even, false) || pairPool(even, true)).forEach((pr) => pairs.push(pr));
    });
    const matches = pairs.map(([a, b], i) => {
      const decisive = [a, b].some((id) => rec[id].w === cfg.winsToAdvance - 1 || rec[id].l === cfg.lossesToElim - 1);
      return { id: `s${round}-${i}`, round: round, a: a, b: b, bo: decisive ? cfg.decisiveBo || cfg.bo : cfg.bo, label: `Omgång ${round + 1}` };
    });
    if (carry.length) matches.push({ id: `s${round}-bye`, round: round, a: carry[0].id, b: null, bo: 0, label: `Omgång ${round + 1}` });
    return matches;
  }

  /* ------------------------------------------------------------------ */
  /* Heat (Mario Kart)                                                    */
  /* ------------------------------------------------------------------ */

  function makeHeats(ids, size, round) {
    const count = Math.max(1, Math.ceil(ids.length / size));
    return L.makeGroups(ids, count, 'snake').map((players, i) => ({ id: `h${round}-${i}`, round: round, index: i, players: players }));
  }

  function heatStanding(heat, res, cfg, seedOf) {
    const pts = parsePoints(cfg.points);
    const races = (res && res.races) || [];
    const m = heat.players.length;
    const complete =
      races.length >= cfg.races &&
      races.slice(0, cfg.races).every((race) => {
        const pos = heat.players.map((p) => race && race[p]);
        return pos.every((x) => x >= 1 && x <= m) && new Set(pos).size === m;
      });
    const rows = heat.players.map((p) => {
      const positions = races.slice(0, cfg.races).map((r) => (r && r[p]) || null);
      const total = positions.reduce((s, x) => s + (x ? pts[x - 1] || 0 : 0), 0);
      return { id: p, positions: positions, total: total, posSum: positions.reduce((s, x) => s + (x || 99), 0) };
    });
    rows.sort((a, b) => b.total - a.total || a.posSum - b.posSum || seedOf[a.id] - seedOf[b.id]);
    rows.forEach((r, i) => (r.pos = i + 1));
    return { rows: rows, complete: complete, started: races.some((r) => r && Object.keys(r).length) };
  }

  /* ------------------------------------------------------------------ */
  /* Poängfas: slumpade lobbyer                                           */
  /* ------------------------------------------------------------------ */

  // Delar in i lobbyer så jämnt som möjligt (t.ex. 10 → 4+3+3)
  function splitLobbies(ids, size) {
    const count = Math.max(1, Math.ceil(ids.length / size));
    const out = [];
    let at = 0;
    for (let i = 0; i < count; i++) {
      const len = Math.floor(ids.length / count) + (i < ids.length % count ? 1 : 0);
      out.push(ids.slice(at, at + len));
      at += len;
    }
    return out;
  }

  // Slumpar alla omgångar direkt och försöker undvika att samma spelare möts igen
  function buildLobbies(ids, cfg, rand) {
    const met = {};
    const key = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
    const rounds = [];
    for (let r = 0; r < Math.max(1, cfg.rounds); r++) {
      let best = null;
      let bestCost = Infinity;
      for (let tries = 0; tries < (r ? 60 : 1); tries++) {
        const groups = splitLobbies(L.shuffle(ids, rand), Math.max(2, cfg.size));
        let cost = 0;
        groups.forEach((g) => g.forEach((a, i) => g.slice(i + 1).forEach((b) => (cost += met[key(a, b)] || 0))));
        if (cost < bestCost) (best = groups), (bestCost = cost);
        if (!cost) break;
      }
      best.forEach((g) => g.forEach((a, i) => g.slice(i + 1).forEach((b) => (met[key(a, b)] = (met[key(a, b)] || 0) + 1))));
      rounds.push({ heats: best.map((players, i) => ({ id: `l${r}-${i}`, round: r, index: i, players: players })) });
    }
    return { rounds: rounds };
  }

  function lobbyStanding(lobby, res) {
    const pts = (res && res.points) || {};
    const has = (p) => typeof pts[p] === 'number' && isFinite(pts[p]);
    const rows = lobby.players.map((p) => ({ id: p, total: has(p) ? pts[p] : null }));
    const order = rows.slice().sort((a, b) => (b.total == null ? -1 : b.total) - (a.total == null ? -1 : a.total));
    order.forEach((r, i) => (r.pos = i + 1));
    return { rows: order, complete: rows.every((r) => r.total != null), started: rows.some((r) => r.total != null) };
  }

  /* ------------------------------------------------------------------ */
  /* Publika funktioner                                                  */
  /* ------------------------------------------------------------------ */

  function newStage(type, name) {
    return { id: L.uid(), type: type, name: name || TYPES[type].short, cfg: defaultCfg(type), status: 'setup', entrants: null, data: null, results: {} };
  }

  /** Startar en fas med deltagarna i seedningsordning. */
  function start(stage, entrants, rand) {
    stage.entrants = entrants.slice();
    stage.results = {};
    stage.status = 'live';
    const n = entrants.length;
    if (stage.type === 'gsl') stage.data = buildGsl(n, stage.cfg);
    else if (stage.type === 'single') stage.data = buildSingle(n, stage.cfg);
    else if (stage.type === 'double') stage.data = buildDouble(n, stage.cfg);
    else if (stage.type === 'rr') stage.data = buildRr(entrants, stage.cfg);
    else if (stage.type === 'swiss') {
      const half = Math.ceil(n / 2);
      const matches = [];
      for (let i = 0; i < Math.floor(n / 2); i++) matches.push({ id: `s0-${i}`, round: 0, a: entrants[i], b: entrants[i + half], bo: stage.cfg.bo, label: 'Omgång 1' });
      if (n % 2) matches.push({ id: 's0-bye', round: 0, a: entrants[half - 1], b: null, bo: 0, label: 'Omgång 1' });
      stage.data = { matches: matches, rounds: 1 };
    } else if (stage.type === 'heats') {
      stage.data = { rounds: [{ heats: makeHeats(entrants, stage.cfg.heatSize, 0) }] };
    } else if (stage.type === 'lobbies') {
      stage.data = buildLobbies(entrants, stage.cfg, rand);
    }
    return stage;
  }

  function reset(stage) {
    stage.status = 'setup';
    stage.entrants = null;
    stage.data = null;
    stage.results = {};
  }

  // Delar upp en lista med placeringar i grupper med delad placering
  function tiers(list) {
    const out = [];
    list.forEach((ids) => {
      const clean = ids.filter(Boolean);
      if (clean.length) out.push(clean);
    });
    return out;
  }

  /** Allt om en fas: matcher, tabeller, placeringar och vilka som går vidare. */
  function resolve(stage) {
    const R = { stage: stage, matches: [], done: false, placements: [], qualifiers: [], seedOf: {} };
    if (!stage.data) return R;
    const cfg = stage.cfg;
    stage.entrants.forEach((id, i) => (R.seedOf[id] = i + 1));
    const seedIdx = (id) => R.seedOf[id] || 999;

    if (stage.type === 'gsl' || stage.type === 'single' || stage.type === 'double') {
      R.matches = resolveGraph(stage.data.nodes, stage.entrants, stage.results);
      const by = {};
      R.matches.forEach((m) => (by[m.id] = m));
      R.byId = by;
      R.done = R.matches.every((m) => m.state === 'done' || m.state === 'bye' || m.state === 'empty' || m.state === 'skip');

      if (stage.type === 'gsl') {
        R.groups = stage.data.groups.map((g, gi) => {
          const p = 'g' + gi + '-';
          const order = [by[p + 'w'].winner, by[p + 'd'].winner, by[p + 'd'].loser, by[p + 'e'].loser];
          const ids = g.map((i) => stage.entrants[i]).filter(Boolean);
          const rec = {};
          ids.forEach((id) => (rec[id] = { id: id, w: 0, l: 0 }));
          R.matches.filter((m) => m.group === gi && m.state === 'done').forEach((m) => {
            rec[m.winner].w++;
            rec[m.loser].l++;
          });
          const rows = ids.map((id) => {
            const idx = order.indexOf(id);
            const r = rec[id];
            return Object.assign(r, { pos: idx >= 0 && id ? idx + 1 : null, status: idx >= 0 && idx < cfg.advancePerGroup ? 'advanced' : r.l >= 2 ? 'out' : 'active' });
          });
          rows.sort((a, b) => (a.pos || 9) - (b.pos || 9) || b.w - a.w || a.l - b.l || seedIdx(a.id) - seedIdx(b.id));
          return { name: 'Grupp ' + groupLetter(gi), index: gi, rows: rows, matches: R.matches.filter((m) => m.group === gi), order: order };
        });
        const maxPos = Math.max(...R.groups.map((g) => g.rows.length), 0);
        for (let p = 0; p < maxPos; p++) R.placements.push(R.groups.map((g) => g.order[p]).filter(Boolean));
        R.placements = tiers(R.placements);
        R.qualifiers = [];
        for (let p = 0; p < cfg.advancePerGroup; p++) R.groups.forEach((g) => g.order[p] && R.qualifiers.push(g.order[p]));
      } else if (stage.type === 'single') {
        const rounds = stage.data.rounds;
        const final = R.matches.find((m) => m.section === 'ub' && m.round === rounds - 1);
        const third = by.third;
        R.champion = final ? final.winner : null;
        const pl = [[final && final.winner], [final && final.loser]];
        if (third && third.state !== 'empty') {
          pl.push([third.winner], [third.loser]);
        } else if (rounds >= 2) {
          pl.push(R.matches.filter((m) => m.section === 'ub' && m.round === rounds - 2).map((m) => m.loser));
        }
        for (let r = rounds - 3; r >= 0; r--) pl.push(R.matches.filter((m) => m.section === 'ub' && m.round === r).map((m) => m.loser));
        R.placements = tiers(pl);
      } else {
        const gf2 = by.gf2;
        const gf = by.gf;
        const finalM = gf2 && gf2.state !== 'skip' ? gf2 : gf;
        R.champion = finalM.winner;
        const runnerUp = finalM.winner ? (finalM.winner === finalM.a ? finalM.b : finalM.a) : null;
        const pl = [[finalM.winner], [runnerUp]];
        stage.data.lb
          .slice()
          .reverse()
          .forEach((ids) => pl.push(ids.map((id) => by[id].loser)));
        R.placements = tiers(pl);
      }
    } else if (stage.type === 'rr') {
      R.matches = stage.data.matches.map((m) => directMatch(m, stage.results, cfg.allowDraw));
      R.done = R.matches.every((m) => m.state === 'done' || m.state === 'bye');
      R.groups = stage.data.groups.map((ids, gi) => {
        const ms = R.matches.filter((m) => m.group === gi);
        const rows = tableFor(ids, ms, cfg, R.seedOf);
        const groupDone = ms.every((m) => m.state === 'done');
        rows.forEach((r) => (r.status = groupDone ? (r.pos <= cfg.advancePerGroup ? 'advanced' : 'out') : 'active'));
        return { name: stage.data.groups.length > 1 ? 'Grupp ' + groupLetter(gi) : 'Tabell', index: gi, rows: rows, matches: ms, order: rows.map((r) => r.id) };
      });
      const maxPos = Math.max(...R.groups.map((g) => g.rows.length), 0);
      for (let p = 0; p < maxPos; p++) R.placements.push(R.groups.map((g) => g.order[p]).filter(Boolean));
      R.placements = tiers(R.placements);
      for (let p = 0; p < cfg.advancePerGroup; p++) R.groups.forEach((g) => g.order[p] && R.qualifiers.push(g.order[p]));
    } else if (stage.type === 'swiss') {
      R.matches = stage.data.matches.map((m) => directMatch(m, stage.results, false));
      const rec = swissRecords(stage, R.matches);
      R.records = rec;
      const active = Object.values(rec).filter((r) => r.status === 'active');
      const roundOpen = R.matches.some((m) => m.state === 'ready');
      R.done = !active.length && !roundOpen;
      R.rounds = stage.data.rounds;
      const sorted = Object.values(rec).sort((a, b) => b.w - a.w || a.l - b.l || b.buchholz - a.buchholz || b.mf - b.ma - (a.mf - a.ma) || seedIdx(a.id) - seedIdx(b.id));
      R.table = sorted;
      const groupsBy = (list) => {
        const out = [];
        let key = null;
        list.forEach((r) => {
          const k = r.w + '-' + r.l;
          if (k !== key) out.push([]);
          out[out.length - 1].push(r.id);
          key = k;
        });
        return out;
      };
      R.placements = tiers(groupsBy(sorted));
      R.qualifiers = sorted.filter((r) => r.status === 'advanced').map((r) => r.id);
    } else if (stage.type === 'heats') {
      R.rounds = stage.data.rounds.map((rd, ri) => {
        const heats = rd.heats.map((h) => {
          const st = heatStanding(h, stage.results[h.id], cfg, R.seedOf);
          const last = ri === stage.data.rounds.length - 1;
          const isFinal = rd.heats.length === 1;
          st.rows.forEach((r) => (r.status = st.complete && !isFinal ? (r.pos <= cfg.advancePerHeat ? 'advanced' : 'out') : st.complete && isFinal ? 'final' : 'active'));
          return Object.assign({}, h, st, { isFinal: isFinal, last: last });
        });
        return { index: ri, heats: heats, isFinal: heats.length === 1, complete: heats.every((h) => h.complete), name: heats.length === 1 ? 'Final' : `Runda ${ri + 1}` };
      });
      const lastRound = R.rounds[R.rounds.length - 1];
      R.done = lastRound.isFinal && lastRound.complete;
      // Placeringar: finalen först, sedan utslagna – senare runda och bättre heatplacering går före
      const pl = [];
      if (lastRound.isFinal) lastRound.heats[0].rows.forEach((r) => pl.push([lastRound.complete ? r.id : null]));
      for (let ri = R.rounds.length - (lastRound.isFinal ? 2 : 1); ri >= 0; ri--) {
        const rd = R.rounds[ri];
        if (!rd.complete) continue;
        const maxPos = Math.max(...rd.heats.map((h) => h.rows.length));
        for (let p = cfg.advancePerHeat + 1; p <= maxPos; p++) pl.push(rd.heats.map((h) => (h.rows[p - 1] ? h.rows[p - 1].id : null)));
      }
      R.placements = tiers(pl);
      R.champion = R.done ? lastRound.heats[0].rows[0].id : null;
    } else if (stage.type === 'lobbies') {
      const tot = {};
      stage.entrants.forEach((id) => (tot[id] = { id: id, total: 0, best: 0, played: 0 }));
      R.rounds = stage.data.rounds.map((rd, ri) => {
        const heats = rd.heats.map((h) => {
          const st = lobbyStanding(h, stage.results[h.id]);
          st.rows.forEach((r) => {
            if (r.total == null || !tot[r.id]) return;
            tot[r.id].total += r.total;
            tot[r.id].best = Math.max(tot[r.id].best, r.total);
            tot[r.id].played++;
          });
          return Object.assign({}, h, st, { lobby: true });
        });
        return { index: ri, heats: heats, complete: heats.every((h) => h.complete), name: stage.data.rounds.length > 1 ? `Omgång ${ri + 1}` : 'Lobbyer' };
      });
      R.done = R.rounds.every((rd) => rd.complete);
      const table = Object.values(tot).sort((a, b) => b.total - a.total || b.best - a.best || seedIdx(a.id) - seedIdx(b.id));
      const adv = cfg.advance > 0 ? Math.min(cfg.advance, table.length) : table.length;
      table.forEach((r, i) => {
        r.pos = i + 1;
        r.status = !R.done ? 'active' : i < adv ? 'advanced' : 'out';
      });
      R.table = table;
      R.placements = table.map((r) => [r.id]);
      R.qualifiers = table.slice(0, adv).map((r) => r.id);
      const stat = {};
      table.forEach((r) => (stat[r.id] = r.status));
      R.rounds.forEach((rd) => rd.heats.forEach((h) => h.rows.forEach((r) => (r.status = h.complete ? stat[r.id] : 'active'))));
    }

    // Delade placeringar sorteras på seedning
    R.placements = R.placements.map((tier) => tier.slice().sort((a, b) => seedIdx(a) - seedIdx(b)));
    // Placeringar från utslagsfaser kan föras vidare till nästa fas
    if (['single', 'double', 'heats'].includes(stage.type)) {
      const flat = [].concat(...R.placements);
      R.qualifiers = cfg.advance > 0 ? flat.slice(0, cfg.advance) : flat;
    }
    if (stage.type !== 'single' && stage.type !== 'double' && stage.type !== 'heats') R.champion = R.done && R.placements[0] && R.placements[0].length === 1 ? R.placements[0][0] : null;
    return R;
  }

  /** Spara ett matchresultat. winner = id, 'draw' eller null för att rensa. */
  function setResult(stage, match, winner, sa, sb, note) {
    if (!winner && sa == null && sb == null && !note) {
      delete stage.results[match.id];
      return;
    }
    stage.results[match.id] = {
      a: match.a,
      b: match.b,
      winner: winner && winner !== 'draw' ? winner : null,
      draw: winner === 'draw',
      sa: sa,
      sb: sb,
      note: note || '',
    };
  }

  function setHeatResult(stage, heatId, races) {
    stage.results[heatId] = { races: races };
  }

  /** Poäng per spelare i en lobby, t.ex. { id1: 54, id2: 41 } */
  function setLobbyResult(stage, lobbyId, points) {
    stage.results[lobbyId] = { points: points };
  }

  /**
   * För Swiss och heat skapas nästa omgång när den förra är klar.
   * Returnerar true om något ändrades.
   */
  function progress(stage) {
    if (!stage.data || stage.status !== 'live') return false;
    if (stage.type === 'swiss') {
      const R = resolve(stage);
      if (R.matches.some((m) => m.state === 'ready')) return false;
      const active = Object.values(R.records).filter((r) => r.status === 'active');
      if (!active.length) return false;
      const next = swissPairRound(stage, R.records, stage.data.rounds);
      stage.data.matches = stage.data.matches.concat(next);
      stage.data.rounds++;
      return true;
    }
    if (stage.type === 'heats') {
      const R = resolve(stage);
      const last = R.rounds[R.rounds.length - 1];
      if (!last.complete || last.isFinal) return false;
      const byPlace = [];
      last.heats.forEach((h) => h.rows.slice(0, stage.cfg.advancePerHeat).forEach((r) => (byPlace[r.pos - 1] = (byPlace[r.pos - 1] || []).concat(r.id))));
      let advancers = [].concat(...byPlace.filter(Boolean));
      const prevCount = last.heats.reduce((s, h) => s + h.players.length, 0);
      const size = advancers.length >= prevCount || advancers.length <= stage.cfg.heatSize ? Math.max(advancers.length, 1) : stage.cfg.heatSize;
      stage.data.rounds.push({ heats: makeHeats(advancers, size, stage.data.rounds.length) });
      return true;
    }
    return false;
  }

  /** Kan resultatet för en match ändras? Inte om senare omgångar redan byggts på det (Swiss/heat). */
  function isLocked(stage, item) {
    if (stage.type === 'swiss') return item.round < stage.data.rounds - 1;
    if (stage.type === 'heats') return item.round < stage.data.rounds.length - 1;
    return false;
  }

  /** Mallar för vanliga turneringsformat. */
  const PRESETS = [
    {
      id: 'league',
      name: 'Poängliga',
      desc: 'Poäng per omgång, tabell och slutspel för de bästa.',
      mode: 'individual',
      format: 'league',
    },
    {
      id: 'champions',
      name: 'Valorant Champions',
      desc: '16 lag: 4 GSL-grupper (Bo3), topp 2 till dubbelutslagning. Undre final och final Bo5.',
      mode: 'team',
      rosterSize: 5,
      game: 'valorant',
      stages: [
        { type: 'gsl', name: 'Gruppspel', cfg: { groups: 4, advancePerGroup: 2, bo: 3, deciderBo: 3 } },
        { type: 'double', name: 'Slutspel', cfg: { bo: 3, ubFinalBo: 3, lbFinalBo: 5, gfBo: 5, gfReset: false } },
      ],
    },
    {
      id: 'major',
      name: 'CS Major',
      desc: '16 lag: Swiss (Bo1, avgörande Bo3), 3 vinster vidare. Topp 8 till utslagning Bo3.',
      mode: 'team',
      rosterSize: 5,
      game: 'cs2',
      stages: [
        { type: 'swiss', name: 'Swiss-fas', cfg: { winsToAdvance: 3, lossesToElim: 3, bo: 1, decisiveBo: 3 } },
        { type: 'single', name: 'Slutspel', cfg: { bo: 3, semiBo: 3, finalBo: 3, third: false } },
      ],
    },
    {
      id: 'mariokart',
      name: 'Mario Kart',
      desc: 'Poängfas i slumpade 1v1v1v1-lobbyer (spelets poäng, max 60). De 8 bästa går till heat om 4 där topp 2 går vidare till final.',
      mode: 'individual',
      stages: [
        { type: 'lobbies', name: 'Poängfas', cfg: { size: 4, rounds: 1, maxPoints: 60, advance: 8 } },
        { type: 'heats', name: 'Heatrundor', cfg: { heatSize: 4, advancePerHeat: 2, races: 1, points: MK_POINTS.join(', ') } },
      ],
    },
    {
      id: 'circle',
      name: 'Cirkel + final',
      desc: 'Lagen står i en ring och möter sina två grannar (5 lag = 5 matcher). Topp 2 möts i final.',
      mode: 'team',
      stages: [
        { type: 'rr', name: 'Cirkel', cfg: { groups: 1, advancePerGroup: 2, bo: 1, perTeam: 2 } },
        { type: 'single', name: 'Final', cfg: { bo: 1, semiBo: 1, finalBo: 3 } },
      ],
    },
    {
      id: 'groups-playoff',
      name: 'Gruppspel + slutspel',
      desc: 'Alla möter alla i grupper, de bästa går till utslagning.',
      mode: 'team',
      stages: [
        { type: 'rr', name: 'Gruppspel', cfg: { groups: 2, advancePerGroup: 2 } },
        { type: 'single', name: 'Slutspel', cfg: { bo: 1, semiBo: 1, finalBo: 3 } },
      ],
    },
    { id: 'single', name: 'Utslagning', desc: 'Enkel utslagning direkt.', mode: 'team', stages: [{ type: 'single', name: 'Slutspel', cfg: {} }] },
    { id: 'double', name: 'Dubbelutslagning', desc: 'Övre och undre träd direkt.', mode: 'team', stages: [{ type: 'double', name: 'Slutspel', cfg: {} }] },
    { id: 'custom', name: 'Anpassat', desc: 'Bygg ditt eget format fas för fas.', mode: 'team', stages: [] },
  ];

  function stagesFromPreset(preset) {
    return (preset.stages || []).map((s) => {
      const st = newStage(s.type, s.name);
      Object.assign(st.cfg, s.cfg || {});
      return st;
    });
  }

  const api = {
    TYPES: TYPES,
    PRESETS: PRESETS,
    MK_POINTS: MK_POINTS,
    defaultCfg: defaultCfg,
    newStage: newStage,
    stagesFromPreset: stagesFromPreset,
    start: start,
    reset: reset,
    resolve: resolve,
    setResult: setResult,
    setHeatResult: setHeatResult,
    setLobbyResult: setLobbyResult,
    splitLobbies: splitLobbies,
    progress: progress,
    isLocked: isLocked,
    winsNeeded: winsNeeded,
    parsePoints: parsePoints,
    groupLetter: groupLetter,
    roundRobinPairs: roundRobinPairs,
    circlePairs: circlePairs,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TStages = api;
})(typeof window !== 'undefined' ? window : globalThis);
