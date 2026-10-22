const test = require('node:test');
const assert = require('node:assert/strict');
const ST = require('../web/stats.js');

const cs = ST.gameFor({ game: 'cs2' });

test('topplista summerar kills och MVP', () => {
  const maps = [
    { rows: [{ name: 'TenZ', teamId: 'A', stats: { k: 20, d: 10, a: 5, mvp: 3, score: 50, dmg: 2100 } }] },
    { rows: [{ name: 'tenz', teamId: 'A', stats: { k: 10, d: 15, a: 3, mvp: 1, score: 30, dmg: 1400 } }] },
  ];
  const [p] = ST.leaderboard(maps, cs);
  assert.equal(p.maps, 2);
  assert.equal(p.values.k, 30);
  assert.equal(p.values.d, 25);
  assert.equal(p.values.mvp, 4);
  assert.equal(p.values.dmg, 3500);
  assert.equal(p.values.adr, undefined); // ADR och HS% sparas inte för CS2
  assert.equal(p.values.kd, 1.2);
  assert.equal(p.values.diff, 5);
  assert.equal(p.values.kda, 1.52);
});

test('snittvärden hoppar över saknade värden', () => {
  const val = ST.gameFor({ game: 'valorant' });
  const [p] = ST.leaderboard(
    [{ rows: [{ name: 'TenZ', stats: { acs: 300, k: 20, d: 10 } }] }, { rows: [{ name: 'TenZ', stats: { acs: 200, k: 10, d: 10 } }] }, { rows: [{ name: 'TenZ', stats: { acs: null, k: 5, d: 5 } }] }],
    val
  );
  assert.equal(p.values.acs, 250);
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
      { name: 'FNC', score: 11, players: [{ name: 'FNC Derke', roster_name: '', stats: { k: 20, d: 18, a: 3, mvp: -1, score: 40 } }] },
      { name: '', score: 13, players: [{ name: 'SEN TenZ', roster_name: 'TenZ', stats: { k: 25, d: 15, a: 4, mvp: 4, score: 60 } }] },
    ],
  };
  const out = ST.normalizeReading(reading, cs, participants);
  assert.equal(out.label, 'Ascent');
  assert.deepEqual(out.teams.map((t) => [t.teamId, t.score]), [['fnc', 11], ['sen', 13]]);
  assert.equal(out.rows[0].name, 'Derke');
  assert.equal(out.rows[0].stats.mvp, null); // -1 = syns inte
  assert.equal(out.rows[1].name, 'TenZ');
  assert.equal(out.rows[1].stats.mvp, 4);
});

test('schemat kräver alla statistikfält och tillåter inga extra', () => {
  const s = ST.scoreboardSchema(cs);
  const statSchema = s.properties.teams.items.properties.players.items.properties.stats;
  assert.deepEqual(statSchema.required, ['k', 'd', 'a', 'mvp', 'score', 'dmg']);
  assert.equal(statSchema.additionalProperties, false);
  assert.match(ST.scoreboardPrompt(cs, [{ name: 'Sentinels', members: ['TenZ'] }]), /Sentinels: TenZ/);
});

test('eget spel med egna fält', () => {
  const g = ST.gameFor({ game: 'custom', customStats: 'Kills, Deaths, Flaggor' });
  assert.deepEqual(g.stats.map((s) => s.long), ['Kills', 'Deaths', 'Flaggor']);
  assert.equal(ST.gameFor({ game: 'custom', customStats: '' }), null);
  assert.equal(ST.gameFor({ game: 'none' }), null);
});

test('topplistan håller isär namn utan latinska bokstäver', () => {
  const maps = [{ rows: [
    { name: '李伟', teamId: 'A', stats: { k: 20, d: 10 } },
    { name: '王芳', teamId: 'A', stats: { k: 5, d: 15 } },
    { name: '★', teamId: 'A', stats: { k: 1, d: 1 } },
    { name: '☆', teamId: 'A', stats: { k: 2, d: 2 } },
  ] }];
  const rows = ST.leaderboard(maps, cs);
  assert.equal(rows.length, 4);
  assert.equal(rows.find((r) => r.name === '李伟').values.k, 20);
});

test('namnmatchning väljer inte ett namn som bara finns mitt i ett annat', () => {
  assert.equal(ST.matchName('Joanna', ['Ann', 'Bob']), null);
  assert.equal(ST.matchName('[NIP] TenZ', ['tenz', 'Bob']), 'tenz');
  assert.equal(ST.matchName('Shroudy', ['Shroud', 'Bob']), 'Shroud'); // avklippt namn i skärmklipp
  assert.equal(ST.matchName('Ann', ['Anna', 'Annie']), null); // tvetydigt
});
