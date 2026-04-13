#!/usr/bin/env node
/**
 * record-results.js
 * Reads current-week.json for the week just ending, fetches MLB scores,
 * determines if any player's team scored exactly 13 runs, and appends
 * the result to history.json.
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const ROOT         = path.join(__dirname, '..');
const WEEK_FILE    = path.join(ROOT, 'data', 'current-week.json');
const HISTORY_FILE = path.join(ROOT, 'data', 'history.json');

// MLB team abbreviation -> Stats API team ID
const TEAM_IDS = {
  ARI:109, ATL:144, BAL:110, BOS:111, CHC:112, CWS:145, CIN:113, CLE:114,
  COL:115, DET:116, HOU:117, KC:118,  LAA:108, LAD:119, MIA:146, MIL:158,
  MIN:142, NYM:121, NYY:147, ATH:133, PHI:143, PIT:134, STL:138, SD:135,
  SF:137,  SEA:136, TB:139,  TEX:140, TOR:141, WSH:120
};

// Add N days to a YYYY-MM-DD string
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Simple HTTPS GET returning parsed JSON
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MLB13RunPool/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}\nBody: ${data.slice(0,200)}`)); }
      });
    }).on('error', reject);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const week   = JSON.parse(fs.readFileSync(WEEK_FILE,    'utf8'));
  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));

  const weekNum  = week.number;
  const startDate = week.startDate;
  const endDate   = addDays(startDate, 6);

  console.log(`\n📊 Recording results for Week ${weekNum} (${startDate} – ${endDate})`);

  // Process each pool
  for (const poolKey of ['pool1', 'pool2']) {
    const poolLabel = poolKey === 'pool1' ? 'Pool #1' : 'Pool #2';

    // Skip if already recorded
    const alreadyRecorded = (history[poolKey] || []).some(r => r.week === weekNum);
    if (alreadyRecorded) {
      console.log(`  ${poolLabel}: Week ${weekNum} already recorded — skipping.`);
      continue;
    }

    // Build a map of teamId -> abbr for this pool's assignments
    const teamAbbrById = {};
    const playerByTeamAbbr = {};
    for (const { player, team } of week[poolKey]) {
      const id = TEAM_IDS[team];
      if (id !== undefined) {
        teamAbbrById[id] = team;
        playerByTeamAbbr[team] = player;
      }
    }

    // Fetch schedule with linescore for the week
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=${startDate}&endDate=${endDate}&hydrate=linescore`;
    console.log(`  Fetching: ${url}`);

    let scheduleData;
    try {
      scheduleData = await fetchJSON(url);
    } catch (err) {
      console.error(`  ERROR fetching schedule: ${err.message}`);
      process.exit(1);
    }

    // Parse games: collect all Final games and check for 13-run totals
    // teamId -> array of run totals across all Final games this week
    const runsByTeamId = {};

    for (const dateEntry of (scheduleData.dates || [])) {
      for (const game of (dateEntry.games || [])) {
        const status = game.status && game.status.abstractGameState;
        if (status !== 'Final') continue;

        const ls = game.linescore;
        if (!ls) continue;

        const homeId   = game.teams && game.teams.home && game.teams.home.team && game.teams.home.team.id;
        const awayId   = game.teams && game.teams.away && game.teams.away.team && game.teams.away.team.id;
        const homeRuns = ls.teams && ls.teams.home && (ls.teams.home.runs !== undefined) ? ls.teams.home.runs : null;
        const awayRuns = ls.teams && ls.teams.away && (ls.teams.away.runs !== undefined) ? ls.teams.away.runs : null;

        if (homeId !== undefined && homeRuns !== null) {
          if (!runsByTeamId[homeId]) runsByTeamId[homeId] = [];
          runsByTeamId[homeId].push(homeRuns);
        }
        if (awayId !== undefined && awayRuns !== null) {
          if (!runsByTeamId[awayId]) runsByTeamId[awayId] = [];
          runsByTeamId[awayId].push(awayRuns);
        }
      }
    }

    // Find pool players whose team scored exactly 13 in at least one game
    const winners13 = [];
    for (const { player, team } of week[poolKey]) {
      const id = TEAM_IDS[team];
      if (id === undefined) continue;
      const runs = runsByTeamId[id] || [];
      if (runs.some(r => r === 13)) {
        winners13.push({ player, team });
      }
    }

    // Determine result
    let result, record;
    const histPool = history[poolKey] || [];

    // Calculate pot: (weekNum - lastWinWeek) * weeklyPot
    // weeklyPot is $125
    const WEEKLY_POT = 125;
    const lastWinEntry = [...histPool].reverse().find(r => r.result === 'winner');
    const lastWinWeek  = lastWinEntry ? lastWinEntry.week : 0;
    const pot          = (weekNum - lastWinWeek) * WEEKLY_POT;

    if (winners13.length === 1) {
      result = 'winner';
      record = {
        week:      weekNum,
        startDate: startDate,
        result:    'winner',
        winner:    winners13[0].player,
        team:      winners13[0].team,
        pot:       pot
      };
      console.log(`  ${poolLabel}: WINNER — ${winners13[0].player} (${winners13[0].team}) wins $${pot}!`);
    } else if (winners13.length > 1) {
      result = 'tie';
      const names = winners13.map(w => `${w.player} (${w.team})`).join(', ');
      record = {
        week:      weekNum,
        startDate: startDate,
        result:    'tie',
        notes:     `Tie — ${names} all had teams that scored 13. Pot rolls over.`
      };
      console.log(`  ${poolLabel}: TIE — ${names}. Pot rolls over.`);
    } else {
      result = 'rollover';
      record = {
        week:      weekNum,
        startDate: startDate,
        result:    'rollover',
        notes:     'No team scored exactly 13 runs this week.'
      };
      console.log(`  ${poolLabel}: ROLLOVER — no 13-run games found.`);
    }

    // Append to history
    if (!history[poolKey]) history[poolKey] = [];
    history[poolKey].push(record);
  }

  // Save updated history
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2) + '\n', 'utf8');
  console.log('\ndata/history.json updated.\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
