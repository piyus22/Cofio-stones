// Streak logic with a GRACE DAY: missing a single day no longer erases weeks
// of effort. One grace per rolling 7 days — kind, but not gameable into an
// every-other-day pattern. Habit research (and common decency) both say a
// person recovering from a busy day should not be punished for it.

const DAY = 86400000

// streak: { current, best, lastDay, lastGrace }
// today: 'YYYY-MM-DD'
// Returns { streak, comeback } — comeback true after a 4+ day break.
export function advanceStreak(streak, today) {
  const { lastDay } = streak
  if (lastDay === today) return { streak, comeback: false }

  let { current, best, lastGrace = null } = streak
  let comeback = false
  const gap = lastDay ? Math.round((new Date(today) - new Date(lastDay)) / DAY) : 0
  const graceAvailable = !lastGrace || (new Date(today) - new Date(lastGrace)) / DAY >= 7

  if (!lastDay) {
    current = 1
  } else if (gap === 1) {
    current += 1
  } else if (gap === 2 && graceAvailable) {
    current += 1 // the missed day is quietly forgiven
    lastGrace = today
  } else {
    if (gap >= 4) comeback = true
    current = 1
  }

  best = Math.max(best, current)
  return { streak: { current, best, lastDay: today, lastGrace }, comeback }
}
