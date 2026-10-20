const test = require('node:test');
const assert = require('node:assert/strict');
const ST = require('../web/stats.js');

const cs = ST.gameFor({ game: 'cs2' });

test('topplista summerar kills och räknar snitt på ADR', () => {
  const maps = [
    { rows: [{ name: 'TenZ', teamId: 'A', stats: { k: 20, d: 10, a: 5, adr: 90, hs: 50, mvp: 3, score: 50 } }] },
    { rows: [{ name: 'tenz', teamId: 'A', stats: { k: 10, d: 15, a: 3, adr: 70, hs: null, mvp: 1, score: 30 } }] },
  ];
  const [p] = ST.leaderboard(maps, cs);
  assert.equal(p.maps, 2);
  assert.equal(p.values.k, 30);
  assert.equal(p.values.d, 25);
  assert.equal(p.values.adr, 80);
  assert.equal(p.values.hs, 50); // saknat värde räknas inte
  assert.equal(p.values.kd, 1.2);
  assert.equal(p.values.diff, 5);
  assert.equal(p.values.kda, 1.52);
});

test('sortering och minsta antal kartor', () => {
  const rows = ST.leaderboard(
    [
      { rows: [{ name: 'a', stats: { k: 30, d: 10 } }, { name: 'b', stats: { k: 10, d: 20 } }] },
      { rows: [{ name: 'b', stats: { k: 30, d: 1 } }] },
    ],
    cs
  );
  assert.deepEqual(ST.sortBoard(rows, 'k').map((r) => r.name), ['b', 'a']);
  assert.deepEqual(ST.sortBoard(rows, 'kd').map((r) => r.name), ['a', 'b']);
  assert.deepEqual(ST.sortBoard(rows, 'k', 2).map((r) => r.name), ['b']);
});

test('namnmatchning klarar klantaggar och smeknamn', () => {
  const roster = ['TenZ', 'Zekken', 'johnqt'];
  assert.equal(ST.matchName('[SEN] TenZ', roster), 'TenZ');
  assert.equal(ST.matchName('zekken_', roster), 'Zekken');
  assert.equal(ST.matchName('someone', roster), null);
});

test('Claudes avläsning kopplas till rätt lag och roster', () => {
  const participants = [
    { id: 'sen', name: 'Sentinels', members: ['TenZ', 'Zekken', 'Sacy', 'johnqt', 'Zellsis'] },
    { id: 'fnc', name: 'Fnatic', members: ['Boaster', 'Chronicle', 'Derke', 'Alfajer', 'Leo'] },
  ];
  const reading = {
    map: 'Ascent',
    teams: [
      { name: 'FNC', score: 11, players: [{ name: 'FNC Derke', roster_name: '', stats: { k: 20, d: 18, a: 3, adr: -1, hs: 30, mvp: 2, score: 40 } }] },
      { name: '', score: 13, players: [{ name: 'SEN TenZ', roster_name: 'TenZ', stats: { k: 25, d: 15, a: 4, adr: 101.5, hs: 40, mvp: 4, score: 60 } }] },
    ],
  };
  const out = ST.normalizeReading(reading, cs, participants);
  assert.equal(out.label, 'Ascent');
  assert.deepEqual(out.teams.map((t) => [t.teamId, t.score]), [['fnc', 11], ['sen', 13]]);
  assert.equal(out.rows[0].name, 'Derke');
  assert.equal(out.rows[0].stats.adr, null); // -1 = syns inte
  assert.equal(out.rows[1].name, 'TenZ');
  assert.equal(out.rows[1].stats.adr, 101.5);
});

test('schemat kräver alla statistikfält och tillåter inga extra', () => {
  const s = ST.scoreboardSchema(cs);
  const statSchema = s.properties.teams.items.properties.players.items.properties.stats;
  assert.deepEqual(statSchema.required, ['k', 'd', 'a', 'adr', 'hs', 'mvp', 'score']);
  assert.equal(statSchema.additionalProperties, false);
  assert.match(ST.scoreboardPrompt(cs, [{ name: 'Sentinels', members: ['TenZ'] }]), /Sentinels: TenZ/);
});

test('eget spel med egna fält', () => {
  const g = ST.gameFor({ game: 'custom', customStats: 'Kills, Deaths, Flaggor' });
  assert.deepEqual(g.stats.map((s) => s.long), ['Kills', 'Deaths', 'Flaggor']);
  assert.equal(ST.gameFor({ game: 'custom', customStats: '' }), null);
  assert.equal(ST.gameFor({ game: 'none' }), null);
});
