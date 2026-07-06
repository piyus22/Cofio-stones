// Device-local persistence. Everything lives on the user's device — no servers.
//
// Durability strategy (important on iOS): localStorage is fast but evictable
// (Safari can purge it after ~7 days of not visiting). So we write-through to
// IndexedDB as well, request persistent storage from the browser, and if
// localStorage ever comes back empty we silently restore from IndexedDB.

const KEY = 'cofio.v1'
const DB_NAME = 'cofio'
const STORE = 'kv'

let db = null

function openDb() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    try {
      const rq = indexedDB.open(DB_NAME, 1)
      rq.onupgradeneeded = () => rq.result.createObjectStore(STORE)
      rq.onsuccess = () => resolve(rq.result)
      rq.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

function idbGet() {
  return new Promise((resolve) => {
    if (!db) return resolve(null)
    try {
      const rq = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY)
      rq.onsuccess = () => resolve(rq.result || null)
      rq.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

function idbSet(value) {
  if (!db) return
  try {
    db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, KEY)
  } catch {
    // best effort — localStorage still has it
  }
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Async boot: ask the browser to protect our storage, open IndexedDB, and
// recover from IndexedDB if localStorage was evicted.
export async function initStorage() {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      navigator.storage.persist() // fire and forget; user gesture not required
    }
  } catch { /* not supported — fine */ }
  db = await openDb()
  const local = loadLocal()
  if (local) return local
  const recovered = await idbGet()
  if (recovered) {
    try { localStorage.setItem(KEY, JSON.stringify(recovered)) } catch { /* ok */ }
    return recovered
  }
  return null
}

// Kept for synchronous contexts (tests, SSR).
export function loadState() {
  return loadLocal()
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch { /* storage full — IndexedDB below still gets it */ }
  idbSet(state)
}

export function exportState(state) {
  const blob = new Blob([JSON.stringify({ app: 'cofio-stones', version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cofio-stones-progress-${todayKey()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseImport(text) {
  const parsed = JSON.parse(text)
  if (parsed && parsed.app === 'cofio-stones' && parsed.data) return parsed.data
  throw new Error('Not a Cofio Stones progress file')
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
