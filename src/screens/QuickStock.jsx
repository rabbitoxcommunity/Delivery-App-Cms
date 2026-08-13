import { useCallback, useState } from 'react'
import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { localized } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import StateBlock from '../components/StateBlock'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

const tri = (key, active) => {
  const map = {
    available: ['#E6F6DE', '#2E7A12', GREEN],
    low: ['#FFF6E2', '#7A5205', '#E39A0B'],
    out: ['#FFE8E5', '#B3261E', '#B3261E'],
  }[key]
  return active
    ? `background:${map[2]};color:#FFFFFF;border:2px solid ${map[2]};border-radius:12px;padding:14px 20px;font-size:15px;font-weight:800;cursor:pointer;min-width:132px;`
    : 'background:#FFFFFF;color:#7B857F;border:2px solid #EAEDE9;border-radius:12px;padding:14px 20px;font-size:15px;font-weight:700;cursor:pointer;min-width:132px;'
}

// Flattens products into one row per variant — stock lives on the variant,
// not the product, and most products have exactly one.
function flatten(products) {
  const rows = []
  for (const p of products) {
    for (const v of p.variants) {
      rows.push({
        key: v.id,
        productId: p.id,
        variantId: v.id,
        name: localized(p.name) + (p.variants.length > 1 ? ` · ${localized(v.label) || 'Variant'}` : ''),
        meta: `barcode ${v.barcode || '—'}`,
        stock: v.stock,
      })
    }
  }
  return rows
}

export default function QuickStock() {
  const [q, setQ] = useState('')
  const [pending, setPending] = useState({}) // variantId -> optimistic stock while saving

  const fetchDefault = useCallback(async () => {
    // No search yet — surface the items that most need attention first.
    const { items } = await api.get('/admin/products?limit=100')
    const rows = flatten(items).filter((r) => r.stock !== 'available')
    return rows.length > 0 ? rows : flatten(items).slice(0, 12)
  }, [])

  const fetchSearch = useCallback(async () => {
    const { items } = await api.get(`/admin/products?q=${encodeURIComponent(q.trim())}&limit=30`)
    return flatten(items)
  }, [q])

  const { data, loading, error, reload } = useFetch(q.trim() ? fetchSearch : fetchDefault, [q])

  const rows = data || []
  const outCount = rows.filter((r) => r.stock === 'out').length
  const lowCount = rows.filter((r) => r.stock === 'low').length

  const setStock = async (row, stock) => {
    setPending((p) => ({ ...p, [row.key]: stock }))
    try {
      await api.patch(`/admin/variants/${row.variantId}/stock`, { stock })
      reload()
    } finally {
      setPending((p) => {
        const { [row.key]: _, ...rest } = p
        return rest
      })
    }
  }

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; gap: 12px; flex-wrap: wrap;')}>
        <div style={css('position: relative; flex: 1; min-width: 300px;')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 18px; top: 19px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a product to update…"
            style={css('width: 100%; padding: 18px 18px 18px 48px; border: 1px solid #E4EADF; border-radius: 16px; background: #FFFFFF; font-size: 16px; font-weight: 600;')}
          />
        </div>
      </div>

      {!q.trim() && (outCount > 0 || lowCount > 0) ? (
        <div className="fc-alert" style={css('display: flex; align-items: center; gap: 12px; background: #FFF6E2; border: 1px solid #F2D18A; border-radius: 16px; padding: 14px 20px;')}>
          <span style={css('font-size: 14.5px; font-weight: 800; color: #7A5205;')}>Needs attention first</span>
          <span style={css('font-size: 13.5px; font-weight: 700; color: #96692A;')}>{outCount} out of stock · {lowCount} running low</span>
        </div>
      ) : null}

      <StateBlock loading={loading} error={error} onRetry={reload} empty={!loading && !error && rows.length === 0} emptyText={q.trim() ? 'No products match that search.' : 'Nothing needs attention right now.'}>
        <div style={css('display: flex; flex-direction: column; gap: 10px;')}>
          {rows.map((s) => {
            const current = pending[s.key] ?? s.stock
            const accent = current === 'out' ? '#B3261E' : current === 'low' ? '#E39A0B' : '#EAEDE9'
            return (
              <div
                key={s.key}
                className="fc-stockrow"
                style={css(`display:flex;flex-wrap:wrap;align-items:center;gap:14px 16px;background:#FFFFFF;border:1px solid #EAEDE9;border-radius:18px;padding:16px 20px;${current === 'available' ? '' : `box-shadow:inset 5px 0 0 ${accent};`}`)}
              >
                <div style={css('width: 54px; height: 54px; border-radius: 12px; flex: none; display: grid; place-items: center; background: repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);')}>
                  <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 8.5px; color: #9AA39C;')}>photo</span>
                </div>
                <div style={css('flex: 1 1 240px; min-width: 200px;')}>
                  <div style={css('font-size: 17px; font-weight: 800; letter-spacing: -.3px;')}>{s.name}</div>
                  <div style={css('font-size: 13.5px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>{s.meta}</div>
                </div>
                <div className="fc-stockacts" style={css('display: flex; gap: 8px; flex: 0 0 auto; margin-left: auto;')}>
                  <button onClick={() => setStock(s, 'available')} style={css(tri('available', current === 'available'))}>Available</button>
                  <button onClick={() => setStock(s, 'low')} style={css(tri('low', current === 'low'))}>Low Stock</button>
                  <button onClick={() => setStock(s, 'out')} style={css(tri('out', current === 'out'))}>Out of Stock</button>
                </div>
              </div>
            )
          })}
        </div>
      </StateBlock>

      <div style={css('display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #7B857F; font-weight: 700; padding: 4px 6px;')}>
        <span style={css('width: 8px; height: 8px; border-radius: 50%; background: #47BB1C;')} />
        Changes save immediately and are live in the customer app.
      </div>
    </div>
  )
}
