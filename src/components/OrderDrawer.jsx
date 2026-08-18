import { useEffect, useState } from 'react'
import { css } from '../lib/css'
import { FLOWS, GREEN, chip, money } from '../lib/design'
import { decorate } from '../lib/orders'
import { fromFils, localized } from '../lib/adapt'
import { useToast } from '../lib/toast'
import { useDialogs } from '../lib/dialogs'
import { fetchDeliveryStaff } from '../lib/ordersData'

export default function OrderDrawer({ order, onClose, onAdvance, onCancel, onAssignRider }) {
  const toast = useToast()
  const { promptText } = useDialogs()
  const [busy, setBusy] = useState(false)

  if (!order) return null

  const cancelled = order.status === 'Cancelled'
  const flow = FLOWS[order.type]
  const at = flow.indexOf(order.status)
  const sel = decorate(order)
  const lines = order.raw?.lines || []
  const deliveryFeeAed = fromFils(order.raw?.deliveryFee ?? 0)
  const payLabel = { card: 'card', cash: 'cash', credit: 'shop credit' }[order.raw?.paymentKind] || 'card'

  const steps = flow.map((label, k) => ({
    label,
    mark: k < at ? '✓' : k === at ? '●' : '',
    dotStyle: `width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;${
      k < at
        ? 'background:#E6F6DE;color:#2E7A12;'
        : k === at
          ? `background:${GREEN};color:#FFFFFF;`
          : 'background:#F3F6F1;color:#B7BFB8;border:1px solid #EAEDE9;'
    }`,
    labelStyle: `font-size:15px;font-weight:${k === at ? 800 : 600};color:${k <= at ? '#14181A' : '#9AA39C'};`,
  }))

  const advance = async () => {
    setBusy(true)
    try {
      await onAdvance(sel.id)
    } catch (e) {
      toast.error(e.message || 'Could not update this order.')
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    const reason = await promptText({
      title: 'Cancel this order?',
      body: 'This tells the customer their order was cancelled. Give a short reason.',
      placeholder: 'Reason for cancelling',
      confirmLabel: 'Cancel order',
      cancelLabel: 'Never mind',
      tone: 'danger',
    })
    if (reason == null) return
    setBusy(true)
    try {
      await onCancel(sel.id, reason)
      toast.success('Order cancelled')
      onClose()
    } catch (e) {
      toast.error(e.message || 'Could not cancel this order.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={css('position: fixed; inset: 0; background: rgba(15,26,18,.42); display: flex; justify-content: flex-end; z-index: 20;')}>
      <div onClick={onClose} style={css('flex: 1;')} />
      <div
        className="fc-drawer"
        style={css('width: 520px; background: #FFFFFF; height: 100%; overflow: auto; padding: 26px 28px 32px; display: flex; flex-direction: column; gap: 20px; box-shadow: -20px 0 60px rgba(15,26,18,.18);')}
      >
        <div style={css('display: flex; align-items: flex-start; gap: 14px;')}>
          <div style={css('flex: 1;')}>
            <div style={css('font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;')}>
              Order #{sel.id} · {sel.time}
            </div>
            <div style={css('font-size: 26px; font-weight: 800; letter-spacing: -.7px; margin-top: 4px;')}>{sel.customer}</div>
            {order.customerPhone ? (
              <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>{order.customerPhone}</div>
            ) : null}
            <div style={css('display: flex; align-items: center; gap: 8px; margin-top: 10px;')}>
              <span style={css(sel.typeStyle)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={sel.typeIcon} />
                </svg>
                {sel.type}
              </span>
              <span style={css(chip(sel.status, true))}>{sel.status}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={css('background: #F3F6F1; border: none; border-radius: 12px; width: 40px; height: 40px; font-size: 18px; font-weight: 800; color: #4C5850; cursor: pointer;')}
          >
            ✕
          </button>
        </div>

        <div style={css('background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 16px; padding: 16px 18px; font-size: 14px; font-weight: 600; color: #4C5850; line-height: 1.5;')}>
          {sel.detail}
        </div>

        {cancelled ? (
          <div style={css('background: #FFF1EF; border: 1px solid #F3B4AC; border-radius: 16px; padding: 16px 18px; font-size: 14px; font-weight: 700; color: #B3261E;')}>
            This order was cancelled{order.raw?.cancelReason ? `: ${order.raw.cancelReason}` : '.'}
          </div>
        ) : (
          <div>
            <div style={css('font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;')}>
              {sel.type === 'Delivery' ? 'Home delivery flow' : 'Curbside pickup flow'}
            </div>
            <div style={css('display: flex; flex-direction: column; gap: 0; margin-top: 12px;')}>
              {steps.map((st) => (
                <div key={st.label} style={css('display: grid; grid-template-columns: 30px 1fr; gap: 12px; align-items: center; padding: 9px 0;')}>
                  <div style={css(st.dotStyle)}>{st.mark}</div>
                  <div style={css(st.labelStyle)}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sel.type === 'Delivery' && !cancelled ? (
          <DriverSection order={order} onAssignRider={onAssignRider} />
        ) : null}

        <div>
          <div style={css('font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;')}>
            {sel.items} items
          </div>
          <div style={css('display: flex; flex-direction: column; gap: 0; margin-top: 8px;')}>
            {lines.map((l) => (
              <div key={l.variantId} style={css('display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid #F2F4F0;')}>
                <span style={css('font-size: 13.5px; font-weight: 800; color: #7B857F; width: 28px;')}>{l.fulfilledQty ?? l.quantity}×</span>
                <span style={css('flex: 1; font-size: 14.5px; font-weight: 700;')}>
                  {localized(l.name)}
                  {localized(l.variantLabel) ? ` · ${localized(l.variantLabel)}` : ''}
                </span>
                <span style={css('font-size: 14.5px; font-weight: 800;')}>{money(fromFils(l.unitPrice) * (l.fulfilledQty ?? l.quantity))}</span>
              </div>
            ))}
          </div>
          <div style={css('display: flex; align-items: center; margin-top: 14px; font-size: 20px; font-weight: 800;')}>
            <span style={css('flex: 1;')}>Total</span>
            <span>{money(sel.total)}</span>
          </div>
          <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>
            {sel.type === 'Delivery'
              ? `Includes ${money(deliveryFeeAed)} delivery fee · paid by ${payLabel}`
              : `No delivery fee for curbside · paid by ${payLabel}`}
          </div>
        </div>

        {!cancelled ? (
          <div className="fc-drawer-cta" style={css('margin-top: auto; display: flex; gap: 10px;')}>
            <button
              onClick={advance}
              disabled={busy || !sel.canAdvance}
              style={css(
                `flex:1;background:${
                  sel.status === 'Customer Arrived' ? '#B3261E' : GREEN
                };color:#FFFFFF;border:none;border-radius:14px;padding:16px 20px;font-size:16px;font-weight:800;cursor:${busy ? 'default' : 'pointer'};opacity:${busy ? 0.7 : 1};`,
              )}
            >
              {busy ? 'Working…' : sel.next}
            </button>
            {(order.status === 'Placed' || order.status === 'Packed') && (
              <button
                onClick={cancel}
                disabled={busy}
                style={css('background: #FFFFFF; color: #B3261E; border: 1px solid #F3B4AC; border-radius: 14px; padding: 16px 20px; font-size: 15px; font-weight: 800; cursor: pointer;')}
              >
                Cancel order
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const AVAIL_LABEL = { available: 'Available', on_delivery: 'On delivery', off_shift: 'Off shift' }

/**
 * Assign or reassign the driver on a delivery order.
 *
 * Orders are normally auto-assigned by workload the moment they are placed,
 * so most of the time this only reports who got it. It matters when that
 * could not happen — every rider busy or off shift when the order came in —
 * which the server marks with `assignment.needsManualAssignment`. Those
 * orders are in nobody's app until they are placed by hand here, so the
 * warning below is the whole point of the section.
 *
 * Off-shift riders are still listed, greyed, rather than hidden: assigning to
 * one is a legitimate "you are back on, take this" and the server allows it.
 */
function DriverSection({ order, onAssignRider }) {
  const toast = useToast()
  const [staff, setStaff] = useState(null)
  const [picking, setPicking] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const rider = order.raw?.rider
  const assigned = Boolean(rider?.userId)
  const needsManual = Boolean(order.raw?.assignment?.needsManualAssignment)

  useEffect(() => {
    if (!picking || staff) return
    let cancelled = false
    fetchDeliveryStaff()
      .then((rows) => !cancelled && setStaff(rows))
      .catch(() => !cancelled && setStaff([]))
    return () => {
      cancelled = true
    }
  }, [picking, staff])

  const assign = async (member) => {
    setBusyId(member.id)
    try {
      await onAssignRider(order.id, member.id)
      toast.success(`Assigned to ${member.name}`)
      setPicking(false)
    } catch (e) {
      toast.error(e.message || 'Could not assign this driver.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div style={css('font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;')}>
        Driver
      </div>

      {needsManual && !assigned ? (
        <div style={css('background: #FFF6E2; border: 1px solid #E8CE8C; border-radius: 12px; padding: 12px 14px; margin-top: 8px; font-size: 13.5px; font-weight: 700; color: #7A5205; line-height: 1.45;')}>
          No driver was free when this order came in, so it was never assigned. It is not in anyone's
          delivery app until you assign it.
        </div>
      ) : null}

      <div style={css('display: flex; align-items: center; gap: 12px; margin-top: 10px;')}>
        <div style={css('flex: 1;')}>
          <div style={css('font-size: 15.5px; font-weight: 800;')}>
            {assigned ? localized(rider.name) : 'Not assigned'}
          </div>
          {assigned && rider.phone ? (
            <div style={css('font-size: 13px; font-weight: 600; color: #7B857F; margin-top: 2px;')}>{rider.phone}</div>
          ) : null}
        </div>
        <button
          onClick={() => setPicking((v) => !v)}
          style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 11px; padding: 10px 16px; font-size: 13.5px; font-weight: 800; cursor: pointer;')}
        >
          {picking ? 'Close' : assigned ? 'Reassign' : 'Assign driver'}
        </button>
      </div>

      {picking ? (
        <div style={css('margin-top: 10px; display: flex; flex-direction: column; gap: 8px;')}>
          {staff === null ? (
            <div style={css('font-size: 13.5px; font-weight: 600; color: #7B857F;')}>Loading drivers…</div>
          ) : staff.length === 0 ? (
            <div style={css('font-size: 13.5px; font-weight: 600; color: #7B857F;')}>
              No delivery staff yet. Add one on the Delivery Staff screen.
            </div>
          ) : (
            staff.map((m) => {
              const isCurrent = assigned && String(rider.userId) === String(m.id)
              return (
                <button
                  key={m.id}
                  onClick={() => assign(m)}
                  disabled={busyId !== null || isCurrent}
                  className="hv-row"
                  style={css(
                    `display:flex;align-items:center;gap:12px;text-align:left;background:#FAFBF9;` +
                      `border:1px solid ${isCurrent ? '#A9DE8F' : '#EFF1ED'};border-radius:12px;padding:11px 14px;` +
                      `cursor:${busyId !== null || isCurrent ? 'default' : 'pointer'};` +
                      `opacity:${m.availability === 'off_shift' && !isCurrent ? 0.62 : 1};`,
                  )}
                >
                  <span style={css('flex: 1; font-size: 14.5px; font-weight: 800;')}>
                    {m.name}
                    <span style={css('display:block;font-size:12.5px;font-weight:600;color:#7B857F;margin-top:2px;')}>
                      {AVAIL_LABEL[m.availability] || 'Off shift'}
                      {m.activeOrderIds?.length ? ` · ${m.activeOrderIds.length} in hand` : ''}
                    </span>
                  </span>
                  <span style={css(`font-size:13px;font-weight:800;color:${isCurrent ? '#2E7A12' : GREEN};`)}>
                    {busyId === m.id ? 'Assigning…' : isCurrent ? 'Current' : 'Assign'}
                  </span>
                </button>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  )
}
