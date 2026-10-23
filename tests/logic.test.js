const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../web/logic.js');

function tournament(n, roundsScores) {
  const players = Array.from({ length: n }, (_, i) => ({ id: 'p' + (i + 1), name: 'Spelare ' + (i + 1), active: true }));
  const rounds = (roundsScores || []).map((scores, i) => ({ id: 'r' + i, name: 'Omgång ' + (i + 1), scores }));
  return { players, rounds, settings: { bestOf: 0 } };
}

test('seedOrder sätter 1 mot sista och håller isär 1 och 2', () => {
  assert.deepEqual(L.seedOrder(8), [1, 8, 4, 5, 2, 7, 3, 6]);
  const o32 = L.seedOrder(32);
  assert.equal(o32.length, 32);
  assert.deepEqual(o32.slice(0, 2), [1, 32]);
  assert.ok(o32.indexOf(2) >= 16, 'seed 2 i andra halvan');
  for (let i = 0; i < 32; i += 2) assert.equal(o32[i] + o32[i + 1], 33);
});

test('tabellen summerar och sorterar, delade placeringar', () => {
  const t = tournament(4, [
    { p1: 10, p2: 5, p3: 7 },
    { p1: 2, p2: 9, p3: 5, p4: 1 },
  ]);
  const rows = L.computeStandings(t);
  assert.deepEqual(rows.map((r) => [r.id, r.total, r.rank]), [
    ['p2', 14, 1],
    ['p1', 12, 2],
    ['p3', 12, 2],
    ['p4', 1, 4],
  ]);
  assert.equal(rows[1].best, 10); // p1 före p3 tack vare bästa omgång
});

test('räkna bara bästa X omgångar', () => {
  const t = tournament(1, [{ p1: 1 }, { p1: 5 }, { p1: 3 }]);
  t.settings.bestOf = 2;
  assert.equal(L.computeStandings(t)[0].total, 8);
});

test('inaktiva spelare visas inte', () => {
  const t = tournament(3, [{ p1: 1, p2: 2, p3: 3 }]);
  t.players[2].active = false;
  assert.equal(L.computeStandings(t).length, 2);
});

test('förflyttning jämfört med föregående omgång', () => {
  const t = tournament(2, [{ p1: 5, p2: 1 }, { p2: 10 }]);
  const rows = L.standingsWithMovement(t);
  assert.equal(rows[0].id, 'p2');
  assert.equal(rows[0].move, 1);
  assert.equal(rows[1].move, -1);
});

test('slutspel topp 32: rätt matcher och avancemang', () => {
  const ids = Array.from({ length: 32 }, (_, i) => 's' + (i + 1));
  const po = L.createPlayoff(ids, { thirdPlace: true });
  let res = L.resolvePlayoff(po);
  assert.equal(res.rounds.length, 5);
  assert.deepEqual(res.rounds.map((r) => r.name), ['Sextondelsfinal', 'Åttondelsfinal', 'Kvartsfinal', 'Semifinal', 'Final']);
  assert.equal(res.rounds[0].matches[0].a, 's1');
  assert.equal(res.rounds[0].matches[0].b, 's32');
  assert.equal(res.totalMatches, 32); // 31 + bronsmatch

  // Spela igenom: högst seed vinner alltid
  for (let r = 0; r < res.rounds.length; r++) {
    res = L.resolvePlayoff(po);
    res.rounds[r].matches.forEach((m) => {
      const w = res.seedOf[m.a] < res.seedOf[m.b] ? m.a : m.b;
      L.setResult(po, m, w, 2, 1);
    });
  }
  res = L.resolvePlayoff(po);
  assert.equal(res.rounds[4].matches[0].a, 's1');
  assert.equal(res.rounds[4].matches[0].b, 's2');
  assert.equal(res.champion, 's1');
  assert.equal(res.runnerUp, 's2');
  assert.deepEqual([res.third.a, res.third.b].sort(), ['s3', 's4']);
});

test('walk over när antalet inte är en tvåpotens', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  const po = L.createPlayoff(ids);
  const res = L.resolvePlayoff(po);
  assert.equal(po.size, 8);
  const byes = res.rounds[0].matches.filter((m) => m.bye);
  assert.deepEqual(byes.map((m) => m.winner).sort(), ['a', 'b']);
  assert.equal(res.rounds[1].matches[0].a, 'a');
  assert.equal(res.totalMatches, 5);
});

test('ändrat resultat ogiltigförklarar senare matcher', () => {
  const po = L.createPlayoff(['a', 'b', 'c', 'd']);
  let res = L.resolvePlayoff(po);
  L.setResult(po, res.rounds[0].matches[0], 'a', 3, 0);
  L.setResult(po, res.rounds[0].matches[1], 'b', 3, 0);
  res = L.resolvePlayoff(po);
  L.setResult(po, res.rounds[1].matches[0], 'a', 1, 0);
  assert.equal(L.resolvePlayoff(po).champion, 'a');
  res = L.resolvePlayoff(po);
  L.setResult(po, res.rounds[0].matches[0], 'd', 0, 3);
  res = L.resolvePlayoff(po);
  assert.equal(res.champion, null);
  assert.equal(res.rounds[1].matches[0].a, 'd');
});

test('ormfördelning i grupper', () => {
  const groups = L.makeGroups(['1', '2', '3', '4', '5', '6', '7', '8'], 4, 'snake');
  assert.deepEqual(groups, [['1', '8'], ['2', '7'], ['3', '6'], ['4', '5']]);
});

test('lagtabell: summa, snitt och bästa X', () => {
  const t = tournament(4, [{ p1: 10, p2: 4, p3: 7, p4: 1 }]);
  t.teams = [{ id: 'A', name: 'Lag A' }, { id: 'B', name: 'Lag B' }];
  t.players[0].teamId = 'A';
  t.players[1].teamId = 'A';
  t.players[2].teamId = 'B';
  t.players[3].teamId = 'B';
  let rows = L.computeTeamStandings(t);
  assert.deepEqual(rows.map((r) => [r.id, r.total, r.size]), [['A', 14, 2], ['B', 8, 2]]);
  t.settings.teamScoring = 'avg';
  assert.deepEqual(L.computeTeamStandings(t).map((r) => r.total), [7, 4]);
  t.settings.teamScoring = 'top';
  t.settings.teamTopN = 1;
  assert.deepEqual(L.computeTeamStandings(t).map((r) => [r.id, r.total]), [['A', 10], ['B', 7]]);
});

test('lagtabell med förflyttning och slutspel mellan lag', () => {
  const t = tournament(2, [{ p1: 5, p2: 1 }, { p2: 10 }]);
  t.teams = [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }];
  t.players[0].teamId = 'A';
  t.players[1].teamId = 'B';
  const rows = L.standingsWithMovement(t, L.computeTeamStandings);
  assert.equal(rows[0].id, 'B');
  assert.equal(rows[0].move, 1);
  const po = L.createPlayoff(rows.map((r) => r.id));
  assert.equal(L.resolvePlayoff(po).rounds[0].matches[0].a, 'B');
});

test('importkontroll stoppar HTML-tecken i id:n, nycklar och siffervärden', () => {
  const ok = { tournaments: { t1: { id: 't1', name: 'Höstligan', settings: { bestOf: 0 }, players: [{ id: 'p1', name: 'A' }], rounds: [{ id: 'r1', scores: { p1: 5 } }] } } };
  assert.equal(L.findUnsafeImport(ok), null);

  const attr = structuredClone(ok);
  attr.tournaments.t1.settings.bestOf = '0" autofocus onfocus="alert(1)';
  assert.equal(L.findUnsafeImport(attr), 'tournaments.t1.settings.bestOf');

  const tag = structuredClone(ok);
  tag.tournaments.t1.players[0].id = '<img src=x onerror=alert(1)>';
  assert.equal(L.findUnsafeImport(tag), 'tournaments.t1.players.0.id');

  const key = structuredClone(ok);
  key.tournaments.t1.rounds[0].scores = { '"><svg onload=alert(1)>': 5 };
  assert.match(L.findUnsafeImport(key), /^tournaments\.t1\.rounds\.0\.scores\./);
});

test('importkontroll släpper igenom fritext med citattecken och &', () => {
  const data = {
    tournaments: {
      t1: {
        id: 't1',
        name: 'Kalle & Co "cupen"',
        settings: { customStats: "K/D, O'Brien-poäng", customGameName: '<Mitt spel>', quickValues: '1, 2' },
        players: [{ id: 'p1', name: "O'Brien", members: ['Ann & Bo', '"Zed"'] }],
        stages: [{ matches: [{ id: 'm1', label: 'Final <Bo5>', note: 'avbruten "regn"', winner: null }] }],
        statMaps: [{ id: 's1', label: "Karta 'Ascent'", matchLabel: 'A & B', rows: [{ name: 'Zed <3', stats: { s0: 12 } }] }],
      },
    },
  };
  assert.equal(L.findUnsafeImport(data), null);
});
