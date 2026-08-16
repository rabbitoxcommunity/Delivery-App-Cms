import { css } from '../lib/css'

export const fieldWrap = css('display: flex; flex-direction: column; gap: 6px;')
export const fieldLabel = css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .4px;')

export function inputStyle(hasError) {
  return css(
    `width: 100%; padding: 13px 14px; border: 1px solid ${
      hasError ? '#E7998F' : '#E4EADF'
    }; border-radius: 12px; font-size: 14.5px; font-weight: 600; background: ${hasError ? '#FFFBFA' : '#FFFFFF'};`,
  )
}

/** Wraps a react-hook-form-registered input with a consistent label + animated error message. */
export function Field({ label, hint, error, children }) {
  return (
    <div style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      {children}
      {error ? (
        <span className="fc-fade-up" style={css('font-size: 12px; font-weight: 700; color: #C0392B;')}>
          {error.message}
        </span>
      ) : hint ? (
        <span style={css('font-size: 12px; color: #9AA39C; font-weight: 600;')}>{hint}</span>
      ) : null}
    </div>
  )
}
