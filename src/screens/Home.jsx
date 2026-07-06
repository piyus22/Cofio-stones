// Home: greeting, resume card if a session is paused, session length choices.
import React from 'react'
import { useStore } from '../store.jsx'
import { SESSION_PLANS, isResumable, sessionProgress } from '../sessions.js'
import { GAMES, GAME_IDS } from '../games/generators.js'
import { todayKey } from '../storage.js'

export default function Home({ startSession, startPractice }) {
  const { state, dispatch } = useStore()
  const name = state.profile?.name
  const resumable = isResumable(state.session)
  const playedToday = state.streak.lastDay === todayKey()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <h1>{greeting}{name ? `, ${name}` : ''} 🌿</h1>
      {state.streak.current > 1 && (
        <p className="soft">🔥 You’ve played {state.streak.current} days in a row. Wonderful.</p>
      )}
      {playedToday && !resumable && <p className="soft">You’ve finished a session today — feel free to enjoy another.</p>}

      {resumable && (
        <div className="card" style={{ borderColor: 'var(--green)', borderWidth: 2 }}>
          <h3>Your session is waiting</h3>
          <p className="soft">You’re {Math.round(sessionProgress(state.session) * 100)}% of the way through. Pick up right where you left off.</p>
          <button className="btn btn-primary" onClick={() => startSession(null)}>Continue session ▸</button>
          <button
            className="btn btn-quiet"
            onClick={() => { if (confirm('Start fresh and let go of the paused session?')) dispatch({ type: 'ABANDON_SESSION' }) }}
          >
            Start fresh instead
          </button>
        </div>
      )}

      {!resumable && (
        <>
          <h2>How much time do you have today?</h2>
          {Object.values(SESSION_PLANS).map((p) => (
            <button key={p.id} className="btn" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16 }} onClick={() => startSession(p.id)}>
              <span style={{ fontSize: '1.8em' }}>{p.icon}</span>
              <span>
                <strong style={{ fontSize: '1.1em' }}>{p.name}</strong>
                <br />
                <span className="soft small">{p.blurb}</span>
              </span>
            </button>
          ))}
          <p className="soft small center" style={{ marginTop: 16 }}>
            You can pause at any moment and continue later in the day.
          </p>

          <h2 style={{ marginTop: 28 }}>Practice Corner 🎯</h2>
          <p className="soft small">Fancy just one exercise? Play as long as you like — it still counts toward your growth.</p>
          <div className="choices">
            {GAME_IDS.map((id) => (
              <button key={id} className="btn" style={{ margin: 0 }} onClick={() => startPractice(id)}>
                <span style={{ fontSize: '1.5em' }}>{GAMES[id].icon}</span>
                <br />
                {GAMES[id].name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
