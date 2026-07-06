// Practice Corner: free play of any single exercise, for as long as you like.
// Every 5 rounds the results feed the same adaptive engine and growth history
// as daily sessions — so practicing here still grows your garden.
import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { GAMES } from '../games/generators.js'
import { gameLevel } from '../adaptive.js'
import RoundPlayer from '../games/RoundPlayer.jsx'

const BLOCK = 5

export default function Practice({ gameId, goHome }) {
  const { state, dispatch } = useStore()
  const game = GAMES[gameId]
  const level = gameLevel(state.games[gameId])
  const [results, setResults] = useState([])
  const [totalDone, setTotalDone] = useState(0)
  const [resting, setResting] = useState(false)
  const [roundKey, setRoundKey] = useState(0)

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
