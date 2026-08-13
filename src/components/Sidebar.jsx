import { css } from '../lib/css'
import { GREEN, NAV } from '../lib/design'

function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase()
}

export default function Sidebar({ current, onNavigate, user, onSignOut, badges = {} }) {
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
        {NAV.map(([key, label, icon]) => {
          const active = current === key
          const badge = badges[key]
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
          <div style={css('width: 34px; height: 34px; border-radius: 50%; background: #E6F6DE; color: #2E7A12; display: grid; place-items: center; font-weight: 800; font-size: 13px; flex: none;')}>
            {initialsOf(user?.name)}
          </div>
          <div style={css('line-height: 1.25; flex: 1; min-width: 0;')}>
            <div style={css('font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;')}>{user?.name || '—'}</div>
            <div style={css('font-size: 11.5px; color: #7B857F; font-weight: 600; text-transform: capitalize;')}>
              {user?.permissions || user?.role || ''}
            </div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            style={css('flex: none; background: transparent; border: none; color: #7B857F; cursor: pointer; padding: 6px; border-radius: 8px;')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
