// Profile & settings: name, text size, progress export/import, fresh start.
import React, { useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { exportState, parseImport } from '../storage.js'

export default function Profile() {
  const { state, dispatch } = useStore()
  const [name, setName] = useState(state.profile?.name || '')
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  function saveName() {
    dispatch({ type: 'UPDATE_PROFILE', profile: { name: name.trim() } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function onImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = parseImport(reader.result)
        if (confirm('Load this progress file? It will replace what is on this device.')) {
          dispatch({ type: 'IMPORT_STATE', data })
          alert('Welcome back! Your progress has been restored.')
        }
      } catch {
        alert('Sorry, that does not look like a Cofio Stones progress file.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <h1>You 🌷</h1>

      <div className="card">
        <h3>Your name</h3>
        <input type="text" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} aria-label="Your name" />
        <button className="btn btn-primary" onClick={saveName} disabled={!name.trim()}>
          {saved ? '✓ Saved' : 'Save name'}
        </button>
      </div>

      <div className="card">
        <h3>Text size</h3>
        <div className="choices">
          {[['normal', 'Normal'], ['larger', 'Larger']].map(([val, label]) => (
            <button
              key={val}
              className={'btn' + ((state.profile?.textSize || 'normal') === val ? ' btn-primary' : '')}
              style={{ margin: 0 }}
              onClick={() => dispatch({ type: 'UPDATE_PROFILE', profile: { textSize: val } })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Keep your progress safe</h3>
        <p className="soft small">
          Everything is stored only on this device — nothing is sent anywhere.
          Save a progress file to move to a new phone, tablet or computer, or as a backup.
        </p>
        <button className="btn" onClick={() => exportState(state)}>⬇ Save my progress file</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>⬆ Load a progress file</button>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={onImportFile} />
      </div>

      <div className="card">
        <h3>Fresh start</h3>
        <p className="soft small">This erases everything on this device. It cannot be undone.</p>
        <button
          className="btn"
          style={{ color: 'var(--terra)' }}
          onClick={() => {
            if (confirm('Erase all progress on this device?') && confirm('Are you quite sure? This cannot be undone.')) {
              dispatch({ type: 'RESET_ALL' })
            }
          }}
        >
          Erase everything
        </button>
      </div>

      <p className="soft small center">
        Cofio Stones is free, has no adverts, and never collects your data.
        <br />“Cofio” is Welsh for “to remember”.
      </p>
    </div>
  )
}
