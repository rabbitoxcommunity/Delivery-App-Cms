import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { fromFils, toFils } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useToast } from '../lib/toast'

const LABEL = 'font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;'
const CARD = 'background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;'
const HINT = 'font-size: 12.5px; color: #7B857F; font-weight: 600; margin-top: 6px;'

const field = (invalid) =>
  `width: 100%; padding: 15px 16px; border: 1px solid ${invalid ? '#E7998F' : '#E4EADF'}; border-radius: 12px; font-size: 16px; font-weight: 700; background: ${invalid ? '#FFFBFA' : '#FFFFFF'};`

/**
 * <input type="datetime-local"> speaks local wall-clock time with no zone,
 * while the API stores an instant. Converting through the local offset (rather
 * than slicing the ISO string, which is UTC) is what keeps "ends 11pm Friday"
 * meaning 11pm in the shop's own evening.
 */
function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null)

// Blank optional number inputs must send null, not 0 — 0 is a real cap meaning
// "nobody may ever use this", which is not what an empty box asks for.
const optionalInt = (value) => {
  const s = String(value ?? '').trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n) : null
}

export default function AddPromo() {
  const navigate = useNavigate()
  const toast = useToast()
  const { id: promoId } = useParams()
  const isEditing = Boolean(promoId)
  const onBack = () => navigate('/promos')

  const [discountType, setDiscountType] = useState('percent')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { code: '', value: '', minSubtotal: '', startsAt: '', endsAt: '', maxRedemptions: '', perCustomerCap: '' },
  })

  // There is no GET /admin/promos/:id — the admin API exposes the list only,
  // and it is a per-tenant list of tens of rows, so the edit screen reads that
  // and picks its row out rather than adding an endpoint for one lookup.
  const {
    data: existing,
    loading: loadingExisting,
    error: existingError,
  } = useFetch(
    () => (promoId ? api.get('/admin/promos').then((list) => list.find((p) => p.id === promoId) || null) : Promise.resolve(null)),
    [promoId],
  )

  useEffect(() => {
    if (!existing) return
    setDiscountType(existing.discountType)
    setActive(existing.active !== false)
    reset({
      code: existing.code || '',
      // Percent promos store percent points; fixed ones store fils.
      value: existing.discountType === 'percent' ? String(existing.value ?? '') : String(fromFils(existing.value)),
      minSubtotal: existing.minSubtotal != null ? String(fromFils(existing.minSubtotal)) : '',
      startsAt: toLocalInput(existing.startsAt),
      endsAt: toLocalInput(existing.endsAt),
      maxRedemptions: existing.maxRedemptions != null ? String(existing.maxRedemptions) : '',
      perCustomerCap: existing.perCustomerCap != null ? String(existing.perCustomerCap) : '',
    })
  }, [existing, reset])

  const codePreview = (watch('code') || '').toUpperCase().replace(/\s+/g, '')

  const save = async (data) => {
    const startsAt = fromLocalInput(data.startsAt)
    const endsAt = fromLocalInput(data.endsAt)
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setError('endsAt', { message: 'The end date must be after the start date.' })
      return
    }

    const rawValue = Number(data.value)
    const body = {
      code: data.code.trim().toUpperCase().replace(/\s+/g, ''),
      discountType,
      // percent → whole percent points as typed; fixed → AED in the box, fils on the wire.
      value: discountType === 'percent' ? Math.round(rawValue) : toFils(rawValue),
      minSubtotal: data.minSubtotal.trim() ? toFils(data.minSubtotal) : null,
      startsAt,
      endsAt,
      maxRedemptions: optionalInt(data.maxRedemptions),
      perCustomerCap: optionalInt(data.perCustomerCap),
      active,
    }

    setSaving(true)
    try {
      if (isEditing) await api.patch(`/admin/promos/${promoId}`, body)
      else await api.post('/admin/promos', body)
      toast.success(isEditing ? `${body.code} updated` : `${body.code} created`)
      onBack()
    } catch (err) {
      // The (tenantId, code) unique index is what rejects a duplicate — say so
      // on the field rather than as a generic "could not save".
      if (err.status === 409 || /duplicate|E11000/i.test(err.message || '')) {
        setError('code', { message: 'A promo code with this name already exists.' })
      } else {
        toast.error(err.message || 'Could not save this promo code.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px; max-width: 1080px;')}>
      <button className="hv-link" onClick={onBack} style={css('display: flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; border: none; padding: 0; font-size: 14px; font-weight: 800; color: #7B857F; cursor: pointer;')}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        Back to promo codes
      </button>

      {existingError || (isEditing && !loadingExisting && !existing) ? (
        <div style={css('background: #FFF1EF; border: 1px solid #F3B4AC; border-radius: 16px; padding: 24px; text-align: center; font-size: 14.5px; font-weight: 700; color: #B3261E;')}>
          {existingError?.message || 'This promo code could not be found.'}
        </div>
      ) : null}

      <div style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; align-items: start; ${loadingExisting ? 'opacity: .5; pointer-events: none;' : ''}`)}>
        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css(CARD)}>
            <div style={css('font-size: 17px; font-weight: 800;')}>The code</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>This is what customers type at checkout. Case doesn't matter — it is stored in capitals.</div>

            <div style={css('margin-top: 18px;')}>
              <div style={css(LABEL)}>Promo code</div>
              <input
                placeholder="e.g. WELCOME10"
                autoCapitalize="characters"
                spellCheck={false}
                style={{ ...css(field(errors.code)), fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.5px', textTransform: 'uppercase' }}
                {...register('code', {
                  required: 'A promo code is required.',
                  validate: (v) =>
                    /^[A-Za-z0-9-_]+$/.test(v.trim().replace(/\s+/g, '')) || 'Use letters, numbers, - and _ only — no spaces.',
                })}
              />
              {errors.code ? (
                <div className="fc-fade-up" style={css('font-size: 12px; font-weight: 700; color: #C0392B; margin-top: 5px;')}>{errors.code.message}</div>
              ) : (
                <div style={css(HINT)}>{codePreview ? `Customers will type: ${codePreview}` : 'Short codes are easier to say over the phone.'}</div>
              )}
            </div>
          </div>

          <div style={css(CARD)}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Discount</div>
            <div style={css('display: flex; gap: 8px; margin-top: 16px;')}>
              {[{ label: 'Percentage off', v: 'percent' }, { label: 'Fixed amount off', v: 'fixed' }].map((k) => (
                <button
                  type="button"
                  key={k.v}
                  onClick={() => setDiscountType(k.v)}
                  style={css(
                    discountType === k.v
                      ? `background:${GREEN};color:#FFFFFF;border:2px solid ${GREEN};border-radius:12px;padding:14px 18px;font-size:14.5px;font-weight:800;cursor:pointer;flex:1;`
                      : 'background:#FFFFFF;color:#7B857F;border:2px solid #EAEDE9;border-radius:12px;padding:14px 18px;font-size:14.5px;font-weight:700;cursor:pointer;flex:1;',
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <div style={css('margin-top: 16px;')}>
              <div style={css(LABEL)}>{discountType === 'percent' ? 'Percent off' : 'Amount off (AED)'}</div>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step={discountType === 'percent' ? '1' : '0.01'}
                placeholder={discountType === 'percent' ? '10' : '25.00'}
                style={css(field(errors.value))}
                {...register('value', {
                  required: 'Enter how much comes off.',
                  validate: (v) => {
                    const n = Number(v)
                    if (!Number.isFinite(n) || n <= 0) return 'Enter an amount greater than zero.'
                    if (discountType === 'percent' && n > 100) return 'A percentage cannot be more than 100.'
                    return true
                  },
                })}
              />
              {errors.value ? (
                <div className="fc-fade-up" style={css('font-size: 12px; font-weight: 700; color: #C0392B; margin-top: 5px;')}>{errors.value.message}</div>
              ) : (
                <div style={css(HINT)}>
                  {discountType === 'percent'
                    ? 'Taken off the basket subtotal, before the delivery fee.'
                    : 'Never more than the basket itself — a large fixed discount is capped at the subtotal, it does not pay for delivery.'}
                </div>
              )}
            </div>

            <div style={css('margin-top: 16px;')}>
              <div style={css(LABEL)}>Minimum basket (AED) — optional</div>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="Any basket size"
                style={css(field(false))}
                {...register('minSubtotal', {
                  validate: (v) => !v.trim() || Number(v) >= 0 || 'Enter a valid amount, or leave it blank.',
                })}
              />
              <div style={css(HINT)}>Below this subtotal the app tells the customer how much more to add.</div>
            </div>
          </div>
        </div>

        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css(CARD)}>
            <div style={css('font-size: 17px; font-weight: 800;')}>When it runs</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Leave both blank to run it until you turn it off.</div>
            <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 16px;')}>
              <div>
                <div style={css(LABEL)}>Starts</div>
                <input type="datetime-local" style={css(field(false))} {...register('startsAt')} />
              </div>
              <div>
                <div style={css(LABEL)}>Ends</div>
                <input type="datetime-local" style={css(field(errors.endsAt))} {...register('endsAt')} />
                {errors.endsAt ? (
                  <div className="fc-fade-up" style={css('font-size: 12px; font-weight: 700; color: #C0392B; margin-top: 5px;')}>{errors.endsAt.message}</div>
                ) : null}
              </div>
            </div>
          </div>

          <div style={css(CARD)}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Usage limits</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Blank means unlimited.</div>
            <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 16px;')}>
              <div>
                <div style={css(LABEL)}>Total redemptions</div>
                <input type="number" min="1" step="1" placeholder="Unlimited" style={css(field(false))} {...register('maxRedemptions')} />
                {isEditing && existing?.redemptions ? (
                  <div style={css(HINT)}>Used {existing.redemptions} time(s) so far.</div>
                ) : null}
              </div>
              <div>
                <div style={css(LABEL)}>Per customer</div>
                <input type="number" min="1" step="1" placeholder="Unlimited" style={css(field(false))} {...register('perCustomerCap')} />
                <div style={css(HINT)}>Counted against signed-in customers only.</div>
              </div>
            </div>
          </div>

          <div style={css(CARD)}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Status</div>
            <div style={css('display: flex; gap: 8px; margin-top: 16px;')}>
              {[{ label: 'Accepting', v: true }, { label: 'Turned off', v: false }].map((k) => (
                <button
                  type="button"
                  key={k.label}
                  onClick={() => setActive(k.v)}
                  style={css(
                    active === k.v
                      ? `background:${GREEN};color:#FFFFFF;border:2px solid ${GREEN};border-radius:12px;padding:14px 18px;font-size:14.5px;font-weight:800;cursor:pointer;flex:1;`
                      : 'background:#FFFFFF;color:#7B857F;border:2px solid #EAEDE9;border-radius:12px;padding:14px 18px;font-size:14.5px;font-weight:700;cursor:pointer;flex:1;',
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 10px;')}>A turned-off code is rejected at checkout, but keeps its history.</div>
          </div>

          <div className="fc-sticky" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px; position: sticky; top: 110px; display: flex; flex-direction: column; gap: 10px;')}>
            <button
              type="button"
              className="hv-green"
              disabled={saving}
              onClick={handleSubmit(save)}
              style={css(`background: ${saving ? '#8FCE6C' : '#47BB1C'}; color: #FFFFFF; border: none; border-radius: 14px; padding: 17px 20px; font-size: 16px; font-weight: 800; cursor: ${saving ? 'default' : 'pointer'};`)}
            >
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create promo code'}
            </button>
            <button type="button" onClick={onBack} style={css('background: transparent; color: #7B857F; border: none; padding: 10px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
