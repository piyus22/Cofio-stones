// First-run welcome: warm intro + name (optional) → creates the profile.
import React, { useState } from 'react'
import { useStore } from '../store.jsx'

export default function Welcome() {
  const { dispatch } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')

  if (step === 0) {
    return (
      <div className="celebrate" style={{ paddingTop: 60 }}>
        <img src="./icon.svg" alt="" width="132" height="132" style={{ borderRadius: 30, boxShadow: 'var(--shadow)' }} />
        <h1>Welcome to Cofio Stones</h1>
        <p className="soft" style={{ maxWidth: 440, margin: '12px auto' }}>
          Gentle daily exercises for your mind — numbers, words, memory and puzzles
          that grow with you, at your own pace.
        </p>
        <p className="soft small" style={{ maxWidth: 440, margin: '12px auto' }}>
          Free, private, and kind. Everything stays on your device.
        </p>
        <button className="btn btn-primary" style={{ maxWidth: 320, margin: '24px auto' }} onClick={() => setStep(1)}>
          Let’s begin
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 40, maxWidth: 440, margin: '0 auto' }}>
      <h1 className="center">What shall we call you?</h1>
      <p className="soft center">Just a first name is lovely. You can skip this if you prefer.</p>
      <input
        type="text"
        value={name}
        maxLength={30}
        placeholder="Your name"
        onChange={(e) => setName(e.target.value)}
        aria-label="Your name"
        style={{ margin: '16px 0' }}
      />
      <button
        className="btn btn-primary"
        onClick={() => dispatch({ type: 'CREATE_PROFILE', profile: { name: name.trim(), textSize: 'normal' } })}
      >
        {name.trim() ? `Nice to meet you, ${name.trim()}!` : 'Continue without a name'}
      </button>
    </div>
  )
}
