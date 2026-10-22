const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../web/stages.js');

const teams = (n) => Array.from({ length: n }, (_, i) => 't' + (i + 1));
const seedNum = (id) => Number(id.slice(1));

// Spela alla spelbara matcher: lägst seednummer vinner (eller valfri regel)
function playAll(stage, pick, guard = 200) {
  for (let i = 0; i < guard; i++) {
    S.progress(stage);
    const R = S.resolve(stage);
    if (stage.type === 'heats') {
      const last = R.rounds[R.rounds.length - 1];
      const open = last.heats.filter((h) => !h.complete);
      if (!open.length) {
        if (!S.progress(stage)) return S.resolve(stage);
        continue;
      }
      open.forEach((h) => {
        const order = h.players.slice().sort((a, b) => seedNum(a) - seedNum(b));
        const races = Array.from({ length: stage.cfg.races }, () => Object.fromEntries(order.map((p, k) => [p, k + 1])));
        S.setHeatResult(stage, h.id, races);
      });
      continue;
    }
    const ready = R.matches.filter((m) => m.state === 'ready');
    if (!ready.length) {
      if (!S.progress(stage)) return S.resolve(stage);
      continue;
    }
    ready.forEach((m) => {
      const w = pick ? pick(m) : seedNum(m.a) < seedNum(m.b) ? m.a : m.b;
      const need = S.winsNeeded(m.bo);
      S.setResult(stage, m, w, w === m.a ? need : 0, w === m.b ? need : 0);
    });
  }
  throw new Error('kom aldrig i mål');
}

test('Valorant Champions: 16 lag, GSL-grupper → dubbelutslagning', () => {
  const [gsl, dbl] = S.stagesFromPreset(S.PRESETS.find((p) => p.id === 'champions'));
  S.start(gsl, teams(16));
  let R = S.resolve(gsl);
  assert.equal(R.groups.length, 4);
  assert.equal(R.matches.length, 20); // 5 matcher per grupp
  assert.ok(R.matches.every((m) => m.bo === 3));
  // Grupp A: seed 1, 8, 9, 16 – öppning 1 mot 16
  assert.deepEqual(R.groups[0].rows.map((r) => r.id).sort(), ['t1', 't16', 't8', 't9'].sort());
  assert.deepEqual([R.matches[0].a, R.matches[0].b], ['t1', 't16']);
  R = playAll(gsl);
  assert.ok(R.done);
  assert.deepEqual(R.groups[0].order, ['t1', 't8', 't9', 't16']);
  assert.equal(R.qualifiers.length, 8);
  assert.deepEqual(R.qualifiers.slice(0, 4), ['t1', 't2', 't3', 't4']); // gruppvinnare först

  S.start(dbl, R.qualifiers);
  let D = S.resolve(dbl);
  assert.equal(D.matches.length, 14); // 7 övre + 6 undre + final
  const lbFinal = D.matches.find((m) => m.label === 'Undre final');
  const gf = D.matches.find((m) => m.id === 'gf');
  assert.equal(lbFinal.bo, 5);
  assert.equal(gf.bo, 5);
  // Gruppvinnare möter tvåa från en annan grupp
  const groupOf = {};
  R.groups.forEach((g) => g.rows.forEach((r) => (groupOf[r.id] = g.index)));
  D.matches.filter((m) => m.id.startsWith('u0-')).forEach((m) => assert.notEqual(groupOf[m.a], groupOf[m.b]));
  const first = D.matches.find((m) => m.id === 'u0-0');
  assert.deepEqual([first.a, first.b], ['t1', 't5']);
  D = playAll(dbl);
  assert.ok(D.done);
  assert.equal(D.champion, 't1');
  assert.deepEqual(D.placements.slice(0, 3), [['t1'], ['t2'], ['t3']]);
  assert.equal([].concat(...D.placements).length, 8);
});

test('dubbelutslagning: förloraren i övre final kan vinna via undre trädet', () => {
  const st = S.newStage('double');
  S.start(st, teams(4));
  // t2 vinner allt utom första mötet med t1? Låt t1 förlora övre final mot t2 och sedan vinna undre final + final
  const R = playAll(st, (m) => {
    if (m.id === 'u1-0') return 't2';
    if (m.id === 'gf') return 't1';
    return seedNum(m.a) < seedNum(m.b) ? m.a : m.b;
  });
  assert.equal(R.champion, 't1');
  assert.deepEqual(R.placements[1], ['t2']);
});

test('dubbelutslagning med omstartad final', () => {
  const st = S.newStage('double');
  st.cfg.gfReset = true;
  S.start(st, teams(4));
  const R = playAll(st, (m) => {
    if (m.id === 'u1-0') return 't2';
    if (m.id === 'gf') return 't1';
    if (m.id === 'gf2') return 't2';
    return seedNum(m.a) < seedNum(m.b) ? m.a : m.b;
  });
  assert.equal(R.champion, 't2');
  assert.ok(R.matches.find((m) => m.id === 'gf2').state === 'done');
});

test('dubbelutslagning med walk over (6 lag)', () => {
  const st = S.newStage('double');
  S.start(st, teams(6));
  const R = playAll(st);
  assert.ok(R.done);
  assert.equal(R.champion, 't1');
  assert.equal([].concat(...R.placements).length, 6);
});

test('CS Major: Swiss 16 lag → 8 vidare, avgörande matcher Bo3', () => {
  const [swiss, single] = S.stagesFromPreset(S.PRESETS.find((p) => p.id === 'major'));
  S.start(swiss, teams(16));
  let R = S.resolve(swiss);
  assert.deepEqual([R.matches[0].a, R.matches[0].b], ['t1', 't9']);
  R = playAll(swiss);
  assert.ok(R.done);
  assert.equal(R.qualifiers.length, 8);
  assert.equal(R.qualifiers[0], 't1');
  assert.ok(Object.values(R.records).every((r) => r.w === 3 || r.l === 3));
  assert.ok(R.matches.some((m) => m.bo === 3), 'avgörande matcher spelas i Bo3');
  // inga returmöten
  const seen = new Set();
  R.matches.filter((m) => m.b).forEach((m) => {
    const k = [m.a, m.b].sort().join();
    assert.ok(!seen.has(k), 'returmöte ' + k);
    seen.add(k);
  });
  S.start(single, R.qualifiers);
  const P = playAll(single);
  assert.equal(P.champion, 't1');
});

test('Mario Kart: poängfas i slumpade lobbyer, topp 8 till heat, topp 2 vidare tills final', () => {
  const [lob, heats] = S.stagesFromPreset(S.PRESETS.find((p) => p.id === 'mariokart'));
  assert.equal(lob.type, 'lobbies');
  S.start(lob, teams(16));
  let L = S.resolve(lob);
  assert.equal(L.rounds[0].heats.length, 4);
  assert.ok(L.rounds[0].heats.every((h) => h.players.length === 4));
  assert.equal(new Set([].concat(...L.rounds[0].heats.map((h) => h.players))).size, 16);
  // Spelets poäng: lägst seednummer får mest (t1 = 59, t16 = 44)
  L.rounds[0].heats.forEach((h) => S.setLobbyResult(lob, h.id, Object.fromEntries(h.players.map((p) => [p, 60 - seedNum(p)]))));
  L = S.resolve(lob);
  assert.ok(L.done);
  assert.deepEqual(L.qualifiers, teams(8));
  assert.equal(L.table[0].total, 59);
  assert.equal(L.table.filter((r) => r.status === 'out').length, 8);
  S.start(heats, L.qualifiers);
  const R = playAll(heats);
  assert.deepEqual(R.rounds.map((r) => r.heats.length), [2, 1]); // 8 → 4 (final)
  assert.equal(R.champion, 't1');
});

test('poängfas: ojämnt antal, flera omgångar och delvis ifyllt', () => {
  const st = S.newStage('lobbies');
  Object.assign(st.cfg, { rounds: 3, advance: 4 });
  assert.deepEqual(S.splitLobbies(teams(10), 4).map((g) => g.length), [4, 3, 3]);
  S.start(st, teams(10));
  let R = S.resolve(st);
  assert.equal(R.rounds.length, 3);
  R.rounds.forEach((rd) => assert.equal([].concat(...rd.heats.map((h) => h.players)).length, 10));
  const h = R.rounds[0].heats[0];
  S.setLobbyResult(st, h.id, { [h.players[0]]: 45 });
  R = S.resolve(st);
  assert.ok(!R.done);
  assert.equal(R.rounds[0].heats[0].started, true);
  assert.equal(R.rounds[0].heats[0].complete, false);
  R.rounds.forEach((rd) => rd.heats.forEach((x) => S.setLobbyResult(st, x.id, Object.fromEntries(x.players.map((p) => [p, seedNum(p) === 7 ? 60 : 20])))));
  R = S.resolve(st);
  assert.ok(R.done);
  assert.equal(R.qualifiers[0], 't7');
  assert.equal(R.table[0].total, 180);
  assert.equal(R.qualifiers.length, 4);
});

test('heat med flera race och poängtabell', () => {
  const st = S.newStage('heats');
  Object.assign(st.cfg, { heatSize: 3, advancePerHeat: 1, races: 2, points: '10, 5, 1' });
  S.start(st, ['a', 'b', 'c']);
  const h = S.resolve(st).rounds[0].heats[0];
  // a: 1:a + 3:e = 11, b: 2:a + 1:a = 15, c: 3:e + 2:a = 6
  S.setHeatResult(st, h.id, [{ a: 1, b: 2, c: 3 }, { a: 3, b: 1, c: 2 }]);
  const R = S.resolve(st);
  assert.deepEqual(R.rounds[0].heats[0].rows.map((r) => [r.id, r.total]), [['b', 15], ['a', 11], ['c', 6]]);
  assert.equal(R.champion, 'b');
});

test('heat med ojämnt antal (10 spelare)', () => {
  const st = S.newStage('heats');
  S.start(st, teams(10));
  assert.deepEqual(S.resolve(st).rounds[0].heats.map((h) => h.players.length).sort(), [3, 3, 4]);
  const R = playAll(st);
  assert.ok(R.done);
  assert.equal(R.champion, 't1');
});

test('gruppspel alla mot alla med oavgjort och inbördes möte', () => {
  const st = S.newStage('rr');
  Object.assign(st.cfg, { groups: 1, advancePerGroup: 2, allowDraw: true });
  S.start(st, ['a', 'b', 'c', 'd']);
  let R = S.resolve(st);
  assert.equal(R.matches.length, 6);
  R.matches.forEach((m) => {
    const key = [m.a, m.b].sort().join('');
    if (key === 'ab') S.setResult(st, m, 'draw', 1, 1);
    else {
      const w = key === 'cd' ? 'c' : [m.a, m.b].includes('a') ? 'a' : 'b';
      S.setResult(st, m, w, w === m.a ? 1 : 0, w === m.b ? 1 : 0);
    }
  });
  R = S.resolve(st);
  assert.ok(R.done);
  assert.deepEqual(R.groups[0].rows.map((r) => [r.id, r.pts]), [['a', 7], ['b', 7], ['c', 3], ['d', 0]]);
  assert.deepEqual(R.qualifiers, ['a', 'b']);
});

test('round robin-schema: alla möter alla exakt en gång', () => {
  const rounds = S.roundRobinPairs(['a', 'b', 'c', 'd', 'e']);
  const pairs = [].concat(...rounds).map((p) => p.slice().sort().join(''));
  assert.equal(pairs.length, 10);
  assert.equal(new Set(pairs).size, 10);
});

test('utslagning med match om tredjepris och Bo-inställningar', () => {
  const st = S.newStage('single');
  Object.assign(st.cfg, { bo: 1, semiBo: 3, finalBo: 5, third: true });
  S.start(st, teams(8));
  let R = S.resolve(st);
  assert.deepEqual(R.matches.filter((m) => m.section === 'ub').map((m) => m.bo), [1, 1, 1, 1, 3, 3, 5]);
  R = playAll(st);
  assert.deepEqual(R.placements.slice(0, 5), [['t1'], ['t2'], ['t3'], ['t4'], ['t5', 't6', 't7', 't8']]);
});

test('Swiss ger ingen deltagare mer än en walkover', () => {
  for (const n of [9, 10, 11, 12, 14, 18, 19, 21]) {
    const st = S.newStage('swiss');
    S.start(st, teams(n));
    const R = playAll(st);
    const byes = {};
    R.matches.filter((m) => m.state === 'bye').forEach((m) => (byes[m.a] = (byes[m.a] || 0) + 1));
    assert.ok(Object.values(byes).every((c) => c === 1), `${n} deltagare: ${JSON.stringify(byes)}`);
  }
});

test('startProblem stoppar GSL-grupper med fler än 4', () => {
  const gsl = S.newStage('gsl');
  gsl.cfg.groups = 2;
  assert.match(S.startProblem(gsl, 16), /4/);
  gsl.cfg.groups = 4;
  assert.equal(S.startProblem(gsl, 16), '');
  assert.match(S.startProblem(gsl, 17), /5 grupper/);
});

test('startProblem stoppar heat där ingen åker ut', () => {
  const heats = S.newStage('heats');
  Object.assign(heats.cfg, { heatSize: 4, advancePerHeat: 3 });
  assert.match(S.startProblem(heats, 9), /åker ut/);
  assert.match(S.startProblem(heats, 16), /åker ut/);
  Object.assign(heats.cfg, { heatSize: 4, advancePerHeat: 2 });
  for (const n of [5, 8, 9, 16, 30]) assert.equal(S.startProblem(heats, n), '', `${n} deltagare`);
});
