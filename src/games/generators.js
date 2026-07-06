// Round generators for every game. Pure functions of (level) → round object.
// level is an integer 1..100 from the adaptive engine. Difficulty scales
// CONTINUOUSLY: every few levels genuinely change something — larger numbers,
// more words, faster displays, bigger grids, trickier patterns — so the game
// stays worthwhile for years while remaining winnable at every step.
import { WORD_TIERS } from '../data/words.js'
import { SENTENCE_TIERS } from '../data/sentences.js'

const ri = (n) => Math.floor(Math.random() * n)
const pick = (arr) => arr[ri(arr.length)]
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = ri(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const sample = (arr, n) => shuffle(arr).slice(0, n)
// t: 0..1 difficulty position; lerp helpers
const T = (level) => Math.max(0, Math.min(1, (level - 1) / 99))
const lerp = (a, b, t) => a + (b - a) * t
const ilerp = (a, b, t) => Math.round(lerp(a, b, t))

function mcFromAnswer(answer, wrongs) {
  const choices = shuffle([answer, ...wrongs])
  return { choices, answerIndex: choices.indexOf(answer) }
}

// ---------- 1. Number Stones (arithmetic / working memory) ----------
export function mathRound(level) {
  const t = T(level)
  // operation pool widens with difficulty
  const ops = ['+']
  if (t > 0.05) ops.push('−')
  if (t > 0.15) ops.push('×')
  if (t > 0.35) ops.push('÷')
  if (t > 0.45) ops.push('3nums')
  if (t > 0.8) ops.push('4nums')
  const op = pick(ops)

  const addMax = ilerp(8, 400, t)       // addend size
  const mulMax = ilerp(3, 19, t)        // factor size
  const divMax = ilerp(3, 15, t)        // divisor / quotient size

  let a, b, c, d, answer, text
  if (op === '+') {
    a = 2 + ri(addMax); b = 1 + ri(addMax)
    answer = a + b; text = `${a} + ${b}`
  } else if (op === '−') {
    a = 2 + ri(addMax); b = 1 + ri(addMax)
    if (b > a) [a, b] = [b, a]
    answer = a - b; text = `${a} − ${b}`
  } else if (op === '×') {
    a = 2 + ri(mulMax); b = 2 + ri(mulMax)
    answer = a * b; text = `${a} × ${b}`
  } else if (op === '÷') {
    b = 2 + ri(divMax); answer = 2 + ri(divMax); a = b * answer
    text = `${a} ÷ ${b}`
  } else if (op === '3nums') {
    a = 2 + ri(addMax); b = 1 + ri(Math.max(2, addMax >> 1)); c = 1 + ri(Math.max(2, addMax >> 1))
    if (Math.random() < 0.5) { answer = a + b - Math.min(c, a + b); text = `${a} + ${b} − ${Math.min(c, a + b)}` }
    else { if (b > a) [a, b] = [b, a]; answer = a - b + c; text = `${a} − ${b} + ${c}` }
  } else { // 4nums
    a = 5 + ri(addMax); b = 1 + ri(addMax >> 1); c = 1 + ri(addMax >> 2); d = 1 + ri(addMax >> 2)
    const cc = Math.min(c, a + b)
    answer = a + b - cc + d; text = `${a} + ${b} − ${cc} + ${d}`
  }

  const spread = Math.max(2, Math.round(Math.abs(answer) * 0.12))
  const wrongs = new Set()
  let tries = 0
  while (wrongs.size < 3) {
    tries++
    // spread widens with tries so small answers (e.g. 0) can't stall the loop
    const w = answer + (pick([-1, 1]) * (1 + ri(spread + Math.floor(tries / 4))))
    if (w !== answer && w >= 0) wrongs.add(w)
  }
  const { choices, answerIndex } = mcFromAnswer(answer, [...wrongs])
  return { kind: 'mc', stimulus: text, question: 'What is the answer?', choices, answerIndex }
}

// ---------- 2. Word Stones (verbal episodic memory) ----------
export function wordRecallRound(level) {
  const t = T(level)
  const tier = WORD_TIERS[t < 0.33 ? 0 : t < 0.66 ? 1 : 2]
  const shownCount = ilerp(3, 10, t)                 // 3 → 10 words
  const showMs = ilerp(2600, 900, t)                 // shorter glimpses
  const words = sample(tier, Math.min(shownCount + 1, tier.length))
  const notShown = words[words.length - 1]
  const shown = words.slice(0, words.length - 1)
  const decoys = sample(shown, Math.min(3, shown.length))
  const { choices, answerIndex } = mcFromAnswer(notShown, decoys)
  return { kind: 'mc', memorize: { words: shown, showMs }, question: 'Which word was NOT shown?', choices, answerIndex }
}

// ---------- 3. Sentence Garden (language / semantic memory) ----------
export function sentenceFillRound(level) {
  const t = T(level)
  const tier = SENTENCE_TIERS[t < 0.33 ? 0 : t < 0.66 ? 1 : 2]
  const s = pick(tier)
  const wrongCount = t < 0.15 ? 2 : 3
  const { choices, answerIndex } = mcFromAnswer(s.answer, sample(s.wrong, wrongCount))
  return { kind: 'mc', stimulus: s.text.replace('___', '＿＿＿'), stimulusClass: 'sentence', question: 'Which word completes the sentence?', choices, answerIndex }
}

// ---------- 4. Stone Path (spatial / visuospatial memory) ----------
export function spatialRound(level) {
  const t = T(level)
  const grid = t < 0.4 ? 3 : t < 0.75 ? 4 : 5        // 3×3 → 5×5
  const cells = grid * grid
  const count = Math.min(ilerp(2, 9, t), cells - 2)  // 2 → 9 stones
  const showMs = ilerp(1100, 450, t)
  const seq = sample([...Array(cells).keys()], count)
  return { kind: 'spatial', grid, sequence: seq, showMs }
}

// ---------- 5. Quick Match (processing speed — ACTIVE speed arm) ----------
const SYMBOL_SETS = [
  ['●', '■', '▲', '◆', '★', '✚'],
  ['☀', '☂', '✿', '♣', '♥', '☾'],
  ['⬠', '⬡', '◐', '◑', '◒', '◓'],   // similar shapes = harder discrimination
  ['◧', '◨', '◩', '◪', '⬒', '⬓'],
]
export function speedMatchRound(level) {
  const t = T(level)
  const set = SYMBOL_SETS[Math.min(Math.floor(t * 4), 3)]
  const target = pick(set)
  const others = set.filter((s) => s !== target)
  const nChoices = 3 + (t > 0.3 ? 1 : 0) + (t > 0.6 ? 1 : 0) + (t > 0.85 ? 1 : 0) // 3 → 6
  const wrongs = sample(others, nChoices - 1)
  const { choices, answerIndex } = mcFromAnswer(target, wrongs)
  return { kind: 'mc', stimulus: target, stimulusClass: 'symbol', question: 'Find the matching shape', choices, answerIndex, speed: true }
}

// ---------- 6. Pattern Pebbles (reasoning — ACTIVE reasoning arm) ----------
export function patternRound(level) {
  const t = T(level)
  const kinds = ['shape', 'arith']
  if (t > 0.35) kinds.push('alt')      // alternating two-step: +a, +b, +a, +b
  if (t > 0.55) kinds.push('double')   // geometric doubling
  if (t > 0.75) kinds.push('growstep') // step itself grows: +1, +2, +3…
  const kind = pick(kinds)

  if (kind === 'shape') {
    const motifs = [['🌑', '🌕'], ['🍂', '🌿', '🌸'], ['⬜', '⬛'], ['🔵', '🔺', '🟡'], ['🌑', '🌓', '🌕', '🌗']]
    const m = pick(motifs.slice(0, t < 0.1 ? 2 : t < 0.4 ? 4 : 5))
    const reps = t < 0.3 ? 2 : 3
    const seq = Array.from({ length: Math.min(m.length * reps, 9) }, (_, i) => m[i % m.length])
    const answer = m[seq.length % m.length]
    const wrongs = sample(['🌑', '🌓', '🌕', '🌗', '🍂', '🌿', '🌸', '⬜', '⬛', '🔵', '🔺', '🟡'].filter((x) => x !== answer), 3)
    const { choices, answerIndex } = mcFromAnswer(answer, wrongs)
    return { kind: 'mc', stimulus: seq.join('  ') + '  ?', stimulusClass: 'symbol', question: 'What comes next?', choices, answerIndex }
  }

  let seq = [], answer
  if (kind === 'arith') {
    const start = 1 + ri(ilerp(8, 60, t))
    const stepMax = ilerp(2, 12, t)
    const step = (Math.random() < (t > 0.4 ? 0.4 : 0.1) ? -1 : 1) * (1 + ri(stepMax))
    const base = step < 0 ? start + Math.abs(step) * 5 : start
    seq = Array.from({ length: 4 }, (_, i) => base + step * i)
    answer = base + step * 4
  } else if (kind === 'alt') {
    const a = 1 + ri(ilerp(2, 8, t)), b = 1 + ri(ilerp(3, 10, t))
    let v = 1 + ri(20)
    seq = [v]
    for (let i = 0; i < 4; i++) { v += i % 2 === 0 ? a : b; seq.push(v) }
    answer = seq[4] + a
    seq = seq.slice(0, 5)
  } else if (kind === 'double') {
    let v = 2 + ri(4)
    seq = [v]
    for (let i = 0; i < 3; i++) { v *= 2; seq.push(v) }
    answer = v * 2
  } else { // growstep
    let v = 1 + ri(10), step = 1 + ri(3)
    seq = [v]
    for (let i = 0; i < 4; i++) { v += step + i; seq.push(v) }
    answer = seq[4] + step + 4
    seq = seq.slice(0, 5)
  }

  const wrongs = new Set()
  while (wrongs.size < 3) {
    const w = answer + pick([-5, -3, -2, -1, 1, 2, 3, 5])
    if (w !== answer && w >= 0) wrongs.add(w)
  }
  const { choices, answerIndex } = mcFromAnswer(answer, [...wrongs])
  return { kind: 'mc', stimulus: seq.join(',  ') + ',  ?', question: 'What comes next?', choices, answerIndex }
}

// ---------- Registry ----------
export const GAMES = {
  math: { id: 'math', name: 'Number Stones', icon: '🧮', domain: 'Numbers & working memory', makeRound: mathRound },
  words: { id: 'words', name: 'Word Stones', icon: '📖', domain: 'Word memory', makeRound: wordRecallRound },
  sentence: { id: 'sentence', name: 'Sentence Garden', icon: '🌿', domain: 'Language', makeRound: sentenceFillRound },
  spatial: { id: 'spatial', name: 'Stone Path', icon: '🪨', domain: 'Places & spaces', makeRound: spatialRound },
  speed: { id: 'speed', name: 'Quick Match', icon: '⚡', domain: 'Thinking speed', makeRound: speedMatchRound },
  pattern: { id: 'pattern', name: 'Pattern Pebbles', icon: '🔮', domain: 'Puzzles & reasoning', makeRound: patternRound },
}

export const GAME_IDS = Object.keys(GAMES)
