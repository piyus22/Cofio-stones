// In-app dialogs: large text, big buttons, calm colors — replacing the
// browser's tiny native confirm()/alert() popups.
import React from 'react'

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(51, 49, 44, 0.45)',
  zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Yes', cancelLabel = 'Not now', onConfirm, onCancel, danger = false }) {
  if (!open) return null
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={title}>
      <div className="card" style={{ maxWidth: 440, width: '100%', margin: 0 }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p className="soft">{body}</p>
        <button
          className="btn btn-primary"
          style={danger ? { background: 'var(--terra)', borderColor: 'var(--terra)' } : undefined}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        <button className="btn" onClick={onCancel}>{cancelLabel}</button>
      </div>
    </div>
  )
}

export function NoticeDialog({ open, title, body, onClose, closeLabel = 'All right' }) {
  if (!open) return null
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={title}>
      <div className="card" style={{ maxWidth: 440, width: '100%', margin: 0 }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p className="soft">{body}</p>
        <button className="btn btn-primary" onClick={onClose}>{closeLabel}</button>
      </div>
    </div>
  )
}
