import { useCallback, useEffect, useState } from 'react'
import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { formatDateTime, fromFils, toFils } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useLiveReload } from '../lib/useLiveReload'
import { useToast } from '../lib/toast'
import { useDialogs } from '../lib/dialogs'
import StateBlock from '../components/StateBlock'
import Portal from '../components/Portal'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

export default function Customers() {
  const toast = useToast()
  const { confirm } = useDialogs()
  const [q, setQ] = useState('')
  const [approving, setApproving] = useState(null)
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchCustomers = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (q.trim()) params.set('q', q.trim())
    return api.get(`/admin/customers?${params.toString()}`)
  }, [page, q])

  const { data, loading, error, reload } = useFetch(fetchCustomers, [fetchCustomers])
  useLiveReload(['credit.changed'], reload)

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

  /**
   * `limit: null` on the API is an explicit grant of UNLIMITED credit, not a
   * missing value — so the modal makes it a deliberate choice rather than
   * something you fall into by leaving the field blank.
   */
  const submitCredit = async (customer, limitFils) => {
    await api.patch(`/admin/customers/${customer.id}/credit`, { limit: limitFils })
    reload()
    toast.success(
      limitFils === null
        ? `Unlimited credit set for ${customer.name}`
        : `Credit limit set for ${customer.name}`,
    )
  }

  /**
   * Disabling is NOT a delete — the account and its ledger stay, because a
   * customer whose credit is pulled usually still owes something. So the
   * confirm says what actually happens, including that any balance survives
   * and can still be settled.
   */
  const disableCredit = async (customer) => {
    const ok = await confirm({
      tone: 'danger',
      title: `Disable credit for ${customer.name}?`,
      body:
        'They will no longer be able to pay later, and Pay Later disappears from their app. ' +
        'Any balance they already owe stays on their account and can still be settled. ' +
        'You can approve them again at any time.',
      confirmLabel: 'Disable credit',
    })
    if (!ok) return
    try {
      await api.delete(`/admin/customers/${customer.id}/credit`)
      reload()
      toast.success(`Credit disabled for ${customer.name}`)
    } catch (e) {
      toast.error(e.message || 'Could not disable credit.')
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
                  {c.creditApproved ? (
                    <>
                      <button
                        className="hv-soft"
                        onClick={() => setApproving(c)}
                        style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 12.5px; font-weight: 800; color: #37413A; cursor: pointer;')}
                      >
                        Edit credit
                      </button>
                      <button
                        className="hv-red-lt"
                        onClick={() => disableCredit(c)}
                        style={css('background: #FFFFFF; border: 1px solid #F3B4AC; border-radius: 10px; padding: 8px 12px; font-size: 12.5px; font-weight: 800; color: #B3261E; cursor: pointer;')}
                      >
                        Disable credit
                      </button>
                    </>
                  ) : (
                    <button
                      className="hv-soft"
                      onClick={() => setApproving(c)}
                      style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 12.5px; font-weight: 800; color: #37413A; cursor: pointer;')}
                    >
                      Approve credit
                    </button>
                  )}
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

      {approving ? (
        <ApproveCreditModal
          customer={approving}
          onClose={() => setApproving(null)}
          onSubmit={submitCredit}
        />
      ) : null}
    </div>
  )
}

/**
 * Approve credit, with an explicit unlimited option.
 *
 * The two choices are radio-style rather than "leave blank for unlimited":
 * an empty field is what a distracted person produces by accident, and
 * granting an unbounded liability by accident is not a thing this screen
 * should make possible. Unlimited has to be chosen.
 */
function ApproveCreditModal({ customer, onClose, onSubmit }) {
  const toast = useToast()
  const editing = Boolean(customer.creditApproved)
  const [mode, setMode] = useState('limited')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(editing)
  const [balance, setBalance] = useState(null)

  // Editing starts from what the account actually is, not from a blank form —
  // retyping a limit you cannot see is how a limit gets accidentally lowered.
  useEffect(() => {
    if (!editing) return undefined
    let cancelled = false
    api
      .get(`/admin/credit/${customer.id}`)
      .then((account) => {
        if (cancelled) return
        setMode(account.limit == null ? 'unlimited' : 'limited')
        if (account.limit != null) setAmount(String(fromFils(account.limit)))
        setBalance(account.balance)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [editing, customer.id])

  const save = async (e) => {
    e.preventDefault()
    let limitFils = null

    if (mode === 'limited') {
      const fils = toFils(Number(amount))
      if (!Number.isFinite(fils) || fils <= 0) {
        toast.error('Enter a valid amount.')
        return
      }
      limitFils = fils
    }

    setBusy(true)
    try {
      await onSubmit(customer, limitFils)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Could not approve credit.')
    } finally {
      setBusy(false)
    }
  }

  const option = (key, title, body) => {
    const on = mode === key
    return (
      <button
        type="button"
        onClick={() => setMode(key)}
        style={css(
          `display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;cursor:pointer;` +
            `background:#FFFFFF;border:2px solid ${on ? GREEN : '#E4EADF'};border-radius:14px;padding:14px 16px;`,
        )}
      >
        <span
          style={{
            ...css('width:20px;height:20px;flex:0 0 auto;border-radius:50%;display:grid;place-items:center;margin-top:1px;'),
            border: `2px solid ${on ? GREEN : '#CBD5C6'}`,
          }}
        >
          {on ? <span style={css(`width:10px;height:10px;border-radius:50%;background:${GREEN};`)} /> : null}
        </span>
        <span style={css('flex:1;')}>
          <span style={css('display:block;font-size:14.5px;font-weight:800;')}>{title}</span>
          <span style={css('display:block;font-size:12.5px;font-weight:600;color:#7B857F;margin-top:3px;line-height:1.45;')}>
            {body}
          </span>
        </span>
      </button>
    )
  }

  return (
    <Portal>
      <div
        className="fc-backdrop"
        onClick={onClose}
        style={css('position: fixed; inset: 0; background: rgba(15,26,18,.42); display: flex; align-items: center; justify-content: center; z-index: 30;')}
      >
        <form
          onSubmit={save}
          onClick={(e) => e.stopPropagation()}
          className="fc-modal"
          style={css('background: #FFFFFF; border-radius: 20px; padding: 26px; width: 420px; max-width: 92vw; display: flex; flex-direction: column; gap: 14px;')}
        >
          <div>
            <div style={css('font-size: 18px; font-weight: 800; letter-spacing: -.3px;')}>
              {editing ? 'Edit credit for' : 'Approve credit for'} {customer.name || 'this customer'}
            </div>
            <div style={css('font-size: 13.5px; color: #7B857F; font-weight: 600; margin-top: 5px; line-height: 1.5;')}>
              Lets them pay later. Orders are charged to their account when placed.
              {balance ? ` Currently owes AED ${fromFils(balance).toFixed(2)}.` : ''}
            </div>
          </div>

          {loading ? (
            <div style={css('font-size: 13.5px; font-weight: 600; color: #7B857F; padding: 8px 0;')}>
              Loading current limit…
            </div>
          ) : null}

          {option('limited', 'Set a credit limit', 'They cannot carry more than this much unpaid at once.')}

          {mode === 'limited' ? (
            <div>
              <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>
                Limit (AED)
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2000.00"
                style={css('width: 100%; padding: 13px 15px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700;')}
              />
            </div>
          ) : null}

          {option(
            'unlimited',
            'No limit',
            'They can carry any outstanding balance. Nothing will ever block an order on credit, so only do this for customers you settle with directly.',
          )}

          <div style={css('display: flex; gap: 10px; margin-top: 4px;')}>
            <button
              type="submit"
              disabled={busy || loading}
              style={css(`flex: 1; background: ${busy || loading ? '#A9DE8F' : GREEN}; color: #FFFFFF; border: none; border-radius: 12px; padding: 13px 16px; font-size: 14.5px; font-weight: 800; cursor: ${busy ? 'default' : 'pointer'};`)}
            >
              {busy
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : mode === 'unlimited'
                    ? 'Approve unlimited'
                    : 'Approve'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 12px; padding: 13px 16px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Portal>
  )
}
