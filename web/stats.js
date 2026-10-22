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
      read: 'MVP stars: a star with a number means that number, a star alone means 1, no star means 0. The team score is the rounds won.',
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
      read: 'Kills, deaths and assists can be in one column as "K / D / A". The team score is the rounds won. At the top, the left score belongs to the team with green or teal rows and the right score to the team with red rows.',
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
      read: 'The KDA column is "kills/deaths/assists". League of Legends has no round score: set every team_score to -1. Numbers like "23,410" mean 23410.',
    },
    rl: {
      name: 'Rocket League',
      long: 'Rocket League',
      stats: [
        { key: 'score', label: 'Poäng', long: 'Player score', kind: 'sum' },
        { key: 'goals', label: 'Mål', long: 'Goals', kind: 'sum' },
        { key: 'assists', label: 'Assist', long: 'Assists', kind: 'sum' },
        { key: 'saves', label: 'Räddn.', long: 'Saves', kind: 'sum' },
        { key: 'shots', label: 'Skott', long: 'Shots', kind: 'sum' },
      ],
      hint: 'Scoreboard efter matchen: poäng, mål, assists, räddningar och skott.',
      read: 'Player score is the SCORE column of each player. The team score is the goals the team scored.',
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
    const raw = String(s || '').toLowerCase();
    const n = raw
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\[[^\]]*\]|\([^)]*\)/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, '');
    // Namn med bara symboler ska inte bli tomma och slås ihop med varandra
    return n || raw.replace(/\s+/g, '');
  }

  /**
   * Hittar bästa namnet i en lista: exakt träff, annars ett namn som börjar eller slutar likadant
   * (avklippta namn eller lagtagg före namnet i skärmklipp), aldrig mitt i ett annat namn. Vid flera möjliga träffar returneras null.
   */
  function matchName(name, candidates) {
    const n = normName(name);
    if (!n) return null;
    const hit = candidates.find((c) => normName(c) === n);
    if (hit) return hit;
    const near = candidates.filter((c) => {
      const m = normName(c);
      if (Math.min(m.length, n.length) < 3) return false;
      const [short, long] = m.length < n.length ? [m, n] : [n, m];
      return long.startsWith(short) || long.endsWith(short);
    });
    return near.length === 1 ? near[0] : null;
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
        // K/D, +/- och KDA räknas bara på kartor där både kills och deaths finns
        const k = num(row.stats && row.stats.k), d = num(row.stats && row.stats.d), a = num(row.stats && row.stats.a);
        if (k != null && d != null) {
          p.kd = p.kd || { k: 0, d: 0, ka: 0, da: 0, a: 0, withA: 0 };
          p.kd.k += k;
          p.kd.d += d;
          if (a != null) {
            p.kd.ka += k;
            p.kd.da += d;
            p.kd.a += a;
            p.kd.withA++;
          }
        }
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
      if (hasStat(game, 'k') && hasStat(game, 'd') && p.kd) {
        v.kd = r2(p.kd.k / Math.max(1, p.kd.d));
        v.diff = p.kd.k - p.kd.d;
        if (hasStat(game, 'a') && p.kd.withA) v.kda = r2((p.kd.ka + p.kd.a) / Math.max(1, p.kd.da));
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

  /**
   * Fältnamnen som modellen ser för varje statistikfält, i samma ordning som game.stats.
   * Beskrivande namn (t.ex. "kills", "mvp_stars") läses av säkrare än korta nycklar
   * som "k" eller "score", som annars blandas ihop med lagets resultat.
   */
  function readKeys(game) {
    const used = new Set();
    return game.stats.map((s, i) => {
      let k = String(s.long || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 40);
      if (!/^[a-z]/.test(k) || used.has(k) || k === 'team_score') k = 'stat_' + (i + 1);
      used.add(k);
      return k;
    });
  }

  /** JSON-schema för strukturerat svar (alla fält krävs, -1 = syns inte). */
  function scoreboardSchema(game) {
    const keys = readKeys(game);
    const statProps = {};
    game.stats.forEach((s, i) => (statProps[keys[i]] = { type: 'number', description: s.long + ' (0 for an empty cell, -1 if the column is not on the scoreboard)' }));
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
            required: ['name', 'team_score', 'players'],
            properties: {
              name: { type: 'string', description: 'Team name as shown, or the tournament team it matches, else empty string' },
              team_score: { type: 'number', description: 'Rounds or goals this team won on this map (-1 if the game shows none)' },
              players: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['name', 'roster_name', 'stats'],
                  properties: {
                    name: { type: 'string', description: 'In-game name exactly as shown' },
                    roster_name: { type: 'string', description: 'The matching roster name from the list given, or empty string' },
                    stats: { type: 'object', additionalProperties: false, required: keys, properties: statProps },
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
   * Instruktion till AI-modellen. teams: [{name, members: [string]}] – de lag som
   * kan finnas på bilden (t.ex. de två lagen i matchen).
   */
  function scoreboardPrompt(game, teams, asJsonText) {
    const keys = readKeys(game);
    const statLines = game.stats.map((s, i) => `- "${keys[i]}": ${s.long}`).join('\n');
    const rosterLines = teams.length
      ? teams.map((t) => `- ${t.name}: ${(t.members || []).length ? t.members.join(', ') : '(no roster entered)'}`).join('\n')
      : '(no teams entered)';
    const example = {
      map: 'Mirage',
      teams: [{ name: 'Team A', team_score: 13, players: [{ name: 'player1', roster_name: 'Player One', stats: Object.fromEntries(keys.map((k) => [k, 0])) }] }],
    };
    return (
      `The image is a screenshot of an end-of-match scoreboard from ${game.long}. ` +
      `Read every player row and return the statistics.\n\n` +
      `Statistics to read for each player:\n${statLines}\n\n` +
      `Rules for numbers:\n` +
      `- Use the number in the player's own row and the matching column. Ignore columns that are not in the list.\n` +
      `- An empty cell in a listed column means 0. Use -1 only when the column is not on the scoreboard at all.\n` +
      `- Percentages are plain numbers (45% -> 45). "1.2k" means 1200. "23,410" means 23410.\n` +
      (game.read ? `- ${game.read}\n` : '') +
      `\nTeams registered in this tournament with their player rosters:\n${rosterLines}\n\n` +
      `Group players by the team they played for on the scoreboard. For each team, set "name" to the registered team it matches ` +
      `(compare the players with the rosters) or the name shown on screen. For each player, set "roster_name" to the roster entry ` +
      `that is the same person (in-game names often add clan tags or nicknames), or "" when none matches. ` +
      `Set "team_score" to the rounds or goals the team won on this map. A team's score is the one shown in the same color, on the same side or ` +
      `next to the same label as that team's rows. Set "map" to the map name if it is shown.` +
      (asJsonText ? `\n\nReply with only one JSON object shaped like this example, no other text:\n${JSON.stringify(example)}` : '')
    );
  }

  /**
   * Förfrågan till Mistrals chat-API för en scoreboard-bild. image är en data-URL.
   * Svaret är ett JSON-objekt enligt scoreboardSchema i choices[0].message.content.
   */
  function mistralRequest(game, teams, model, image) {
    return {
      model: model,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: image },
            { type: 'text', text: scoreboardPrompt(game, teams, false) },
          ],
        },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'scoreboard', schema: scoreboardSchema(game), strict: true } },
    };
  }

  /**
   * Gör om AI-modellens svar till kartdata. participants: [{id, name, members}]
   * – de lag som svaret ska kopplas till.
   */
  function normalizeReading(reading, game, participants) {
    const keys = readKeys(game);
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
      return { teamId: pt ? pt.id : null, name: pt ? pt.name : String(t.name || ''), score: num(t.team_score) };
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
        game.stats.forEach((s, i) => (stats[s.key] = num(Number(p.stats && p.stats[keys[i]]))));
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
    mistralRequest: mistralRequest,
    readKeys: readKeys,
    normalizeReading: normalizeReading,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TStats = api;
})(typeof window !== 'undefined' ? window : globalThis);
