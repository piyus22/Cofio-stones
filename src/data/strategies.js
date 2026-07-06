// Strategy coaching, in the spirit of the ACTIVE trial's memory arm — which
// didn't just test people, it TAUGHT techniques (association, visualization,
// organization) and had participants practice applying them.
// One tip appears before each game block, rotating so they all get seen.
export const STRATEGIES = {
  math: [
    'Try rounding first: 38 + 27 is close to 40 + 25 — then adjust.',
    'Break it into steps: solve the tens first, then the ones.',
    'Say the numbers in your head — hearing them helps hold them.',
    'For × tables, anchor on ones you know: 7×8 is 7×7 plus 7.',
  ],
  words: [
    'Weave the words into a little story — the sillier, the stickier.',
    'Picture each word vividly: don’t think “bread”, see a warm crusty loaf.',
    'Group words that belong together — foods, places, things in a kitchen.',
    'Connect each word to your own life: whose garden? which chair?',
  ],
  sentence: [
    'Read the whole sentence first — the meaning points to the word.',
    'Try each choice in the blank and listen for what sounds natural.',
    'Rule out the ones that make no sense before choosing.',
  ],
  spatial: [
    'Trace a path between the stones with your eyes — make it a route.',
    'Give the places names: corner, middle, top-right.',
    'Picture the lit stones as a shape — a line, a triangle, an L.',
  ],
  speed: [
    'Soften your gaze at the centre — let the shape come to you.',
    'Don’t hunt for it; your first impression is usually right.',
    'Sit comfortably and blink before each round — fresh eyes see faster.',
  ],
  pattern: [
    'Ask: what changed between one number and the next?',
    'Check the gaps — are they the same? growing? doubling?',
    'If stuck, read the sequence aloud — rhythm often reveals the rule.',
  ],
  stroop: [
    'Name the ink colour in your head BEFORE you read the word.',
    'Slow is fine — the win is resisting the word’s pull.',
    'Read the question twice: ink and word are different challenges.',
  ],
  flanker: [
    'Look only at the centre — let the neighbours blur away.',
    'Count to the middle arrow if the row is long.',
    'A slow correct answer beats a fast guess every time.',
  ],
}

// First-time explanations, in plain language. Shown once per game, the very
// first time someone meets it — then available behind "How to play".
export const HOW_TO = {
  math: ['A sum appears on screen.', 'Take all the time you need, then tap the answer.', 'A wrong tap is fine — we show the right answer and simply carry on.'],
  words: ['Words appear one at a time — just watch them.', 'Then we ask: which word was NOT shown?', 'Tap your choice from the list.'],
  sentence: ['You’ll see a sentence with a missing word.', 'Tap the word that completes it best.'],
  spatial: ['Stones light up, one after another.', 'When they stop, tap the stones that lit up.', 'At higher levels, the order matters too.'],
  speed: ['A shape flashes briefly, then hides.', 'Tap the shape you just saw.', 'It gets quicker as you grow — that’s the training.'],
  pattern: ['A sequence follows a hidden rule.', 'Work out what comes next and tap it.'],
  stroop: ['A colour word appears, written in coloured ink.', 'Read the question carefully — sometimes we ask about the INK, sometimes the WORD.', 'It’s tricky on purpose — that’s the exercise!'],
  flanker: ['A row of arrows appears.', 'Only the MIDDLE one matters.', 'Tap the direction it points, and let the neighbours fool you not.'],
}

export function tipFor(gameId) {
  const tips = STRATEGIES[gameId] || []
  if (!tips.length) return null
  // rotate by day so tips vary but stay stable within a day
  const day = Math.floor(Date.now() / 86400000)
  return tips[day % tips.length]
}
