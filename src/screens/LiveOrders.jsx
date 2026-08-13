import { useMemo, useState } from 'react'
import { css } from '../lib/css'
import { money, pillBtn } from '../lib/design'
import { decorate } from '../lib/orders'
import { useSoundAlerts } from '../lib/sound'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import StateBlock from '../components/StateBlock'

function useTodayStats() {
  const { data } = useFetch(() => api.get('/admin/analytics/today'), [])
  const byStatus = data?.byStatus || {}
  return {
    waitingToPack: (byStatus.placed || 0) + (byStatus.packed || 0),
    customersAtBay: byStatus.customer_arrived || 0,
    outForDelivery: byStatus.out_for_delivery || 0,
    completedToday: (byStatus.delivered || 0) + (byStatus.handed_over || 0),
  }
}

function minutesAgo(iso) {
  if (!iso) return null
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
}

export default function LiveOrders({ orders, loading, error, onRetry, filter, onFilter, onOpenOrder, onAdvance }) {
  const [dismissed, setDismissed] = useState(new Set())
  const stats = useTodayStats()
  const { enabled: soundOn } = useSoundAlerts()

  const rows = orders.filter((o) => filter === 'All' || o.type === filter).map(decorate)

  const newestPlaced = useMemo(() => {
    const placed = orders
      .filter((o) => o.status === 'Placed' && !dismissed.has(o.id))
      .sort((a, b) => new Date(b.raw.placedAt) - new Date(a.raw.placedAt))
    return placed[0] || null
  }, [orders, dismissed])

  const arrived = useMemo(() => orders.filter((o) => o.status === 'Customer Arrived'), [orders])

  const waitingOldest = useMemo(() => {
    const waiting = orders.filter((o) => o.status === 'Placed' || o.status === 'Packed')
    if (waiting.length === 0) return null
    return Math.max(...waiting.map((o) => minutesAgo(o.raw.placedAt) ?? 0))
  }, [orders])

  const outForDeliveryDrivers = useMemo(() => {
    const set = new Set(
      orders.filter((o) => o.status === 'Out for Delivery' && o.raw.rider?.userId).map((o) => o.raw.rider.userId),
    )
    return set.size
  }, [orders])

  const LIVE_STATS = [
    {
      label: 'Waiting to pack',
      value: String(stats.waitingToPack),
      note: waitingOldest != null ? `oldest ${waitingOldest} min` : 'none waiting',
      valueStyle: 'font-size:42px;font-weight:800;letter-spacing:-1.6px;line-height:1.1;margin:4px 0 2px;',
    },
    {
      label: 'Customers at bay',
      value: String(stats.customersAtBay),
      note: stats.customersAtBay > 0 ? 'hand over now' : 'none waiting',
      valueStyle: 'font-size:42px;font-weight:800;letter-spacing:-1.6px;line-height:1.1;margin:4px 0 2px;color:#B3261E;',
    },
    {
      label: 'Out for delivery',
      value: String(stats.outForDelivery),
      note: outForDeliveryDrivers > 0 ? `${outForDeliveryDrivers} driver(s) on road` : 'none out',
      valueStyle: 'font-size:42px;font-weight:800;letter-spacing:-1.6px;line-height:1.1;margin:4px 0 2px;color:#0B5E86;',
    },
    {
      label: 'Completed today',
      value: String(stats.completedToday),
      note: 'so far today',
      valueStyle: 'font-size:42px;font-weight:800;letter-spacing:-1.6px;line-height:1.1;margin:4px 0 2px;color:#2E7A12;',
    },
  ]

  return (
    <div style={css('display: flex; flex-direction: column; gap: 18px;')}>
      {newestPlaced ? (
        <div className="fc-alert" style={css('background: #0F1A12; color: #FFFFFF; border-radius: 18px; padding: 18px 22px; display: flex; align-items: center; gap: 18px;')}>
          <div style={css('width: 46px; height: 46px; border-radius: 14px; background: #47BB1C; display: grid; place-items: center; animation: fcPulse 1.4s ease-in-out infinite;')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F1A12" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4a5 5 0 0 0-5 5v4l-2 3h14l-2-3V9a5 5 0 0 0-5-5ZM10 19a2 2 0 0 0 4 0" />
            </svg>
          </div>
          <div style={css('flex: 1;')}>
            <div style={css('font-size: 17px; font-weight: 800; letter-spacing: -.2px;')}>
              New Order! #{newestPlaced.id} · {newestPlaced.customer}
            </div>
            <div style={css('font-size: 13px; color: #A8B6AC; font-weight: 600; margin-top: 3px;')}>
              {newestPlaced.type === 'Curbside' ? 'Curbside pickup' : 'Home delivery'} · {newestPlaced.items} items ·{' '}
              {money(newestPlaced.total)} {soundOn ? '· chime played' : ''}
            </div>
          </div>
          <button
            className="hv-green-lt"
            onClick={() => onAdvance(newestPlaced.id)}
            style={css('background: #47BB1C; color: #0F1A12; border: none; border-radius: 12px; padding: 13px 22px; font-size: 14px; font-weight: 800; cursor: pointer;')}
          >
            Start packing
          </button>
          <button
            className="hv-white"
            onClick={() => setDismissed((prev) => new Set(prev).add(newestPlaced.id))}
            style={css('background: transparent; color: #A8B6AC; border: 1px solid #33422F; border-radius: 12px; padding: 13px 18px; font-size: 14px; font-weight: 700; cursor: pointer;')}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {arrived.length > 0 ? (
        <div className="fc-alert" style={css('background: #FFF1EF; border: 1.5px solid #F3B4AC; border-radius: 18px; padding: 18px 22px; display: flex; align-items: center; gap: 18px; animation: fcGlow 2s ease-in-out infinite;')}>
          <div style={css('width: 46px; height: 46px; border-radius: 14px; background: #B3261E; display: grid; place-items: center;')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15l2-5h12l2 5v3H4z" />
              <path d="M7.5 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M13.5 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0" />
            </svg>
          </div>
          <div style={css('flex: 1;')}>
            <div style={css('font-size: 17px; font-weight: 800; color: #8C1D18; letter-spacing: -.2px;')}>
              {arrived.length} customer{arrived.length > 1 ? 's have' : ' has'} arrived — take the orders out now
            </div>
            <div style={css('font-size: 13.5px; color: #A6423B; font-weight: 700; margin-top: 4px;')}>
              {arrived
                .slice(0, 3)
                .map((o) => `#${o.id} ${o.customer} · ${o.detail}`)
                .join('  ·  ')}
            </div>
          </div>
          <button
            className="hv-red"
            onClick={() => onOpenOrder(arrived[0].id)}
            style={css('background: #B3261E; color: #FFFFFF; border: none; border-radius: 12px; padding: 13px 22px; font-size: 14px; font-weight: 800; cursor: pointer;')}
          >
            Hand over
          </button>
        </div>
      ) : null}

      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px;')}>
        {LIVE_STATS.map((s) => (
          <div key={s.label} style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 16px; padding: 16px 18px;')}>
            <div style={css('font-size: 12.5px; font-weight: 700; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>{s.label}</div>
            <div className="fc-xl" style={css(s.valueStyle)}>{s.value}</div>
            <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600;')}>{s.note}</div>
          </div>
        ))}
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <div style={css('display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid #EFF1ED; min-width: 1080px;')} className="fc-tblfoot">
          <div style={css('font-size: 16px; font-weight: 800;')}>Active orders</div>
          <div style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>tap any order to update its status</div>
          <div style={css('margin-left: auto; display: flex; gap: 8px;')}>
            {['All', 'Delivery', 'Curbside'].map((f) => (
              <button key={f} onClick={() => onFilter(f)} style={css(pillBtn(filter === f))}>
                {f === 'All' ? 'All orders' : f}
              </button>
            ))}
          </div>
        </div>

        <StateBlock loading={loading} error={error} onRetry={onRetry} empty={!loading && !error && rows.length === 0} emptyText="No active orders right now.">
          <div className="fc-thead" style={css('display: grid; grid-template-columns: 118px minmax(200px, 1.5fr) 150px 80px 116px 1fr 132px; gap: 12px; padding: 12px 20px; min-width: 1080px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
            <div>Order</div><div>Customer</div><div>Fulfillment</div><div>Items</div><div>Total</div><div>Status</div><div>Next step</div>
          </div>

          {rows.map((o) => (
            <div key={o.id} className="fc-row hv-row" onClick={() => onOpenOrder(o.id)} style={css(o.rowStyle)}>
              <div>
                <div style={css('font-size: 14.5px; font-weight: 800;')}>#{o.id}</div>
                <div style={css('font-size: 12px; color: #7B857F; font-weight: 600;')}>{o.time}</div>
              </div>
              <div style={css('min-width: 0;')}>
                <div style={css('font-size: 14.5px; font-weight: 700;')}>{o.customer}</div>
                <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;')}>{o.detail}</div>
              </div>
              <div data-label="Fulfillment">
                <span style={css(o.typeStyle)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={o.typeIcon} />
                  </svg>
                  {o.type}
                </span>
              </div>
              <div data-label="Items" style={css('font-size: 14.5px; font-weight: 700; color: #37413A;')}>{o.items}</div>
              <div data-label="Total" style={css('font-size: 15px; font-weight: 800;')}>{o.total}</div>
              <div data-label="Status"><span style={css(o.statusStyle)}>{o.status}</span></div>
              <div className="fc-act" style={css('display: flex; justify-content: flex-end;')}>
                <button
                  onClick={(e) => { e.stopPropagation(); onAdvance(o.id) }}
                  style={css(o.nextStyle)}
                >
                  {o.next}
                </button>
              </div>
            </div>
          ))}
        </StateBlock>
      </div>
    </div>
  )
}
