import { useCallback, useState } from 'react'
import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { formatDateTime, toFils } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useToast } from '../lib/toast'
import { useDialogs } from '../lib/dialogs'
import StateBlock from '../components/StateBlock'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

export default function Customers() {
  const toast = useToast()
  const { confirm, promptText } = useDialogs()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchCustomers = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (q.trim()) params.set('q', q.trim())
    return api.get(`/admin/customers?${params.toString()}`)
  }, [page, q])

  const { data, loading, error, reload } = useFetch(fetchCustomers, [fetchCustomers])

  const search = (value) => {
    setQ(value)
    setPage(1)
  }

  const toggleBlock = async (customer) => {
    const blocking = customer.status !== 'blocked'
    if (blocking) {
      const ok = await confirm({
        title: `Block ${customer.name}?`,
        body: 'They will not be able to sign in or place new orders until unblocked.',
        tone: 'danger',
        confirmLabel: 'Block',
      })
      if (!ok) return
    }
    try {
      await api.patch(`/admin/customers/${customer.id}/block`, { blocked: blocking })
      reload()
      toast.success(blocking ? `${customer.name} blocked` : `${customer.name} unblocked`)
    } catch (e) {
      toast.error(e.message || 'Could not update this customer.')
    }
  }

  const approveCredit = async (customer) => {
    const raw = await promptText({
      title: `Approve credit for ${customer.name}?`,
      body: 'Set the maximum outstanding balance this customer can carry.',
      placeholder: 'Credit limit (AED)',
      confirmLabel: 'Approve',
    })
    if (raw == null) return
    const fils = toFils(Number(raw))
    if (!Number.isFinite(fils) || fils <= 0) {
      toast.error('Enter a valid amount.')
      return
    }
    try {
      await api.patch(`/admin/customers/${customer.id}/credit`, { limit: fils })
      reload()
      toast.success(`Credit approved for ${customer.name}`)
    } catch (e) {
      toast.error(e.message || 'Could not approve credit.')
    }
  }

  const customers = data?.items || []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; align-items: center; gap: 12px; flex-wrap: wrap;')}>
        <div style={css('position: relative; flex: 1; min-width: 280px;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input
            placeholder={`Search ${total.toLocaleString()} customers by name or phone`}
            value={q}
            onChange={(e) => search(e.target.value)}
            style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')}
          />
        </div>
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <StateBlock loading={loading} error={error} onRetry={reload} empty={!loading && !error && customers.length === 0} emptyText="No customers match this search.">
          <div className="fc-thead" style={css('display: grid; grid-template-columns: minmax(200px, 1.6fr) 140px 1fr 130px 140px 260px; gap: 14px; padding: 13px 20px; min-width: 1080px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
            <div>Customer</div><div>Phone</div><div>Email</div><div>Credit</div><div>Joined</div><div />
          </div>

          {customers.map((c, i) => {
            const blocked = c.status === 'blocked'
            return (
              <div
                key={c.id}
                className="fc-row fc-fade-up"
                style={{
                  ...css('display: grid; grid-template-columns: minmax(200px, 1.6fr) 140px 1fr 130px 140px 260px; gap: 14px; align-items: center; padding: 13px 20px; min-width: 1080px; border-top: 1px solid #F2F4F0;'),
                  animationDelay: `${Math.min(i, 12) * 18}ms`,
                }}
              >
                <div style={css('min-width: 0;')}>
                  <div style={css('font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;')}>{c.name || 'Customer'}</div>
                  {blocked ? (
                    <span style={css('display: inline-flex; margin-top: 3px; background: #FFE8E5; color: #B3261E; font-size: 11.5px; font-weight: 800; padding: 3px 8px; border-radius: 7px;')}>Blocked</span>
                  ) : null}
                </div>
                <div data-label="Phone" style={css('font-size: 13.5px; font-weight: 700; color: #37413A; font-family: ui-monospace, Menlo, monospace;')}>{c.phone || '—'}</div>
                <div data-label="Email" style={css('font-size: 13.5px; color: #4C5850; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;')}>{c.email || '—'}</div>
                <div data-label="Credit">
                  {c.creditApproved ? (
                    <span style={css('display: inline-flex; background: #E6F6DE; color: #2E7A12; font-size: 12.5px; font-weight: 800; padding: 6px 11px; border-radius: 9px;')}>Approved</span>
                  ) : (
                    <span style={css('display: inline-flex; background: #EEF0EC; color: #7B857F; font-size: 12.5px; font-weight: 800; padding: 6px 11px; border-radius: 9px;')}>Not approved</span>
                  )}
                </div>
                <div data-label="Joined" style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>{formatDateTime(c.createdAt)}</div>
                <div className="fc-act" style={css('display: flex; justify-content: flex-end; gap: 8px;')}>
                  {!c.creditApproved ? (
                    <button
                      className="hv-soft"
                      onClick={() => approveCredit(c)}
                      style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 12.5px; font-weight: 800; color: #37413A; cursor: pointer;')}
                    >
                      Approve credit
                    </button>
                  ) : null}
                  <button
                    onClick={() => toggleBlock(c)}
                    style={css(
                      blocked
                        ? `background:${GREEN};color:#FFFFFF;border:none;border-radius:10px;padding:8px 12px;font-size:12.5px;font-weight:800;cursor:pointer;`
                        : 'background:#FFFFFF;color:#B3261E;border:1px solid #F3B4AC;border-radius:10px;padding:8px 12px;font-size:12.5px;font-weight:800;cursor:pointer;',
                    )}
                  >
                    {blocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </div>
            )
          })}

          <div className="fc-tblfoot" style={css('display: flex; align-items: center; gap: 14px; padding: 15px 20px; min-width: 1080px; border-top: 1px solid #EFF1ED; font-size: 13.5px; color: #7B857F; font-weight: 700;')}>
            Showing {customers.length} of {total.toLocaleString()} customers
            <div style={css('margin-left: auto; display: flex; gap: 8px;')}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 9px 14px; font-weight: 800; color: #37413A; cursor: ${page <= 1 ? 'default' : 'pointer'}; opacity: ${page <= 1 ? 0.5 : 1};`)}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 9px 14px; font-weight: 800; color: #37413A; cursor: ${page >= totalPages ? 'default' : 'pointer'}; opacity: ${page >= totalPages ? 0.5 : 1};`)}
              >
                Next
              </button>
            </div>
          </div>
        </StateBlock>
      </div>
    </div>
  )
}
