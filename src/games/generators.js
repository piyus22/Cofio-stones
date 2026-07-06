// Round generators for every game. Pure functions of (level) → round object.
// level is an integer 1..8 from the adaptive engine.
import { WORD_TIERS, wordTierForLevel } from '../data/words.js'
import { SENTENCE_TIERS, sentenceTierForLevel } from '../data/sentences.js'

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

function mcFromAnswer(answer, wrongs) {
  const choices = shuffle([answer, ...wrongs])
  return { choices, answerIndex: choices.indexOf(answer) }
}

// ---------- 1. Number Stones (arithmetic / working memory) ----------
export function mathRound(level) {
  let a, b, c, op, answer, text
  if (level <= 1) { a = 2 + ri(7); b = 1 + ri(7); op = '+' }
  else if (level === 2) { a = 5 + ri(10); b = 1 + ri(5); op = pick(['+', '−']) }
  else if (level === 3) { a = 10 + ri(30); b = 2 + ri(10); op = pick(['+', '−']) }
  else if (level === 4) { a = 2 + ri(8); b = 2 + ri(8); op = pick(['×', '+', '−']); if (op !== '×') { a += 10 + ri(20); b += ri(10) } }
  else if (level === 5) { a = 3 + ri(9); b = 3 + ri(9); op = pick(['×', '−', '+']); if (op !== '×') { a += 20 + ri(40); b += 10 + ri(20) } }
  else if (level === 6) { op = '3nums'; a = 5 + ri(20); b = 3 + ri(15); c = 2 + ri(10) }
  else if (level === 7) { op = pick(['÷', '×']); if (op === '÷') { b = 3 + ri(9); answer = 3 + ri(9); a = b * answer } else { a = 6 + ri(10); b = 6 + ri(7) } }
  else { op = pick(['3nums', '÷', '×']); if (op === '÷') { b = 4 + ri(10); answer = 4 + ri(10); a = b * answer } else if (op === '×') { a = 7 + ri(12); b = 6 + ri(9) } else { a = 20 + ri(50); b = 10 + ri(30); c = 5 + ri(20) } }

  if (op === '+') { answer = a + b; text = `${a} + ${b}` }
  else if (op === '−') { if (b > a) [a, b] = [b, a]; answer = a - b; text = `${a} − ${b}` }
  else if (op === '×') { answer = a * b; text = `${a} × ${b}` }
  else if (op === '÷') { text = `${a} ÷ ${b}` }
  else { // three numbers
    const plusFirst = Math.random() < 0.5
    if (plusFirst) { answer = a + b - Math.min(c, a + b); text = `${a} + ${b} − ${Math.min(c, a + b)}` }
    else { if (b > a) [a, b] = [b, a]; answer = a - b + c; text = `${a} − ${b} + ${c}` }
  }

  const wrongs = new Set()
  while (wrongs.size < 3) {
    const offset = pick([-10, -3, -2, -1, 1, 2, 3, 10, answer > 20 ? 5 : 4])
    const w = answer + offset
    if (w !== answer && w >= 0) wrongs.add(w)
  }
  const { choices, answerIndex } = mcFromAnswer(answer, [...wrongs])
  return { kind: 'mc', stimulus: text, stimulusClass: '', question: 'What is the answer?', choices, answerIndex }
}

// ---------- 2. Word Stones (verbal episodic memory) ----------
export function wordRecallRound(level) {
  const tier = WORD_TIERS[wordTierForLevel(level)]
  const shownCount = Math.min(3 + Math.floor((level - 1) / 2), 7) // 3 → 7 words
  const showMs = Math.max(2600 - level * 150, 1400)
  const words = sample(tier, shownCount + 1)
  const notShown = words[words.length - 1]
  const shown = words.slice(0, shownCount)
  const decoys = sample(shown, Math.min(3, shown.length))
  const { choices, answerIndex } = mcFromAnswer(notShown, decoys)
  return {
    kind: 'mc',
    memorize: { words: shown, showMs },
    question: 'Which word was NOT shown?',
    choices,
    answerIndex,
  }
}

// ---------- 3. Sentence Garden (language / semantic memory) ----------
export function sentenceFillRound(level) {
  const tier = SENTENCE_TIERS[sentenceTierForLevel(level)]
  const s = pick(tier)
  const wrongCount = level <= 2 ? 2 : 3
  const { choices, answerIndex } = mcFromAnswer(s.answer, sample(s.wrong, wrongCount))
  return { kind: 'mc', stimulus: s.text.replace('___', '＿＿＿'), stimulusClass: 'sentence', question: 'Which word completes the sentence?', choices, answerIndex }
}

// ---------- 4. Stone Path (spatial / visuospatial memory) ----------
export function spatialRound(level) {
  const grid = level <= 2 ? 3 : level <= 5 ? 3 : 4 // 3x3 → 4x4
  const cells = grid * grid
  const count = Math.min(2 + Math.floor(level / 2), 6) // 2 → 6 stones
  const showMs = Math.max(1050 - level * 60, 600)
  const seq = sample([...Array(cells).keys()], count)
  return { kind: 'spatial', grid, sequence: seq, showMs }
}

// ---------- 5. Quick Match (processing speed — ACTIVE speed arm) ----------
const SYMBOL_SETS = [
  ['●', '■', '▲', '◆', '★', '✚'],
  ['☀', '☂', '✿', '♣', '♥', '☾'],
  ['⬠', '⬡', '◐', '◑', '◒', '◓'],
]
export function speedMatchRound(level) {
  const set = SYMBOL_SETS[Math.min(Math.floor((level - 1) / 3), 2)]
  const target = pick(set)
  const others = set.filter((s) => s !== target)
  const nChoices = level <= 3 ? 3 : 4
  const wrongs = sample(others, nChoices - 1)
  const { choices, answerIndex } = mcFromAnswer(target, wrongs)
  return { kind: 'mc', stimulus: target, stimulusClass: 'symbol', question: 'Find the matching shape', choices, answerIndex, speed: true }
}

// ---------- 6. Pattern Pebbles (reasoning — ACTIVE reasoning arm) ----------
export function patternRound(level) {
  if (level <= 4 && Math.random() < 0.5) {
    // shape pattern
    const motifs = [['🌑', '🌕'], ['🍂', '🌿', '🌸'], ['⬜', '⬛'], ['🔵', '🔺', '🟡']]
    const m = pick(motifs.slice(0, level <= 2 ? 2 : 4))
    const reps = 2 + (level > 2 ? 1 : 0)
    const seq = Array.from({ length: m.length * reps }, (_, i) => m[i % m.length])
    const answer = m[seq.length % m.length]
    const wrongs = sample(['🌑', '🌕', '🍂', '🌿', '🌸', '⬜', '⬛', '🔵', '🔺', '🟡'].filter((x) => x !== answer), 3)
    const { choices, answerIndex } = mcFromAnswer(answer, wrongs)
    return { kind: 'mc', stimulus: seq.join('  ') + '  ?', stimulusClass: 'symbol', question: 'What comes next?', choices, answerIndex }
  }
  // number pattern
  let start, step, seq
  if (level <= 2) { start = 1 + ri(5); step = pick([1, 2, 5, 10]) }
  else if (level <= 4) { start = 2 + ri(10); step = pick([2, 3, 4, 5]) }
  else if (level <= 6) { start = 30 + ri(40); step = pick([-3, -4, -5, 6, 7]) }
  else { start = 2 + ri(3); step = 'double' }
  if (step === 'double') {
    seq = [start]
    for (let i = 0; i < 3; i++) seq.push(seq[seq.length - 1] * 2)
  } else {
    seq = Array.from({ length: 4 }, (_, i) => start + step * i)
  }
  const answer = step === 'double' ? seq[seq.length - 1] * 2 : start + step * 4
  const wrongs = new Set()
  while (wrongs.size < 3) {
    const w = answer + pick([-4, -2, -1, 1, 2, 4, typeof step === 'number' ? step : 3])
    if (w !== answer) wrongs.add(w)
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
