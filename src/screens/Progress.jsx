// Progress: one card per game — level, gentle trend words, sparkline.
// Language is always nurturing; easing difficulty is framed as comfort, not failure.
import React from 'react'
import { useStore } from '../store.jsx'
import { GAMES, GAME_IDS } from '../games/generators.js'
import { trendLabel, avgTimeTrend, LEVEL_MAX } from '../adaptive.js'
import { wellbeingStatus } from '../wellbeing.js'

export default function Progress() {
  const { state } = useStore()
  const days = state.playDays.length

  return (
    <div>
      <h1>Your growth 🌱</h1>
      <p className="soft">
        {days === 0
          ? 'Your garden is ready to grow. Finish a session and your progress will appear here.'
          : `You’ve played on ${days} day${days > 1 ? 's' : ''}. Every mind grows at its own pace — this page is only ever about you.`}
      </p>

      {GAME_IDS.map((id) => {
        const g = GAMES[id]
        const stats = state.games[id]
        const trend = trendLabel(stats.history)
        const timeNote = avgTimeTrend(stats.history)
        return (
          <div key={id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.8em' }}>{g.icon}</span>
              <div style={{ flex: 1 }}>
                <strong>{g.name}</strong>
                <div className="soft small">{g.domain}</div>
              </div>
              <div className="center">
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4em', color: 'var(--green)' }}>
                  {Math.round(stats.level)}
                </div>
                <div className="soft small">of {LEVEL_MAX}</div>
              </div>
            </div>
            <LevelDots level={stats.level} />
            <Sparkline history={stats.history} />
            <p className="small" style={{ margin: '4px 0 0' }}>
              {trend.arrow} {trend.label}
              {timeNote && <span className="soft"> · {timeNote}</span>}
            </p>
          </div>
        )
      })}

      <WellbeingCard />
    </div>
  )
}

// Speaks only with months of data, and only ever gently. Sustained change
// across several domains → a calm suggestion to mention it to a doctor.
// One noisy domain or thin data → reassurance or silence.
function WellbeingCard() {
  const { state } = useStore()
  const { status } = wellbeingStatus(state)

  if (status === 'building' || status === 'watch') return null

  if (status === 'steady') {
    return (
      <p className="soft small center" style={{ marginTop: 20 }}>
        Looking across recent months, your overall pattern is steady. 🌿
      </p>
    )
  }

  // status === 'checkup'
  return (
    <div className="card" style={{ borderColor: 'var(--gold)', borderWidth: 2, background: 'var(--gold-soft)' }}>
      <h3 style={{ marginTop: 0 }}>A gentle observation 🕊️</h3>
      <p>
        Over the past couple of months, several of your exercises have been
        gently easing to keep things comfortable. That can happen for many
        everyday reasons — poor sleep, stress, a busy spell, new medicines,
        or eyesight changes.
      </p>
      <p>
        If you’ve noticed changes in daily life too, it may be worth mentioning
        at your next doctor’s visit. Catching things early is always worthwhile —
        and often the explanation is something simple and fixable.
      </p>
      <p className="soft small">
        Cofio Stones is not a medical device and cannot diagnose anything.
        This note is based only on your game results.
      </p>
    </div>
  )
}

function LevelDots({ level }) {
  const pct = Math.max(2, (level / LEVEL_MAX) * 100)
  return (
    <div className="session-bar" style={{ margin: '10px 0' }} role="progressbar"
      aria-label={`level ${Math.round(level)} of ${LEVEL_MAX}`}
      aria-valuenow={Math.round(level)} aria-valuemin={1} aria-valuemax={LEVEL_MAX}>
      <div style={{ width: `${pct}%` }} />
    </div>
  )
}

function Sparkline({ history }) {
  if (history.length < 2) return <p className="soft small" style={{ margin: '6px 0 0' }}>Play a few sessions to see your journey here.</p>
  const pts = history.slice(-30)
  const w = 300, h = 50, pad = 4
  const xs = pts.map((_, i) => pad + (i * (w - 2 * pad)) / (pts.length - 1))
  const min = 1, max = 100
  const ys = pts.map((p) => h - pad - ((p.level - min) / (max - min)) * (h - 2 * pad))
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
