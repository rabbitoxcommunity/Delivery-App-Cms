import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { GREEN } from './design'

const DialogContext = createContext(null)

/**
 * One imperative API for the three native-dialog replacements this app
 * needed (confirm / prompt-for-text / reveal-a-secret-once), all sharing the
 * same on-brand modal shell instead of browser-native alert/confirm/prompt.
 * Each resolves a promise so call sites read almost exactly like the native
 * versions did: `if (!(await confirm({...}))) return`.
 */
export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)

  const close = useCallback((result) => {
    resolver.current?.(result)
    resolver.current = null
    setDialog(null)
  }, [])

  const open = useCallback((config) => {
    return new Promise((resolve) => {
      resolver.current = resolve
      setDialog(config)
    })
  }, [])

  const api = useMemo(
    () => ({
      confirm: (config) => open({ kind: 'confirm', ...config }),
      promptText: (config) => open({ kind: 'prompt', value: '', ...config }),
      reveal: (config) => open({ kind: 'reveal', ...config }),
    }),
    [open],
  )

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog ? <DialogModal dialog={dialog} onClose={close} /> : null}
    </DialogContext.Provider>
  )
}

export function useDialogs() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialogs must be used inside DialogProvider')
  return ctx
}

function DialogModal({ dialog, onClose }) {
  const [text, setText] = useState(dialog.value || '')
  const [copied, setCopied] = useState(false)
  const danger = dialog.tone === 'danger'

  const copy = () => {
    navigator.clipboard?.writeText(dialog.value || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div
      className="fc-backdrop"
      onClick={() => (dialog.kind === 'reveal' ? onClose(true) : onClose(dialog.kind === 'prompt' ? null : false))}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,26,18,.5)', zIndex: 300, display: 'grid', placeItems: 'center', padding: 20 }}
    >
      <div
        className="fc-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: '#FFFFFF', borderRadius: 20, padding: 26, boxShadow: '0 30px 70px rgba(0,0,0,.3)' }}
      >
        <div style={{ fontSize: 17, fontWeight: 800, color: '#14181A' }}>{dialog.title}</div>
        {dialog.body ? <div style={{ fontSize: 13.5, color: '#7B857F', fontWeight: 600, marginTop: 8, lineHeight: 1.5 }}>{dialog.body}</div> : null}

        {dialog.kind === 'prompt' && (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={dialog.placeholder}
            onKeyDown={(e) => e.key === 'Enter' && text.trim() && onClose(text.trim())}
            style={{ width: '100%', marginTop: 16, padding: '12px 14px', border: '1px solid #E4EADF', borderRadius: 12, fontSize: 14, fontWeight: 600 }}
          />
        )}

        {dialog.kind === 'reveal' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, background: '#F3F6F1', border: '1px solid #E4EADF', borderRadius: 12, padding: '12px 14px' }}>
            <code style={{ flex: 1, fontSize: 14.5, fontWeight: 800, letterSpacing: 0.4, color: '#14181A', wordBreak: 'break-all' }}>{dialog.value}</code>
            <button
              onClick={copy}
              style={{ flex: 'none', background: copied ? GREEN : '#FFFFFF', color: copied ? '#FFFFFF' : '#37413A', border: '1px solid #E4EADF', borderRadius: 9, padding: '7px 11px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          {dialog.kind !== 'reveal' && (
            <button
              onClick={() => onClose(dialog.kind === 'prompt' ? null : false)}
              style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4EADF', borderRadius: 12, padding: '13px 16px', fontSize: 13.5, fontWeight: 800, color: '#4C5850', cursor: 'pointer' }}
            >
              {dialog.cancelLabel || 'Cancel'}
            </button>
          )}
          <button
            onClick={() => onClose(dialog.kind === 'prompt' ? (text.trim() || null) : true)}
            disabled={dialog.kind === 'prompt' && !text.trim()}
            style={{
              flex: 1,
              background: danger ? '#D9463C' : GREEN,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '13px 16px',
              fontSize: 13.5,
              fontWeight: 800,
              cursor: dialog.kind === 'prompt' && !text.trim() ? 'default' : 'pointer',
              opacity: dialog.kind === 'prompt' && !text.trim() ? 0.6 : 1,
            }}
          >
            {dialog.confirmLabel || (dialog.kind === 'reveal' ? 'Done' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
