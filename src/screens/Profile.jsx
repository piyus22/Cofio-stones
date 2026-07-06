// Profile & settings: name, text size, progress export/import, fresh start.
import React, { useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { exportState, parseImport } from '../storage.js'
import Science from './Science.jsx'
import { ConfirmDialog, NoticeDialog } from '../components/Dialog.jsx'

export default function Profile() {
  const { state, dispatch } = useStore()
  const [name, setName] = useState(state.profile?.name || '')
  const [saved, setSaved] = useState(false)
  const [showScience, setShowScience] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const [notice, setNotice] = useState(null) // { title, body }
  const [confirmErase, setConfirmErase] = useState(false)
  const fileRef = useRef(null)

  if (showScience) return <Science onBack={() => setShowScience(false)} />

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
        setPendingImport(parseImport(reader.result))
      } catch {
        setNotice({ title: 'Hmm, that file didn’t work', body: 'That doesn’t look like a Cofio Stones progress file. Look for a file named like “cofio-stones-progress-….json”.' })
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
        <h3>The science 🔬</h3>
        <p className="soft small">What the research shows, how each exercise maps to it, and what no app can honestly promise.</p>
        <button className="btn" onClick={() => setShowScience(true)}>Why this works ▸</button>
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
        <button className="btn" style={{ color: 'var(--terra)' }} onClick={() => setConfirmErase(true)}>
          Erase everything
        </button>
      </div>

      <ConfirmDialog
        open={pendingImport !== null}
        title="Load this progress file?"
        body="It will replace the progress currently on this device."
        confirmLabel="Yes, load it"
        onConfirm={() => {
          dispatch({ type: 'IMPORT_STATE', data: pendingImport })
          setPendingImport(null)
          setNotice({ title: 'Welcome back! 🌿', body: 'Your progress has been restored on this device.' })
        }}
        onCancel={() => setPendingImport(null)}
      />
      <ConfirmDialog
        open={confirmErase}
        danger
        title="Erase all progress?"
        body="This removes everything on this device — profile, levels, badges and history. It cannot be undone. If in doubt, save a progress file first."
        confirmLabel="Erase everything"
        cancelLabel="Keep my progress"
        onConfirm={() => { setConfirmErase(false); dispatch({ type: 'RESET_ALL' }) }}
        onCancel={() => setConfirmErase(false)}
      />
      <NoticeDialog
        open={notice !== null}
        title={notice?.title}
        body={notice?.body}
        onClose={() => setNotice(null)}
      />

      <p className="soft small center">
        Cofio Stones is free, has no adverts, and never collects your data.
        <br />“Cofio” is Welsh for “to remember”.
      </p>
    </div>
  )
}
