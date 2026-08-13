import { useSyncExternalStore } from 'react'

/**
 * Sound alerts for the live queue.
 *
 * Two things shape this file:
 *
 *  - Browsers refuse to play audio until the page has seen a user gesture. The
 *    clips are therefore primed on the first interaction, and a refusal is
 *    surfaced as `blocked` rather than swallowed — an alert that silently never
 *    fires is worse than no alert at all, because staff stop watching the screen.
 *
 *  - The preference belongs to the device, not the account: whoever is standing
 *    at the counter decides whether the shop makes noise. Hence localStorage
 *    rather than the user record.
 */

const KEY = 'fc.soundAlerts'

const FILES = {
  order: 'sounds/order-sound.mp3',
  delivered: 'sounds/order-delivered.mp3',
}

const url = (file) => `${import.meta.env.BASE_URL}${file}`

function readPreference() {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true // Safari private mode throws on access — default to audible.
  }
}

function writePreference(on) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* preference simply won't survive a reload */
  }
}

let enabled = readPreference()
let blocked = false
let snapshot = { enabled, blocked }

const clips = {}
const listeners = new Set()

function emit() {
  // useSyncExternalStore compares by identity, so the snapshot object is
  // replaced only when something actually changed.
  snapshot = { enabled, blocked }
  for (const fn of listeners) fn()
}

function clip(kind) {
  if (!clips[kind]) {
    const el = new Audio(url(FILES[kind]))
    el.preload = 'auto'
    el.volume = 0.85
    clips[kind] = el
  }
  return clips[kind]
}

/**
 * Play each clip muted so the autoplay policy is satisfied by the gesture that
 * called this; later programmatic plays are then allowed. Must be invoked from
 * a real user interaction.
 */
export async function primeSounds() {
  const results = await Promise.all(
    Object.keys(FILES).map(async (kind) => {
      const el = clip(kind)
      el.muted = true
      try {
        await el.play()
        el.pause()
        el.currentTime = 0
        return true
      } catch {
        return false
      } finally {
        el.muted = false
      }
    }),
  )

  const refused = results.some((ok) => !ok)
  if (refused !== blocked) {
    blocked = refused
    emit()
  }
  return !refused
}

export function playAlert(kind) {
  if (!enabled || !FILES[kind]) return

  const el = clip(kind)
  el.currentTime = 0 // restart rather than stack, so a burst of orders stays one chime each
  const played = el.play()
  if (played) {
    played.catch(() => {
      if (!blocked) {
        blocked = true
        emit()
      }
    })
  }
}

export async function toggleSound() {
  if (enabled) {
    enabled = false
    blocked = false
    writePreference(false)
    emit()
    return
  }

  enabled = true
  writePreference(true)
  emit()

  // This runs inside the click handler, so it counts as the unlocking gesture.
  if (await primeSounds()) playAlert('order') // confirm audibly that it works
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

const getSnapshot = () => snapshot

export function useSoundAlerts() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { ...state, toggle: toggleSound }
}

// An operator who left alerts on last session shouldn't need to click the
// toggle again — prime on whatever they touch first instead.
if (typeof document !== 'undefined') {
  const onFirstGesture = () => {
    document.removeEventListener('pointerdown', onFirstGesture)
    document.removeEventListener('keydown', onFirstGesture)
    if (enabled) primeSounds()
  }
  document.addEventListener('pointerdown', onFirstGesture)
  document.addEventListener('keydown', onFirstGesture)
}
