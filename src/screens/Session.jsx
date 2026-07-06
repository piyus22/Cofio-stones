// Session player: runs blocks of games in order, saving after every round so
// the user can pause and pick up exactly where they left off, any time today.
import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { SESSION_PLANS, sessionProgress } from '../sessions.js'
import { GAMES } from '../games/generators.js'
import { gameLevel } from '../adaptive.js'
import RoundPlayer from '../games/RoundPlayer.jsx'
import { BADGES } from '../badges.js'
import { tipFor, HOW_TO } from '../data/strategies.js'

export default function Session({ goHome }) {
  const { state, dispatch } = useStore()
  const session = state.session
  const [intro, setIntro] = useState(true)

  if (!session) return null
  const plan = SESSION_PLANS[session.planId]

  if (session.finished) return <Finished goHome={goHome} />

  const block = session.blocks[session.blockIndex]
  const game = GAMES[block.game]
  const level = gameLevel(state.games[block.game])
  const progress = sessionProgress(session)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-quiet" style={{ minHeight: 48, border: 'none', background: 'none', fontSize: '1em' }} onClick={goHome}>
          ⏸ Pause &amp; save
        </button>
        <span className="soft small">{plan.name} session</span>
      </div>
      <div className="session-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${Math.max(progress * 100, 3)}%` }} />
      </div>

      {intro ? (
        <BlockIntro
          game={game}
          onStart={() => {
            if (!state.flags?.['tut_' + block.game]) dispatch({ type: 'SET_FLAG', flag: 'tut_' + block.game, value: true })
            setIntro(false)
          }}
          firstTime={!state.flags?.['tut_' + block.game]}
          isFirst={session.blockIndex === 0 && session.roundIndex === 0}
          resumed={session.roundIndex > 0}
        />
      ) : (
        <RoundRunner
          key={`${session.blockIndex}-${session.roundIndex}`}
          gameId={block.game}
          level={level}
          onDone={(result) => {
            const endOfBlock = session.roundIndex + 1 >= block.rounds
            dispatch({ type: 'ROUND_DONE', result })
            if (endOfBlock) setIntro(true)
          }}
        />
      )}
    </div>
  )
}

function BlockIntro({ game, onStart, isFirst, resumed, firstTime }) {
  const [showHelp, setShowHelp] = useState(false)
  const explain = firstTime || showHelp
  return (
    <div className="card center" style={{ marginTop: 40, padding: 32 }}>
      <div style={{ fontSize: '3em' }}>{game.icon}</div>
      <h2>{game.name}</h2>
      <p className="soft">{game.domain}</p>
      {firstTime && <p style={{ color: 'var(--green)', fontWeight: 600 }}>New exercise — here’s how it works:</p>}
      {explain && (
        <div style={{ textAlign: 'left', background: 'var(--green-soft)', borderRadius: 12, padding: '12px 16px', margin: '10px 0' }}>
          {HOW_TO[game.id]?.map((line, i) => (
            <p key={i} style={{ margin: '6px 0' }}>{i + 1}. {line}</p>
          ))}
        </div>
      )}
      {!explain && tipFor(game.id) && (
        <p style={{ background: 'var(--gold-soft)', borderRadius: 12, padding: '10px 14px', fontSize: '0.95em' }}>
          💡 {tipFor(game.id)}
        </p>
      )}
      {resumed && <p className="soft">Welcome back — continuing right where you left off.</p>}
      <button className="btn btn-primary" onClick={onStart} style={{ marginTop: 18 }}>
        {firstTime ? 'Got it — let’s try' : isFirst ? 'Begin' : 'Ready — let’s go'}
      </button>
      {!explain && (
        <button className="btn btn-quiet" onClick={() => setShowHelp(true)}>How to play?</button>
      )}
    </div>
  )
}

function RoundRunner({ gameId, level, onDone }) {
  const round = useMemo(() => GAMES[gameId].makeRound(level), [gameId, level])
  return <RoundPlayer round={round} onDone={onDone} />
}

function Finished({ goHome }) {
  const { state, dispatch } = useStore()
  const newBadges = state.newBadges
  const session = state.session

  const rows = session.blocks.map((b, i) => {
    const res = session.results[i] || []
    return { game: GAMES[b.game], correct: res.filter((r) => r.correct).length, total: res.length }
  })
  const totalCorrect = rows.reduce((s, r) => s + r.correct, 0)
  const totalRounds = rows.reduce((s, r) => s + r.total, 0)

  return (
    <div className="celebrate">
      <div className="big">🌸</div>
      <h1>Lovely work today!</h1>
      <p className="soft">
        {totalCorrect} of {totalRounds} spot on. Every day you play, you’re caring for your mind.
      </p>
      {state.streak.current > 1 && <p style={{ fontSize: '1.15em' }}>🔥 {state.streak.current} days in a row</p>}

      <div className="card" style={{ textAlign: 'left' }}>
        <h3 style={{ marginTop: 0 }}>Today’s garden</h3>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ fontSize: '1.5em' }}>{r.game.icon}</span>
            <span style={{ flex: 1 }}>{r.game.name}</span>
            <Blooms correct={r.correct} total={r.total} />
          </div>
        ))}
      </div>
      <BackupNudge />
      {newBadges.length > 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>New badge{newBadges.length > 1 ? 's' : ''} earned!</h3>
          <NewBadgeList ids={newBadges} />
        </div>
      )}
      <button
        className="btn btn-primary"
        onClick={() => {
          dispatch({ type: 'CLEAR_NEW_BADGES' })
          dispatch({ type: 'CLEAR_FINISHED_SESSION' })
          goHome()
        }}
      >
        Done
      </button>
    </div>
  )
}

// Every 10th session, gently suggest saving a progress file. Phones can lose
// browser data; a saved file means months of history are never at risk.
function BackupNudge() {
  const { state } = useStore()
  const total = Object.values(state.sessionCounts || {}).reduce((a, b) => a + b, 0)
  if (total === 0 || total % 10 !== 0) return null
  return (
    <div className="card" style={{ textAlign: 'center', background: 'var(--green-soft)' }}>
      <p style={{ margin: '4px 0' }}>💾 That’s {total} sessions! A good moment to save a progress file — you’ll find the button under <strong>You → Keep your progress safe</strong>.</p>
    </div>
  )
}

// Per-game result shown as blooms rather than scores — flowers for right
// answers, buds for the rest. Warm, glanceable, never a red mark.
function Blooms({ correct, total }) {
  return (
    <span aria-label={`${correct} of ${total} correct`} style={{ letterSpacing: 2, whiteSpace: 'nowrap' }}>
      {Array.from({ length: total }, (_, i) => (i < correct ? '🌸' : '🌿'))}
    </span>
  )
}

function NewBadgeList({ ids }) {
  return (
    <div>
      {ids.map((id) => {
        const b = BADGES.find((x) => x.id === id)
        if (!b) return null
        return (
          <div key={id} className="badge-row">
            <div className="badge-medal">{b.icon}</div>
            <div style={{ textAlign: 'left' }}>
              <strong>{b.name}</strong>
              <div className="soft small">{b.desc}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
