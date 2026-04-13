const CONFIG = {
  season: 2026,
  startDate:   "2026-04-13",  // Monday — Week 1 begins
  totalWeeks:  24,
  weeklyPot:   125,            // $125/week · $125 × 24 = $3,000 total

  // ═══════════════════════════════════════════════════════════════
  //  CURRENT WEEK — Update every Monday after the 7am draw
  //  1. Bump "number" by 1
  //  2. Set "startDate" to that Monday (YYYY-MM-DD)
  //  3. Replace each player's "team" with their drawn team for that week
  //  4. Move the previous week into the matching pool's weekHistory below
  // ═══════════════════════════════════════════════════════════════
  currentWeek: {
    number:    1,
    startDate: "2026-04-13",   // ← The Monday this week starts

    // ── Pool #1 Assignments ───────────────────────────────────────
    // MLB Abbreviations:
    //   ARI  ATL  BAL  BOS  CHC  CWS  CIN  CLE  COL  DET
    //   HOU  KC   LAA  LAD  MIA  MIL  MIN  NYM  NYY  ATH
    //   PHI  PIT  STL  SD   SF   SEA  TB   TEX  TOR  WSH
    pool1: [
      { player: "Billy Bartlett",   team: "ARI" },
      { player: "Greg Abel",        team: "ATL" },
      { player: "Nick Eggemeyer",   team: "BAL" },
      { player: "Nick Vlattas",     team: "BOS" },
      { player: "Mitchell Rottier", team: "CHC" },
      { player: "Todd Karas",       team: "CWS" },
      { player: "Travis Hemming",   team: "CIN" },
      { player: "Bobby Manikas",    team: "CLE" },
      { player: "Tom Brown",        team: "COL" },
      { player: "Bill McDonald",     team: "DET" },
      { player: "Dave Jordan",      team: "HOU" },
      { player: "Jason Segebrecht", team: "KC"  },
      { player: "Wes Frangul",      team: "LAA" },
      { player: "Bobs Berry",       team: "LAD" },
      { player: "Bill Olsen",       team: "MIA" },
      { player: "Sean Dolan",       team: "MIL" },
      { player: "Harley Piercy",    team: "MIN" },
      { player: "Dave Hood",        team: "NYM" },
      { player: "Pat Fisher",       team: "NYY" },
      { player: "Bobby Darnall",    team: "ATH" },
      { player: "Tom Zarndt",       team: "PHI" },
      { player: "Craig Anderson",   team: "PIT" },
      { player: "Jim Murphy",       team: "STL" },
      { player: "Ted Homewood",     team: "SD"  },
      { player: "Brett Hassels",    team: "SF"  },
      { player: "Aaron Burnside",   team: "SEA" },
      { player: "Jim Quisling",     team: "TB"  },
      { player: "Mike McQuillan",   team: "TEX" },
      { player: "Trevor Benson",    team: "TOR" },
      { player: "Joe Novak",        team: "WSH" },
    ],

    // ── Pool #2 Assignments ───────────────────────────────────────
    pool2: [
      { player: "Jim Murphy",         team: "ARI" },
      { player: "Jim Whitley",        team: "ATL" },
      { player: "Dave Burns",         team: "BAL" },
      { player: "Wes Frangul",        team: "BOS" },
      { player: "Joe Novak",          team: "CHC" },
      { player: "Scott Vogg",         team: "CWS" },
      { player: "Jeremy Theisen",     team: "CIN" },
      { player: "Lee Schreiber",      team: "CLE" },
      { player: "Brian Regan",        team: "COL" },
      { player: "Tom Brown",          team: "DET" },
      { player: "Brian Wiedenhoeft",  team: "HOU" },
      { player: "Todd Karas",         team: "KC"  },
      { player: "Bobs Berry",         team: "LAA" },
      { player: "Luke Cella",         team: "LAD" },
      { player: "Dave Hood",          team: "MIA" },
      { player: "Gary Reno",          team: "MIL" },
      { player: "Trevor Benson",      team: "MIN" },
      { player: "Grant Douglas",      team: "NYM" },
      { player: "Jason Segebrecht",   team: "NYY" },
      { player: "Brett Hassels",      team: "ATH" },
      { player: "Tom Rogers",         team: "PHI" },
      { player: "Ryan Bird",          team: "PIT" },
      { player: "Vic Mehren",         team: "STL" },
      { player: "Travis Hemming",     team: "SD"  },
      { player: "Ted Homewood",       team: "SF"  },
      { player: "Roger Brown",        team: "SEA" },
      { player: "Jeff Dillenberg",    team: "TB"  },
      { player: "Rob Hassels",        team: "TEX" },
      { player: "Bobby Manikas",      team: "TOR" },
      { player: "Bob Spring",         team: "WSH" },
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  //  WEEK HISTORY — Paste completed weeks here after each Sunday
  //  result: "winner" | "tie" | "rollover"
  //  For a winner, include: winner (name), team (abbr), pot (amount won)
  //  For a tie/rollover, include: notes (optional)
  // ═══════════════════════════════════════════════════════════════
  weekHistory: {
    pool1: [
      // { week:1, startDate:"2026-04-13", result:"rollover", notes:"No 13-run games" },
      // { week:2, startDate:"2026-04-20", result:"winner", winner:"Pat Fisher", team:"NYY", pot:250 },
      // { week:3, startDate:"2026-04-27", result:"tie", notes:"Two teams scored 13" },
    ],
    pool2: [
      // { week:1, startDate:"2026-04-13", result:"rollover", notes:"No 13-run games" },
      // { week:2, startDate:"2026-04-20", result:"winner", winner:"Jason Segebrecht", team:"BOS", pot:250 },
    ]
  }
};
