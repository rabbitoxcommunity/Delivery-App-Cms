import { io } from 'socket.io-client'
import { API_BASE_URL } from './api'

// §14 of the design doc — one namespace per tenant, joined with the same
// JWT used for HTTP. storeAdmin sockets auto-join the 'queue' room
// server-side, so the client here only needs to listen.
const SOCKET_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

let socket = null

export function connectQueueSocket(tenantId, accessToken, handlers = {}) {
  disconnectQueueSocket()
  if (!tenantId || !accessToken) return null

  socket = io(`${SOCKET_ORIGIN}/t/${tenantId}`, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
  })

  for (const [event, handler] of Object.entries(handlers)) {
    socket.on(event, handler)
  }

  return socket
}

export function disconnectQueueSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
