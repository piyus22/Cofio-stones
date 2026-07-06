// Weekly recap: a warm once-a-week summary of the past 7 days,
// computed entirely from on-device history. Shown on Home each new week.
import { GAMES, GAME_IDS } from './games/generators.js'
import { todayKey } from './storage.js'

// ISO week key like "2026-W27" — recap shows once per calendar week.
export function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

// Returns null when there is nothing to celebrate yet.
export function buildRecap(state) {
  const now = Date.now()
  const within = (iso, days) => now - new Date(iso).getTime() <= days * 86400000

  const daysPlayed = state.playDays.filter((d) => within(d + 'T12:00:00', 7)).length
  let rounds = 0
  let correct = 0
  const gains = []

  for (const id of GAME_IDS) {
    const h = state.games[id].history
    const week = h.filter((e) => within(e.t, 7))
    if (!week.length) continue
    rounds += week.reduce((s, e) => s + e.rounds, 0)
    correct += week.reduce((s, e) => s + Math.round(e.accuracy * e.rounds), 0)
    const before = h.filter((e) => !within(e.t, 7))
    const startLevel = before.length ? before[before.length - 1].level : week[0].level
    const endLevel = week[week.length - 1].level
    if (endLevel - startLevel >= 1) gains.push({ id, gain: Math.round(endLevel - startLevel) })
  }

  if (daysPlayed === 0 || rounds === 0) return null
  gains.sort((a, b) => b.gain - a.gain)

  const lines = []
  lines.push(`You played on ${daysPlayed} day${daysPlayed > 1 ? 's' : ''} and answered ${rounds} questions.`)
  const pct = Math.round((correct / rounds) * 100)
  if (pct >= 60) lines.push(`${pct}% were spot on — lovely work.`)
  if (gains.length) {
    const top = gains[0]
    lines.push(`${GAMES[top.id].icon} ${GAMES[top.id].name} grew ${top.gain} level${top.gain > 1 ? 's' : ''}${gains.length > 1 ? `, and ${gains.length - 1} other game${gains.length > 2 ? 's' : ''} grew too` : ''}.`)
  } else {
    lines.push('You held steady — showing up is what matters most.')
  }
  if (state.streak.current >= 3) lines.push(`🔥 You're on a ${state.streak.current}-day streak.`)

  return { daysPlayed, rounds, pct, gains, lines }
}
