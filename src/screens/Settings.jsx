import { useCallback, useState } from 'react'
import { css } from '../lib/css'
import { localized } from '../lib/adapt'
import { api } from '../lib/api'
import { uploadImage } from '../lib/upload'
import { useFetch } from '../lib/useFetch'
import { useAuth } from '../lib/auth'
import StateBlock from '../components/StateBlock'

const PAYMENT_LABELS = { card: 'Card payments', credit: 'Shop credit (ledger)', cash: 'Cash' }

export default function Settings() {
  const { hasGrade } = useAuth()
  const canEdit = hasGrade('owner')

  const fetchAll = useCallback(async () => {
    const [config, methods] = await Promise.all([api.get('/admin/config'), api.get('/admin/payment-methods')])
    return { config, methods }
  }, [])

  const { data, loading, error, reload } = useFetch(fetchAll, [])
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [err, setErr] = useState('')

  if (loading || error) return <StateBlock loading={loading} error={error} onRetry={reload} />

  const { config, methods } = data

  const saveConfig = async (patch) => {
    setErr('')
    try {
      await api.put('/admin/config', patch)
      reload()
    } catch (e) {
      setErr(e.message || 'Could not save this change.')
    }
  }

  const onLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const logoUrl = await uploadImage(file, 'tenant-logo')
      await saveConfig({ branding: { logoUrl } })
    } catch (e) {
      setErr(e.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  const togglePayment = async (method) => {
    await api.patch(`/admin/payment-methods/${method.id}`, { enabled: !method.enabled })
    reload()
  }

  return (
    <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px; align-items: start;')}>
      {err ? (
        <div style={css('grid-column: 1 / -1; background: #FFF1EF; border: 1px solid #F3B4AC; color: #B3261E; border-radius: 12px; padding: 12px 14px; font-size: 13.5px; font-weight: 700;')}>{err}</div>
      ) : null}

      <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
        <div style={css('font-size: 17px; font-weight: 800;')}>Shop profile &amp; branding</div>
        <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 18px;')}>
          <div>
            <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Shop name</div>
            <input
              defaultValue={localized(config.name)}
              disabled={!canEdit}
              onBlur={(e) => {
                if (e.target.value !== localized(config.name)) saveConfig({ name: { en: e.target.value, ar: config.name?.ar || '' } })
              }}
              style={css('width: 100%; padding: 13px 14px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700;')}
            />
          </div>
          <div>
            <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Brand colour</div>
            <div style={css('display: flex; align-items: center; gap: 10px;')}>
              <span style={css(`width: 42px; height: 42px; border-radius: 12px; background: ${config.branding?.primaryHex || '#47BB1C'};`)} />
              <input
                defaultValue={config.branding?.primaryHex || '#47BB1C'}
                disabled={!canEdit}
                onBlur={(e) => {
                  if (e.target.value !== config.branding?.primaryHex) saveConfig({ branding: { primaryHex: e.target.value } })
                }}
                style={css('width: 130px; padding: 13px 14px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 800; font-family: ui-monospace, Menlo, monospace;')}
              />
              <span style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>used in the customer app too</span>
            </div>
          </div>
          <div>
            <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Logo</div>
            <div style={css('display: flex; align-items: center; gap: 12px;')}>
              <div style={css('width: 56px; height: 56px; border-radius: 16px; background: #47BB1C; display: grid; place-items: center; overflow: hidden;')}>
                {config.branding?.logoUrl ? (
                  <img src={config.branding.logoUrl} alt="" style={css('width: 100%; height: 100%; object-fit: cover;')} />
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 20c0-8 3-12 8-13 1 8-2 13-8 13Z" />
                    <path d="M12 20c-4 0-7-3-7-8 4 0 7 3 7 8Z" />
                  </svg>
                )}
              </div>
              {canEdit ? (
                <label style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 12px; padding: 12px 16px; font-size: 14px; font-weight: 800; color: #37413A; cursor: pointer;')}>
                  {uploadingLogo ? 'Uploading…' : 'Replace logo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onLogo} disabled={uploadingLogo} style={css('display: none;')} />
                </label>
              ) : null}
            </div>
          </div>
          <div>
            <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Default language</div>
            <div style={css('display: flex; gap: 8px;')}>
              {[{ v: 'en', label: 'English' }, { v: 'ar', label: 'العربية' }].map((l) => {
                const active = config.locale?.defaultLanguage === l.v
                return (
                  <button
                    key={l.v}
                    disabled={!canEdit}
                    onClick={() => saveConfig({ locale: { defaultLanguage: l.v } })}
                    style={css(
                      active
                        ? 'background: #47BB1C; color: #FFFFFF; border: none; border-radius: 11px; padding: 12px 18px; font-size: 14px; font-weight: 800; cursor: pointer;'
                        : 'background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 11px; padding: 12px 18px; font-size: 14px; font-weight: 800; cursor: pointer;',
                    )}
                  >
                    {l.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
          <div style={css('font-size: 17px; font-weight: 800;')}>Payments</div>
          <div style={css('display: flex; flex-direction: column; gap: 10px; margin-top: 16px;')}>
            {methods.map((p) => (
              <div key={p.id} style={css('display: flex; align-items: center; gap: 12px; background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 12px; padding: 14px 16px;')}>
                <div style={css('flex: 1;')}>
                  <div style={css('font-size: 14.5px; font-weight: 800;')}>{PAYMENT_LABELS[p.kind] || localized(p.title)}</div>
                  <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600;')}>
                    {p.availableFor?.join(' & ') || 'delivery & curbside'}
                    {p.requiresCreditApproval ? ' · approved customers only' : ''}
                  </div>
                </div>
                <button
                  onClick={() => canEdit && togglePayment(p)}
                  disabled={!canEdit}
                  style={css(
                    p.enabled
                      ? 'background:#E6F6DE;color:#2E7A12;font-size:12.5px;font-weight:800;padding:7px 12px;border-radius:9px;border:none;cursor:pointer;'
                      : 'background:#EEF0EC;color:#7B857F;font-size:12.5px;font-weight:800;padding:7px 12px;border-radius:9px;border:none;cursor:pointer;',
                  )}
                >
                  {p.enabled ? 'Active' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
          <div style={css('font-size: 17px; font-weight: 800;')}>Delivery &amp; curbside</div>
          <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 16px;')}>
            <div>
              <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Delivery fee (AED)</div>
              <input
                defaultValue={((config.settings?.deliveryFee ?? 0) / 100).toFixed(2)}
                disabled={!canEdit}
                onBlur={(e) => {
                  const fils = Math.round(Number(e.target.value) * 100)
                  if (Number.isFinite(fils)) saveConfig({ settings: { deliveryFee: fils } })
                }}
                style={css('width: 100%; padding: 13px 14px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700;')}
              />
            </div>
            <div>
              <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Delivery ETA (minutes)</div>
              <input
                defaultValue={config.settings?.deliveryEtaMinutes ?? 30}
                disabled={!canEdit}
                onBlur={(e) => {
                  const v = Number(e.target.value)
                  if (Number.isFinite(v)) saveConfig({ settings: { deliveryEtaMinutes: v } })
                }}
                style={css('width: 100%; padding: 13px 14px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700;')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
