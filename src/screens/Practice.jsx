// Practice Corner: free play of any single exercise, for as long as you like.
// Every 5 rounds the results feed the same adaptive engine and growth history
// as daily sessions — so practicing here still grows your garden.
import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { GAMES } from '../games/generators.js'
import { gameLevel } from '../adaptive.js'
import RoundPlayer from '../games/RoundPlayer.jsx'
import { HOW_TO, tipFor } from '../data/strategies.js'

const BLOCK = 5

export default function Practice({ gameId, goHome }) {
  const { state, dispatch } = useStore()
  const game = GAMES[gameId]
  const level = gameLevel(state.games[gameId])
  const [results, setResults] = useState([])
  const [totalDone, setTotalDone] = useState(0)
  const [resting, setResting] = useState(false)
  const [roundKey, setRoundKey] = useState(0)
  const firstTime = !state.flags?.['tut_' + gameId]
  const [started, setStarted] = useState(!firstTime)

  function finish(pending = results) {
    // partial blocks still count toward growth if there's enough signal
    if (pending.length >= 3) dispatch({ type: 'PRACTICE_BLOCK_DONE', game: gameId, results: pending })
    goHome()
  }

  function onRoundDone(result) {
    const next = [...results, result]
    setTotalDone(totalDone + 1)
    if (next.length >= BLOCK) {
      dispatch({ type: 'PRACTICE_BLOCK_DONE', game: gameId, results: next })
      setResults([])
      setResting(true)
    } else {
      setResults(next)
      setRoundKey(roundKey + 1)
    }
  }

  if (!started) {
    return (
      <div className="card center" style={{ marginTop: 40, padding: 32 }}>
        <div style={{ fontSize: '3em' }}>{game.icon}</div>
        <h2>{game.name}</h2>
        <p style={{ color: 'var(--green)', fontWeight: 600 }}>New exercise — here’s how it works:</p>
        <div style={{ textAlign: 'left', background: 'var(--green-soft)', borderRadius: 12, padding: '12px 16px', margin: '10px 0' }}>
          {HOW_TO[gameId]?.map((line, i) => (
            <p key={i} style={{ margin: '6px 0' }}>{i + 1}. {line}</p>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            dispatch({ type: 'SET_FLAG', flag: 'tut_' + gameId, value: true })
            setStarted(true)
          }}
        >
          Got it — let’s try
        </button>
        <button className="btn btn-quiet" onClick={goHome}>Maybe later</button>
      </div>
    )
  }

  if (resting) {
    return (
      <div className="celebrate">
        <div className="big">{game.icon}</div>
        <h2>Lovely — {totalDone} rounds of {game.name}</h2>
        <p className="soft">Your growth page has been updated. Carry on, or call it a day?</p>
        <button className="btn btn-primary" onClick={() => { setResting(false); setRoundKey(roundKey + 1) }}>
          Keep going
        </button>
        <button className="btn" onClick={goHome}>I’m done for now</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-quiet" style={{ minHeight: 48, border: 'none', background: 'none', fontSize: '1em' }} onClick={() => finish()}>
          ◂ Finish practice
        </button>
        <span className="soft small">{game.icon} {game.name}</span>
      </div>
      <PracticeRound key={roundKey} gameId={gameId} level={level} onDone={onRoundDone} />
    </div>
  )
}

function PracticeRound({ gameId, level, onDone }) {
  const round = useMemo(() => GAMES[gameId].makeRound(level), [gameId, level])
  return <RoundPlayer round={round} onDone={onDone} />
}
