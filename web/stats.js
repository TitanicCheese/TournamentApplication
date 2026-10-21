/*
 * Spelarstatistik: speldefinitioner, topplistor och avläsning av scoreboards.
 * Ren logik utan DOM – används av appen och av testerna (Node).
 */
(function (root) {
  'use strict';

  // kind: 'sum' summeras över kartor, 'avg' snitt per karta
  const GAMES = {
    cs2: {
      name: 'CS2',
      long: 'Counter-Strike 2',
      stats: [
        { key: 'k', label: 'K', long: 'Kills', kind: 'sum' },
        { key: 'd', label: 'D', long: 'Deaths', kind: 'sum' },
        { key: 'a', label: 'A', long: 'Assists', kind: 'sum' },
        { key: 'mvp', label: 'MVP', long: 'MVP stars', kind: 'sum' },
        { key: 'score', label: 'Poäng', long: 'Scoreboard score', kind: 'sum' },
        { key: 'dmg', label: 'Skada', long: 'Total damage dealt', kind: 'sum' },
      ],
      hint: 'TAB-tavlan i slutet av kartan: namn, K, D, A, MVP-stjärnor (siffran vid stjärnan, ingen stjärna = 0), poäng och skada.',
    },
    valorant: {
      name: 'Valorant',
      long: 'Valorant',
      stats: [
        { key: 'acs', label: 'ACS', long: 'Average combat score', kind: 'avg' },
        { key: 'k', label: 'K', long: 'Kills', kind: 'sum' },
        { key: 'd', label: 'D', long: 'Deaths', kind: 'sum' },
        { key: 'a', label: 'A', long: 'Assists', kind: 'sum' },
        { key: 'econ', label: 'Econ', long: 'Econ rating', kind: 'avg' },
        { key: 'fb', label: 'FB', long: 'First bloods', kind: 'sum' },
        { key: 'plants', label: 'Plant', long: 'Spike plants', kind: 'sum' },
        { key: 'defuses', label: 'Def', long: 'Spike defuses', kind: 'sum' },
      ],
      hint: 'Scoreboard efter matchen: ACS, K, D, A, Econ, First Bloods, Plants och Defuses.',
    },
    lol: {
      name: 'LoL',
      long: 'League of Legends',
      stats: [
        { key: 'k', label: 'K', long: 'Kills', kind: 'sum' },
        { key: 'd', label: 'D', long: 'Deaths', kind: 'sum' },
        { key: 'a', label: 'A', long: 'Assists', kind: 'sum' },
        { key: 'cs', label: 'CS', long: 'Creep score (minions)', kind: 'avg' },
        { key: 'gold', label: 'Guld', long: 'Gold earned', kind: 'avg' },
        { key: 'dmg', label: 'Skada', long: 'Damage to champions', kind: 'avg' },
      ],
      hint: 'Resultatskärmen efter matchen med KDA, CS, guld och skada.',
    },
    rl: {
      name: 'Rocket League',
      long: 'Rocket League',
      stats: [
        { key: 'score', label: 'Poäng', long: 'Score', kind: 'sum' },
        { key: 'goals', label: 'Mål', long: 'Goals', kind: 'sum' },
        { key: 'assists', label: 'Assist', long: 'Assists', kind: 'sum' },
        { key: 'saves', label: 'Räddn.', long: 'Saves', kind: 'sum' },
        { key: 'shots', label: 'Skott', long: 'Shots', kind: 'sum' },
      ],
      hint: 'Scoreboard efter matchen: poäng, mål, assists, räddningar och skott.',
    },
  };

  /** Spelet för en turnering, inklusive egna statistikfält. */
  function gameFor(settings) {
    const id = settings && settings.game;
    if (!id || id === 'none') return null;
    if (id === 'custom') {
      const names = String(settings.customStats || '')
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12);
      if (!names.length) return null;
      return {
        id: 'custom',
        name: settings.customGameName || 'Eget spel',
        long: settings.customGameName || 'the game',
        stats: names.map((n, i) => ({ key: 's' + i, label: n.slice(0, 8), long: n, kind: 'sum' })),
        hint: 'Scoreboarden med kolumnerna ' + names.join(', ') + '.',
      };
    }
    return GAMES[id] ? Object.assign({ id: id }, GAMES[id]) : null;
  }

  const hasStat = (game, key) => game.stats.some((s) => s.key === key);

  /** Härledda kolumner (K/D, KDA, +/-) för spel som har K och D. */
  function derivedFor(game) {
    const out = [];
    if (hasStat(game, 'k') && hasStat(game, 'd')) {
      out.push({ key: 'kd', label: 'K/D', long: 'Kills per death', kind: 'derived' });
      out.push({ key: 'diff', label: '+/−', long: 'Kills minus deaths', kind: 'derived' });
      if (hasStat(game, 'a')) out.push({ key: 'kda', label: 'KDA', long: '(Kills + assists) per death', kind: 'derived' });
    }
    return out;
  }

  /** Normaliserar ett namn för jämförelse (gemener, utan klantaggar/specialtecken). */
  function normName(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\[[^\]]*\]|\([^)]*\)/g, '')
      .replace(/[^a-z0-9]+/g, '');
  }

  /** Hittar bästa namnet i en lista (exakt, sedan början/innehåller). */
  function matchName(name, candidates) {
    const n = normName(name);
    if (!n) return null;
    let hit = candidates.find((c) => normName(c) === n);
    if (hit) return hit;
    hit = candidates.find((c) => {
      const m = normName(c);
      return m.length >= 3 && (n.includes(m) || m.includes(n));
    });
    return hit || null;
  }

  const num = (v) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : null);
  const r2 = (n) => Math.round(n * 100) / 100;

  /**
   * Topplista över alla registrerade kartor.
   * maps: [{rows: [{name, teamId, stats: {key: number|null}}]}]
   */
  function leaderboard(maps, game) {
    const players = {};
    maps.forEach((m) => {
      (m.rows || []).forEach((row) => {
        if (!row.name) return;
        const key = normName(row.name) + '|' + (row.teamId || '');
        const p = (players[key] = players[key] || { key: key, name: row.name, teamId: row.teamId || null, maps: 0, sums: {}, counts: {} });
        p.maps++;
        game.stats.forEach((s) => {
          const v = num(row.stats && row.stats[s.key]);
          if (v == null) return;
          p.sums[s.key] = (p.sums[s.key] || 0) + v;
          p.counts[s.key] = (p.counts[s.key] || 0) + 1;
        });
      });
    });
    return Object.values(players).map((p) => {
      const v = {};
      game.stats.forEach((s) => {
        if (!p.counts[s.key]) v[s.key] = null;
        else v[s.key] = s.kind === 'avg' ? r2(p.sums[s.key] / p.counts[s.key]) : r2(p.sums[s.key]);
      });
      if (hasStat(game, 'k') && hasStat(game, 'd') && v.k != null && v.d != null) {
        v.kd = r2(v.k / Math.max(1, v.d));
        v.diff = v.k - v.d;
        if (v.a != null) v.kda = r2((v.k + v.a) / Math.max(1, v.d));
      }
      return { key: p.key, name: p.name, teamId: p.teamId, maps: p.maps, values: v };
    });
  }

  function sortBoard(rows, key, minMaps) {
    return rows
      .filter((r) => r.maps >= (minMaps || 1))
      .slice()
      .sort((a, b) => {
        const av = key === 'maps' ? a.maps : a.values[key];
        const bv = key === 'maps' ? b.maps : b.values[key];
        if (av == null && bv == null) return a.name.localeCompare(b.name, 'sv');
        if (av == null) return 1;
        if (bv == null) return -1;
        return bv - av || a.name.localeCompare(b.name, 'sv');
      });
  }

  /* ------------------------------------------------------------------ */
  /* Avläsning av scoreboard                                             */
  /* ------------------------------------------------------------------ */

  /** JSON-schema för strukturerat svar (alla fält krävs, -1 = syns inte). */
  function scoreboardSchema(game) {
    const statProps = {};
    game.stats.forEach((s) => (statProps[s.key] = { type: 'number', description: s.long + ' (-1 if not shown)' }));
    return {
      type: 'object',
      additionalProperties: false,
      required: ['map', 'teams'],
      properties: {
        map: { type: 'string', description: 'Map name if visible, else empty string' },
        teams: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'score', 'players'],
            properties: {
              name: { type: 'string', description: 'Team name as shown, or the tournament team it matches, else empty string' },
              score: { type: 'number', description: 'Rounds/points won on this map (-1 if not shown)' },
              players: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['name', 'roster_name', 'stats'],
                  properties: {
                    name: { type: 'string', description: 'In-game name exactly as shown' },
                    roster_name: { type: 'string', description: 'The matching roster name from the list given, or empty string' },
                    stats: { type: 'object', additionalProperties: false, required: game.stats.map((s) => s.key), properties: statProps },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  /**
   * Instruktion till Claude. teams: [{name, members: [string]}] – de lag som
   * kan finnas på bilden (t.ex. de två lagen i matchen).
   */
  function scoreboardPrompt(game, teams, asJsonText) {
    const statLines = game.stats.map((s) => `- "${s.key}": ${s.long}`).join('\n');
    const rosterLines = teams.length
      ? teams.map((t) => `- ${t.name}: ${(t.members || []).length ? t.members.join(', ') : '(no roster entered)'}`).join('\n')
      : '(no teams entered)';
    const example = {
      map: 'Mirage',
      teams: [{ name: 'Team A', score: 13, players: [{ name: 'player1', roster_name: 'Player One', stats: Object.fromEntries(game.stats.map((s) => [s.key, 0])) }] }],
    };
    return (
      `The image is a screenshot of an end-of-match scoreboard from ${game.long}. ` +
      `Read every player row and return the statistics.\n\n` +
      `Statistics to read for each player (numbers only, -1 when a value is not shown):\n${statLines}\n\n` +
      `Percentages are plain numbers (45% -> 45). Values like "1.2k" mean 1200.\n\n` +
      `Teams registered in this tournament with their player rosters:\n${rosterLines}\n\n` +
      `Group players by the team they played for on the scoreboard. For each team, set "name" to the registered team it matches ` +
      `(compare the players with the rosters) or the name shown on screen. For each player, set "roster_name" to the roster entry ` +
      `that is the same person (in-game names often add clan tags or nicknames), or "" when none matches. ` +
      `Set "score" to the rounds or points the team won on this map. Set "map" to the map name if it is shown.` +
      (asJsonText ? `\n\nReply with only one JSON object shaped like this example, no other text:\n${JSON.stringify(example)}` : '')
    );
  }

  /**
   * Gör om Claudes svar till kartdata. participants: [{id, name, members}]
   * – de lag som svaret ska kopplas till.
   */
  function normalizeReading(reading, game, participants) {
    const teams = Array.isArray(reading && reading.teams) ? reading.teams : [];
    const used = new Set();
    const pickTeam = (t) => {
      const names = (t.players || []).map((p) => p.roster_name || p.name);
      let best = null;
      let bestScore = 0;
      participants.forEach((pt) => {
        if (used.has(pt.id)) return;
        let s = 0;
        if (t.name && matchName(t.name, [pt.name])) s += 3;
        names.forEach((n) => {
          if (matchName(n, pt.members || [])) s += 1;
        });
        if (s > bestScore) {
          bestScore = s;
          best = pt;
        }
      });
      if (best) used.add(best.id);
      return best;
    };
    const outTeams = teams.map((t) => {
      const pt = pickTeam(t);
      return { teamId: pt ? pt.id : null, name: pt ? pt.name : String(t.name || ''), score: num(t.score) };
    });
    // Lag som inte kunde kopplas får de lediga deltagarna i tur och ordning
    outTeams.forEach((t) => {
      if (t.teamId) return;
      const free = participants.find((p) => !used.has(p.id));
      if (free && participants.length <= 2) {
        t.teamId = free.id;
        t.name = free.name;
        used.add(free.id);
      }
    });
    const rows = [];
    teams.forEach((t, ti) => {
      const pt = participants.find((p) => p.id === outTeams[ti].teamId);
      (t.players || []).forEach((p) => {
        const rosterHit = pt ? matchName(p.roster_name || '', pt.members || []) || matchName(p.name || '', pt.members || []) : null;
        const stats = {};
        game.stats.forEach((s) => (stats[s.key] = num(Number(p.stats && p.stats[s.key]))));
        rows.push({ name: rosterHit || String(p.name || '').trim(), ingame: String(p.name || '').trim(), team: ti, stats: stats });
      });
    });
    return { label: String((reading && reading.map) || '').trim(), teams: outTeams, rows: rows };
  }

  const api = {
    GAMES: GAMES,
    gameFor: gameFor,
    derivedFor: derivedFor,
    normName: normName,
    matchName: matchName,
    leaderboard: leaderboard,
    sortBoard: sortBoard,
    scoreboardSchema: scoreboardSchema,
    scoreboardPrompt: scoreboardPrompt,
    normalizeReading: normalizeReading,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TStats = api;
})(typeof window !== 'undefined' ? window : globalThis);
