import { css } from '../lib/css'
import { PAYMENTS } from '../lib/data'

export default function Settings() {
  return (
    <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px; align-items: start;')}>
      <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
        <div style={css('font-size: 17px; font-weight: 800;')}>Shop profile &amp; branding</div>
        <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 18px;')}>
          <div>
            <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Shop name</div>
            <input defaultValue="FreshCart" style={css('width: 100%; padding: 13px 14px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700;')} />
          </div>
          <div>
            <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Brand colour</div>
            <div style={css('display: flex; align-items: center; gap: 10px;')}>
              <span style={css('width: 42px; height: 42px; border-radius: 12px; background: #47BB1C;')} />
              <input defaultValue="#47BB1C" style={css('width: 130px; padding: 13px 14px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 800; font-family: ui-monospace, Menlo, monospace;')} />
              <span style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>used in the customer app too</span>
            </div>
          </div>
          <div>
            <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Logo</div>
            <div style={css('display: flex; align-items: center; gap: 12px;')}>
              <div style={css('width: 56px; height: 56px; border-radius: 16px; background: #47BB1C; display: grid; place-items: center;')}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 20c0-8 3-12 8-13 1 8-2 13-8 13Z" />
                  <path d="M12 20c-4 0-7-3-7-8 4 0 7 3 7 8Z" />
                </svg>
              </div>
              <button style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 12px; padding: 12px 16px; font-size: 14px; font-weight: 800; color: #37413A; cursor: pointer;')}>Replace logo</button>
            </div>
          </div>
          <div>
            <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Language</div>
            <div style={css('display: flex; gap: 8px;')}>
              <button style={css('background: #47BB1C; color: #FFFFFF; border: none; border-radius: 11px; padding: 12px 18px; font-size: 14px; font-weight: 800; cursor: pointer;')}>English</button>
              <button style={css('background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 11px; padding: 12px 18px; font-size: 14px; font-weight: 800; cursor: pointer;')}>العربية</button>
              <button style={css('background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 11px; padding: 12px 18px; font-size: 14px; font-weight: 800; cursor: pointer;')}>Both</button>
            </div>
          </div>
        </div>
      </div>

      <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
          <div style={css('font-size: 17px; font-weight: 800;')}>Payments</div>
          <div style={css('display: flex; flex-direction: column; gap: 10px; margin-top: 16px;')}>
            {PAYMENTS.map((p) => (
              <div key={p.name} style={css('display: flex; align-items: center; gap: 12px; background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 12px; padding: 14px 16px;')}>
                <div style={css('flex: 1;')}>
                  <div style={css('font-size: 14.5px; font-weight: 800;')}>{p.name}</div>
                  <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600;')}>{p.note}</div>
                </div>
                <span style={css(p.style)}>{p.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
