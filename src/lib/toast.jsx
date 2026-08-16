import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

let idSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    // Give the leave animation time to play before actually removing the node.
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id))
    }, 220)
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (tone, message, opts = {}) => {
      const id = ++idSeq
      const toast = { id, tone, message, body: opts.body, leaving: false }
      setToasts((list) => [...list, toast])
      const duration = opts.duration ?? (tone === 'error' ? 6000 : 3800)
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration)
        timers.current.set(id, timer)
      }
      return id
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (message, opts) => push('success', message, opts),
      error: (message, opts) => push('error', message, opts),
      warning: (message, opts) => push('warning', message, opts),
      info: (message, opts) => push('info', message, opts),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

const TONE = {
  success: { bg: '#0F1A12', accent: '#47BB1C', icon: 'M20 6 9 17l-5-5' },
  error: { bg: '#3A1210', accent: '#F3897E', icon: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z' },
  warning: { bg: '#3A2A0E', accent: '#F2C15C', icon: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z' },
  info: { bg: '#0F1A12', accent: '#8FA097', icon: 'M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z' },
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: 340,
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {toasts.map((t) => {
        const tone = TONE[t.tone] || TONE.info
        return (
          <div
            key={t.id}
            className={t.leaving ? 'fc-toast-leave' : 'fc-toast-enter'}
            style={{
              background: tone.bg,
              color: '#FFFFFF',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 11,
              boxShadow: '0 18px 40px rgba(0,0,0,.28)',
              border: `1px solid ${tone.accent}33`,
            }}
          >
            <span
              style={{
                flex: 'none',
                width: 26,
                height: 26,
                borderRadius: 8,
                background: `${tone.accent}26`,
                display: 'grid',
                placeItems: 'center',
                marginTop: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tone.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tone.icon} />
              </svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.35 }}>{t.message}</div>
              {t.body ? <div style={{ fontSize: 12, fontWeight: 600, color: '#B9C4BC', marginTop: 3, lineHeight: 1.4 }}>{t.body}</div> : null}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              style={{ flex: 'none', background: 'transparent', border: 'none', color: '#8FA097', cursor: 'pointer', padding: 2, marginTop: 1 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
