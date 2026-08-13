import { CAR, FLOWS, GREEN, VAN, chip, money, typeChip } from './design'

export function nextLabel(o) {
  const f = FLOWS[o.type]
  const i = f.indexOf(o.status)
  if (i >= f.length - 1) return null
  const n = f[i + 1]
  return (
    {
      Packed: 'Mark packed',
      'Out for Delivery': 'Send out',
      Delivered: 'Mark delivered',
      'Ready for Pickup': 'Mark ready',
      'Customer Arrived': 'Customer here',
      'Handed Over': 'Hand over',
    }[n] || n
  )
}

export function decorate(o) {
  const urgent = o.status === 'Customer Arrived'
  const next = nextLabel(o)
  return {
    ...o,
    total: money(o.total),
    typeStyle: typeChip(o.type),
    typeIcon: o.type === 'Delivery' ? VAN : CAR,
    statusStyle: chip(o.status),
    next: next || 'Complete',
    canAdvance: !!next,
    nextStyle: next
      ? `background:${urgent ? '#B3261E' : GREEN};color:#FFFFFF;border:none;border-radius:11px;padding:10px 15px;font-size:13.5px;font-weight:800;cursor:pointer;white-space:nowrap;`
      : 'background:#F3F6F1;color:#7B857F;border:none;border-radius:11px;padding:10px 15px;font-size:13.5px;font-weight:800;',
    rowStyle: `display:grid;grid-template-columns:118px minmax(200px, 1.5fr) 150px 80px 116px 1fr 132px;gap:12px;align-items:center;padding:15px 20px;min-width:1080px;border-top:1px solid #F2F4F0;cursor:pointer;${
      urgent ? 'background:#FFF6F4;box-shadow:inset 4px 0 0 #B3261E;' : ''
    }`,
  }
}

export function advanceStatus(orders, id) {
  return orders.map((o) => {
    if (o.id !== id) return o
    const f = FLOWS[o.type]
    const i = f.indexOf(o.status)
    return i < f.length - 1 ? { ...o, status: f[i + 1] } : o
  })
}
