import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { css } from '../lib/css'
import { chip } from '../lib/design'
import { STATUS_TO_LABEL } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { Field, inputStyle } from '../components/FormField'
import StateBlock from '../components/StateBlock'
import Select from '../components/Select'

const AVAIL_LABEL = { available: 'Available', on_delivery: 'On delivery', off_shift: 'Off shift' }

function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase()
}

export default function Staff() {
  const { hasGrade } = useAuth()
  const [adding, setAdding] = useState(false)

  const fetchAll = useCallback(async () => {
    const [riders, orders] = await Promise.all([
      api.get('/admin/staff?role=deliveryStaff'),
      api.get('/admin/orders?limit=100&fulfillment=delivery'),
    ])
    return { riders, orders: orders.items }
  }, [])

  const { data, loading, error, reload } = useFetch(fetchAll, [])

  const riders = data?.riders || []
  const orders = data?.orders || []

  const staff = riders.map((d) => {
    const avail = AVAIL_LABEL[d.availability] || 'Off shift'
    const c = avail === 'Available' ? ['#E6F6DE', '#2E7A12'] : avail === 'On delivery' ? ['#E1F0F5', '#0B5E86'] : ['#EEF0EC', '#7B857F']
    const myOrders = orders
      .filter((o) => o.rider?.userId === d.id && !['delivered', 'cancelled'].includes(o.status))
      .map((o) => ({ id: o.reference, who: o.customer?.name || 'Customer', status: STATUS_TO_LABEL[o.status] || o.status }))
    return {
      ...d,
      availStyle: `display:inline-flex;background:${c[0]};color:${c[1]};font-size:12.5px;font-weight:800;padding:7px 12px;border-radius:9px;`,
      orders: myOrders,
      active: myOrders.length,
      done: d.stats?.completedToday ?? 0,
      avg: d.stats?.avgMinutes ? `${d.stats.avgMinutes}m` : '—',
    }
  })

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div style={css('background: #F1EAFB; border: 1px solid #DCC9F5; border-radius: 16px; padding: 15px 20px; display: flex; align-items: center; gap: 14px;')}>
        <span style={css('width: 34px; height: 34px; border-radius: 10px; background: #7A4BD0; display: grid; place-items: center; flex: none;')}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15l2-5h12l2 5v3H4z" />
          </svg>
        </span>
        <div style={css('font-size: 14px; font-weight: 700; color: #4A2A85; flex: 1;')}>
          Orders are auto-assigned to the nearest available driver. Curbside pickups never consume a delivery person — staff hand them over at the bay.
        </div>
        {hasGrade('owner') ? (
          <button
            onClick={() => setAdding(true)}
            style={css('flex: none; background: #7A4BD0; color: #FFFFFF; border: none; border-radius: 11px; padding: 11px 18px; font-size: 13.5px; font-weight: 800; cursor: pointer;')}
          >
            + Add driver
          </button>
        ) : null}
      </div>

      <StateBlock loading={loading} error={error} onRetry={reload} empty={!loading && !error && staff.length === 0} emptyText="No delivery staff yet.">
        <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;')}>
          {staff.map((d) => (
            <div key={d.id} style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 20px 22px;')}>
              <div style={css('display: flex; align-items: center; gap: 14px;')}>
                <div style={css('width: 50px; height: 50px; border-radius: 50%; background: #F0F2EE; color: #37413A; display: grid; place-items: center; font-size: 16px; font-weight: 800;')}>{initialsOf(d.name)}</div>
                <div style={css('flex: 1;')}>
                  <div style={css('font-size: 18px; font-weight: 800; letter-spacing: -.3px;')}>{d.name}</div>
                  <div style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>{d.vehicle ? `${d.vehicle.type} · ${d.vehicle.plate}` : 'No vehicle on file'} · {d.phone}</div>
                </div>
                <span style={css(d.availStyle)}>{AVAIL_LABEL[d.availability] || 'Off shift'}</span>
              </div>

              <div className="fc-staffstats" style={css('display: flex; gap: 22px; margin: 18px 0; padding: 14px 0; border-top: 1px solid #F2F4F0; border-bottom: 1px solid #F2F4F0;')}>
                <div>
                  <div style={css('font-size: 11.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .4px;')}>Active</div>
                  <div style={css('font-size: 26px; font-weight: 800; letter-spacing: -.8px;')}>{d.active}</div>
                </div>
                <div>
                  <div style={css('font-size: 11.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .4px;')}>Delivered today</div>
                  <div style={css('font-size: 26px; font-weight: 800; letter-spacing: -.8px;')}>{d.done}</div>
                </div>
                <div>
                  <div style={css('font-size: 11.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .4px;')}>Avg time</div>
                  <div style={css('font-size: 26px; font-weight: 800; letter-spacing: -.8px;')}>{d.avg}</div>
                </div>
              </div>

              <div style={css('display: flex; flex-direction: column; gap: 8px;')}>
                {d.orders.length === 0 ? (
                  <div style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>No active deliveries right now.</div>
                ) : (
                  d.orders.map((o) => (
                    <div key={o.id} style={css('display: flex; align-items: center; gap: 12px; background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 12px; padding: 11px 14px;')}>
                      <span style={css('font-size: 13.5px; font-weight: 800;')}>#{o.id}</span>
                      <span style={css('font-size: 13.5px; font-weight: 600; color: #4C5850; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;')}>{o.who}</span>
                      <span style={css(chip(o.status))}>{o.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </StateBlock>

      {adding ? <AddDriverModal onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload() }} /> : null}
    </div>
  )
}

function AddDriverModal({ onClose, onSaved }) {
  const toast = useToast()
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', phone: '', plate: '', vehicleType: 'bike', password: '' },
  })

  const save = async (data) => {
    try {
      await api.post('/admin/staff', {
        role: 'deliveryStaff',
        name: data.name,
        phone: data.phone,
        password: data.password,
        vehicle: data.plate ? { type: data.vehicleType, plate: data.plate } : undefined,
      })
      toast.success('Driver added')
      onSaved()
    } catch (e) {
      toast.error(e.message || 'Could not add this driver.')
    }
  }

  return (
    <div className="fc-backdrop" onClick={onClose} style={css('position: fixed; inset: 0; background: rgba(15,26,18,.42); display: flex; align-items: center; justify-content: center; z-index: 30;')}>
      <form onSubmit={handleSubmit(save)} onClick={(e) => e.stopPropagation()} className="fc-modal" style={css('background: #FFFFFF; border-radius: 20px; padding: 26px; width: 380px; max-width: 90vw; display: flex; flex-direction: column; gap: 12px;')}>
        <div style={css('font-size: 18px; font-weight: 800;')}>Add delivery driver</div>

        <Field label="Full name" error={errors.name}>
          <input autoFocus style={inputStyle(errors.name)} placeholder="Full name" {...register('name', { required: 'Name is required' })} />
        </Field>

        <Field label="Phone" error={errors.phone}>
          <input style={inputStyle(errors.phone)} placeholder="+971 5X XXX XXXX" {...register('phone', { required: 'Phone is required' })} />
        </Field>

        <div style={css('display: flex; gap: 8px;')}>
          {/* Controller, not register: react-select renders a div, so RHF cannot
              read a value off it via a ref the way it does for a native input. */}
          <div style={css('flex: 1;')}>
            <Controller
              name="vehicleType"
              control={control}
              render={({ field }) => (
                <Select
                  ariaLabel="Vehicle type"
                  isSearchable={false}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Vehicle"
                  options={[
                    { value: 'bike', label: 'Bike' },
                    { value: 'van', label: 'Van' },
                    { value: 'car', label: 'Car' },
                  ]}
                />
              )}
            />
          </div>
          <input style={{ ...inputStyle(), flex: 1 }} placeholder="Plate (optional)" {...register('plate')} />
        </div>

        <Field label="Temporary password" error={errors.password} hint={!errors.password ? 'At least 8 characters.' : undefined}>
          <input
            type="password"
            style={inputStyle(errors.password)}
            placeholder="Temporary password"
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
          />
        </Field>

        <div style={css('display: flex; gap: 10px; margin-top: 6px;')}>
          <button type="submit" disabled={isSubmitting} style={css(`flex: 1; background: ${isSubmitting ? '#B79BE8' : '#7A4BD0'}; color: #FFFFFF; border: none; border-radius: 12px; padding: 13px 16px; font-size: 14.5px; font-weight: 800; cursor: ${isSubmitting ? 'default' : 'pointer'};`)}>
            {isSubmitting ? 'Adding…' : 'Add driver'}
          </button>
          <button type="button" onClick={onClose} style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 12px; padding: 13px 16px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
