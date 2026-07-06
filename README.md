# Cofio Stones 🪨

Gentle, adaptive brain exercises for adults 60+. Free, private, and kind —
everything stays on the user's device.

*"Cofio" is Welsh for "to remember".*

## What it is

A web app (installable PWA) of short daily sessions — 5, 10 or 15 minutes —
built from six exercises that together stimulate the whole brain, not one part:

| Game | Cognitive domain | Evidence anchor |
|---|---|---|
| 🧮 Number Stones | Arithmetic & working memory | Working-memory training literature |
| 📖 Word Stones | Verbal episodic memory | ACTIVE trial — memory arm |
| 🌿 Sentence Garden | Language & semantic memory | Language/semantic stimulation |
| 🪨 Stone Path | Visuospatial memory | Spatial deficits are an early Alzheimer's marker |
| ⚡ Quick Match | Processing speed | ACTIVE trial — speed arm (20-yr dementia-risk reduction, 2026 follow-up) |
| 🔮 Pattern Pebbles | Reasoning & puzzles | ACTIVE trial — reasoning arm |

Multidomain design follows FINGER / US POINTER findings.

## Principles

- **Grows with the user.** Each game has its own level (1–100) with continuous
  difficulty scaling — larger numbers, more words, faster displays, bigger
  grids, trickier patterns — enough headroom for years of play. A fast-start
  phase finds a new player's comfort zone quickly; after that, levels rise
  slowly with sustained success and ease down quickly and quietly when someone
  struggles, including a 7-day vs 30-day trend guard so a difficult week makes
  the game *more comfortable*, never discouraging.
- **Weekly recap.** Once a week, a warm on-device summary: days played,
  questions answered, which games grew.
- **Zero stress.** No countdowns, no red X, no failure states. Wrong answers
  get "Good try" and the correct answer, and play simply continues. Timing is
  measured silently for progress tracking only.
- **Pause anywhere.** State is saved after every round; sessions resume
  exactly where they stopped, any time the same day. Each new day starts fresh.
- **Private by design.** No accounts, no servers, no analytics. Progress can
  be saved to a file and loaded on a new device.
- **Designed for 60+.** Large type (20px+ base, adjustable), 64px+ tap
  targets, AA+ contrast, one task per screen, warm nurturing language.

## Run it

```bash
npm install
npm run dev      # local development
npm run build    # production build → dist/ (deploy anywhere static & free:
                 # GitHub Pages, Netlify, Cloudflare Pages)
```

## Tech

React 18 + Vite, zero other runtime dependencies. localStorage behind a
swap-ready storage module. PWA manifest + service worker for offline use.
The same codebase can be wrapped with Capacitor later for app stores.
