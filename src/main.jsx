import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import { initStorage } from './storage.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './styles.css'

// Boot: open durable storage first (and recover from IndexedDB if the browser
// evicted localStorage), then render with whatever we found.
initStorage().then((initial) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <StoreProvider initial={initial}>
          <App />
        </StoreProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
})

// Offline support (production only) — with a safe update flow:
//  - a freshly downloaded version activates at APP LAUNCH, never mid-session
//  - we nudge the browser to check for updates whenever the app regains focus
//  - worst case, a user is exactly one launch behind
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js')

      // A new version was already waiting when the app opened → adopt it now,
      // before the user starts anything.
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })

      // Updates found later (mid-session) simply wait for the next launch.
      // Check for them when the user returns to the app.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {})
      })
    } catch { /* SW unsupported — app still works, just not offline */ }
  })

  // When the new worker takes control at launch, reload once to run new code.
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return
    reloaded = true
    location.reload()
  })
}
