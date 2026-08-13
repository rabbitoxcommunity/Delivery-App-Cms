import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { ADD_CATS, CAT_COLORS } from '../lib/data'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

export default function AddCategory({ onBack }) {
  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px; max-width: 1080px;')}>
      <button className="hv-link" onClick={onBack} style={css('display: flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; border: none; padding: 0; font-size: 14px; font-weight: 800; color: #7B857F; cursor: pointer;')}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        Back to categories
      </button>

      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; align-items: start;')}>
        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Category details</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Both names appear on the customer app home screen.</div>
            <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 18px;')}>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Category name (English)</div>
                <input placeholder="e.g. Frozen foods" style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 16px; font-weight: 700;')} />
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>اسم الفئة (Arabic)</div>
                <input placeholder="مثال: مجمدات" dir="rtl" style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 16px; font-weight: 700;')} />
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Sits under</div>
                <select style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700; background: #FFFFFF; color: #14181A;')}>
                  <option>Top level (shown on home screen)</option>
                  {ADD_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Accent colour</div>
                <div style={css('display: flex; gap: 12px;')}>
                  {CAT_COLORS.map((c, i) => (
                    <button
                      key={c}
                      style={css(`width:52px;height:52px;border-radius:14px;cursor:pointer;background:${c};box-shadow:${
                        i === 0 ? `0 0 0 3px #FFFFFF, 0 0 0 5px ${c}` : 'none'
                      };border:none;`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Move products in</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Optional — you can also assign products later from the product list.</div>
            <div style={css('position: relative; margin-top: 16px;')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
                <path d={SEARCH_ICON} />
              </svg>
              <input placeholder="Search products to add to this category" style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 14.5px; font-weight: 600;')} />
            </div>
            <div style={css('display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px;')}>
              {['Frozen Peas 900g ✕', 'Chicken Nuggets 750g ✕', 'Vanilla Ice Cream 1L ✕'].map((t) => (
                <span key={t} style={css('display: inline-flex; align-items: center; gap: 8px; background: #E6F6DE; color: #2E7A12; border-radius: 10px; padding: 9px 13px; font-size: 13.5px; font-weight: 800;')}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Category image</div>
            <div style={css('margin-top: 16px; border: 2px dashed #D8E0D3; border-radius: 16px; height: 180px; display: grid; place-items: center; background: repeating-linear-gradient(135deg,#F7F9F5 0 8px,#F1F4EE 8px 16px);')}>
              <div style={css('text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center;')}>
                <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; color: #7B857F;')}>category tile · 2:1 · min 800×400</span>
                <button style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 11px; padding: 11px 18px; font-size: 14px; font-weight: 800; color: #37413A; cursor: pointer;')}>Upload image</button>
              </div>
            </div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Visibility</div>
            <div style={css('display: flex; gap: 8px; margin-top: 16px;')}>
              {['Visible in app', 'Hidden'].map((k, i) => (
                <button
                  key={k}
                  style={css(
                    i === 0
                      ? `background:${GREEN};color:#FFFFFF;border:2px solid ${GREEN};border-radius:12px;padding:14px 18px;font-size:14.5px;font-weight:800;cursor:pointer;flex:1;`
                      : 'background:#FFFFFF;color:#7B857F;border:2px solid #EAEDE9;border-radius:12px;padding:14px 18px;font-size:14.5px;font-weight:700;cursor:pointer;flex:1;',
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 10px;')}>Hidden categories keep their products, but customers can't browse them.</div>
          </div>

          <div className="fc-sticky" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px; position: sticky; top: 110px; display: flex; flex-direction: column; gap: 10px;')}>
            <button className="hv-green" onClick={onBack} style={css('background: #47BB1C; color: #FFFFFF; border: none; border-radius: 14px; padding: 17px 20px; font-size: 16px; font-weight: 800; cursor: pointer;')}>Save category</button>
            <button onClick={onBack} style={css('background: transparent; color: #7B857F; border: none; padding: 10px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
