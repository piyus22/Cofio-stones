// Badge definitions. check(state) → true when earned.
// Framing is nurturing: badges reward showing up and personal growth,
// never speed records or comparison with others.
import { GAME_IDS, GAMES } from './games/generators.js'

export const BADGES = [
  { id: 'first-session', icon: '🌱', name: 'First Stone', desc: 'Finished your very first session', check: (s) => totalSessions(s) >= 1 },
  { id: 'streak-3', icon: '🔥', name: 'Three Days Running', desc: 'Played on 3 days in a row', check: (s) => s.streak.best >= 3 },
  { id: 'streak-7', icon: '🌟', name: 'A Full Week', desc: 'Played on 7 days in a row', check: (s) => s.streak.best >= 7 },
  { id: 'streak-30', icon: '🏆', name: 'A Whole Month', desc: 'Played on 30 days in a row', check: (s) => s.streak.best >= 30 },
  { id: 'comeback', icon: '🕊️', name: 'Welcome Back', desc: 'Returned after a break — the best thing you can do', check: (s) => s.flags?.comeback === true },
  { id: 'sessions-10', icon: '🪨', name: 'Ten Stones Laid', desc: 'Completed 10 sessions', check: (s) => totalSessions(s) >= 10 },
  { id: 'sessions-50', icon: '🏛️', name: 'Stone Circle', desc: 'Completed 50 sessions', check: (s) => totalSessions(s) >= 50 },
  { id: 'full-garden', icon: '🌳', name: 'The Full Garden', desc: 'Completed a 15-minute session', check: (s) => (s.sessionCounts?.s15 || 0) >= 1 },
  ...GAME_IDS.map((g) => ({
    id: `grow-${g}`, icon: GAMES[g].icon, name: `${GAMES[g].name} Grower`,
    desc: `Grew ${GAMES[g].name} to level 25`,
    check: (s) => (s.games[g]?.level || 1) >= 25,
  })),
  ...GAME_IDS.map((g) => ({
    id: `master-${g}`, icon: '💎', name: `${GAMES[g].name} Gem`,
    desc: `Grew ${GAMES[g].name} to level 60`,
    check: (s) => (s.games[g]?.level || 1) >= 60,
  })),
  ...GAME_IDS.map((g) => ({
    id: `summit-${g}`, icon: '⛰️', name: `${GAMES[g].name} Summit`,
    desc: `Reached the top: level 100 in ${GAMES[g].name}`,
    check: (s) => (s.games[g]?.level || 1) >= 100,
  })),
]

function totalSessions(s) {
  return Object.values(s.sessionCounts || {}).reduce((a, b) => a + b, 0)
}

// Returns list of newly earned badge ids.
export function checkBadges(state) {
  const earned = new Set(state.badges || [])
  const fresh = []
  for (const b of BADGES) {
    if (!earned.has(b.id) && b.check(state)) fresh.push(b.id)
  }
  return fresh
}
