// Adaptive difficulty engine.
// Each game has an independent level from 1.0 (gentlest) to 8.0.
// Principles (per ACTIVE/FINGER-style training):
//  - grow slowly on sustained success, never as a reward spike
//  - ease down quickly and quietly when someone struggles — comfort first
//  - watch the recent trend vs the longer baseline; if recent performance
//    dips (possible off week or genuine decline), ease difficulty so the
//    experience stays encouraging, and let growth resume from there.

export const LEVEL_MIN = 1
export const LEVEL_MAX = 100

export function initGameStats() {
  return {
    level: 1,
    scale100: true, // level scale marker (v0.2+); old saves are migrated
    history: [], // { t: ISO date, level, accuracy, avgMs, rounds }
  }
}

// Called after each completed block of rounds for a game.
// results: [{ correct: bool, ms: number }]
// v2: decisions use an exponential moving average of accuracy rather than a
// single block, so one slip in five rounds no longer whipsaws the level.
export function updateAfterBlock(stats, results) {
  if (!results.length) return stats
  const accuracy = results.filter((r) => r.correct).length / results.length
  const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length)
  const emaAcc = round2(stats.emaAcc == null ? accuracy : stats.emaAcc * 0.55 + accuracy * 0.45)

  // Fast start: for the first few blocks of a game, a confident player jumps
  // quickly to their true comfort zone instead of crawling through easy levels.
  const settling = stats.history.length < 6

  let delta = 0
  if (settling) {
    if (accuracy === 1) delta = +12
    else if (accuracy >= 0.85) delta = +8
    else if (accuracy >= 0.6) delta = +2
    else delta = -4
  } else {
    if (emaAcc >= 0.9) delta = +3
    else if (emaAcc >= 0.78) delta = +1.5
    else if (emaAcc >= 0.65) delta = 0
    else if (emaAcc >= 0.5) delta = -2
    else delta = -5
  }

  const recent = stats.history.slice(-5)
  if (recent.length >= 3) {
    const baseMs = recent.reduce((s, h) => s + h.avgMs, 0) / recent.length
    // Speed bonus: clearly faster than their own recent average → small nudge up
    if (delta >= 0 && avgMs < baseMs * 0.8) delta += 1
    // Strain guard: accurate but noticeably slower than usual → hold level
    // instead of climbing; they're working hard enough already.
    if (delta > 0 && avgMs > baseMs * 1.35) delta = 0
  }

  let level = clamp(stats.level + delta)

  const history = [
    ...stats.history,
    { t: new Date().toISOString(), level: round1(level), accuracy: round2(accuracy), avgMs, rounds: results.length },
  ].slice(-400) // keep storage small

  // Trend guard: recent week noticeably below the month baseline → ease down gently
  level = clamp(Math.min(level, trendGuard(history, level)))

  return { ...stats, level: round1(level), emaAcc, history }
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
  if (avg(recent) < avg(baseline) - 0.15) return level - 6
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
  if (diff > 3) return { arrow: '↗', label: 'Growing steadily' }
  if (diff < -3) return { arrow: '→', label: 'Taking it comfortably' }
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
