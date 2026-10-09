/*
 * Turneringslogik: tabellberäkning, seedning och slutspelsträd.
 * Ren logik utan DOM – används av appen och av testerna (Node).
 */
(function (root) {
  'use strict';

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function isNum(v) {
    return typeof v === 'number' && isFinite(v);
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function roundHasScores(round) {
    return Object.values(round.scores || {}).some(isNum);
  }

  function compareRows(a, b) {
    if (b.total !== a.total) return b.total - a.total;
    const ab = a.best == null ? -Infinity : a.best;
    const bb = b.best == null ? -Infinity : b.best;
    if (bb !== ab) return bb - ab;
    const aa = a.avg == null ? -Infinity : a.avg;
    const ba = b.avg == null ? -Infinity : b.avg;
    if (ba !== aa) return ba - aa;
    return a.name.localeCompare(b.name, 'sv', { numeric: true });
  }

  /**
   * Beräknar tabellen för en turnering.
   * opts.rounds: vilka omgångar som ska räknas (standard: alla)
   * Returnerar rader sorterade efter placering.
   */
  function computeStandings(t, opts) {
    const rounds = (opts && opts.rounds) || t.rounds;
    const bestOf = t.settings && t.settings.bestOf > 0 ? t.settings.bestOf : 0;
    const rows = t.players
      .filter((p) => p.active !== false)
      .map((p) => {
        const scores = [];
        const perRound = [];
        rounds.forEach((r) => {
          const v = (r.scores || {})[p.id];
          perRound.push(isNum(v) ? v : null);
          if (isNum(v)) scores.push(v);
        });
        let counted = scores;
        if (bestOf && scores.length > bestOf) {
          counted = scores.slice().sort((a, b) => b - a).slice(0, bestOf);
        }
        const sum = scores.reduce((a, b) => a + b, 0);
        return {
          id: p.id,
          player: p,
          name: p.name,
          total: round2(counted.reduce((a, b) => a + b, 0)),
          played: scores.length,
          best: scores.length ? Math.max.apply(null, scores) : null,
          worst: scores.length ? Math.min.apply(null, scores) : null,
          avg: scores.length ? round2(sum / scores.length) : null,
          perRound: perRound,
        };
      });
    rows.sort(compareRows);
    let prev = null;
    rows.forEach((r, i) => {
      r.tied = false;
      if (prev && r.total === prev.total) {
        r.rank = prev.rank;
        r.tied = true;
        prev.tied = true;
      } else {
        r.rank = i + 1;
      }
      prev = r;
    });
    return rows;
  }

  /**
   * Tabell med förändring jämfört med före senaste spelade omgång.
   * r.move > 0 betyder att spelaren klättrat.
   */
  function standingsWithMovement(t) {
    const rows = computeStandings(t);
    const scored = t.rounds.filter(roundHasScores);
    if (scored.length >= 2) {
      const last = scored[scored.length - 1];
      const prev = computeStandings(t, { rounds: t.rounds.filter((r) => r !== last) });
      const prevRank = {};
      prev.forEach((r) => (prevRank[r.id] = r.rank));
      rows.forEach((r) => {
        r.move = prevRank[r.id] != null ? prevRank[r.id] - r.rank : 0;
      });
    } else {
      rows.forEach((r) => (r.move = 0));
    }
    return rows;
  }

  /** Placering för en spelare efter varje omgång. */
  function rankHistory(t, playerId) {
    const out = [];
    for (let i = 1; i <= t.rounds.length; i++) {
      const rows = computeStandings(t, { rounds: t.rounds.slice(0, i) });
      const row = rows.find((r) => r.id === playerId);
      out.push(row ? row.rank : null);
    }
    return out;
  }

  function nextPow2(n) {
    let p = 1;
    while (p < n) p *= 2;
    return p;
  }

  /** Standardseedning: 1 möter sista, 1 och 2 kan bara mötas i finalen. */
  function seedOrder(size) {
    let order = [1];
    while (order.length < size) {
      const n = order.length * 2;
      const next = [];
      order.forEach((s) => next.push(s, n + 1 - s));
      order = next;
    }
    return order;
  }

  function shuffle(arr, rnd) {
    const a = arr.slice();
    const random = rnd || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  /**
   * Skapar ett slutspel. ids = kvalificerade spelare i seedningsordning.
   * Antal behöver inte vara en tvåpotens – topseedade får walk over.
   */
  function createPlayoff(ids, opts) {
    opts = opts || {};
    if (ids.length < 2) throw new Error('Minst 2 spelare krävs');
    const seeds = opts.seeding === 'random' ? shuffle(ids, opts.random) : ids.slice();
    const size = nextPow2(seeds.length);
    const slots = seedOrder(size).map((s) => seeds[s - 1] || null);
    return {
      createdAt: Date.now(),
      size: size,
      seeding: opts.seeding === 'random' ? 'random' : 'standard',
      thirdPlace: !!opts.thirdPlace,
      seeds: seeds,
      slots: slots,
      results: {},
    };
  }

  function roundName(matchCount) {
    switch (matchCount) {
      case 1: return 'Final';
      case 2: return 'Semifinal';
      case 4: return 'Kvartsfinal';
      case 8: return 'Åttondelsfinal';
      case 16: return 'Sextondelsfinal';
      default: return matchCount * 2 + '-delsfinal';
    }
  }

  function resultFor(po, key, a, b) {
    const res = po.results[key];
    if (!res || res.a !== a || res.b !== b) return null;
    return res;
  }

  /** Härleder hela slutspelsträdet från seedning + inmatade resultat. */
  function resolvePlayoff(po) {
    const seedOf = {};
    po.seeds.forEach((id, i) => (seedOf[id] = i + 1));
    const rounds = [];
    let participants = po.slots.slice();
    let r = 0;
    while (participants.length >= 2) {
      const matches = [];
      const next = [];
      for (let m = 0; m < participants.length / 2; m++) {
        const a = participants[2 * m];
        const b = participants[2 * m + 1];
        const key = r + '-' + m;
        let winner = null;
        let bye = false;
        let res = null;
        if (r === 0 && (a == null) !== (b == null)) {
          winner = a || b;
          bye = true;
        } else if (a && b) {
          res = resultFor(po, key, a, b);
          if (res && (res.winner === a || res.winner === b)) winner = res.winner;
          else res = res && (res.sa != null || res.sb != null) ? res : null;
        }
        matches.push({
          key: key,
          round: r,
          index: m,
          a: a,
          b: b,
          seedA: a ? seedOf[a] : null,
          seedB: b ? seedOf[b] : null,
          sa: res ? res.sa : null,
          sb: res ? res.sb : null,
          winner: winner,
          loser: winner && !bye ? (winner === a ? b : a) : null,
          bye: bye,
          ready: !!(a && b),
        });
        next.push(winner);
      }
      rounds.push({ name: roundName(matches.length), matches: matches });
      participants = next;
      r++;
    }
    rounds.forEach((rd) => {
      rd.played = rd.matches.filter((m) => m.winner && !m.bye).length;
    });

    let third = null;
    if (po.thirdPlace && rounds.length >= 2) {
      const semis = rounds[rounds.length - 2].matches;
      const a = semis[0].loser;
      const b = semis[1].loser;
      const res = a && b ? resultFor(po, 'third', a, b) : null;
      const winner = res && (res.winner === a || res.winner === b) ? res.winner : null;
      third = {
        key: 'third',
        round: -1,
        a: a,
        b: b,
        seedA: a ? seedOf[a] : null,
        seedB: b ? seedOf[b] : null,
        sa: res ? res.sa : null,
        sb: res ? res.sb : null,
        winner: winner,
        loser: winner ? (winner === a ? b : a) : null,
        bye: false,
        ready: !!(a && b),
        applicable: !(semis[0].bye || semis[1].bye),
      };
    }

    const final = rounds[rounds.length - 1].matches[0];
    const all = rounds.reduce((acc, rd) => acc.concat(rd.matches.filter((m) => !m.bye)), []);
    if (third && third.applicable) all.push(third);
    return {
      rounds: rounds,
      third: third,
      champion: final.winner,
      runnerUp: final.loser,
      thirdPlace: third ? third.winner : null,
      totalMatches: all.length,
      playedMatches: all.filter((m) => m.winner).length,
      seedOf: seedOf,
    };
  }

  function findMatch(resolved, key) {
    if (key === 'third') return resolved.third;
    for (const rd of resolved.rounds) {
      for (const m of rd.matches) if (m.key === key) return m;
    }
    return null;
  }

  /** Sparar ett matchresultat. winner = spelar-id eller null för att rensa. */
  function setResult(po, match, winner, sa, sb) {
    if (!winner && sa == null && sb == null) {
      delete po.results[match.key];
      return;
    }
    po.results[match.key] = { a: match.a, b: match.b, winner: winner || null, sa: sa, sb: sb };
  }

  /** Lottning i grupper. mode: 'random' eller 'snake' (efter given ordning). */
  function makeGroups(ids, groupCount, mode, rnd) {
    const n = Math.max(1, Math.min(groupCount, ids.length || 1));
    const list = mode === 'snake' ? ids.slice() : shuffle(ids, rnd);
    const groups = Array.from({ length: n }, () => []);
    list.forEach((id, i) => {
      const lap = Math.floor(i / n);
      const pos = i % n;
      const g = mode === 'snake' && lap % 2 === 1 ? n - 1 - pos : pos;
      groups[g].push(id);
    });
    return groups;
  }

  const api = {
    uid: uid,
    isNum: isNum,
    round2: round2,
    roundHasScores: roundHasScores,
    computeStandings: computeStandings,
    standingsWithMovement: standingsWithMovement,
    rankHistory: rankHistory,
    nextPow2: nextPow2,
    seedOrder: seedOrder,
    shuffle: shuffle,
    createPlayoff: createPlayoff,
    resolvePlayoff: resolvePlayoff,
    findMatch: findMatch,
    setResult: setResult,
    roundName: roundName,
    makeGroups: makeGroups,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
