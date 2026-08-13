// Thin fetch wrapper for the FreshCart backend. Mirrors the shape of the
// customer app's src/api/client.ts (same ApiError, same error envelope
// reading) so the two clients stay consistent, even though this one also
// needs to hold and refresh a staff session.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'

const ACCESS_TOKEN_KEY = 'fc_admin_access_token'
const REFRESH_TOKEN_KEY = 'fc_admin_refresh_token'

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// Access token lives in memory + sessionStorage (survives a reload, not a
// closed tab — the refresh token in localStorage is what makes a reload
// resume the session at all). Refresh token in localStorage: this is a
// desktop/tablet back-office running in a normal browser tab, not the
// mobile app, so the design doc's SecureStore requirement (§5.5, mobile
// only) doesn't apply here.
let accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || null
let refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || null
let onUnauthorized = null

export function setTokens(pair) {
  accessToken = pair?.accessToken ?? null
  refreshToken = pair?.refreshToken ?? null
  if (accessToken) sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  else sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  else localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getRefreshToken() {
  return refreshToken
}

export function getAccessToken() {
  return accessToken
}

/**
 * The access token's own claims carry tenantId, but every JSON response
 * strips it (§2 CONVENTIONS — clients never see tenantId in a body). Decoding
 * the JWT payload client-side needs no verification here: it's only used to
 * pick a Socket.io namespace to join, and the server independently verifies
 * the same token on the socket handshake before admitting the connection.
 */
export function decodeTenantId(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json).tenantId ?? null
  } catch {
    return null
  }
}

export function hasSession() {
  return Boolean(refreshToken)
}

/** Called once by AuthContext so a 401 that survives a refresh attempt can force a logout. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

let refreshInFlight = null

async function refreshAccessToken() {
  if (!refreshToken) throw new ApiError('No refresh token', 401, 'UNAUTHENTICATED')
  // Coalesce concurrent 401s into a single refresh call.
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError('Session expired', 401, 'UNAUTHENTICATED')
        const body = await res.json()
        setTokens(body)
        return body
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

export async function request(path, init = {}) {
  const { skipAuth, retry, ...rest } = init

  const doFetch = async () => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept-Language': 'en',
      ...(accessToken && !skipAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...rest.headers,
    }
    return fetch(`${API_BASE_URL}${path}`, { ...rest, headers })
  }

  let response = await doFetch()

  // One transparent retry after a silent refresh — the design doc's
  // rotating-refresh-token flow (§5.5) means this is expected to happen
  // roughly hourly, not an error case worth surfacing to the user.
  if (response.status === 401 && !skipAuth && retry !== false && refreshToken) {
    try {
      await refreshAccessToken()
      response = await doFetch()
    } catch {
      setTokens(null)
      onUnauthorized?.()
      throw new ApiError('Session expired — please sign in again.', 401, 'UNAUTHENTICATED')
    }
  }

  if (response.status === 204) return null

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const err = body.error ?? {}
    if (response.status === 401 && !skipAuth) {
      setTokens(null)
      onUnauthorized?.()
    }
    throw new ApiError(err.message || response.statusText, response.status, err.code, err.details)
  }

  return body
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
}

/** §13.7 — POST /orders-style idempotency. A fresh key per logical action, not per click. */
export function idempotencyKey() {
  return crypto.randomUUID()
}
