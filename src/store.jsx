// Global state: React context + reducer, persisted to the device after every
// change. Nothing ever leaves the device.
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { loadState, saveState, todayKey } from './storage.js'
import { initGameStats, updateAfterBlock } from './adaptive.js'
import { GAME_IDS } from './games/generators.js'
import { SESSION_PLANS, newSession, isResumable } from './sessions.js'
import { checkBadges } from './badges.js'

function freshState() {
  const games = {}
  for (const id of GAME_IDS) games[id] = initGameStats()
  return {
    profile: null,
    games,
    session: null,
    sessionCounts: {},
    playDays: [],
    streak: { current: 0, best: 0, lastDay: null },
    badges: [],
    newBadges: [],
    flags: {},
  }
}

function migrate(saved) {
  // merge saved data over fresh defaults so old exports keep working
  const base = freshState()
  const s = { ...base, ...saved, newBadges: [] }
  for (const id of GAME_IDS) if (!s.games[id]) s.games[id] = initGameStats()
  // migrate old 1–8 level scale to 1–100 (v0.1 saves)
  for (const id of GAME_IDS) {
    const g = s.games[id]
    if (g.level <= 8 && !g.scale100) {
      s.games[id] = {
        ...g,
        scale100: true,
        level: Math.round(1 + ((g.level - 1) / 7) * 99),
        history: g.history.map((h) => ({ ...h, level: Math.round(1 + ((h.level - 1) / 7) * 99) })),
      }
    } else if (!g.scale100) {
      s.games[id] = { ...g, scale100: true }
    }
  }
  if (s.session && !isResumable(s.session)) s.session = null // new day, new game
  return s
}

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_PROFILE':
      return { ...state, profile: { ...action.profile, createdAt: new Date().toISOString() } }

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.profile } }

    case 'START_SESSION':
      return { ...state, session: newSession(action.planId) }

    case 'ABANDON_SESSION':
      return { ...state, session: null }

    case 'ROUND_DONE': {
      // action.result = { correct, ms }
      const session = state.session
      if (!session || session.finished) return state
      const block = session.blocks[session.blockIndex]
      const blockResults = [...(session.results[session.blockIndex] || []), action.result]
      let next = {
        ...session,
        results: { ...session.results, [session.blockIndex]: blockResults },
        roundIndex: session.roundIndex + 1,
      }
      let games = state.games

      if (next.roundIndex >= block.rounds) {
        // block finished → adaptive update for this game
        games = { ...games, [block.game]: updateAfterBlock(games[block.game], blockResults) }
        next = { ...next, blockIndex: next.blockIndex + 1, roundIndex: 0 }
        if (next.blockIndex >= session.blocks.length) next = { ...next, finished: true }
      }

      let newState = { ...state, session: next, games }
      if (next.finished) newState = onSessionFinished(newState)
      return newState
    }

    case 'PRACTICE_BLOCK_DONE': {
      // action.game, action.results — free play still feeds growth tracking
      if (!action.results?.length) return state
      return {
        ...state,
        games: { ...state.games, [action.game]: updateAfterBlock(state.games[action.game], action.results) },
      }
    }

    case 'CLEAR_FINISHED_SESSION':
      return state.session?.finished ? { ...state, session: null } : state

    case 'CLEAR_NEW_BADGES':
      return { ...state, newBadges: [] }

    case 'SET_FLAG':
      return { ...state, flags: { ...state.flags, [action.flag]: action.value } }

    case 'IMPORT_STATE':
      return migrate(action.data)

    case 'RESET_ALL':
      return freshState()

    default:
      return state
  }
}

function onSessionFinished(state) {
  const today = todayKey()
  const playDays = state.playDays.includes(today) ? state.playDays : [...state.playDays, today].slice(-800)

  // streak
  let { current, best, lastDay } = state.streak
  const flags = { ...state.flags }
  if (lastDay !== today) {
    const gapDays = lastDay ? Math.round((new Date(today) - new Date(lastDay)) / 86400000) : 0
    if (gapDays === 1) current += 1
    else {
      if (gapDays >= 4 && lastDay) flags.comeback = true
      current = 1
    }
    lastDay = today
    best = Math.max(best, current)
  }

  const sessionCounts = {
    ...state.sessionCounts,
    [state.session.planId]: (state.sessionCounts[state.session.planId] || 0) + 1,
  }

  let next = { ...state, playDays, streak: { current, best, lastDay }, sessionCounts, flags }
  const fresh = checkBadges(next)
  if (fresh.length) next = { ...next, badges: [...next.badges, ...fresh], newBadges: fresh }
  return next
}

const StoreContext = createContext(null)

export function StoreProvider({ children, initial }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = initial !== undefined ? initial : loadState()
    return saved ? migrate(saved) : freshState()
  })

  useEffect(() => { saveState(state) }, [state])

  useEffect(() => {
    document.documentElement.dataset.textsize = state.profile?.textSize || 'normal'
  }, [state.profile?.textSize])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}
