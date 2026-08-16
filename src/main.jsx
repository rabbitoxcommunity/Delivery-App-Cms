import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { ToastProvider } from './lib/toast.jsx'
import { DialogProvider } from './lib/dialogs.jsx'
import { registerServiceWorker } from './pwa.js'
import './index.css'

// App.jsx owns the router itself (createBrowserRouter + RouterProvider —
// required for the `handle`/useMatches route-metadata API Header relies on),
// so there's no separate <BrowserRouter> to wrap here. Toast/Dialog wrap
// everything so any screen can reach useToast()/useDialogs(); AuthProvider
// doesn't use router hooks, so its position relative to the router doesn't
// matter — it wraps App so every routed screen can reach useAuth().
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <DialogProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DialogProvider>
    </ToastProvider>
  </StrictMode>,
)

registerServiceWorker()
