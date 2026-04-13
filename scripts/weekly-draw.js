#!/usr/bin/env node
/**
 * weekly-draw.js
 * Each Monday, players rotate DOWN one spot in the table.
 * Teams stay fixed in alphabetical order — only the player list shifts.
 * The bottom player (position 30) wraps to the top (position 1).
 * With 30 teams and 24 weeks, no player ever gets the same team twice.
 *
 * Example:
 *   Week 1: Billy Bartlett→ARI, Greg Abel→ATL, ... Joe Novak→WSH
 *   Week 2: Joe Novak→ARI,  Billy Bartlett→ATL, Greg Abel→BAL, ...
 *   Week 3: Trevor Benson→ARI, Joe Novak→ATL,  Billy Bartlett→BAL, ...
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const POOLS_FILE = path.join(ROOT, 'data', 'pools.json');
const WEEK_FILE  = path.join(ROOT, 'data', 'current-week.json');

// Teams in fixed alphabetical order — this never changes
const TEAMS = [
  "ARI","ATL","BAL","BOS","CHC","CWS","CIN","CLE","COL","DET",
  "HOU","KC","LAA","LAD","MIA","MIL","MIN","NYM","NYY","ATH",
  "PHI","PIT","STL","SD","SF","SEA","TB","TEX","TOR","WSH"
];

// Add N days to a YYYY-MM-DD string
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Rotate players for week N:
// Move the last player to the front, everyone else shifts down one.
// rotation = (weekNum - 1) % 30  positions from the end move to the front
function rotatePlayers(originalPlayers, weekNum) {
  const n        = originalPlayers.length;
  const rotation = (weekNum - 1) % n;
  const rotated  = [
    ...originalPlayers.slice(n - rotation),  // last `rotation` players come first
    ...originalPlayers.slice(0, n - rotation) // rest follow
  ];
  return rotated.map((player, i) => ({ player, team: TEAMS[i] }));
}

// ── Main ──────────────────────────────────────────────────────────────────────
const pools   = JSON.parse(fs.readFileSync(POOLS_FILE, 'utf8'));
const current = JSON.parse(fs.readFileSync(WEEK_FILE,  'utf8'));

const newWeekNum   = current.number + 1;
const newStartDate = addDays(current.startDate, 7);

if (newWeekNum > pools.totalWeeks) {
  console.log(`Season complete — all ${pools.totalWeeks} weeks have been drawn.`);
  process.exit(0);
}

if (pools.pool1.players.length !== TEAMS.length || pools.pool2.players.length !== TEAMS.length) {
  console.error('ERROR: Player lists must be exactly 30 to match 30 teams.');
  process.exit(1);
}

const newWeek = {
  number:    newWeekNum,
  startDate: newStartDate,
  pool1: rotatePlayers(pools.pool1.players, newWeekNum),
  pool2: rotatePlayers(pools.pool2.players, newWeekNum)
};

fs.writeFileSync(WEEK_FILE, JSON.stringify(newWeek, null, 2) + '\n', 'utf8');

// ── Log results ───────────────────────────────────────────────────────────────
const endDate = addDays(newStartDate, 6);
console.log(`\n🔄 Week ${newWeekNum} Rotation`);
console.log(`   Dates: ${newStartDate} – ${endDate}`);
console.log(`   Teams stay fixed. Players rotated down 1 spot (last → first).\n`);

console.log('Pool #1 Assignments:');
newWeek.pool1.forEach(({ player, team }) =>
  console.log(`  ${team.padEnd(4)}  ${player}`)
);

console.log('\nPool #2 Assignments:');
newWeek.pool2.forEach(({ player, team }) =>
  console.log(`  ${team.padEnd(4)}  ${player}`)
);

console.log(`\ndata/current-week.json updated for Week ${newWeekNum} (${newStartDate}).`);
