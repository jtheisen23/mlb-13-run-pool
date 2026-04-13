#!/usr/bin/env node
/**
 * weekly-draw.js
 * Reads the current week from data/current-week.json,
 * increments by 1, shuffles 30 MLB teams separately for each pool,
 * and writes the new assignments back.
 */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const POOLS_FILE  = path.join(ROOT, 'data', 'pools.json');
const WEEK_FILE   = path.join(ROOT, 'data', 'current-week.json');

const TEAMS = [
  "ARI","ATL","BAL","BOS","CHC","CWS","CIN","CLE","COL","DET",
  "HOU","KC","LAA","LAD","MIA","MIL","MIN","NYM","NYY","ATH",
  "PHI","PIT","STL","SD","SF","SEA","TB","TEX","TOR","WSH"
];

// Fisher-Yates shuffle — returns a new shuffled array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Add N days to a YYYY-MM-DD string
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
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

// Shuffle teams independently for each pool
const shuffled1 = shuffle(TEAMS);
const shuffled2 = shuffle(TEAMS);

const pool1Players = pools.pool1.players;
const pool2Players = pools.pool2.players;

if (pool1Players.length !== TEAMS.length || pool2Players.length !== TEAMS.length) {
  console.error('ERROR: Player lists must be exactly 30 players to match 30 teams.');
  process.exit(1);
}

const newWeek = {
  number:    newWeekNum,
  startDate: newStartDate,
  pool1: pool1Players.map((player, i) => ({ player, team: shuffled1[i] })),
  pool2: pool2Players.map((player, i) => ({ player, team: shuffled2[i] }))
};

fs.writeFileSync(WEEK_FILE, JSON.stringify(newWeek, null, 2) + '\n', 'utf8');

// ── Log results ───────────────────────────────────────────────────────────────
const endDate = addDays(newStartDate, 6);
console.log(`\n🎲 Week ${newWeekNum} Random Draw`);
console.log(`   Dates: ${newStartDate} – ${endDate}\n`);

console.log('Pool #1 Assignments:');
newWeek.pool1.forEach(({ player, team }) =>
  console.log(`  ${team.padEnd(4)}  ${player}`)
);

console.log('\nPool #2 Assignments:');
newWeek.pool2.forEach(({ player, team }) =>
  console.log(`  ${team.padEnd(4)}  ${player}`)
);

console.log(`\ndata/current-week.json updated for Week ${newWeekNum} (${newStartDate}).`);
