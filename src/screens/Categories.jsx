import { css } from '../lib/css'
import { CAT_DEFS } from '../lib/data'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

export default function Categories({ onGoAddCat }) {
  const rows = CAT_DEFS.map((c, i) => {
    const s = c.state
    const col =
      s === 'Visible' ? ['#E6F6DE', '#2E7A12'] : s === 'Hidden' ? ['#EEF0EC', '#7B857F'] : ['#FFF6E2', '#7A5205']
    return {
      ...c,
      order: i + 1,
      thumbStyle: 'width:46px;height:46px;border-radius:12px;flex:none;display:grid;place-items:center;background:repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);',
      stateStyle: `display:inline-flex;background:${col[0]};color:${col[1]};font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;`,
      rowStyle: `display:grid;grid-template-columns:56px 64px minmax(220px, 2fr) 120px 120px 150px 96px;gap:14px;align-items:center;padding:14px 20px;min-width:960px;border-top:1px solid #F2F4F0;${
        s === 'Needs fixing' ? 'background:#FFFBF2;box-shadow:inset 4px 0 0 #E39A0B;' : ''
      }`,
    }
  })

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; align-items: center; gap: 12px; flex-wrap: wrap;')}>
        <div style={css('position: relative; flex: 1; min-width: 260px;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input placeholder="Search categories" style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')} />
        </div>
        <button className="hv-dark" onClick={onGoAddCat} style={css('display: flex; align-items: center; gap: 9px; background: #0F1A12; color: #FFFFFF; border: none; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add category
        </button>
        <button className="hv-soft" style={css('display: flex; align-items: center; gap: 9px; background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          Fix Categories
          <span style={css('background: #FFF6E2; color: #7A5205; font-size: 12px; font-weight: 800; padding: 3px 8px; border-radius: 7px;')}>213</span>
        </button>
      </div>

      <div className="fc-alert" style={css('background: #FFF6E2; border: 1px solid #F2D18A; border-radius: 16px; padding: 15px 20px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;')}>
        <span style={css('font-size: 14.5px; font-weight: 800; color: #7A5205;')}>213 products are uncategorised</span>
        <span style={css('font-size: 13.5px; font-weight: 700; color: #96692A; flex: 1;')}>
          They still sell, but customers won't find them by browsing. Fix Categories suggests a group for each one.
        </span>
        <button style={css('background: #7A5205; color: #FFF6E2; border: none; border-radius: 11px; padding: 11px 18px; font-size: 13.5px; font-weight: 800; cursor: pointer;')}>Review suggestions</button>
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <div className="fc-thead" style={css('display: grid; grid-template-columns: 56px 64px minmax(220px, 2fr) 120px 120px 150px 96px; gap: 14px; padding: 13px 20px; min-width: 960px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
          <div>Order</div><div>Image</div><div>Name (EN / AR)</div><div>Products</div><div>Revenue</div><div>Status</div><div />
        </div>

        {rows.map((c) => (
          <div key={c.name} className="fc-row" style={css(c.rowStyle)}>
            <div className="fc-drag" style={css('display: flex; align-items: center; gap: 8px; color: #B7BFB8; cursor: grab;')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
              </svg>
              <span style={css('font-size: 13.5px; font-weight: 800; color: #7B857F;')}>{c.order}</span>
            </div>
            <div style={css(c.thumbStyle)}>
              <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 8.5px; color: #9AA39C;')}>image</span>
            </div>
            <div style={css('min-width: 0;')}>
              <div style={css('font-size: 15px; font-weight: 700;')}>{c.name}</div>
              <div dir="rtl" style={css('font-size: 13.5px; font-weight: 600; color: #7B857F; margin-top: 2px;')}>{c.nameAr}</div>
            </div>
            <div data-label="Products" style={css('font-size: 15px; font-weight: 800;')}>{c.items}</div>
            <div data-label="Revenue" style={css('font-size: 14.5px; font-weight: 700; color: #2E7A12;')}>{c.share}</div>
            <div data-label="Status"><span style={css(c.stateStyle)}>{c.state}</span></div>
            <div className="fc-act" style={css('display: flex; justify-content: flex-end;')}>
              <button className="hv-soft" style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #37413A; cursor: pointer;')}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      <div style={css('font-size: 13.5px; color: #7B857F; font-weight: 700; padding: 0 4px;')}>
        Drag to reorder — this is the order customers see on the app home screen.
      </div>
    </div>
  )
}
