import { useEffect } from 'react'
import { getAccessToken, decodeTenantId } from './api'
import { connectQueueSocket, disconnectQueueSocket } from './socket'

/**
 * Subscribes this screen to the tenant socket for the given event names and
 * calls `reload` whenever one fires, so an edit made from another tab/device
 * (or another admin screen) shows up here without a manual refresh.
 */
export function useLiveReload(events, reload) {
  const key = events.join(',')

  useEffect(() => {
    const accessToken = getAccessToken()
    const tenantId = accessToken ? decodeTenantId(accessToken) : null
    if (!tenantId || !accessToken) return undefined

    const handler = () => reload()
    const handlers = Object.fromEntries(key.split(',').map((event) => [event, handler]))
    // Also re-read on reconnect — changes made while the socket was down
    // emitted events nobody was listening for.
    connectQueueSocket(tenantId, accessToken, handlers, handler)
    return () => disconnectQueueSocket(handlers, handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reload])
}
