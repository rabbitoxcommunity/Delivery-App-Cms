import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, hasSession, request, setTokens, setUnauthorizedHandler } from './api'

const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || ''

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'checking' avoids a Login-screen flash on reload while a stored refresh
  // token is still being exchanged for a fresh session.
  const [status, setStatus] = useState(hasSession() ? 'checking' : 'signedOut')

  const signOut = useCallback(() => {
    setTokens(null)
    setUser(null)
    setStatus('signedOut')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(signOut)
  }, [signOut])

  useEffect(() => {
    if (status !== 'checking') return
    let cancelled = false
    request('/me')
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setStatus('signedIn')
      })
      .catch(() => {
        if (cancelled) return
        signOut()
      })
    return () => {
      cancelled = true
    }
  }, [status, signOut])

  const signIn = useCallback(async (email, password) => {
    const result = await api.post(
      '/auth/staff/login',
      { tenantSlug: TENANT_SLUG, email, password },
      { skipAuth: true },
    )
    setTokens(result)
    setUser(result.user)
    setStatus('signedIn')
    return result.user
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isSignedIn: status === 'signedIn',
      isChecking: status === 'checking',
      signIn,
      signOut,
      // §5.2 permission matrix — 'staff' < 'manager' < 'owner'.
      grade: user?.permissions ?? null,
      hasGrade: (min) => {
        const rank = { staff: 0, manager: 1, owner: 2 }
        const have = rank[user?.permissions] ?? -1
        return have >= (rank[min] ?? 0)
      },
    }),
    [user, status, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
