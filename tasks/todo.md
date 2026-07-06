# Cofio Stones — Build Plan

## Goal
Free, offline-first web app (PWA) of gentle, adaptive cognitive exercises for adults 60+.
All data stays on the user's device; export/import file to carry progress across devices.

## Evidence base
- ACTIVE trial 20-year follow-up (2026): speed-of-processing training reduced dementia diagnoses; memory & reasoning were the other trained domains → games cover all three arms.
- FINGER / US POINTER: multidomain stimulation works better than single-domain → 6 games across number, verbal memory, language, spatial, speed, reasoning.
- Spatial navigation deficits are an early Alzheimer's marker → dedicated spatial memory game.

## Decisions
- Stack: React 18 + Vite, no other runtime deps. PWA (manifest + simple service worker). Wraps into Capacitor later.
- Persistence: localStorage behind a storage module (swap to IndexedDB later without touching callers).
- Adaptive engine: per-game level 1–8 (float). Gentle steps up on high accuracy, gentle steps down when struggling; 7-day vs 30-day comparison eases difficulty on decline. Never punitive.
- Sessions: 5/10/15 min = ordered game blocks. State saved after every round → pause/resume anytime same day; new day, new session.
- Tone: warm, nurturing, zero stress. No visible countdowns, no red X, wrong answers get "Good try" + the correct answer, and play continues.

## Checklist
- [x] Research pass (ACTIVE 2026, FINGER/POINTER)
- [x] Scaffold: package.json, vite config, index.html, manifest, SW, design tokens
- [x] Core: storage.js, adaptive.js, store (context+reducer), sessions.js, badges.js
- [x] Games: Math, Word Recall, Sentence Fill, Spatial Stones, Quick Match (speed), Pattern Puzzle (reasoning)
- [x] Screens: Welcome/Profile, Home, Session player (pause/resume), Progress, Badges, Settings (export/import)
- [x] Verify: npm install + vite build clean; smoke-test flows
- [x] Update README

## Review notes
- `vite build` compiles clean (46 modules, ~58 kB gzipped).
- Logic tests: all 6 generators validated at levels 1–8 (unique choices, valid
  answer index, word-recall answer never among shown words, math answers
  verified by evaluating the expression, spatial cells unique/in range).
- Adaptive engine: grows to max on sustained success, floors at 1 under
  struggle, trend guard eases level when a recent week dips vs baseline.
- SSR render test: Welcome, Home (greeting + session choices), Progress,
  Badges, Profile and all 6 round players render without errors.

## v0.2 additions (done)
- New stone-cairn logo (SVG + PNG icons, iOS install-ready)
- Levels expanded 1–8 → 1–100 with continuous scaling; old saves auto-migrate
- Fast-start: perfect early blocks jump levels quickly to find comfort zone
- Practice Corner: free play of any single game, feeds growth tracking
- Weekly recap card on Home (once per calendar week, on-device)
- GitHub Pages auto-deploy workflow
- Fixed: math wrong-answer generator could loop forever when answer was 0

## v0.3 additions (done)
- Two new games: True Colors (Stroop — inhibition/task-switching) and Arrow River
  (flanker — selective attention); 10-min session now 6 games, 15-min all 8
- Weekly recap redesigned: stat tiles (days/questions/accuracy) + top level gains;
  hidden for accounts younger than 4 days
- Session-end summary redesigned: per-game breakdown with bloom marks (🌸/🌿)
- Note: GitHub Pages requires the repo to be PUBLIC on a free account

## Next steps (v2 candidates)
- QR-code progress transfer between devices
- Audio cues + optional voice prompts (hearing/vision accessibility)
- Reminiscence-style photo memory game (needs user photos)
- More sentence/word banks, seasonal content rotation
- Capacitor wrap for App Store / Play Store
- IndexedDB storage backend (module is swap-ready)
