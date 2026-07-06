import React, { useState } from 'react'
import { useStore } from './store.jsx'
import Welcome from './screens/Welcome.jsx'
import Home from './screens/Home.jsx'
import Session from './screens/Session.jsx'
import Progress from './screens/Progress.jsx'
import Badges from './screens/Badges.jsx'
import Profile from './screens/Profile.jsx'

const TABS = [
  { id: 'home', icon: '🏡', label: 'Home' },
  { id: 'progress', icon: '🌱', label: 'Growth' },
  { id: 'badges', icon: '🏅', label: 'Badges' },
  { id: 'profile', icon: '🌷', label: 'You' },
]

export default function App() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState('home')
  const [inSession, setInSession] = useState(false)

  if (!state.profile) {
    return <div className="app"><Welcome /></div>
  }

  function startSession(planId) {
    if (planId) dispatch({ type: 'START_SESSION', planId })
    setInSession(true)
  }

  if (inSession && state.session) {
    return (
      <div className="app">
        <Session goHome={() => setInSession(false)} />
      </div>
    )
  }

  return (
    <div className="app">
      {tab === 'home' && <Home startSession={startSession} />}
      {tab === 'progress' && <Progress />}
      {tab === 'badges' && <Badges />}
      {tab === 'profile' && <Profile />}

      <nav className="nav" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)} aria-current={tab === t.id}>
            <span className="icon" aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
