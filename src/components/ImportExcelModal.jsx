import { useCallback, useEffect, useRef, useState } from 'react'
import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { api } from '../lib/api'
import { useToast } from '../lib/toast'

/**
 * §17 Excel import — the five server steps behind one wizard:
 *   sign → PUT to storage → register batch → map columns → validate → commit.
 *
 * The commit is queued and processed by a background worker, so the last step
 * polls the batch rather than waiting on the request.
 */

const REQUIRED = [
  ['nameEn', 'Product name (English)'],
  ['nameAr', 'Product name (Arabic)'],
  ['category', 'Category'],
  ['price', 'Price'],
]
const OPTIONAL = [
  ['barcode', 'Barcode'],
  ['productKey', 'Product key (groups variants)'],
  ['variantAttribute', 'Variant attribute'],
  ['icon', 'Icon'],
  ['imageUrl', 'Image URL'],
]

const ACCEPT = '.csv,.xls,.xlsx'
const SPREADSHEET_TYPES = {
  csv: 'text/csv',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

/** Best-effort column guess so a well-formed sheet needs no manual mapping. */
function guessColumn(headers, field) {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z]/g, '')
  const wanted = {
    nameEn: ['nameen', 'englishname', 'name', 'product', 'productname', 'title'],
    nameAr: ['namear', 'arabicname', 'arabic'],
    category: ['category', 'categoryname', 'cat'],
    price: ['price', 'sellingprice', 'unitprice', 'amount'],
    barcode: ['barcode', 'ean', 'upc', 'sku'],
    productKey: ['productkey', 'key', 'group', 'parent'],
    variantAttribute: ['variant', 'variantattribute', 'size', 'flavour', 'flavor'],
    icon: ['icon'],
    imageUrl: ['imageurl', 'image', 'photo', 'picture'],
  }[field]
  return headers.find((h) => wanted?.includes(norm(h))) || ''
}

const label = css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')
const select = css('width: 100%; padding: 11px 12px; border: 1px solid #E4EADF; border-radius: 10px; font-size: 14px; font-weight: 700; background: #FFFFFF; color: #14181A;')

export default function ImportExcelModal({ onClose, onImported }) {
  const toast = useToast()
  const [step, setStep] = useState('upload') // upload | map | review | importing | done
  const [busy, setBusy] = useState(false)
  const [batch, setBatch] = useState(null)
  const [mapping, setMapping] = useState({})
  const [validRowCount, setValidRowCount] = useState(0)
  const pollRef = useRef(null)

  useEffect(() => () => clearInterval(pollRef.current), [])

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    const contentType = SPREADSHEET_TYPES[ext]
    if (!contentType) {
      toast.error('Choose a .csv, .xls or .xlsx file.')
      return
    }

    setBusy(true)
    try {
      // 1 — presigned PUT straight to storage; the file never goes through our API.
      const { url, fileUrl } = await api.post('/admin/import/sign', { contentType })
      // An unreachable storage host makes fetch REJECT rather than return
      // !ok, so a bare "Failed to fetch" would surface to the shop owner —
      // true, but useless. Translate both failure shapes into one message
      // that says where to actually look.
      let put
      try {
        put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file })
      } catch {
        throw new Error('Could not reach file storage. Check that the storage service is running.')
      }
      if (!put.ok) throw new Error(`Storage rejected the upload (${put.status}).`)

      // 2 — register the batch; the server reads the headers and a preview back out.
      const created = await api.post('/admin/import/upload', { fileUrl, originalName: file.name })
      setBatch(created)
      setMapping(
        Object.fromEntries(
          [...REQUIRED, ...OPTIONAL].map(([field]) => [field, guessColumn(created.headers || [], field)]),
        ),
      )
      setStep('map')
    } catch (err) {
      toast.error(err.message || 'Could not read that file.')
    } finally {
      setBusy(false)
    }
  }

  const saveMappingAndValidate = async () => {
    const missing = REQUIRED.filter(([field]) => !mapping[field]).map(([, text]) => text)
    if (missing.length) {
      toast.error(`Map a column for: ${missing.join(', ')}`)
      return
    }
    setBusy(true)
    try {
      // Drop unset optional fields — the server's schema expects strings, not nulls.
      const columnMap = Object.fromEntries(Object.entries(mapping).filter(([, v]) => v))
      await api.post(`/admin/import/${batch.id}/mapping`, columnMap)
      const result = await api.post(`/admin/import/${batch.id}/validate`)
      setBatch(result.batch)
      setValidRowCount(result.validRowCount ?? 0)
      setStep('review')
    } catch (err) {
      toast.error(err.message || 'Could not validate this file.')
    } finally {
      setBusy(false)
    }
  }

  const poll = useCallback(
    (id) => {
      clearInterval(pollRef.current)
      pollRef.current = setInterval(async () => {
        try {
          const latest = await api.get(`/admin/import/${id}`)
          setBatch(latest)
          if (latest.status === 'done' || latest.status === 'failed') {
            clearInterval(pollRef.current)
            setStep('done')
            if (latest.status === 'done') {
              toast.success(`Imported ${latest.stats?.created ?? 0} product(s)`)
              onImported?.()
            } else {
              toast.error('The import failed. See the row errors below.')
            }
          }
        } catch {
          // Transient poll failure — the next tick retries.
        }
      }, 1500)
    },
    [onImported, toast],
  )

  const commit = async () => {
    setBusy(true)
    try {
      await api.post(`/admin/import/${batch.id}/commit`)
      setStep('importing')
      poll(batch.id) // the commit runs on a background worker (§17)
    } catch (err) {
      toast.error(err.message || 'Could not start the import.')
    } finally {
      setBusy(false)
    }
  }

  const errors = batch?.rowErrors || []
  const stats = batch?.stats || {}

  return (
    <div
      className="fc-backdrop"
      onClick={step === 'importing' ? undefined : onClose}
      style={css('position: fixed; inset: 0; background: rgba(15,26,18,.42); display: flex; align-items: center; justify-content: center; z-index: 30; padding: 20px;')}
    >
      <div
        className="fc-modal"
        onClick={(e) => e.stopPropagation()}
        style={css('background: #FFFFFF; border-radius: 20px; padding: 26px; width: 640px; max-width: 100%; max-height: 86vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;')}
      >
        <div>
          <div style={css('font-size: 19px; font-weight: 800;')}>Import products from Excel</div>
          <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>
            {step === 'upload' && 'Choose a .csv or .xlsx file. Nothing is created until you confirm.'}
            {step === 'map' && `Match your columns to the product fields — ${batch?.originalName}`}
            {step === 'review' && 'Check what will be imported before committing.'}
            {step === 'importing' && 'Importing in the background — you can watch the progress here.'}
            {step === 'done' && (batch?.status === 'done' ? 'Import finished.' : 'Import failed.')}
          </div>
        </div>

        {step === 'upload' && (
          <label
            style={css('border: 2px dashed #D8E0D3; border-radius: 16px; padding: 34px; text-align: center; cursor: pointer; background: #FAFBF9;')}
          >
            <div style={css('font-size: 15px; font-weight: 800; color: #37413A;')}>
              {busy ? 'Reading file…' : 'Choose a spreadsheet'}
            </div>
            <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600; margin-top: 5px;')}>
              .csv, .xls or .xlsx — first row must be the column headers
            </div>
            <input type="file" accept={ACCEPT} onChange={onFile} disabled={busy} style={css('display: none;')} />
          </label>
        )}

        {step === 'map' && (
          <>
            <div style={css('display: grid; grid-template-columns: 1fr 1fr; gap: 12px;')}>
              {[...REQUIRED, ...OPTIONAL].map(([field, text]) => {
                const required = REQUIRED.some(([f]) => f === field)
                return (
                  <div key={field}>
                    <div style={label}>
                      {text}
                      {required ? <span style={css('color: #B3261E;')}> *</span> : null}
                    </div>
                    <select
                      value={mapping[field] || ''}
                      onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value }))}
                      style={select}
                    >
                      <option value="">— not mapped —</option>
                      {(batch?.headers || []).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
            <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600;')}>
              {stats.rows ?? 0} row(s) found. Columns are pre-matched by name where possible.
            </div>
          </>
        )}

        {(step === 'review' || step === 'importing' || step === 'done') && (
          <>
            <div style={css('display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;')}>
              {[
                ['Rows in file', stats.rows ?? 0, '#14181A'],
                [step === 'review' ? 'Ready to import' : 'Created', step === 'review' ? validRowCount : stats.created ?? 0, '#2E7A12'],
                ['With errors', stats.errored ?? 0, (stats.errored ?? 0) > 0 ? '#B3261E' : '#7B857F'],
              ].map(([text, value, colour]) => (
                <div key={text} style={css('background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 12px; padding: 12px 14px;')}>
                  <div style={css('font-size: 11.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .4px;')}>{text}</div>
                  <div style={css(`font-size: 24px; font-weight: 800; color: ${colour}; margin-top: 2px;`)}>{value}</div>
                </div>
              ))}
            </div>

            {errors.length > 0 && (
              <div style={css('border: 1px solid #F3B4AC; background: #FFF8F7; border-radius: 12px; max-height: 220px; overflow-y: auto;')}>
                {errors.slice(0, 100).map((e, i) => (
                  <div key={i} style={css('display: flex; gap: 10px; padding: 9px 13px; border-top: 1px solid #FBE4E1; font-size: 12.5px; font-weight: 600; color: #96423B;')}>
                    <span style={css('font-weight: 800; flex: none;')}>Row {e.row}</span>
                    {e.column ? <span style={css('flex: none; color: #B3261E;')}>{e.column}</span> : null}
                    <span>{e.message}</span>
                  </div>
                ))}
                {errors.length > 100 ? (
                  <div style={css('padding: 9px 13px; font-size: 12px; font-weight: 700; color: #96423B;')}>
                    …and {errors.length - 100} more
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}

        <div style={css('display: flex; gap: 10px; margin-top: 4px;')}>
          {step === 'map' && (
            <button
              onClick={saveMappingAndValidate}
              disabled={busy}
              className="hv-green"
              style={css(`flex: 1; background: ${busy ? '#8FCE6C' : GREEN}; color: #FFFFFF; border: none; border-radius: 12px; padding: 13px 16px; font-size: 14.5px; font-weight: 800; cursor: ${busy ? 'default' : 'pointer'};`)}
            >
              {busy ? 'Validating…' : 'Validate'}
            </button>
          )}
          {step === 'review' && (
            <button
              onClick={commit}
              disabled={busy || validRowCount === 0}
              className="hv-green"
              style={css(`flex: 1; background: ${busy || validRowCount === 0 ? '#8FCE6C' : GREEN}; color: #FFFFFF; border: none; border-radius: 12px; padding: 13px 16px; font-size: 14.5px; font-weight: 800; cursor: ${busy || validRowCount === 0 ? 'default' : 'pointer'};`)}
            >
              {validRowCount === 0 ? 'Nothing valid to import' : `Import ${validRowCount} product(s)`}
            </button>
          )}
          {step === 'importing' && (
            <div style={css('flex: 1; text-align: center; font-size: 14px; font-weight: 800; color: #7B857F; padding: 13px;')}>
              Importing… ({batch?.status})
            </div>
          )}
          <button
            onClick={onClose}
            disabled={step === 'importing'}
            style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 12px; padding: 13px 18px; font-size: 14.5px; font-weight: 800; color: #4C5850; cursor: ${step === 'importing' ? 'default' : 'pointer'};`)}
          >
            {step === 'done' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
