import { useCallback, useEffect, useState } from 'react'
import { api, idempotencyKey } from './api'
import { LABEL_TO_STATUS, mapOrderRow } from './adapt'
import { FLOWS } from './design'
import { connectQueueSocket, disconnectQueueSocket } from './socket'
import { playAlert } from './sound'

const TERMINAL = new Set(['delivered', 'handed_over', 'cancelled'])
const COMPLETED = new Set(['delivered', 'handed_over'])

// The event payload shape isn't pinned down server-side yet, so read the status
// from the shapes it plausibly arrives in and stay silent if it's none of them.
function statusOf(payload) {
  return payload?.status ?? payload?.order?.status ?? payload?.data?.status ?? null
}

/**
 * Live queue: orders that still need action. Backed by GET /admin/orders
 * with no status filter (the "active" concept doesn't exist server-side as
 * a single query, so this fetches recent orders and filters client-side —
 * fine at the volume one shop's live queue actually holds) plus a Socket.io
 * subscription (§14) that invalidates on any order event, so the screen
 * updates the moment the backend commits a change rather than only on the
 * operator's next click.
 */
export function useLiveOrders({ tenantId, accessToken }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { items } = await api.get('/admin/orders?limit=100')
      const active = items.filter((o) => !TERMINAL.has(o.status))
      setRows(active.map(mapOrderRow))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!tenantId || !accessToken) return undefined
    const onEvent = () => load()

    // Alerts hang off the socket rather than off `rows`, for two reasons: a
    // completed order leaves the active queue entirely (see TERMINAL above), so
    // there is no state change left to diff against; and the initial fetch then
    // can't chime for orders that were already sitting there when the screen
    // opened — only genuinely new events make a sound.
    connectQueueSocket(tenantId, accessToken, {
      'order.created': () => {
        playAlert('order')
        load()
      },
      'order.status': (payload) => {
        if (COMPLETED.has(statusOf(payload))) playAlert('delivered')
        load()
      },
      'order.assigned': onEvent,
      'order.lines': onEvent,
      'order.arrived': onEvent,
    })
    return () => disconnectQueueSocket()
  }, [tenantId, accessToken, load])

  const advance = useCallback(
    async (reference) => {
      const row = rows.find((r) => r.id === reference)
      if (!row) return
      const flow = FLOWS[row.type]
      const at = flow.indexOf(row.status)
      const nextLabel = flow[at + 1]
      if (!nextLabel) return
      const nextStatus = LABEL_TO_STATUS[nextLabel]
      await api.patch(`/admin/orders/${row._id}/status`, { status: nextStatus })
      await load()
    },
    [rows, load],
  )

  const cancel = useCallback(
    async (reference, reason) => {
      const row = rows.find((r) => r.id === reference)
      if (!row) return
      await api.post(`/admin/orders/${row._id}/cancel`, { reason: reason || 'Cancelled from the back office' })
      await load()
    },
    [rows, load],
  )

  return { rows, loading, error, reload: load, advance, cancel }
}

export async function recordCreditPayment(customerId, amountFils) {
  return api.post(
    `/admin/credit/${customerId}/payment`,
    { amount: amountFils },
    { headers: { 'Idempotency-Key': idempotencyKey() } },
  )
}
