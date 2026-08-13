import { useState } from 'react'
import { css } from '../lib/css'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={css(
        'min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F6F7F5; padding: 20px;',
      )}
    >
      <form
        onSubmit={submit}
        style={css(
          'width: 100%; max-width: 380px; background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 22px; padding: 32px; display: flex; flex-direction: column; gap: 18px;',
        )}
      >
        <div style={css('display: flex; align-items: center; gap: 10px;')}>
          <div style={css('width: 42px; height: 42px; border-radius: 13px; background: #47BB1C; display: grid; place-items: center;')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 20c0-8 3-12 8-13 1 8-2 13-8 13Z" />
              <path d="M12 20c-4 0-7-3-7-8 4 0 7 3 7 8Z" />
            </svg>
          </div>
          <div>
            <div style={css('font-size: 18px; font-weight: 800; letter-spacing: -.3px;')}>FreshCart</div>
            <div style={css('font-size: 12px; color: #7B857F; font-weight: 600;')}>Back office</div>
          </div>
        </div>

        <div>
          <div style={css('font-size: 22px; font-weight: 800; letter-spacing: -.4px;')}>Sign in</div>
          <div style={css('font-size: 13.5px; color: #7B857F; font-weight: 600; margin-top: 4px;')}>
            Staff and delivery accounts only.
          </div>
        </div>

        {error ? (
          <div
            style={css(
              'background: #FFF1EF; border: 1px solid #F3B4AC; color: #B3261E; border-radius: 12px; padding: 12px 14px; font-size: 13.5px; font-weight: 700;',
            )}
          >
            {error}
          </div>
        ) : null}

        <div>
          <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>
            Email
          </div>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@freshcart-demo.test"
            style={css('width: 100%; padding: 14px 15px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 600;')}
          />
        </div>

        <div>
          <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>
            Password
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={css('width: 100%; padding: 14px 15px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 600;')}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          style={css(
            `background:${busy ? '#8FCE6C' : '#47BB1C'};color:#FFFFFF;border:none;border-radius:14px;padding:16px 20px;font-size:15.5px;font-weight:800;cursor:${
              busy ? 'default' : 'pointer'
            };`,
          )}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
