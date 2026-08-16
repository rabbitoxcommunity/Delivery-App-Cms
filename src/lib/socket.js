import { io } from 'socket.io-client'
import { API_BASE_URL, getAccessToken } from './api'

// §14 of the design doc — one namespace per tenant, joined with the same
// JWT used for HTTP. storeAdmin sockets auto-join the 'queue' room
// server-side, so the client here only needs to listen.
const SOCKET_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

let socket = null
let refCount = 0
/** Called after a dropped connection is re-established, so callers can re-fetch what they missed. */
const resyncers = new Set()

/**
 * One shared socket per admin session, reference-counted — Shell's Live
 * Orders subscription is always mounted, and other screens (Categories,
 * Products, Credit, ...) each add their own subscription on top. Without
 * ref-counting, the second caller's connect would tear down the first
 * caller's socket (and its listeners) since this used to hold a single
 * unconditional connection.
 */
export function connectQueueSocket(tenantId, accessToken, handlers = {}, onResync) {
  if (!tenantId || !accessToken) return null
  if (!socket) {
    socket = io(`${SOCKET_ORIGIN}/t/${tenantId}`, {
      // A FUNCTION, not a static `{ token }` object. Socket.io re-invokes this
      // for every (re)connection attempt, so a reconnect after the access token
      // rotated sends the CURRENT one. Passing the object captured at connect
      // time meant that any drop after the token's 60-minute TTL — a backend
      // restart, a wifi blip, the laptop waking — reconnected with an expired
      // token, was rejected with "Invalid token", and left the socket dead
      // until a full page reload. Live updates and the new-order chime just
      // stopped, with nothing on screen saying so.
      auth: (cb) => cb({ token: getAccessToken() }),
      transports: ['websocket', 'polling'],
    })

    // Events emitted while the socket was down are gone for good, so a
    // reconnect has to re-read state rather than assume it stayed in sync.
    socket.io.on('reconnect', () => {
      for (const fn of resyncers) fn()
    })
  }
  refCount += 1

  for (const [event, handler] of Object.entries(handlers)) {
    socket.on(event, handler)
  }
  if (onResync) resyncers.add(onResync)

  return socket
}

/** Pass the exact `handlers` object used to connect, so only this caller's listeners are removed. */
export function disconnectQueueSocket(handlers = {}, onResync) {
  if (!socket) return
  for (const [event, handler] of Object.entries(handlers)) {
    socket.off(event, handler)
  }
  if (onResync) resyncers.delete(onResync)
  refCount = Math.max(0, refCount - 1)
  if (refCount === 0) {
    socket.disconnect()
    socket = null
    resyncers.clear()
  }
}
