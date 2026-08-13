import { css } from '../lib/css'
import { PROPS, TITLES } from '../lib/design'

const SOUND_ON = 'M11 5 6 9H3v6h3l5 4V5ZM16 9a4 4 0 0 1 0 6'
const SOUND_OFF = 'M11 5 6 9H3v6h3l5 4V5ZM16 10l4 4M20 10l-4 4'

export default function Header({ screen, onOpenNav }) {
  const sound = PROPS.soundAlerts
  const [title, sub] = TITLES[screen]

  return (
    <header
      className="fc-header"
      style={css(
        'background: #FFFFFF; border-bottom: 1px solid #EAEDE9; padding: 18px 30px; display: flex; align-items: center; gap: 20px; position: sticky; top: 0; z-index: 5;',
      )}
    >
      <button className="fc-burger" onClick={onOpenNav} aria-label="Open navigation">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <div>
        <h1 className="fc-title" style={css('margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -.4px;')}>
          {title}
        </h1>
        <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>{sub}</div>
      </div>

      <div className="fc-headtools" style={css('margin-left: auto; display: flex; align-items: center; gap: 12px;')}>
        <div style={css('display: flex; align-items: center; gap: 9px; background: #F3F6F1; border: 1px solid #E4EADF; border-radius: 999px; padding: 9px 15px; font-size: 13px; font-weight: 700; color: #37413A;')}>
          <span style={css('width: 8px; height: 8px; border-radius: 50%; background: #47BB1C;')} />
          Shop open · closes 11:00 PM
        </div>
        <button
          className="hv-soft"
          style={css('display: flex; align-items: center; gap: 9px; background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 999px; padding: 9px 15px; font-size: 13px; font-weight: 700; color: #37413A; cursor: pointer;')}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d={sound ? SOUND_ON : SOUND_OFF} />
          </svg>
          {sound ? 'Sound alerts on' : 'Sound alerts off'}
        </button>
      </div>
    </header>
  )
}
