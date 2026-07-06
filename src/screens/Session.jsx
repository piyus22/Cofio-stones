// Session player: runs blocks of games in order, saving after every round so
// the user can pause and pick up exactly where they left off, any time today.
import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { SESSION_PLANS, sessionProgress } from '../sessions.js'
import { GAMES } from '../games/generators.js'
import { gameLevel } from '../adaptive.js'
import RoundPlayer from '../games/RoundPlayer.jsx'
import { BADGES } from '../badges.js'

export default function Session({ goHome }) {
  const { state, dispatch } = useStore()
  const session = state.session
  const [intro, setIntro] = useState(true)

  if (!session) return null
  const plan = SESSION_PLANS[session.planId]

  if (session.finished) return <Finished goHome={goHome} />

  const block = plan.blocks[session.blockIndex]
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
        <BlockIntro game={game} onStart={() => setIntro(false)} isFirst={session.blockIndex === 0 && session.roundIndex === 0} resumed={session.roundIndex > 0} />
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

function BlockIntro({ game, onStart, isFirst, resumed }) {
  return (
    <div className="card center" style={{ marginTop: 40, padding: 32 }}>
      <div style={{ fontSize: '3em' }}>{game.icon}</div>
      <h2>{game.name}</h2>
      <p className="soft">{game.domain}</p>
      {resumed && <p className="soft">Welcome back — continuing right where you left off.</p>}
      <button className="btn btn-primary" onClick={onStart} style={{ marginTop: 18 }}>
        {isFirst ? 'Begin' : 'Ready — let’s go'}
      </button>
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
  return (
    <div className="celebrate">
      <div className="big">🌸</div>
      <h1>Lovely work today!</h1>
      <p className="soft">You finished your session. Every day you play, you’re caring for your mind.</p>
      {state.streak.current > 1 && <p style={{ fontSize: '1.15em' }}>🔥 {state.streak.current} days in a row</p>}
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
