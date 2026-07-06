// Device-local persistence. Everything lives on the user's device — no servers.
// Backed by localStorage today; swap this module for IndexedDB later without
// touching any caller.

const KEY = 'cofio.v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — game continues in memory
  }
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
