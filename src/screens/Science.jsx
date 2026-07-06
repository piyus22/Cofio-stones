// "Why this works" — the honest version. What the research shows, how each
// game maps to it, and what no app can promise.
import React from 'react'
import { GAMES } from '../games/generators.js'

const MAPPING = [
  { id: 'speed', evidence: 'Modeled on the ACTIVE trial’s speed-of-processing arm: shapes flash briefly and must be identified from memory, with display time shrinking as you improve. This is the training with the strongest long-term result — a 2026 follow-up found reduced dementia diagnoses 20 years later.' },
  { id: 'words', evidence: 'Verbal episodic memory, the domain of ACTIVE’s memory arm. Like that trial, Cofio also teaches technique — the tips before each round (stories, imagery, grouping) are the same families of mnemonic strategy ACTIVE trained.' },
  { id: 'pattern', evidence: 'Inductive reasoning — spotting the rule in a sequence — mirrors ACTIVE’s reasoning arm, which showed durable gains in everyday problem-solving.' },
  { id: 'spatial', evidence: 'Spatial memory. Difficulties with spatial navigation are among the earliest measurable signs of Alzheimer’s, which makes this a valuable domain to exercise and to watch over time.' },
  { id: 'stroop', evidence: 'The classic Stroop task — naming ink colour while ignoring the word — is a standard laboratory measure of response inhibition, an executive function that ages noticeably.' },
  { id: 'flanker', evidence: 'The flanker task (find the middle arrow among distractors) is a standard measure of selective attention used across decades of cognitive research.' },
  { id: 'math', evidence: 'Mental arithmetic exercises working memory — holding and manipulating numbers — a core system behind everyday independence, from shopping to medication schedules.' },
  { id: 'sentence', evidence: 'Language and semantic memory. Word-retrieval practice supports verbal fluency, one of the abilities older adults most often notice changing.' },
]

export default function Science({ onBack }) {
  return (
    <div>
      <button className="btn-quiet" style={{ minHeight: 48, border: 'none', background: 'none', fontSize: '1em', padding: 0 }} onClick={onBack}>
        ◂ Back
      </button>
      <h1>Why this works 🔬</h1>

      <div className="card">
        <h3>The research behind Cofio Stones</h3>
        <p>
          The <strong>ACTIVE trial</strong> (2,802 older adults, started 1998) trained memory,
          reasoning, or processing speed. A 2026 twenty-year follow-up found the
          speed-training group had measurably fewer dementia diagnoses decades later.
        </p>
        <p>
          The <strong>FINGER</strong> and <strong>US POINTER</strong> trials showed that
          stimulating several domains together — alongside exercise, diet and social
          activity — protects thinking better than any single activity.
        </p>
        <p>
          Cofio Stones follows both findings: eight exercises across six cognitive
          domains, difficulty calibrated to you, plus taught strategies — because
          ACTIVE didn’t just quiz people, it coached them.
        </p>
      </div>

      <div className="card">
        <h3>What each exercise trains</h3>
        {MAPPING.map((m) => (
          <p key={m.id} style={{ margin: '10px 0' }}>
            {GAMES[m.id].icon} <strong>{GAMES[m.id].name}.</strong> {m.evidence}
          </p>
        ))}
      </div>

      <div className="card" style={{ borderColor: 'var(--terra)', borderWidth: 2 }}>
        <h3>What we can — and cannot — promise</h3>
        <p>
          Honestly: <strong>no app can promise to prevent dementia.</strong> The research
          shows cognitive training can help maintain trained abilities, and the ACTIVE
          follow-up is encouraging — but brain health rests on many pillars: physical
          exercise, sleep, blood pressure, hearing, social connection, and mood.
        </p>
        <p>
          Think of Cofio Stones as one healthy habit among several — a pleasant,
          evidence-informed way to stay mentally active. If you notice worrying changes
          in memory or thinking, please speak with your doctor; this app is not a
          medical device and does not diagnose anything.
        </p>
      </div>

      <div className="card">
        <h3>Sources</h3>
        <p className="small">
          Coe et al., “Impact of cognitive training on claims-based diagnosed dementia over
          20 years: evidence from the ACTIVE study.” <em>Alzheimer’s &amp; Dementia: TRCI</em>, 2026.
        </p>
        <p className="small">
          Ngandu et al., “A 2 year multidomain intervention…” (FINGER). <em>The Lancet</em>, 2015.
        </p>
        <p className="small">
          Baker et al., US POINTER trial results. <em>Alzheimer’s Association</em>, 2025.
        </p>
        <p className="small">
          Ball et al., “Effects of cognitive training interventions with older adults” (ACTIVE). <em>JAMA</em>, 2002.
        </p>
      </div>
    </div>
  )
}
