// Adapts backend API shapes (snake_case-ish enums, fils, ISO timestamps)
// into the exact shape the existing screens were built against
// (Title Case statuses, AED floats, formatted times). Keeping this as one
// translation layer means lib/design.js, lib/orders.js and every screen's
// render logic stay byte-for-byte what they were before the backend existed.

export const STATUS_TO_LABEL = {
  placed: 'Placed',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  ready_for_pickup: 'Ready for Pickup',
  customer_arrived: 'Customer Arrived',
  handed_over: 'Handed Over',
  cancelled: 'Cancelled',
}

export const LABEL_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_LABEL).map(([status, label]) => [label, status]),
)

export const FULFILLMENT_TO_TYPE = { delivery: 'Delivery', curbside: 'Curbside' }
export const TYPE_TO_FULFILLMENT = { Delivery: 'delivery', Curbside: 'curbside' }

export function fromFils(fils) {
  return (fils ?? 0) / 100
}

export function toFils(aed) {
  return Math.round(Number(aed) * 100)
}

export function localized(value, lang = 'en') {
  if (!value) return ''
  return value[lang] || value.en || value.ar || ''
}

export function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) +
    ', ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  )
}

function lineCount(order) {
  return (order.lines || []).reduce((sum, l) => sum + (l.fulfilledQty ?? l.quantity ?? 0), 0)
}

function orderDetail(order) {
  if (order.fulfillment === 'curbside') {
    const car = order.car
    const bay = order.bay != null ? `Bay ${order.bay} · ` : ''
    const colour = car ? localized(car.colour) : ''
    const plate = car?.plate ? ` ${car.plate}` : ''
    const arrival =
      order.arrival === 'near' ? 'near the shop' : order.arrival === 'on_way' ? 'on the way' : 'curbside pickup'
    return car ? `${bay}${colour}${plate}`.trim() || arrival : arrival
  }
  const addr = order.addressSnapshot
  const addrText = addr ? localized(addr.lines) : 'Delivery'
  const riderName = order.rider?.name ? localized(order.rider.name) : null
  return riderName ? `${addrText} · ${riderName} assigned` : addrText
}

/** Row shape expected by LiveOrders / OrderDrawer / lib/orders.js#decorate. */
export function mapOrderRow(order) {
  return {
    id: order.reference,
    _id: order.id,
    customer: order.customer?.name || 'Customer',
    customerPhone: order.customer?.phone || '',
    detail: orderDetail(order),
    type: FULFILLMENT_TO_TYPE[order.fulfillment] || 'Delivery',
    items: lineCount(order),
    total: fromFils(order.total),
    status: STATUS_TO_LABEL[order.status] || 'Placed',
    time: formatTime(order.placedAt),
    raw: order,
  }
}

/** Row shape expected by OrdersHistory (mirrors the old HISTORY_ROWS tuple, as an object). */
export function mapHistoryRow(order) {
  return {
    id: order.reference,
    _id: order.id,
    customer: order.customer?.name || 'Customer',
    type: FULFILLMENT_TO_TYPE[order.fulfillment] || 'Delivery',
    date: formatDateTime(order.placedAt),
    pay: order.paymentKind === 'credit' ? 'Credit' : order.paymentKind === 'cash' ? 'Cash' : 'Card',
    total: fromFils(order.total),
    status: STATUS_TO_LABEL[order.status] || 'Placed',
  }
}
