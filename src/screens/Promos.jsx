import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { css } from '../lib/css'
import { fromFils } from '../lib/adapt'
import { money } from '../lib/design'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useToast } from '../lib/toast'
import { useDialogs } from '../lib/dialogs'
import StateBlock from '../components/StateBlock'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

const GRID = 'display: grid; grid-template-columns: minmax(150px, 1.2fr) 130px 130px minmax(190px, 1.4fr) 120px 130px 190px; gap: 14px; align-items: center;'
const MIN_W = 'min-width: 1140px;'

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * A promo is "live" only when every gate the server checks in evaluatePromo
 * passes — active flag, both ends of the date window, and the redemption cap.
 * Showing just the active flag would label an expired or exhausted code as
 * working, which is exactly the case an owner comes to this screen to debug.
 */
function stateOf(p) {
  if (!p.active) return 'Inactive'
  const now = Date.now()
  if (p.startsAt && now < new Date(p.startsAt).getTime()) return 'Scheduled'
  if (p.endsAt && now > new Date(p.endsAt).getTime()) return 'Expired'
  if (p.maxRedemptions != null && (p.redemptions ?? 0) >= p.maxRedemptions) return 'Used up'
  return 'Live'
}

const STATE_COLORS = {
  Live: ['#E6F6DE', '#2E7A12'],
  Scheduled: ['#E1F0F5', '#0B5E86'],
  Expired: ['#FFF6E2', '#7A5205'],
  'Used up': ['#FFF6E2', '#7A5205'],
  Inactive: ['#EEF0EC', '#7B857F'],
}

/** `value` is percent points for a percent promo, and fils for a fixed one. */
const discountLabel = (p) => (p.discountType === 'percent' ? `${p.value}% off` : `${money(fromFils(p.value))} off`)

const windowLabel = (p) => {
  if (!p.startsAt && !p.endsAt) return 'Always on'
  if (p.startsAt && p.endsAt) return `${fmtDate(p.startsAt)} → ${fmtDate(p.endsAt)}`
  if (p.startsAt) return `From ${fmtDate(p.startsAt)}`
  return `Until ${fmtDate(p.endsAt)}`
}

export default function Promos() {
  const navigate = useNavigate()
  const toast = useToast()
  const { confirm } = useDialogs()
  const [q, setQ] = useState('')

  // The admin list endpoint returns every promo for the tenant as a plain
  // array — no paging, no `q` — so search filters client-side here.
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/promos'), [])
  const promos = Array.isArray(data) ? data : []

  const needle = q.trim().toUpperCase()
  const rows = needle ? promos.filter((p) => p.code.includes(needle)) : promos

  const toggleActive = async (p) => {
    try {
      await api.patch(`/admin/promos/${p.id}`, { active: !p.active })
      reload()
      toast.success(p.active ? `${p.code} turned off` : `${p.code} turned on`)
    } catch (e) {
      toast.error(e.message || 'Could not update this promo code.')
    }
  }

  // DELETE on this resource is a soft deactivate server-side (active: false) —
  // redemption history has to stay attached to the code that granted it. The
  // wording says "turn off", not "delete", so the row staying in the list is
  // the expected outcome rather than a failed delete.
  const deactivate = async (p) => {
    const ok = await confirm({
      title: `Turn off "${p.code}"?`,
      body: 'Customers who type this code will be told it is not found. You can turn it back on at any time — past redemptions are kept either way.',
      tone: 'danger',
      confirmLabel: 'Turn off code',
    })
    if (!ok) return
    try {
      await api.delete(`/admin/promos/${p.id}`)
      reload()
      toast.success(`${p.code} turned off`)
    } catch (e) {
      toast.error(e.message || 'Could not turn off this promo code.')
    }
  }

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; align-items: center; gap: 12px; flex-wrap: wrap;')}>
        <div style={css('position: relative; flex: 1; min-width: 260px;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input
            placeholder={`Search ${promos.length.toLocaleString()} promo codes`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')}
          />
        </div>
        <button
          className="hv-dark"
          onClick={() => navigate('/promos/new')}
          style={css('display: flex; align-items: center; gap: 9px; background: #0F1A12; color: #FFFFFF; border: none; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add promo code
        </button>
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <StateBlock
          loading={loading}
          error={error}
          onRetry={reload}
          empty={!loading && !error && rows.length === 0}
          emptyText={needle ? `No promo code matches "${q.trim()}".` : 'No promo codes yet — add one to start running an offer.'}
        >
          <div className="fc-thead" style={css(`${GRID} ${MIN_W} padding: 13px 20px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;`)}>
            <div>Code</div><div>Discount</div><div>Min order</div><div>Active window</div><div>Used</div><div>Status</div><div />
          </div>

          {rows.map((p, i) => {
            const state = stateOf(p)
            const col = STATE_COLORS[state]
            return (
              <div
                key={p.id}
                className="fc-row fc-fade-up"
                style={{ ...css(`${GRID} ${MIN_W} padding: 14px 20px; border-top: 1px solid #F2F4F0;`), animationDelay: `${Math.min(i, 12) * 18}ms` }}
              >
                <div style={css('font-family: ui-monospace, Menlo, monospace; font-size: 15px; font-weight: 800; letter-spacing: .5px;')}>{p.code}</div>
                <div data-label="Discount" style={css('font-size: 14.5px; font-weight: 800;')}>{discountLabel(p)}</div>
                <div data-label="Min order" style={css('font-size: 14px; font-weight: 700; color: #4C5850;')}>
                  {p.minSubtotal != null ? money(fromFils(p.minSubtotal)) : '—'}
                </div>
                <div data-label="Active window" style={css('font-size: 13.5px; font-weight: 700; color: #4C5850;')}>{windowLabel(p)}</div>
                <div data-label="Used" style={css('font-size: 14px; font-weight: 800;')}>
                  {p.redemptions ?? 0}
                  <span style={css('color: #7B857F; font-weight: 700;')}>{p.maxRedemptions != null ? ` / ${p.maxRedemptions}` : ''}</span>
                </div>
                <div data-label="Status">
                  <span style={css(`display:inline-flex;background:${col[0]};color:${col[1]};font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;`)}>{state}</span>
                </div>
                <div className="fc-act" style={css('display: flex; justify-content: flex-end; gap: 6px;')}>
                  <button
                    className="hv-soft"
                    onClick={() => navigate(`/promos/${p.id}/edit`)}
                    style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #37413A; cursor: pointer;')}
                  >
                    Edit
                  </button>
                  {p.active ? (
                    <button
                      onClick={() => deactivate(p)}
                      style={css('background: #FFFFFF; border: 1px solid #F3B4AC; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #B3261E; cursor: pointer;')}
                    >
                      Turn off
                    </button>
                  ) : (
                    <button
                      className="hv-soft"
                      onClick={() => toggleActive(p)}
                      style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #37413A; cursor: pointer;')}
                    >
                      Turn on
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </StateBlock>
      </div>
    </div>
  )
}
