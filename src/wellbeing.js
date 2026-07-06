// Long-horizon wellbeing monitor.
//
// This is deliberately conservative. A bad week means nothing — illness,
// travel, poor sleep, new glasses, a new medicine. We only ever speak up when
// MULTIPLE cognitive domains show SUSTAINED change (recent 3 weeks vs a
// baseline ending 3 weeks ago), and only once there are 8+ weeks of history.
//
// This is a heuristic on game performance — NOT a medical screen, and the
// language shown to users must always say so.
import { GAME_IDS } from './games/generators.js'

const DAY = 86400000

function windowStats(history, fromDays, toDays, now) {
  const entries = history.filter((h) => {
    const age = (now - new Date(h.t).getTime()) / DAY
    return age <= fromDays && age > toDays
  })
  if (entries.length < 5) return null // not enough signal — stay silent
  const avg = (k) => entries.reduce((s, h) => s + h[k], 0) / entries.length
  return { acc: avg('accuracy'), level: avg('level'), ms: avg('avgMs') }
}

// A game "signals" only when at least 2 of 3 measures moved together:
// accuracy down, level down, or slower responses at similar difficulty.
export function declineSignals(state, now = Date.now()) {
  const domains = []
  for (const id of GAME_IDS) {
    const h = state.games[id]?.history || []
    const recent = windowStats(h, 21, 0, now)
    const baseline = windowStats(h, 90, 21, now)
    if (!recent || !baseline) continue
    let signals = 0
    if (recent.acc < baseline.acc - 0.12) signals++
    if (recent.level < baseline.level - 8) signals++
    if (recent.ms > baseline.ms * 1.2 && Math.abs(recent.level - baseline.level) <= 10) signals++
    if (signals >= 2) domains.push(id)
  }
  return domains
}

export function wellbeingStatus(state, now = Date.now()) {
  const stamps = GAME_IDS.flatMap((id) => (state.games[id]?.history || []).map((h) => new Date(h.t).getTime()))
  if (!stamps.length) return { status: 'building', domains: [] }
  const spanWeeks = (now - Math.min(...stamps)) / (7 * DAY)
  if (spanWeeks < 8) return { status: 'building', domains: [] }

  const domains = declineSignals(state, now)
  if (domains.length >= 3) return { status: 'checkup', domains }
  if (domains.length >= 1) return { status: 'watch', domains } // noted, not surfaced
  return { status: 'steady', domains: [] }
}
