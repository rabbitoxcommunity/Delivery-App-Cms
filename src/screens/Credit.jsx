import { css } from '../lib/css'
import { GREEN, money } from '../lib/design'
import { CREDIT_ROWS } from '../lib/data'

const GRID = 'display:grid;grid-template-columns:minmax(240px, 2fr) 170px 150px 140px 120px;gap:14px;align-items:center;padding:16px 22px;min-width:940px;border-top:1px solid #F2F4F0;'

export default function Credit() {
  const rows = CREDIT_ROWS.map((c) => ({
    ...c,
    amountText: money(c.amount),
    amountStyle: `font-size:19px;font-weight:800;color:${c.overdue ? '#B3261E' : '#14181A'};`,
    status: c.overdue ? 'Overdue 34 days' : 'Within terms',
    statusStyle: c.overdue
      ? 'display:inline-flex;background:#FFE8E5;color:#B3261E;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;'
      : 'display:inline-flex;background:#EEF0EC;color:#4C5850;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;',
    settleStyle: `background:${c.overdue ? '#B3261E' : GREEN};color:#FFFFFF;border:none;border-radius:11px;padding:11px 20px;font-size:14px;font-weight:800;cursor:pointer;`,
  }))

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;')}>
        <div style={css('background: #0F1A12; color: #FFFFFF; border-radius: 20px; padding: 22px 26px;')}>
          <div style={css('font-size: 13px; font-weight: 800; color: #8FA894; text-transform: uppercase; letter-spacing: .6px;')}>Total outstanding credit</div>
          <div className="fc-xl" style={css('font-size: 52px; font-weight: 800; letter-spacing: -2px; line-height: 1.05; margin-top: 8px;')}>AED 24,860</div>
          <div style={css('font-size: 13.5px; color: #8FA894; font-weight: 600;')}>across 38 customers · same figures customers see in the app</div>
        </div>
        <div style={css('background: #FFF1EF; border: 1px solid #F3B4AC; border-radius: 20px; padding: 22px 26px;')}>
          <div style={css('font-size: 13px; font-weight: 800; color: #A6423B; text-transform: uppercase; letter-spacing: .6px;')}>Overdue (30+ days)</div>
          <div className="fc-xl" style={css('font-size: 44px; font-weight: 800; color: #B3261E; letter-spacing: -1.6px; line-height: 1.1; margin-top: 8px;')}>AED 9,215</div>
          <div style={css('font-size: 13.5px; color: #A6423B; font-weight: 700;')}>6 customers</div>
        </div>
        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 26px;')}>
          <div style={css('font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;')}>Settled this month</div>
          <div className="fc-xl" style={css('font-size: 44px; font-weight: 800; color: #2E7A12; letter-spacing: -1.6px; line-height: 1.1; margin-top: 8px;')}>AED 12,480</div>
          <div style={css('font-size: 13.5px; color: #7B857F; font-weight: 700;')}>21 payments recorded</div>
        </div>
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <div className="fc-thead" style={css('display: grid; grid-template-columns: minmax(240px, 2fr) 170px 150px 140px 120px; gap: 14px; padding: 13px 22px; min-width: 940px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
          <div>Customer</div><div>Outstanding</div><div>Last order</div><div>Status</div><div />
        </div>

        {rows.map((c) => (
          <div key={c.phone} className="fc-row" style={css(GRID)}>
            <div style={css('display: flex; align-items: center; gap: 12px;')}>
              <div style={css('width: 38px; height: 38px; border-radius: 50%; background: #F0F2EE; color: #4C5850; display: grid; place-items: center; font-size: 13px; font-weight: 800;')}>{c.initials}</div>
              <div>
                <div style={css('font-size: 15px; font-weight: 700;')}>{c.name}</div>
                <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600;')}>{c.phone}</div>
              </div>
            </div>
            <div data-label="Outstanding" style={css(c.amountStyle)}>{c.amountText}</div>
            <div data-label="Last order" style={css('font-size: 14px; font-weight: 700; color: #37413A;')}>{c.last}</div>
            <div data-label="Status"><span style={css(c.statusStyle)}>{c.status}</span></div>
            <div className="fc-act" style={css('display: flex; justify-content: flex-end;')}>
              <button style={css(c.settleStyle)}>Settle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
