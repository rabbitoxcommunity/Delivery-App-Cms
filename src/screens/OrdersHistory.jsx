import { css } from '../lib/css'
import { CAR, VAN, chip, money, pillBtn, typeChip } from '../lib/design'
import { HISTORY_ROWS } from '../lib/data'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'
const GRID = 'display:grid;grid-template-columns:110px minmax(180px, 1.6fr) 150px 160px 140px 120px 110px;gap:12px;align-items:center;padding:15px 22px;min-width:1060px;border-top:1px solid #F2F4F0;'

export default function OrdersHistory() {
  const rows = HISTORY_ROWS.map((h) => ({
    id: h[0],
    customer: h[1],
    type: h[2],
    date: h[3],
    pay: h[4],
    total: money(h[5]),
    status: h[6],
    typeStyle: typeChip(h[2]),
    typeIcon: h[2] === 'Delivery' ? VAN : CAR,
    statusStyle: chip(h[6]),
    payStyle:
      h[4] === 'Credit'
        ? 'display:inline-flex;background:#FFF6E2;color:#7A5205;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;'
        : 'display:inline-flex;background:#F0F2EE;color:#4C5850;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;',
  }))

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; gap: 12px; flex-wrap: wrap; align-items: center;')}>
        <div style={css('position: relative; flex: 1; min-width: 260px;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input placeholder="Search order number, customer or phone" style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')} />
        </div>
        {['All fulfillment', 'Last 30 days', 'Any payment', 'Any status'].map((f) => (
          <button key={f} style={css(pillBtn(false))}>{f} ▾</button>
        ))}
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <div className="fc-thead" style={css('display: grid; grid-template-columns: 110px minmax(180px, 1.6fr) 150px 160px 140px 120px 110px; gap: 12px; padding: 13px 22px; min-width: 1060px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
          <div>Order</div><div>Customer</div><div>Fulfillment</div><div>Date</div><div>Payment</div><div>Total</div><div>Status</div>
        </div>

        {rows.map((o) => (
          <div key={o.id} className="fc-row" style={css(GRID)}>
            <div style={css('font-size: 14.5px; font-weight: 800;')}>#{o.id}</div>
            <div style={css('font-size: 14.5px; font-weight: 700;')}>{o.customer}</div>
            <div data-label="Fulfillment">
              <span style={css(o.typeStyle)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={o.typeIcon} />
                </svg>
                {o.type}
              </span>
            </div>
            <div data-label="Date" style={css('font-size: 13.5px; font-weight: 600; color: #4C5850;')}>{o.date}</div>
            <div data-label="Payment"><span style={css(o.payStyle)}>{o.pay}</span></div>
            <div data-label="Total" style={css('font-size: 15px; font-weight: 800;')}>{o.total}</div>
            <div data-label="Status"><span style={css(o.statusStyle)}>{o.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
