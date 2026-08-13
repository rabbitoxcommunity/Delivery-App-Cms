import { useEffect, useState } from 'react'

/**
 * Additive PWA affordance — never rendered unless the browser actually fires
 * `beforeinstallprompt`, so it cannot affect the dashboard layout on desktop
 * or in an already-installed window.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => setDeferred(null)

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!deferred) return null

  const install = async () => {
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div className="fc-install">
      <button onClick={install}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
        </svg>
        Install FreshCart Admin
      </button>
      <button onClick={() => setDeferred(null)} aria-label="Dismiss">✕</button>
    </div>
  )
}
