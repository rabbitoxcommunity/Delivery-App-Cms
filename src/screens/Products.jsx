import { css } from '../lib/css'
import { PROPS, stockPill } from '../lib/design'
import { PROD_DEFS } from '../lib/data'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

const THUMB = 'width:46px;height:46px;border-radius:10px;display:grid;place-items:center;background:repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);'
const VAR_THUMB = 'width:38px;height:38px;border-radius:9px;margin-left:16px;display:grid;place-items:center;background:repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);'
const ROW = 'display:grid;grid-template-columns:64px minmax(240px, 2.1fr) 1fr 130px 150px 96px;gap:14px;align-items:center;padding:13px 20px;min-width:1000px;border-top:1px solid #F2F4F0;'
const VAR_ROW = 'display:grid;grid-template-columns:64px minmax(240px, 2.1fr) 1fr 130px 150px 96px;gap:14px;align-items:center;padding:11px 20px 11px 32px;min-width:1000px;border-top:1px solid #F6F8F4;background:#FCFDFB;'

export default function Products({ open, onToggle, onGoAdd }) {
  const rows = []
  PROD_DEFS.forEach((pd) => {
    const isOpen = !!open[pd.id]
    rows.push({
      key: pd.id,
      name: pd.name,
      nameAr: pd.nameAr,
      category: pd.category,
      price: pd.price,
      stock: pd.stock,
      thumbLabel: 'photo',
      thumbStyle: THUMB,
      nameInputStyle: 'flex:1;min-width:0;border:1px solid transparent;background:transparent;border-radius:8px;padding:5px 8px;font-size:15px;font-weight:700;color:#14181A;',
      variantCount: pd.variants ? pd.variants.length : false,
      variantLabel: (isOpen ? '▾ ' : '▸ ') + (pd.variants ? pd.variants.length : 0) + ' variants',
      toggle: () => onToggle(pd.id),
      catStyle: `display:inline-flex;background:${pd.category === 'Uncategorised' ? '#FFF6E2' : '#F0F2EE'};color:${
        pd.category === 'Uncategorised' ? '#7A5205' : '#4C5850'
      };font-size:12.5px;font-weight:700;padding:6px 11px;border-radius:9px;`,
      stockStyle: stockPill(pd.stock),
      rowStyle: ROW,
    })

    if (isOpen && pd.variants) {
      pd.variants.forEach((v) => {
        rows.push({
          key: pd.id + v.name,
          name: v.name,
          nameAr: v.nameAr,
          category: 'variant of ' + pd.name,
          price: v.price,
          stock: v.stock,
          thumbLabel: 'var',
          thumbStyle: VAR_THUMB,
          nameInputStyle: 'flex:1;min-width:0;border:1px solid transparent;background:transparent;border-radius:8px;padding:5px 8px;font-size:14px;font-weight:600;color:#37413A;',
          variantCount: false,
          variantLabel: '',
          toggle: null,
          catStyle: 'display:inline-flex;color:#9AA39C;font-size:12px;font-weight:700;padding:6px 0;',
          stockStyle: stockPill(v.stock),
          rowStyle: VAR_ROW,
        })
      })
    }
  })

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; align-items: center; gap: 12px; flex-wrap: wrap;')}>
        <div style={css('position: relative; flex: 1; min-width: 280px;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input
            placeholder="Search 4,855 products by name, barcode or Arabic name"
            style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')}
          />
        </div>
        <button className="hv-dark" onClick={onGoAdd} style={css('display: flex; align-items: center; gap: 9px; background: #0F1A12; color: #FFFFFF; border: none; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add product manually
        </button>
        <button className="hv-green" style={css('display: flex; align-items: center; gap: 9px; background: #47BB1C; color: #FFFFFF; border: none; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 16V4M8 8l4-4 4 4M4 20h16" /></svg>
          Import from Excel
        </button>
        <button className="hv-soft" style={css('display: flex; align-items: center; gap: 9px; background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          Fix Categories
          <span style={css('background: #FFF6E2; color: #7A5205; font-size: 12px; font-weight: 800; padding: 3px 8px; border-radius: 7px;')}>213</span>
        </button>
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <div className="fc-thead" style={css('display: grid; grid-template-columns: 64px minmax(240px, 2.1fr) 1fr 130px 150px 96px; gap: 14px; padding: 13px 20px; min-width: 1000px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
          <div>Photo</div><div>Name (EN / AR)</div><div>Category</div><div>Price</div><div>Stock</div><div />
        </div>

        {rows.map((p) => (
          <div key={p.key} className="fc-row" style={css(p.rowStyle)}>
            <div style={css(p.thumbStyle)}>
              <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 8.5px; color: #9AA39C;')}>{p.thumbLabel}</span>
            </div>
            <div style={css('min-width: 0;')}>
              <div style={css('display: flex; align-items: center; gap: 8px;')}>
                <input defaultValue={p.name} style={css(p.nameInputStyle)} />
                {p.variantCount ? (
                  <button onClick={p.toggle} style={css('background: #F1EAFB; color: #5A31A8; border: none; border-radius: 8px; padding: 4px 9px; font-size: 11.5px; font-weight: 800; cursor: pointer; white-space: nowrap;')}>
                    {p.variantLabel}
                  </button>
                ) : null}
              </div>
              {PROPS.showArabicNames ? (
                <input
                  className="hv-input"
                  defaultValue={p.nameAr}
                  dir="rtl"
                  style={css('width: 100%; border: 1px solid transparent; background: transparent; border-radius: 8px; padding: 4px 8px; font-size: 13.5px; font-weight: 600; color: #7B857F; margin-top: 2px;')}
                />
              ) : null}
            </div>
            <div data-label="Category"><span style={css(p.catStyle)}>{p.category}</span></div>
            <div data-label="Price" style={css('display: flex; align-items: center; gap: 6px;')}>
              <span style={css('font-size: 12.5px; color: #7B857F; font-weight: 700;')}>AED</span>
              <input defaultValue={p.price} style={css('width: 74px; border: 1px solid #E4EADF; background: #FFFFFF; border-radius: 9px; padding: 8px 10px; font-size: 14.5px; font-weight: 800;')} />
            </div>
            <div data-label="Stock"><span style={css(p.stockStyle)}>{p.stock}</span></div>
            <div className="fc-act" style={css('display: flex; justify-content: flex-end;')}>
              <button className="hv-soft" style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #37413A; cursor: pointer;')}>Edit</button>
            </div>
          </div>
        ))}

        <div className="fc-tblfoot" style={css('display: flex; align-items: center; gap: 14px; padding: 15px 20px; min-width: 1000px; border-top: 1px solid #EFF1ED; font-size: 13.5px; color: #7B857F; font-weight: 700;')}>
          Showing 7 of 4,855 products
          <div style={css('margin-left: auto; display: flex; gap: 8px;')}>
            <button style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 9px 14px; font-weight: 800; color: #37413A; cursor: pointer;')}>Previous</button>
            <button style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 9px 14px; font-weight: 800; color: #37413A; cursor: pointer;')}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
