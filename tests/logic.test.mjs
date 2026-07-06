// Cofio Stones logic tests — pure Node, no browser needed.  Run: npm test
import { GAMES, GAME_IDS } from '../src/games/generators.js'
import { updateAfterBlock, initGameStats, gameLevel, LEVEL_MAX } from '../src/adaptive.js'
import { SESSION_PLANS, newSession, sessionProgress, blocksForDate } from '../src/sessions.js'
import { checkBadges } from '../src/badges.js'
import { wellbeingStatus } from '../src/wellbeing.js'
import { WORD_TIERS } from '../src/data/words.js'
import { SENTENCE_TIERS, SENTENCE_TEMPLATES } from '../src/data/sentences.js'

let fails = 0
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg) } }
const block = (correct, ms = 3000, n = 5) => Array.from({ length: n }, () => ({ correct, ms }))

// ---- content banks ----
WORD_TIERS.forEach((tier, i) => {
  ok(tier.length >= 60, `word tier ${i} has ${tier.length} words (<60)`)
  ok(new Set(tier).size === tier.length, `word tier ${i} has duplicates`)
})
SENTENCE_TIERS.forEach((tier, i) => {
  ok(tier.length >= 35, `sentence tier ${i} has ${tier.length} items (<35)`)
  for (const s of tier) {
    ok(s.text.includes('___'), `sentence missing blank: ${s.text}`)
    ok(!s.wrong.includes(s.answer), `answer in wrongs: ${s.text}`)
    ok(s.wrong.length >= 3, `needs 3 wrongs: ${s.text}`)
  }
})
SENTENCE_TEMPLATES.forEach((tier, i) => {
  ok(tier.length >= 5, `template tier ${i} too small`)
  for (const s of tier) {
    ok(s.text.includes('___'), `template missing blank: ${s.text}`)
    ok(s.right.length >= 4, `template needs 4+ answers: ${s.text}`)
    ok(s.wrong.length >= 3, `template needs 3+ wrongs: ${s.text}`)
    ok(s.right.every((r) => !s.wrong.includes(r)), `template right/wrong overlap: ${s.text}`)
  }
})

// ---- every game, sampled levels, many rounds ----
for (const id of GAME_IDS) {
  for (const level of [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
    for (let i = 0; i < 40; i++) {
      const r = GAMES[id].makeRound(level)
      if (r.kind === 'mc') {
        ok(Array.isArray(r.choices) && r.choices.length >= 2, `${id} L${level} choices`)
        ok(r.answerIndex >= 0 && r.answerIndex < r.choices.length, `${id} L${level} answerIndex`)
        ok(new Set(r.choices.map(String)).size === r.choices.length, `${id} L${level} duplicate choices: ${r.choices}`)
        if (r.memorize) ok(!r.memorize.words.includes(r.choices[r.answerIndex]), `${id} L${level} answer word was shown`)
      } else if (r.kind === 'spatial') {
        ok(new Set(r.sequence).size === r.sequence.length, `spatial L${level} dup cells`)
        ok(r.sequence.every((c) => c >= 0 && c < r.grid * r.grid), `spatial L${level} cell range`)
      }
    }
  }
}

// math answers verified by evaluating the expression
for (const level of [1, 10, 30, 50, 70, 90, 100]) {
  for (let i = 0; i < 150; i++) {
    const r = GAMES.math.makeRound(level)
    const expr = r.stimulus.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
    const val = eval(expr)
    ok(val === r.choices[r.answerIndex], `math L${level}: ${r.stimulus} = ${val}, marked ${r.choices[r.answerIndex]}`)
    ok(Number.isInteger(val) && val >= 0, `math L${level} bad value: ${r.stimulus} = ${val}`)
  }
}

// ordered spatial appears at top levels only
ok(GAMES.spatial.makeRound(100).ordered === true, 'spatial L100 should be ordered')
ok(!GAMES.spatial.makeRound(10).ordered, 'spatial L10 should not be ordered')

// ---- variety: many distinct sentences across repeated draws ----
{
  const seen = new Set()
  for (let i = 0; i < 30; i++) seen.add(GAMES.sentence.makeRound(1).stimulus)
  ok(seen.size >= 15, `sentence variety too low: ${seen.size}/30 unique`)
}

// ---- speed training: calibrated flash times ----
{
  const slow = GAMES.speed.makeRound(1)
  const fast = GAMES.speed.makeRound(100)
  ok(slow.flash && slow.flash.ms >= 1100, `L1 flash should be ~1300ms, got ${slow.flash?.ms}`)
  ok(fast.flash && fast.flash.ms <= 250, `L100 flash should be ~180ms, got ${fast.flash?.ms}`)
  ok(!slow.stimulus, 'speed round must not show a persistent stimulus (flash-then-mask)')
}

// ---- daily session rotation ----
{
  const a = blocksForDate('s5', '2026-07-06')
  const b = blocksForDate('s5', '2026-07-06')
  ok(JSON.stringify(a) === JSON.stringify(b), 'same date must give same blocks')
  ok(a.length === 3, `s5 should have 3 blocks, got ${a.length}`)
  ok(blocksForDate('s10', '2026-07-06').length === 6, 's10 should have 6 blocks')
  ok(blocksForDate('s15', '2026-07-06').length === 8, 's15 should have 8 blocks')
  // different days should differ at least once across a week
  const firsts = new Set()
  for (let d = 1; d <= 7; d++) firsts.add(blocksForDate('s5', `2026-07-0${d}`)[0].game)
  ok(firsts.size >= 3, `weekly rotation too static: ${[...firsts]}`)
  const sess = newSession('s5')
  ok(Array.isArray(sess.blocks) && sess.totalRounds > 0, 'session stores its own blocks')
}

// ---- adaptive engine ----
let s = initGameStats()
for (let i = 0; i < 40; i++) s = updateAfterBlock(s, block(true))
ok(s.level === LEVEL_MAX, `sustained success should reach ${LEVEL_MAX}, got ${s.level}`)
for (let i = 0; i < 60; i++) s = updateAfterBlock(s, block(false, 9000))
ok(s.level === 1, `sustained struggle should floor at 1, got ${s.level}`)
ok(gameLevel(s) === 1, 'gameLevel int')

// fast start: 4 perfect settling blocks jump well past the crawl
let f = initGameStats()
for (let i = 0; i < 4; i++) f = updateAfterBlock(f, block(true))
ok(f.level >= 40, `fast start too slow: ${f.level}`)

// EMA smoothing: one slip after a long good run should NOT drop the level
let e = initGameStats()
for (let i = 0; i < 10; i++) e = updateAfterBlock(e, block(true))
const before = e.level
e = updateAfterBlock(e, [{ correct: true, ms: 3000 }, { correct: true, ms: 3000 }, { correct: true, ms: 3000 }, { correct: true, ms: 3000 }, { correct: false, ms: 3000 }])
ok(e.level >= before, `one slip dropped level ${before} → ${e.level}`)

// strain guard: accurate but much slower → level holds instead of climbing
let g = initGameStats()
for (let i = 0; i < 8; i++) g = updateAfterBlock(g, block(true, 3000))
const gBefore = g.level
g = updateAfterBlock(g, block(true, 6000))
ok(g.level <= gBefore + 1, `strain guard failed: ${gBefore} → ${g.level}`)

// ---- sessions & badges ----
for (const pid of Object.keys(SESSION_PLANS)) {
  const sess = newSession(pid)
  ok(sessionProgress(sess) === 0, `${pid} progress starts at 0`)
  ok(sess.blocks.every((b) => GAMES[b.game] && b.rounds > 0), `${pid} references valid games`)
}
{
  const state = { games: {}, sessionCounts: { s5: 1 }, streak: { best: 3 }, badges: [], flags: {} }
  for (const id of GAME_IDS) state.games[id] = { level: 1 }
  state.games.math = { level: 30 }
  const fresh = checkBadges(state)
  ok(fresh.includes('first-session'), 'first-session badge')
  ok(fresh.includes('streak-3'), 'streak-3 badge')
  ok(fresh.includes('grow-math'), 'grow-math badge (level 25+)')
  ok(!fresh.includes('master-math'), 'master-math not yet (needs 60)')
}

// ---- wellbeing monitor: silent on noise, speaks on sustained multi-domain change ----
{
  const now = Date.now()
  const entry = (daysAgo, level, accuracy, avgMs) => ({ t: new Date(now - daysAgo * 86400000).toISOString(), level, accuracy, avgMs, rounds: 5 })
  const flatHistory = () => [...Array(8)].map((_, i) => entry(80 - i * 8, 40, 0.85, 3000)).concat([...Array(6)].map((_, i) => entry(18 - i * 3, 40, 0.85, 3000)))
  const decliningHistory = () => [...Array(8)].map((_, i) => entry(80 - i * 8, 40, 0.9, 3000)).concat([...Array(6)].map((_, i) => entry(18 - i * 3, 28, 0.65, 4200)))

  const mkState = (decliningIds) => {
    const games = {}
    for (const id of GAME_IDS) games[id] = { level: 40, history: decliningIds.includes(id) ? decliningHistory() : flatHistory() }
    return { games }
  }

  ok(wellbeingStatus(mkState([])).status === 'steady', 'steady state should report steady')
  ok(wellbeingStatus(mkState(['math'])).status === 'watch', 'one declining domain → watch (not surfaced)')
  ok(wellbeingStatus(mkState(['math', 'words', 'spatial'])).status === 'checkup', 'three declining domains → checkup')
  const young = { games: { math: { level: 5, history: [entry(10, 5, 0.9, 3000)] } } }
  for (const id of GAME_IDS) young.games[id] = young.games[id] || { level: 1, history: [] }
  ok(wellbeingStatus(young).status === 'building', 'thin data → building, never alarms')
}

if (fails === 0) console.log('ALL LOGIC TESTS PASSED')
else { console.log(`${fails} FAILURES`); process.exit(1) }
