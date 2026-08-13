import { css } from '../lib/css'
import { ADD_CATS, NEW_VARIANTS } from '../lib/data'

const ACCENTS = ['#47BB1C', '#E39A0B', '#B3261E']

export default function AddProduct({ newState, onNewState, onBack }) {
  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px; max-width: 1240px;')}>
      <button className="hv-link" onClick={onBack} style={css('display: flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; border: none; padding: 0; font-size: 14px; font-weight: 800; color: #7B857F; cursor: pointer;')}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        Back to products
      </button>

      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; align-items: start;')}>
        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Product details</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Both names are shown to customers — Arabic is required.</div>
            <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 18px;')}>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Product name (English)</div>
                <input placeholder="e.g. Almarai Fresh Milk 2L" style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 16px; font-weight: 700;')} />
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>اسم المنتج (Arabic)</div>
                <input placeholder="مثال: ألمراي حليب طازج ٢ لتر" dir="rtl" style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 16px; font-weight: 700;')} />
              </div>
              <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px;')}>
                <div>
                  <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Category</div>
                  <select style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700; background: #FFFFFF; color: #14181A;')}>
                    {ADD_CATS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Sold by</div>
                  <select style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700; background: #FFFFFF; color: #14181A;')}>
                    <option>Each</option>
                    <option>Kilogram</option>
                    <option>Pack</option>
                  </select>
                </div>
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Barcode</div>
                <div style={css('display: flex; gap: 10px;')}>
                  <input placeholder="Type or scan the barcode" style={css('flex: 1 1 200px; min-width: 0; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700; font-family: ui-monospace, Menlo, monospace;')} />
                  <button className="hv-dark" style={css('display: flex; align-items: center; gap: 9px; background: #0F1A12; color: #FFFFFF; border: none; border-radius: 12px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer; flex: 0 0 auto;')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6v12M8 6v12M12 6v12M16 6v12M20 6v12" /></svg>
                    Scan
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Price</div>
            <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 18px;')}>
              {['Selling price', 'Was price (optional)'].map((label) => (
                <div key={label}>
                  <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>{label}</div>
                  <div style={css('display: flex; align-items: center; gap: 8px; border: 1px solid #E4EADF; border-radius: 12px; padding: 0 14px; background: #FFFFFF;')}>
                    <span style={css('font-size: 13.5px; font-weight: 800; color: #7B857F;')}>AED</span>
                    <input placeholder="0.00" style={css('flex: 1; min-width: 0; border: none; padding: 15px 0; font-size: 20px; font-weight: 800; background: transparent;')} />
                  </div>
                </div>
              ))}
            </div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 10px;')}>Adding a "was" price shows a green offer tag in the customer app.</div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('display: flex; align-items: center; gap: 10px;')}>
              <div>
                <div style={css('font-size: 17px; font-weight: 800;')}>Variants</div>
                <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Flavours or sizes of the same product — customers pick one.</div>
              </div>
              <button className="hv-violet" style={css('margin-left: auto; background: #F1EAFB; color: #5A31A8; border: none; border-radius: 11px; padding: 11px 16px; font-size: 13.5px; font-weight: 800; cursor: pointer;')}>+ Add variant</button>
            </div>
            <div style={css('display: flex; flex-direction: column; gap: 10px; margin-top: 16px;')}>
              {NEW_VARIANTS.map((v) => (
                <div key={v.name} style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 10px; background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 14px; padding: 12px 14px;')}>
                  <input defaultValue={v.name} style={css('flex: 1 1 180px; min-width: 0; border: 1px solid #E4EADF; background: #FFFFFF; border-radius: 10px; padding: 11px 12px; font-size: 14.5px; font-weight: 700;')} />
                  <input defaultValue={v.nameAr} dir="rtl" style={css('flex: 1 1 160px; min-width: 0; border: 1px solid #E4EADF; background: #FFFFFF; border-radius: 10px; padding: 11px 12px; font-size: 14.5px; font-weight: 600; color: #4C5850;')} />
                  <input defaultValue={v.price} style={css('width: 92px; flex: 0 0 auto; border: 1px solid #E4EADF; background: #FFFFFF; border-radius: 10px; padding: 11px 12px; font-size: 14.5px; font-weight: 800;')} />
                  <span style={css(v.stockStyle)}>{v.stock}</span>
                  <button style={css('flex: 0 0 auto; background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; width: 40px; height: 40px; font-size: 15px; font-weight: 800; color: #B3261E; cursor: pointer;')}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Photo</div>
            <div style={css('margin-top: 16px; border: 2px dashed #D8E0D3; border-radius: 16px; height: 210px; display: grid; place-items: center; background: repeating-linear-gradient(135deg,#F7F9F5 0 8px,#F1F4EE 8px 16px);')}>
              <div style={css('text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center;')}>
                <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; color: #7B857F;')}>product shot · 1:1 · min 800×800</span>
                <button style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 11px; padding: 11px 18px; font-size: 14px; font-weight: 800; color: #37413A; cursor: pointer;')}>Upload photo</button>
              </div>
            </div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 10px;')}>Or take a photo with the tablet camera.</div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Availability</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Staff can flip this any time from Quick Stock.</div>
            <div style={css('display: flex; gap: 8px; margin-top: 16px;')}>
              {['Available', 'Low Stock', 'Out of Stock'].map((k, i) => (
                <button
                  key={k}
                  onClick={() => onNewState(k)}
                  style={css(
                    newState === k
                      ? `background:${ACCENTS[i]};color:#FFFFFF;border:2px solid ${ACCENTS[i]};border-radius:12px;padding:14px 16px;font-size:14.5px;font-weight:800;cursor:pointer;flex:1;`
                      : 'background:#FFFFFF;color:#7B857F;border:2px solid #EAEDE9;border-radius:12px;padding:14px 16px;font-size:14.5px;font-weight:700;cursor:pointer;flex:1;',
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="fc-sticky" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px; position: sticky; top: 110px;')}>
            <div style={css('display: flex; align-items: center; gap: 12px;')}>
              <div style={css('flex: 1;')}>
                <div style={css('font-size: 15px; font-weight: 800;')}>Show in customer app</div>
                <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>Publishes immediately after saving.</div>
              </div>
              <span style={css('flex: 0 0 auto; width: 52px; height: 30px; border-radius: 999px; background: #47BB1C; display: flex; align-items: center; justify-content: flex-end; padding: 3px;')}>
                <span style={css('width: 24px; height: 24px; border-radius: 50%; background: #FFFFFF;')} />
              </span>
            </div>
            <div style={css('display: flex; flex-direction: column; gap: 10px; margin-top: 20px;')}>
              <button className="hv-green" onClick={onBack} style={css('background: #47BB1C; color: #FFFFFF; border: none; border-radius: 14px; padding: 17px 20px; font-size: 16px; font-weight: 800; cursor: pointer;')}>Save product</button>
              <button className="hv-soft" style={css('background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 14px; padding: 15px 20px; font-size: 15px; font-weight: 800; cursor: pointer;')}>Save &amp; add another</button>
              <button onClick={onBack} style={css('background: transparent; color: #7B857F; border: none; padding: 10px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
