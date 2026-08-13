export const GREEN = '#47BB1C'
export const DARK = '#0F1A12'

export const VAN =
  'M2 7h11v9H2zM13 10h4l3 3v3h-7zM5.5 16a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M14.5 16a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0'
export const CAR =
  'M4 15l2-5h12l2 5v3H4zM6.5 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M14.5 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0'

export const FLOWS = {
  Delivery: ['Placed', 'Packed', 'Out for Delivery', 'Delivered'],
  Curbside: ['Placed', 'Packed', 'Ready for Pickup', 'Customer Arrived', 'Handed Over'],
}

export const CHIP = {
  Placed: ['#EEF0EC', '#4C5850'],
  Packed: ['#FFF6E2', '#7A5205'],
  'Out for Delivery': ['#E1F0F5', '#0B5E86'],
  'Ready for Pickup': ['#F1EAFB', '#5A31A8'],
  'Customer Arrived': ['#FFE8E5', '#B3261E'],
  Delivered: ['#E6F6DE', '#2E7A12'],
  'Handed Over': ['#E6F6DE', '#2E7A12'],
}

export const chip = (s, big) => {
  const c = CHIP[s] || CHIP.Placed
  return `display:inline-flex;align-items:center;background:${c[0]};color:${c[1]};font-size:${
    big ? 13.5 : 12.5
  }px;font-weight:800;padding:${big ? '7px 13px' : '6px 11px'};border-radius:9px;white-space:nowrap;`
}

export const typeChip = (t) => {
  const c = t === 'Delivery' ? ['#E1F0F5', '#0B5E86'] : ['#F1EAFB', '#5A31A8']
  return `display:inline-flex;align-items:center;gap:6px;background:${c[0]};color:${c[1]};font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;white-space:nowrap;`
}

export const stockPill = (s) => {
  const c =
    s === 'Available'
      ? ['#E6F6DE', '#2E7A12']
      : s === 'Low Stock'
        ? ['#FFF6E2', '#7A5205']
        : ['#FFE8E5', '#B3261E']
  return `display:inline-flex;background:${c[0]};color:${c[1]};font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;`
}

export const pillBtn = (on) =>
  `background:${on ? DARK : '#FFFFFF'};color:${on ? '#FFFFFF' : '#4C5850'};border:1px solid ${
    on ? DARK : '#E4EADF'
  };border-radius:10px;padding:9px 15px;font-size:13px;font-weight:800;cursor:pointer;`

export const money = (n) =>
  'AED ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const NAV = [
  ['live', 'Live Orders', 'M12 4a5 5 0 0 0-5 5v4l-2 3h14l-2-3V9a5 5 0 0 0-5-5ZM10 19a2 2 0 0 0 4 0', '12'],
  ['insights', 'Insights', 'M4 20V11M9.5 20V4M15 20v-6M20.5 20V8'],
  ['products', 'Products', 'M4 8l8-4 8 4v8l-8 4-8-4V8ZM4 8l8 4 8-4M12 12v8'],
  ['categories', 'Categories', 'M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v5H4zM13 14h7v5h-7z'],
  ['stock', 'Quick Stock', 'M4 5h16v14H4zM8 12l3 3 5-5', '7'],
  ['credit', 'Credit', 'M3 7h18v10H3zM15 12h3'],
  ['orders', 'Orders', 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01'],
  ['staff', 'Delivery Staff', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 3.6-6 8-6s8 2 8 6'],
  [
    'settings',
    'Settings',
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1',
  ],
]

export const TITLES = {
  live: ['Live Orders', 'Orders coming in right now — keep this screen open'],
  insights: ['Insights', 'How the shop is doing today and this month'],
  products: ['Products', '4,855 items · English and Arabic names'],
  stock: ['Quick Stock Update', 'Flip availability in seconds — customers see it instantly'],
  credit: ['Customer Credit', 'Outstanding balances and payments'],
  orders: ['Orders', 'Full order history'],
  staff: ['Delivery Staff', 'Availability and active deliveries'],
  settings: ['Settings', 'Shop, delivery, curbside, payments and language'],
  add: ['Add Product', 'Fill in the details — it appears in the customer app once published'],
  categories: ['Categories', 'How products are grouped in the customer app'],
  addcat: ['Add Category', 'Categories are the first thing customers see in the app'],
}

// Editor-facing props in the source component, fixed here as app defaults.
export const PROPS = {
  showArabicNames: true,
  showSeasonalAlert: true,
  soundAlerts: true,
}
