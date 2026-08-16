import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { css } from '../lib/css'
import { GREEN, money } from '../lib/design'
import { fromFils, toFils } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useLiveReload } from '../lib/useLiveReload'
import { useToast } from '../lib/toast'
import { Field, inputStyle } from '../components/FormField'
import { recordCreditPayment } from '../lib/ordersData'
import StateBlock from '../components/StateBlock'

const GRID = 'display:grid;grid-template-columns:minmax(240px, 2fr) 170px 150px 140px 120px;gap:14px;align-items:center;padding:16px 22px;min-width:940px;border-top:1px solid #F2F4F0;'

function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase()
}

export default function Credit() {
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/credit'), [])
  useLiveReload(['credit.changed'], reload)
  const [settling, setSettling] = useState(null)

  const accounts = data?.accounts || []

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <StateBlock loading={loading} error={error} onRetry={reload}>
        <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;')}>
          <div style={css('background: #0F1A12; color: #FFFFFF; border-radius: 20px; padding: 22px 26px;')}>
            <div style={css('font-size: 13px; font-weight: 800; color: #8FA894; text-transform: uppercase; letter-spacing: .6px;')}>Total outstanding credit</div>
            <div className="fc-xl" style={css('font-size: 52px; font-weight: 800; letter-spacing: -2px; line-height: 1.05; margin-top: 8px;')}>{money(fromFils(data?.totalExposure || 0))}</div>
            <div style={css('font-size: 13.5px; color: #8FA894; font-weight: 600;')}>across {data?.accountCount || 0} customers · same figures customers see in the app</div>
          </div>
          <div style={css('background: #FFF1EF; border: 1px solid #F3B4AC; border-radius: 20px; padding: 22px 26px;')}>
            <div style={css('font-size: 13px; font-weight: 800; color: #A6423B; text-transform: uppercase; letter-spacing: .6px;')}>Overdue</div>
            <div className="fc-xl" style={css('font-size: 44px; font-weight: 800; color: #B3261E; letter-spacing: -1.6px; line-height: 1.1; margin-top: 8px;')}>{data?.overdueCount || 0}</div>
            <div style={css('font-size: 13.5px; color: #A6423B; font-weight: 700;')}>customers past due date</div>
          </div>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 26px;')}>
            <div style={css('font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;')}>Settled this month</div>
            <div className="fc-xl" style={css('font-size: 44px; font-weight: 800; color: #2E7A12; letter-spacing: -1.6px; line-height: 1.1; margin-top: 8px;')}>{money(fromFils(data?.monthSettled || 0))}</div>
            <div style={css('font-size: 13.5px; color: #7B857F; font-weight: 700;')}>{data?.monthSettledCount || 0} payments recorded</div>
          </div>
        </div>

        <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto; margin-top: 16px;')}>
          <StateBlock loading={false} error={null} empty={accounts.length === 0} emptyText="No customers currently owe a balance.">
            <div className="fc-thead" style={css('display: grid; grid-template-columns: minmax(240px, 2fr) 170px 150px 140px 120px; gap: 14px; padding: 13px 22px; min-width: 940px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
              <div>Customer</div><div>Outstanding</div><div>Due date</div><div>Status</div><div />
            </div>

            {accounts.map((a) => {
              const overdue = a.overdue
              return (
                <div key={a.id} className="fc-row" style={css(GRID)}>
                  <div style={css('display: flex; align-items: center; gap: 12px;')}>
                    <div style={css('width: 38px; height: 38px; border-radius: 50%; background: #F0F2EE; color: #4C5850; display: grid; place-items: center; font-size: 13px; font-weight: 800;')}>
                      {initialsOf(a.customer?.name)}
                    </div>
                    <div>
                      <div style={css('font-size: 15px; font-weight: 700;')}>{a.customer?.name || 'Customer'}</div>
                      <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600;')}>{a.customer?.phone || ''}</div>
                    </div>
                  </div>
                  <div data-label="Outstanding" style={css(`font-size:19px;font-weight:800;color:${overdue ? '#B3261E' : '#14181A'};`)}>{money(fromFils(a.balance))}</div>
                  <div data-label="Due date" style={css('font-size: 14px; font-weight: 700; color: #37413A;')}>{new Date(a.dueDate).toLocaleDateString()}</div>
                  <div data-label="Status">
                    <span style={css(overdue ? 'display:inline-flex;background:#FFE8E5;color:#B3261E;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;' : 'display:inline-flex;background:#EEF0EC;color:#4C5850;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;')}>
                      {overdue ? 'Overdue' : 'Within terms'}
                    </span>
                  </div>
                  <div className="fc-act" style={css('display: flex; justify-content: flex-end;')}>
                    <button
                      onClick={() => setSettling(a)}
                      style={css(`background:${overdue ? '#B3261E' : GREEN};color:#FFFFFF;border:none;border-radius:11px;padding:11px 20px;font-size:14px;font-weight:800;cursor:pointer;`)}
                    >
                      Settle
                    </button>
                  </div>
                </div>
              )
            })}
          </StateBlock>
        </div>
      </StateBlock>

      {settling ? (
        <SettleModal
          account={settling}
          onClose={() => setSettling(null)}
          onSettled={() => {
            setSettling(null)
            reload()
          }}
        />
      ) : null}
    </div>
  )
}

function SettleModal({ account, onClose, onSettled }) {
  const toast = useToast()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { amount: fromFils(account.balance).toFixed(2) },
  })

  const confirmSettle = async (data) => {
    const fils = toFils(data.amount)
    try {
      await recordCreditPayment(account.customerId, fils)
      toast.success('Payment recorded')
      onSettled()
    } catch (e) {
      toast.error(e.message || 'Could not record this payment.')
    }
  }

  return (
    <div className="fc-backdrop" onClick={onClose} style={css('position: fixed; inset: 0; background: rgba(15,26,18,.42); display: flex; align-items: center; justify-content: center; z-index: 30;')}>
      <form onSubmit={handleSubmit(confirmSettle)} onClick={(e) => e.stopPropagation()} className="fc-modal" style={css('background: #FFFFFF; border-radius: 20px; padding: 26px; width: 360px; max-width: 90vw; display: flex; flex-direction: column; gap: 14px;')}>
        <div style={css('font-size: 18px; font-weight: 800;')}>Record payment</div>
        <div style={css('font-size: 13.5px; color: #7B857F; font-weight: 600;')}>{account.customer?.name} · outstanding {money(fromFils(account.balance))}</div>

        <Field label="Amount (AED)" error={errors.amount}>
          <input
            autoFocus
            style={{ ...inputStyle(errors.amount), fontSize: 18, fontWeight: 800 }}
            {...register('amount', {
              required: 'Enter an amount',
              validate: (v) => (Number.isFinite(toFils(v)) && toFils(v) > 0) || 'Enter a valid amount.',
            })}
          />
        </Field>

        <div style={css('display: flex; gap: 10px;')}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={css(`flex:1;background:${isSubmitting ? '#8FCE6C' : GREEN};color:#FFFFFF;border:none;border-radius:12px;padding:13px 16px;font-size:14.5px;font-weight:800;cursor:${isSubmitting ? 'default' : 'pointer'};`)}
          >
            {isSubmitting ? 'Recording…' : 'Record payment'}
          </button>
          <button type="button" onClick={onClose} style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 12px; padding: 13px 16px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
