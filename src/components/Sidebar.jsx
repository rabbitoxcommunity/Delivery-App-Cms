import { css } from '../lib/css'
import { GREEN, NAV } from '../lib/design'

export default function Sidebar({ current, onNavigate }) {
  return (
    <aside
      className="fc-sidebar"
      style={css(
        'background: #FFFFFF; border-right: 1px solid #EAEDE9; padding: 22px 16px; display: flex; flex-direction: column; gap: 26px; position: sticky; top: 0; height: 100vh;',
      )}
    >
      <div style={css('display: flex; align-items: center; gap: 10px; padding: 0 6px;')}>
        <div style={css('width: 38px; height: 38px; border-radius: 12px; background: #47BB1C; display: grid; place-items: center;')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 20c0-8 3-12 8-13 1 8-2 13-8 13Z" />
            <path d="M12 20c-4 0-7-3-7-8 4 0 7 3 7 8Z" />
          </svg>
        </div>
        <div>
          <div style={css('font-size: 17px; font-weight: 800; letter-spacing: -.3px;')}>FreshCart</div>
          <div style={css('font-size: 11.5px; color: #7B857F; font-weight: 600;')}>Back office</div>
        </div>
      </div>

      <nav style={css('display: flex; flex-direction: column; gap: 4px;')}>
        {NAV.map(([key, label, icon, badge]) => {
          const active = current === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              style={css(
                `display:flex;align-items:center;gap:12px;padding:12px 14px;border:none;border-radius:12px;font-size:14.5px;font-weight:${
                  active ? 800 : 700
                };cursor:pointer;text-align:left;${
                  active ? `background:${GREEN};color:#FFFFFF;` : 'background:transparent;color:#4C5850;'
                }`,
              )}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
              <span style={css('flex: 1; text-align: left;')}>{label}</span>
              {badge ? (
                <span
                  style={css(
                    `background:${active ? 'rgba(255,255,255,.25)' : '#FFE8E5'};color:${
                      active ? '#FFFFFF' : '#B3261E'
                    };font-size:11.5px;font-weight:800;padding:3px 8px;border-radius:7px;`,
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div style={css('margin-top: auto; display: flex; flex-direction: column; gap: 12px;')}>
        <div style={css('background: #F3F6F1; border: 1px solid #E4EADF; border-radius: 14px; padding: 14px;')}>
          <div style={css('font-size: 12px; font-weight: 700; color: #4C5850; display: flex; align-items: center; gap: 7px;')}>
            <span style={css('width: 8px; height: 8px; border-radius: 50%; background: #47BB1C; animation: fcPulse 1.6s ease-in-out infinite;')} />
            Live · synced with app
          </div>
          <div style={css('font-size: 11.5px; color: #7B857F; margin-top: 6px; line-height: 1.4;')}>
            Stock and status changes appear in the customer app instantly.
          </div>
        </div>
        <div style={css('display: flex; align-items: center; gap: 10px; padding: 4px 6px;')}>
          <div style={css('width: 34px; height: 34px; border-radius: 50%; background: #E6F6DE; color: #2E7A12; display: grid; place-items: center; font-weight: 800; font-size: 13px;')}>
            SA
          </div>
          <div style={css('line-height: 1.25;')}>
            <div style={css('font-size: 13px; font-weight: 700;')}>Sami Al Harbi</div>
            <div style={css('font-size: 11.5px; color: #7B857F; font-weight: 600;')}>Owner</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
