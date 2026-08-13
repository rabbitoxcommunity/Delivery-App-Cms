import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { STOCK_DEFS } from '../lib/data'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

const tri = (key, active) => {
  const map = {
    avail: ['#E6F6DE', '#2E7A12', GREEN],
    low: ['#FFF6E2', '#7A5205', '#E39A0B'],
    out: ['#FFE8E5', '#B3261E', '#B3261E'],
  }[key]
  return active
    ? `background:${map[2]};color:#FFFFFF;border:2px solid ${map[2]};border-radius:12px;padding:14px 20px;font-size:15px;font-weight:800;cursor:pointer;min-width:132px;`
    : 'background:#FFFFFF;color:#7B857F;border:2px solid #EAEDE9;border-radius:12px;padding:14px 20px;font-size:15px;font-weight:700;cursor:pointer;min-width:132px;'
}

export default function QuickStock({ stock, onSetStock }) {
  const items = STOCK_DEFS.map((s) => {
    const v = stock[s.id]
    const accent = v === 'out' ? '#B3261E' : v === 'low' ? '#E39A0B' : '#EAEDE9'
    return {
      ...s,
      rowStyle: `display:flex;flex-wrap:wrap;align-items:center;gap:14px 16px;background:#FFFFFF;border:1px solid #EAEDE9;border-radius:18px;padding:16px 20px;${
        v === 'avail' ? '' : `box-shadow:inset 5px 0 0 ${accent};`
      }`,
      thumbStyle: 'width:54px;height:54px;border-radius:12px;flex:none;display:grid;place-items:center;background:repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);',
      availStyle: tri('avail', v === 'avail'),
      lowStyle: tri('low', v === 'low'),
      outStyle: tri('out', v === 'out'),
    }
  })

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; gap: 12px; flex-wrap: wrap;')}>
        <div style={css('position: relative; flex: 1; min-width: 300px;')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 18px; top: 19px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input placeholder="Search a product to update…" style={css('width: 100%; padding: 18px 18px 18px 48px; border: 1px solid #E4EADF; border-radius: 16px; background: #FFFFFF; font-size: 16px; font-weight: 600;')} />
        </div>
        <button className="hv-dark" style={css('display: flex; align-items: center; gap: 10px; background: #0F1A12; color: #FFFFFF; border: none; border-radius: 16px; padding: 18px 24px; font-size: 16px; font-weight: 800; cursor: pointer;')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6v12M8 6v12M12 6v12M16 6v12M20 6v12" /></svg>
          Scan barcode
        </button>
        <button className="hv-soft" style={css('display: flex; align-items: center; gap: 10px; background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 16px; padding: 18px 22px; font-size: 15px; font-weight: 800; cursor: pointer;')}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 16V4M8 8l4-4 4 4M4 20h16" /></svg>
          Import stock report from Excel
        </button>
      </div>

      <div className="fc-alert" style={css('display: flex; align-items: center; gap: 12px; background: #FFF6E2; border: 1px solid #F2D18A; border-radius: 16px; padding: 14px 20px;')}>
        <span style={css('font-size: 14.5px; font-weight: 800; color: #7A5205;')}>Needs attention first</span>
        <span style={css('font-size: 13.5px; font-weight: 700; color: #96692A;')}>3 out of stock · 4 running low — these are hidden or flagged in the customer app right now.</span>
      </div>

      <div style={css('display: flex; flex-direction: column; gap: 10px;')}>
        {items.map((s) => (
          <div key={s.id} className="fc-stockrow" style={css(s.rowStyle)}>
            <div style={css(s.thumbStyle)}>
              <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 8.5px; color: #9AA39C;')}>photo</span>
            </div>
            <div style={css('flex: 1 1 240px; min-width: 200px;')}>
              <div style={css('font-size: 17px; font-weight: 800; letter-spacing: -.3px;')}>{s.name}</div>
              <div style={css('font-size: 13.5px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>{s.meta}</div>
            </div>
            <div className="fc-stockacts" style={css('display: flex; gap: 8px; flex: 0 0 auto; margin-left: auto;')}>
              <button onClick={() => onSetStock(s.id, 'avail')} style={css(s.availStyle)}>Available</button>
              <button onClick={() => onSetStock(s.id, 'low')} style={css(s.lowStyle)}>Low Stock</button>
              <button onClick={() => onSetStock(s.id, 'out')} style={css(s.outStyle)}>Out of Stock</button>
            </div>
          </div>
        ))}
      </div>

      <div style={css('display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #7B857F; font-weight: 700; padding: 4px 6px;')}>
        <span style={css('width: 8px; height: 8px; border-radius: 50%; background: #47BB1C;')} />
        All changes saved and live in the customer app · last update just now
      </div>
    </div>
  )
}
