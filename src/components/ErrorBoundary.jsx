// Last line of defense: if anything throws during render, show a warm
// recovery screen instead of a blank white page. Progress is saved after
// every answer, so a reload loses nothing.
import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="app center" style={{ paddingTop: 60 }}>
        <div style={{ fontSize: '3em' }}>🪨</div>
        <h1>A little stumble</h1>
        <p className="soft" style={{ maxWidth: 420, margin: '12px auto' }}>
          Something went wrong on our side — not yours. Don’t worry:
          your progress is saved after every answer, so nothing is lost.
        </p>
        <button
          className="btn btn-primary"
          style={{ maxWidth: 340, margin: '24px auto' }}
          onClick={() => location.reload()}
        >
          Carry on where I left off
        </button>
      </div>
    )
  }
}
