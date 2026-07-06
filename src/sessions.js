// Session plans: 5 / 10 / 15 minutes made of game blocks played in order.
// The games ROTATE each day (seeded by the date) so no two days feel the same:
// the 5-minute session cycles through all eight games across the week.
// Rounds are sized for a relaxed pace — no countdown, nothing bad happens
// if it takes longer.
import { GAME_IDS } from './games/generators.js'
import { todayKey } from './storage.js'

export const SESSION_PLANS = {
  s5: { id: 's5', name: '5 minutes', icon: '🌱', blurb: 'A gentle start — three exercises, different every day.', games: 3 },
  s10: { id: 's10', name: '10 minutes', icon: '🌿', blurb: 'A balanced session — six exercises.', games: 6 },
  s15: { id: 's15', name: '15 minutes', icon: '🌳', blurb: 'The full garden — all eight exercises.', games: 8 },
}

const ROUNDS_PER_GAME = { math: 5, words: 4, sentence: 4, spatial: 4, speed: 6, pattern: 4, stroop: 4, flanker: 5 }

// Deterministic date-seeded shuffle: same order all day, new order tomorrow.
function seededOrder(dateKey) {
  let seed = 0
  for (const ch of dateKey) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const arr = [...GAME_IDS]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function blocksForDate(planId, dateKey = todayKey()) {
  const plan = SESSION_PLANS[planId]
  const games = seededOrder(dateKey).slice(0, plan.games)
  return games.map((g) => ({ game: g, rounds: ROUNDS_PER_GAME[g] }))
}

export function newSession(planId) {
  const date = todayKey()
  const blocks = blocksForDate(planId, date)
  return {
    planId,
    date,
    blocks, // stored with the session so pause/resume stays consistent
    blockIndex: 0,
    roundIndex: 0,
    results: {}, // { [blockIndex]: [{correct, ms}] }
    startedAt: new Date().toISOString(),
    finished: false,
    totalRounds: blocks.reduce((s, b) => s + b.rounds, 0),
  }
}

export function sessionProgress(session) {
  const blocks = session.blocks || []
  let done = 0
  for (let i = 0; i < session.blockIndex; i++) done += blocks[i]?.rounds || 0
  done += session.roundIndex
  return Math.min(1, done / (session.totalRounds || 1))
}

// A saved session is resumable only on the same day — each day is a fresh start.
export function isResumable(session) {
  return session && !session.finished && session.date === todayKey() && Array.isArray(session.blocks)
}
