// Plays a single round of any game. Two round kinds:
//  - 'mc'      : optional memorize phase → multiple-choice question
//  - 'spatial' : watch stones light up → tap the ones you remember
// Feedback is always gentle: a wrong answer shows "Good try" plus the correct
// answer, and the session simply continues.
import React, { useEffect, useRef, useState } from 'react'

const ENCOURAGE = ['Well done!', 'Lovely!', 'That’s right!', 'Beautifully done!', 'Yes — great!']
const GENTLE = ['Good try!', 'Nearly!', 'Good effort!']
const pick = (a) => a[Math.floor(Math.random() * a.length)]

export default function RoundPlayer({ round, onDone }) {
  if (round.kind === 'spatial') return <SpatialRound round={round} onDone={onDone} />
  return <McRound round={round} onDone={onDone} />
}

/* ---------- multiple choice (with optional memorize phase) ---------- */
function McRound({ round, onDone }) {
  const [phase, setPhase] = useState(round.memorize ? 'memorize' : 'question')
  const [memIndex, setMemIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const startRef = useRef(null)

  // memorize phase: show words one at a time
  useEffect(() => {
    if (phase !== 'memorize') return
    const t = setTimeout(() => {
      if (memIndex + 1 < round.memorize.words.length) setMemIndex(memIndex + 1)
      else setPhase('question')
    }, round.memorize.showMs)
    return () => clearTimeout(t)
  }, [phase, memIndex, round])

  useEffect(() => {
    if (phase === 'question') startRef.current = Date.now()
  }, [phase])

  function choose(i) {
    if (picked !== null) return
    const ms = Date.now() - startRef.current
    setPicked(i)
    const correct = i === round.answerIndex
    setTimeout(() => onDone({ correct, ms }), correct ? 1100 : 2200)
  }

  if (phase === 'memorize') {
    return (
      <div>
        <p className="center soft">Remember these words…</p>
        <div className="stimulus word" aria-live="polite">{round.memorize.words[memIndex]}</div>
        <p className="center soft small">{memIndex + 1} of {round.memorize.words.length}</p>
      </div>
    )
  }

  const answered = picked !== null
  const wasCorrect = picked === round.answerIndex
  return (
    <div>
      {round.stimulus && (
        <div className={'stimulus ' + (round.stimulusClass === 'sentence' ? '' : round.stimulusClass || '')}
          style={{
            ...(round.stimulusClass === 'sentence' ? { fontSize: '1.35em', lineHeight: 1.5 } : {}),
            ...(round.stimulusStyle || {}),
          }}>
          {round.stimulus}
        </div>
      )}
      <h2 className="center" style={{ fontFamily: 'var(--font-body)', fontSize: '1.15em', fontWeight: 600 }}>{round.question}</h2>
      <div className={'choices' + (round.choices.some((c) => String(c).length > 12) ? ' one-col' : '')}>
        {round.choices.map((c, i) => (
          <button
            key={i}
            className={
              'btn btn-choice' +
              (answered && i === round.answerIndex ? ' correct' : '') +
              (answered && i === picked && !wasCorrect ? ' chosen-wrong' : '')
            }
            disabled={answered}
            onClick={() => choose(i)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className={'feedback ' + (answered ? (wasCorrect ? 'good' : 'gentle') : '')} aria-live="polite">
        {answered && (wasCorrect ? pick(ENCOURAGE) : `${pick(GENTLE)} It was “${round.choices[round.answerIndex]}”.`)}
      </div>
    </div>
  )
}

/* ---------- spatial: remember which stones lit up ---------- */
function SpatialRound({ round, onDone }) {
  const [phase, setPhase] = useState('watch') // watch → recall → done
  const [litIndex, setLitIndex] = useState(-1)
  const [pickedSet, setPickedSet] = useState([])
  const startRef = useRef(null)
  const cells = round.grid * round.grid

  useEffect(() => {
    if (phase !== 'watch') return
    if (litIndex + 1 <= round.sequence.length) {
      const t = setTimeout(() => {
        if (litIndex + 1 < round.sequence.length) setLitIndex(litIndex + 1)
        else {
          setPhase('recall')
          startRef.current = Date.now()
        }
      }, litIndex === -1 ? 800 : round.showMs)
      return () => clearTimeout(t)
    }
  }, [phase, litIndex, round])

  function tap(i) {
    if (phase !== 'recall' || pickedSet.includes(i)) return
    const next = [...pickedSet, i]
    setPickedSet(next)
    if (next.length >= round.sequence.length) {
      const ms = Date.now() - startRef.current
      const hits = next.filter((x) => round.sequence.includes(x)).length
      const correct = hits === round.sequence.length
      setPhase('done')
      setTimeout(() => onDone({ correct, ms }), correct ? 1100 : 2200)
    }
  }

  const currentLit = phase === 'watch' && litIndex >= 0 ? round.sequence[litIndex] : -1
  const done = phase === 'done'

  return (
    <div>
      <p className="center soft" aria-live="polite">
        {phase === 'watch' && 'Watch which stones light up…'}
        {phase === 'recall' && `Tap the ${round.sequence.length} stones that lit up`}
        {done && ''}
      </p>
      <div className="stones-grid" style={{ gridTemplateColumns: `repeat(${round.grid}, 1fr)` }}>
        {Array.from({ length: cells }, (_, i) => {
          let cls = 'stone'
          if (i === currentLit) cls += ' lit'
          if ((phase === 'recall' || done) && pickedSet.includes(i)) {
            cls += round.sequence.includes(i) ? ' picked-good' : ' picked-gentle'
          }
          if (done && round.sequence.includes(i) && !pickedSet.includes(i)) cls += ' lit'
          return (
            <button key={i} className={cls} onClick={() => tap(i)} disabled={phase !== 'recall'}
              aria-label={`stone ${i + 1}`}>
              {(phase === 'recall' || done) && pickedSet.includes(i) ? (round.sequence.includes(i) ? '✓' : '·') : ''}
            </button>
          )
        })}
      </div>
      <div className={'feedback ' + (done ? (pickedSet.filter((x) => round.sequence.includes(x)).length === round.sequence.length ? 'good' : 'gentle') : '')} aria-live="polite">
        {done && (pickedSet.filter((x) => round.sequence.includes(x)).length === round.sequence.length
          ? pick(ENCOURAGE)
          : `${pick(GENTLE)} The green stones were the ones.`)}
      </div>
    </div>
  )
}
