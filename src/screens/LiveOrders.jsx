import { css } from '../lib/css'
import { PROPS, money, pillBtn } from '../lib/design'
import { decorate } from '../lib/orders'

const LIVE_STATS = [
  { label: 'Waiting to pack', value: '5', note: 'oldest 12 min', valueStyle: 'font-size:42px;font-weight:800;letter-spacing:-1.6px;line-height:1.1;margin:4px 0 2px;' },
  { label: 'Customers at bay', value: '2', note: 'hand over now', valueStyle: 'font-size:42px;font-weight:800;letter-spacing:-1.6px;line-height:1.1;margin:4px 0 2px;color:#B3261E;' },
  { label: 'Out for delivery', value: '3', note: '2 drivers on road', valueStyle: 'font-size:42px;font-weight:800;letter-spacing:-1.6px;line-height:1.1;margin:4px 0 2px;color:#0B5E86;' },
  { label: 'Completed today', value: '138', note: 'avg 21 min to hand off', valueStyle: 'font-size:42px;font-weight:800;letter-spacing:-1.6px;line-height:1.1;margin:4px 0 2px;color:#2E7A12;' },
]

export default function LiveOrders({ orders, filter, onFilter, onOpenOrder, onAdvance }) {
  const rows = orders.filter((o) => filter === 'All' || o.type === filter).map(decorate)

  return (
    <div style={css('display: flex; flex-direction: column; gap: 18px;')}>
      <div className="fc-alert" style={css('background: #0F1A12; color: #FFFFFF; border-radius: 18px; padding: 18px 22px; display: flex; align-items: center; gap: 18px;')}>
        <div style={css('width: 46px; height: 46px; border-radius: 14px; background: #47BB1C; display: grid; place-items: center; animation: fcPulse 1.4s ease-in-out infinite;')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F1A12" strokeWidth="2" strokeLinecap="round">
            <path d="M12 4a5 5 0 0 0-5 5v4l-2 3h14l-2-3V9a5 5 0 0 0-5-5ZM10 19a2 2 0 0 0 4 0" />
          </svg>
        </div>
        <div style={css('flex: 1;')}>
          <div style={css('font-size: 17px; font-weight: 800; letter-spacing: -.2px;')}>New Order! #10486 · Layla Mansour</div>
          <div style={css('font-size: 13px; color: #A8B6AC; font-weight: 600; margin-top: 3px;')}>
            Curbside pickup · 14 items · {money(186.5)} · received 12 seconds ago {PROPS.soundAlerts ? '· chime played' : ''}
          </div>
        </div>
        <button className="hv-green-lt" style={css('background: #47BB1C; color: #0F1A12; border: none; border-radius: 12px; padding: 13px 22px; font-size: 14px; font-weight: 800; cursor: pointer;')}>
          Start packing
        </button>
        <button className="hv-white" style={css('background: transparent; color: #A8B6AC; border: 1px solid #33422F; border-radius: 12px; padding: 13px 18px; font-size: 14px; font-weight: 700; cursor: pointer;')}>
          Dismiss
        </button>
      </div>

      <div className="fc-alert" style={css('background: #FFF1EF; border: 1.5px solid #F3B4AC; border-radius: 18px; padding: 18px 22px; display: flex; align-items: center; gap: 18px; animation: fcGlow 2s ease-in-out infinite;')}>
        <div style={css('width: 46px; height: 46px; border-radius: 14px; background: #B3261E; display: grid; place-items: center;')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15l2-5h12l2 5v3H4z" />
            <path d="M7.5 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M13.5 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0" />
          </svg>
        </div>
        <div style={css('flex: 1;')}>
          <div style={css('font-size: 17px; font-weight: 800; color: #8C1D18; letter-spacing: -.2px;')}>
            2 customers have arrived — take the orders out now
          </div>
          <div style={css('font-size: 13.5px; color: #A6423B; font-weight: 700; margin-top: 4px;')}>
            #10481 Hessa Al Nuaimi · Bay 3 · white Land Cruiser · waiting 4 min &nbsp;·&nbsp; #10478 Omar Farouk · Bay 1 · grey Camry · waiting 1 min
          </div>
        </div>
        <button
          className="hv-red"
          onClick={() => onOpenOrder('10481')}
          style={css('background: #B3261E; color: #FFFFFF; border: none; border-radius: 12px; padding: 13px 22px; font-size: 14px; font-weight: 800; cursor: pointer;')}
        >
          Hand over
        </button>
      </div>

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
      </div>
    </div>
  )
}
