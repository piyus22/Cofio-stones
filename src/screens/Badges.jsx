import React from 'react'
import { useStore } from '../store.jsx'
import { BADGES } from '../badges.js'

export default function Badges() {
  const { state } = useStore()
  const earned = new Set(state.badges)
  const have = BADGES.filter((b) => earned.has(b.id))
  const locked = BADGES.filter((b) => !earned.has(b.id))

  return (
    <div>
      <h1>Your badges 🏅</h1>
      <p className="soft">
        {have.length === 0
          ? 'Badges celebrate showing up for yourself. Your first one is waiting after your first session.'
          : `You’ve earned ${have.length} of ${BADGES.length}. Each one marks care for your mind.`}
      </p>
      {have.length > 0 && (
        <div className="card">
          {have.map((b) => (
            <div key={b.id} className="badge-row">
              <div className="badge-medal">{b.icon}</div>
              <div>
                <strong>{b.name}</strong>
                <div className="soft small">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <h3 className="soft">Still to discover</h3>
      <div className="card">
        {locked.map((b) => (
          <div key={b.id} className="badge-row">
            <div className="badge-medal locked">{b.icon}</div>
            <div>
              <strong className="soft">{b.name}</strong>
              <div className="soft small">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
