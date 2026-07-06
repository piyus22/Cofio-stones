import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import { initStorage } from './storage.js'
import './styles.css'

// Boot: open durable storage first (and recover from IndexedDB if the browser
// evicted localStorage), then render with whatever we found.
initStorage().then((initial) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <StoreProvider initial={initial}>
        <App />
      </StoreProvider>
    </React.StrictMode>
  )
})

// Offline support (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
