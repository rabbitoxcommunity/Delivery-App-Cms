import { useCallback, useState } from 'react'
import { css } from '../lib/css'
import { CAR, VAN, chip, money, typeChip } from '../lib/design'
import { mapHistoryRow } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useLiveReload } from '../lib/useLiveReload'
import Select from '../components/Select'
import StateBlock from '../components/StateBlock'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'
const GRID = 'display:grid;grid-template-columns:110px minmax(180px, 1.6fr) 150px 160px 140px 120px 110px;gap:12px;align-items:center;padding:15px 22px;min-width:1060px;border-top:1px solid #F2F4F0;'

const STATUS_FILTERS = [
  { label: 'Any status', value: '' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Handed over', value: 'handed_over' },
  { label: 'Cancelled', value: 'cancelled' },
]
const FULFILLMENT_FILTERS = [
  { label: 'All fulfillment', value: '' },
  { label: 'Delivery', value: 'delivery' },
  { label: 'Curbside', value: 'curbside' },
]

export default function OrdersHistory() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [fulfillment, setFulfillment] = useState('')
  const [cursor, setCursor] = useState(null)
  const [cursorStack, setCursorStack] = useState([])

  const fetchPage = useCallback(async () => {
    const params = new URLSearchParams({ limit: '20' })
    if (cursor) params.set('cursor', cursor)
    if (status) params.set('status', status)
    if (fulfillment) params.set('fulfillment', fulfillment)
    if (q.trim()) params.set('q', q.trim())
    return api.get(`/admin/orders?${params.toString()}`)
  }, [cursor, status, fulfillment, q])

  const { data, loading, error, reload } = useFetch(fetchPage, [fetchPage])
  useLiveReload(
    ['order.created', 'order.status', 'order.assigned', 'order.lines', 'order.arrived'],
    reload,
  )

  const rows = (data?.items || []).map(mapHistoryRow)

  const applyFilter = (setter) => (value) => {
    setter(value)
    setCursor(null)
    setCursorStack([])
  }

  const nextPage = () => {
    if (!data?.nextCursor) return
    setCursorStack((s) => [...s, cursor])
    setCursor(data.nextCursor)
  }
  const prevPage = () => {
    setCursorStack((s) => {
      const copy = [...s]
      const prev = copy.pop() ?? null
      setCursor(prev)
      return copy
    })
  }

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; gap: 12px; flex-wrap: wrap; align-items: center;')}>
        <div style={css('position: relative; flex: 1; min-width: 260px;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input
            placeholder="Search order reference"
            value={q}
            onChange={(e) => applyFilter(setQ)(e.target.value)}
            style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')}
          />
        </div>
        <div style={css('min-width: 176px;')}>
          <Select
            variant="pill"
            ariaLabel="Filter by fulfillment"
            value={fulfillment}
            onChange={applyFilter(setFulfillment)}
            placeholder="All fulfillment"
            options={FULFILLMENT_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
          />
        </div>
        <div style={css('min-width: 168px;')}>
          <Select
            variant="pill"
            ariaLabel="Filter by status"
            value={status}
            onChange={applyFilter(setStatus)}
            placeholder="Any status"
            options={STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
          />
        </div>
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <StateBlock loading={loading} error={error} onRetry={reload} empty={!loading && !error && rows.length === 0} emptyText="No orders match these filters.">
          <div className="fc-thead" style={css('display: grid; grid-template-columns: 110px minmax(180px, 1.6fr) 150px 160px 140px 120px 110px; gap: 12px; padding: 13px 22px; min-width: 1060px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
            <div>Order</div><div>Customer</div><div>Fulfillment</div><div>Date</div><div>Payment</div><div>Total</div><div>Status</div>
          </div>

          {rows.map((o) => {
            const typeStyle = typeChip(o.type)
            const typeIcon = o.type === 'Delivery' ? VAN : CAR
            const statusStyle = chip(o.status)
            const payStyle =
              o.pay === 'Credit'
                ? 'display:inline-flex;background:#FFF6E2;color:#7A5205;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;'
                : 'display:inline-flex;background:#F0F2EE;color:#4C5850;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;'
            return (
              <div key={o._id} className="fc-row" style={css(GRID)}>
                <div style={css('font-size: 14.5px; font-weight: 800;')}>#{o.id}</div>
                <div style={css('font-size: 14.5px; font-weight: 700;')}>{o.customer}</div>
                <div data-label="Fulfillment">
                  <span style={css(typeStyle)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={typeIcon} />
                    </svg>
                    {o.type}
                  </span>
                </div>
                <div data-label="Date" style={css('font-size: 13.5px; font-weight: 600; color: #4C5850;')}>{o.date}</div>
                <div data-label="Payment"><span style={css(payStyle)}>{o.pay}</span></div>
                <div data-label="Total" style={css('font-size: 15px; font-weight: 800;')}>{money(o.total)}</div>
                <div data-label="Status"><span style={css(statusStyle)}>{o.status}</span></div>
              </div>
            )
          })}

          <div className="fc-tblfoot" style={css('display: flex; align-items: center; gap: 14px; padding: 15px 20px; min-width: 1060px; border-top: 1px solid #EFF1ED; font-size: 13.5px; color: #7B857F; font-weight: 700;')}>
            Showing {rows.length} order{rows.length === 1 ? '' : 's'}
            <div style={css('margin-left: auto; display: flex; gap: 8px;')}>
              <button
                onClick={prevPage}
                disabled={cursorStack.length === 0}
                style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 9px 14px; font-weight: 800; color: #37413A; cursor: ${cursorStack.length === 0 ? 'default' : 'pointer'}; opacity: ${cursorStack.length === 0 ? 0.5 : 1};`)}
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={!data?.nextCursor}
                style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 9px 14px; font-weight: 800; color: #37413A; cursor: ${!data?.nextCursor ? 'default' : 'pointer'}; opacity: ${!data?.nextCursor ? 0.5 : 1};`)}
              >
                Next
              </button>
            </div>
          </div>
        </StateBlock>
      </div>
    </div>
  )
}
