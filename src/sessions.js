// Session plans: 5 / 10 / 15 minutes made of game blocks played in order.
// Rounds-per-block are sized so a relaxed pace fits the time comfortably —
// there is no countdown and nothing bad happens if it takes longer.
import { GAME_IDS } from './games/generators.js'
import { todayKey } from './storage.js'

export const SESSION_PLANS = {
  s5: {
    id: 's5', name: '5 minutes', icon: '🌱',
    blurb: 'A gentle start — three short exercises.',
    blocks: [
      { game: 'math', rounds: 4 },
      { game: 'words', rounds: 3 },
      { game: 'speed', rounds: 5 },
    ],
  },
  s10: {
    id: 's10', name: '10 minutes', icon: '🌿',
    blurb: 'A balanced session — six exercises.',
    blocks: [
      { game: 'math', rounds: 5 },
      { game: 'words', rounds: 4 },
      { game: 'sentence', rounds: 4 },
      { game: 'spatial', rounds: 4 },
      { game: 'stroop', rounds: 4 },
      { game: 'speed', rounds: 6 },
    ],
  },
  s15: {
    id: 's15', name: '15 minutes', icon: '🌳',
    blurb: 'The full garden — all eight exercises.',
    blocks: [
      { game: 'math', rounds: 5 },
      { game: 'words', rounds: 4 },
      { game: 'sentence', rounds: 4 },
      { game: 'spatial', rounds: 4 },
      { game: 'stroop', rounds: 4 },
      { game: 'flanker', rounds: 5 },
      { game: 'speed', rounds: 6 },
      { game: 'pattern', rounds: 4 },
    ],
  },
}

export function newSession(planId) {
  const plan = SESSION_PLANS[planId]
  return {
    planId,
    date: todayKey(),
    blockIndex: 0,
    roundIndex: 0,
    // per-block collected results: { [blockIndex]: [{correct, ms}] }
    results: {},
    startedAt: new Date().toISOString(),
    finished: false,
    totalRounds: plan.blocks.reduce((s, b) => s + b.rounds, 0),
  }
}

export function sessionProgress(session) {
  const plan = SESSION_PLANS[session.planId]
  let done = 0
  for (let i = 0; i < session.blockIndex; i++) done += plan.blocks[i].rounds
  done += session.roundIndex
  return Math.min(1, done / session.totalRounds)
}

// A saved session is resumable only on the same day — each day is a fresh start.
export function isResumable(session) {
  return session && !session.finished && session.date === todayKey()
}
