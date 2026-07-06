// Adaptive difficulty engine.
// Each game has an independent level from 1.0 (gentlest) to 8.0.
// Principles (per ACTIVE/FINGER-style training):
//  - grow slowly on sustained success, never as a reward spike
//  - ease down quickly and quietly when someone struggles — comfort first
//  - watch the recent trend vs the longer baseline; if recent performance
//    dips (possible off week or genuine decline), ease difficulty so the
//    experience stays encouraging, and let growth resume from there.

export const LEVEL_MIN = 1
export const LEVEL_MAX = 8

export function initGameStats() {
  return {
    level: 1,
    history: [], // { t: ISO date, level, accuracy, avgMs, rounds }
  }
}

// Called after each completed block of rounds for a game.
// results: [{ correct: bool, ms: number }]
export function updateAfterBlock(stats, results) {
  if (!results.length) return stats
  const accuracy = results.filter((r) => r.correct).length / results.length
  const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length)

  let delta = 0
  if (accuracy >= 0.85) delta = +0.4
  else if (accuracy >= 0.7) delta = +0.15
  else if (accuracy >= 0.5) delta = -0.25
  else delta = -0.6

  // Speed bonus: clearly faster than their own recent average → small nudge up
  const recent = stats.history.slice(-5)
  if (recent.length >= 3 && delta >= 0) {
    const baseMs = recent.reduce((s, h) => s + h.avgMs, 0) / recent.length
    if (avgMs < baseMs * 0.8) delta += 0.1
  }

  let level = clamp(stats.level + delta)

  const history = [
    ...stats.history,
    { t: new Date().toISOString(), level: round1(level), accuracy: round2(accuracy), avgMs, rounds: results.length },
  ].slice(-400) // keep storage small

  // Trend guard: recent week noticeably below the month baseline → ease down gently
  level = clamp(Math.min(level, trendGuard(history, level)))

  return { level: round1(level), history }
}

function trendGuard(history, level) {
  const now = Date.now()
  const inDays = (h, d1, d2) => {
    const age = (now - new Date(h.t).getTime()) / 86400000
    return age <= d1 && age > d2
  }
  const recent = history.filter((h) => inDays(h, 7, 0))
  const baseline = history.filter((h) => inDays(h, 35, 7))
  if (recent.length < 3 || baseline.length < 4) return level
  const avg = (arr) => arr.reduce((s, h) => s + h.accuracy, 0) / arr.length
  if (avg(recent) < avg(baseline) - 0.15) return level - 0.5
  return level
}

// Integer level for game generators.
export function gameLevel(stats) {
  return Math.max(LEVEL_MIN, Math.min(LEVEL_MAX, Math.round(stats.level)))
}

// Human-friendly trend for the Progress screen. Never negative language.
export function trendLabel(history) {
  if (history.length < 4) return { arrow: '•', label: 'Just getting started' }
  const half = Math.floor(history.length / 2)
  const older = history.slice(0, half)
  const newer = history.slice(half)
  const avg = (arr) => arr.reduce((s, h) => s + h.level, 0) / arr.length
  const diff = avg(newer) - avg(older)
  if (diff > 0.3) return { arrow: '↗', label: 'Growing steadily' }
  if (diff < -0.3) return { arrow: '→', label: 'Taking it comfortably' }
  return { arrow: '→', label: 'Nice and steady' }
}

export function avgTimeTrend(history) {
  const withTimes = history.filter((h) => h.avgMs > 0)
  if (withTimes.length < 4) return null
  const half = Math.floor(withTimes.length / 2)
  const avg = (arr) => arr.reduce((s, h) => s + h.avgMs, 0) / arr.length
  const older = avg(withTimes.slice(0, half))
  const newer = avg(withTimes.slice(half))
  const change = (older - newer) / older
  if (change > 0.1) return 'Answering quicker than before'
  if (change < -0.1) return 'Taking a little more time — that is perfectly fine'
  return 'Answering at a steady pace'
}

function clamp(v) { return Math.max(LEVEL_MIN, Math.min(LEVEL_MAX, v)) }
function round1(v) { return Math.round(v * 10) / 10 }
function round2(v) { return Math.round(v * 100) / 100 }
