import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { css } from '../lib/css'
import { fromFils, toFils } from '../lib/adapt'
import { api } from '../lib/api'
import { uploadImage } from '../lib/upload'
import { useFetch } from '../lib/useFetch'
import { useToast } from '../lib/toast'
import Select from '../components/Select'

const ACCENTS = ['#47BB1C', '#E39A0B', '#B3261E']
const STOCK_TO_STATE = { available: 'Available', low: 'Low Stock', out: 'Out of Stock' }
const STATE_TO_STOCK = { Available: 'available', 'Low Stock': 'low', 'Out of Stock': 'out' }
// Pill colours for the variant stock control, keyed by the same display
// strings the form already stores.
const STOCK_TONE = {
  Available: { bg: '#E6F6DE', fg: '#2E7A12' },
  'Low Stock': { bg: '#FFF6E2', fg: '#7A5205' },
  'Out of Stock': { bg: '#FFE8E5', fg: '#B3261E' },
}

let variantKeySeed = 0
const nextKey = () => `v${variantKeySeed++}`

export default function AddProduct() {
  const navigate = useNavigate()
  const toast = useToast()
  const { id: productId } = useParams()
  const onBack = () => navigate('/products')
  const [newState, onNewState] = useState('Available')
  const isEditing = Boolean(productId)
  const barcodeRef = useRef(null)

  const { data: categories } = useFetch(() => api.get('/admin/categories').then((r) => r.items), [])
  const {
    data: existing,
    loading: loadingExisting,
    error: existingError,
  } = useFetch(() => (productId ? api.get(`/admin/products/${productId}`) : Promise.resolve(null)), [productId])

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { nameEn: '', nameAr: '' } })

  const [categoryId, setCategoryId] = useState('')
  const [barcode, setBarcode] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [icon, setIcon] = useState('p-water')
  const [imageUrl, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [published, setPublished] = useState(true)
  const [variants, setVariants] = useState([])
  const [saving, setSaving] = useState(false)

  // Prefill when editing an existing product.
  useEffect(() => {
    if (!existing) return
    reset({ nameEn: existing.name?.en || '', nameAr: existing.name?.ar || '' })
    setCategoryId(existing.categoryId || '')
    setIcon(existing.icon || 'p-water')
    setImageUrl(existing.imageUrl || null)
    setPublished(existing.status === 'published')
    const [first, ...rest] = existing.variants || []
    if (first) {
      setBarcode(first.barcode || '')
      setPrice(fromFils(first.price).toFixed(2))
      setComparePrice(first.compareAtPrice != null ? fromFils(first.compareAtPrice).toFixed(2) : '')
      onNewState(STOCK_TO_STATE[first.stock] || 'Available')
    }
    setVariants(
      rest.map((v) => ({
        key: nextKey(),
        id: v.id,
        labelEn: v.label?.en || '',
        labelAr: v.label?.ar || '',
        price: fromFils(v.price).toFixed(2),
        stock: STOCK_TO_STATE[v.stock] || 'Available',
      })),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing])

  const addVariant = () => {
    setVariants((v) => [...v, { key: nextKey(), labelEn: '', labelAr: '', price: price || '0.00', stock: 'Available' }])
  }
  const updateVariant = (key, patch) => {
    setVariants((v) => v.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }
  const removeVariant = (key) => {
    setVariants((v) => v.filter((row) => row.key !== key))
  }

  const onUploadPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, 'product-image')
      setImageUrl(url)
    } catch (err) {
      toast.error(err.message || 'Could not upload this photo.')
    } finally {
      setUploading(false)
    }
  }

  const buildPayload = (data) => ({
    categoryId: categoryId || null,
    name: { en: data.nameEn, ar: data.nameAr },
    subtitle: { en: '', ar: '' },
    icon,
    imageUrl,
    status: published ? 'published' : 'draft',
    variants: [
      { barcode: barcode || null, price: toFils(price || 0), compareAtPrice: comparePrice ? toFils(comparePrice) : null, stock: STATE_TO_STOCK[newState] },
      ...variants.map((v) => ({
        label: { en: v.labelEn, ar: v.labelAr },
        price: toFils(v.price || 0),
        stock: STATE_TO_STOCK[v.stock],
      })),
    ],
  })

  const save = async (data, andAddAnother) => {
    setSaving(true)
    try {
      const payload = buildPayload(data)
      if (isEditing) {
        await api.patch(`/admin/products/${productId}`, payload)
      } else {
        await api.post('/admin/products', payload)
      }
      toast.success(isEditing ? 'Product updated' : 'Product created')
      if (andAddAnother) {
        reset({ nameEn: '', nameAr: '' })
        setBarcode('')
        setPrice('')
        setComparePrice('')
        setImageUrl(null)
        setVariants([])
        onNewState('Available')
      } else {
        onBack()
      }
    } catch (err) {
      toast.error(err.message || 'Could not save this product.')
    } finally {
      setSaving(false)
    }
  }

  if (productId && loadingExisting) {
    return <div style={css('padding: 40px; text-align: center; color: #7B857F; font-weight: 700;')}>Loading product…</div>
  }

  // A stale bookmark, browser back/forward, or a hand-edited URL can point at
  // a product that's been deleted since — surface that plainly instead of
  // silently rendering a blank "new product" form under an Edit heading.
  if (productId && existingError) {
    return (
      <div style={css('display: flex; flex-direction: column; gap: 16px; max-width: 640px;')}>
        <button className="hv-link" onClick={onBack} style={css('display: flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; border: none; padding: 0; font-size: 14px; font-weight: 800; color: #7B857F; cursor: pointer;')}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
          Back to products
        </button>
        <div style={css('background: #FFF1EF; border: 1px solid #F3B4AC; border-radius: 16px; padding: 24px; text-align: center;')}>
          <div style={css('font-size: 15px; font-weight: 800; color: #B3261E;')}>Couldn't find this product</div>
          <div style={css('font-size: 13.5px; color: #96423B; font-weight: 600; margin-top: 6px;')}>
            {existingError.message || 'It may have been deleted.'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px; max-width: 1240px;')}>
      <button className="hv-link" onClick={onBack} style={css('display: flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; border: none; padding: 0; font-size: 14px; font-weight: 800; color: #7B857F; cursor: pointer;')}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        Back to products
      </button>

      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; align-items: start;')}>
        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Product details</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Both names are shown to customers — Arabic is required to publish.</div>
            <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 18px;')}>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Product name (English)</div>
                <input
                  placeholder="e.g. Almarai Fresh Milk 2L"
                  style={css(`width: 100%; padding: 15px 16px; border: 1px solid ${errors.nameEn ? '#E7998F' : '#E4EADF'}; border-radius: 12px; font-size: 16px; font-weight: 700; background: ${errors.nameEn ? '#FFFBFA' : '#FFFFFF'};`)}
                  {...register('nameEn', { required: 'Product name (English) is required.' })}
                />
                {errors.nameEn ? <div className="fc-fade-up" style={css('font-size: 12px; font-weight: 700; color: #C0392B; margin-top: 5px;')}>{errors.nameEn.message}</div> : null}
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>اسم المنتج (Arabic)</div>
                <input
                  dir="rtl"
                  placeholder="مثال: ألمراي حليب طازج ٢ لتر"
                  style={css(`width: 100%; padding: 15px 16px; border: 1px solid ${errors.nameAr ? '#E7998F' : '#E4EADF'}; border-radius: 12px; font-size: 16px; font-weight: 700; background: ${errors.nameAr ? '#FFFBFA' : '#FFFFFF'};`)}
                  {...register('nameAr', {
                    validate: (v) => (published && !v.trim() ? 'Arabic name is required to publish — save as draft instead, or fill it in.' : true),
                  })}
                />
                {errors.nameAr ? <div className="fc-fade-up" style={css('font-size: 12px; font-weight: 700; color: #C0392B; margin-top: 5px;')}>{errors.nameAr.message}</div> : null}
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Category</div>
                <Select
                  ariaLabel="Category"
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder="Uncategorised"
                  options={[
                    { value: '', label: 'Uncategorised' },
                    ...(categories || []).map((c) => ({ value: c.id, label: c.name?.en })),
                  ]}
                />
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Barcode</div>
                <div style={css('display: flex; gap: 10px;')}>
                  <input
                    ref={barcodeRef}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Type or scan the barcode"
                    style={css('flex: 1 1 200px; min-width: 0; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700; font-family: ui-monospace, Menlo, monospace;')}
                  />
                  <button
                    type="button"
                    className="hv-dark"
                    onClick={() => barcodeRef.current?.focus()}
                    title="Focuses the field — a USB or Bluetooth barcode scanner types straight into it"
                    style={css('display: flex; align-items: center; gap: 9px; background: #0F1A12; color: #FFFFFF; border: none; border-radius: 12px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer; flex: 0 0 auto;')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6v12M8 6v12M12 6v12M16 6v12M20 6v12" /></svg>
                    Scan
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Price</div>
            <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 18px;')}>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Selling price</div>
                <div style={css('display: flex; align-items: center; gap: 8px; border: 1px solid #E4EADF; border-radius: 12px; padding: 0 14px; background: #FFFFFF;')}>
                  <span style={css('font-size: 13.5px; font-weight: 800; color: #7B857F;')}>AED</span>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" style={css('flex: 1; min-width: 0; border: none; padding: 15px 0; font-size: 20px; font-weight: 800; background: transparent;')} />
                </div>
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Was price (optional)</div>
                <div style={css('display: flex; align-items: center; gap: 8px; border: 1px solid #E4EADF; border-radius: 12px; padding: 0 14px; background: #FFFFFF;')}>
                  <span style={css('font-size: 13.5px; font-weight: 800; color: #7B857F;')}>AED</span>
                  <input value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0.00" style={css('flex: 1; min-width: 0; border: none; padding: 15px 0; font-size: 20px; font-weight: 800; background: transparent;')} />
                </div>
              </div>
            </div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 10px;')}>Adding a "was" price shows a green offer tag in the customer app.</div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('display: flex; align-items: center; gap: 10px;')}>
              <div>
                <div style={css('font-size: 17px; font-weight: 800;')}>Variants</div>
                <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Flavours or sizes of the same product — customers pick one.</div>
              </div>
              <button type="button" className="hv-violet" onClick={addVariant} style={css('margin-left: auto; background: #F1EAFB; color: #5A31A8; border: none; border-radius: 11px; padding: 11px 16px; font-size: 13.5px; font-weight: 800; cursor: pointer;')}>+ Add variant</button>
            </div>
            <div style={css('display: flex; flex-direction: column; gap: 10px; margin-top: 16px;')}>
              {variants.map((v) => (
                <div key={v.key} className="fc-fade-up" style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 10px; background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 14px; padding: 12px 14px;')}>
                  <input
                    value={v.labelEn}
                    onChange={(e) => updateVariant(v.key, { labelEn: e.target.value })}
                    placeholder="e.g. Sugarfree 250ml"
                    style={css('flex: 1 1 180px; min-width: 0; border: 1px solid #E4EADF; background: #FFFFFF; border-radius: 10px; padding: 11px 12px; font-size: 14.5px; font-weight: 700;')}
                  />
                  <input
                    value={v.labelAr}
                    onChange={(e) => updateVariant(v.key, { labelAr: e.target.value })}
                    dir="rtl"
                    placeholder="بدون سكر"
                    style={css('flex: 1 1 160px; min-width: 0; border: 1px solid #E4EADF; background: #FFFFFF; border-radius: 10px; padding: 11px 12px; font-size: 14.5px; font-weight: 600; color: #4C5850;')}
                  />
                  <input
                    value={v.price}
                    onChange={(e) => updateVariant(v.key, { price: e.target.value })}
                    style={css('width: 92px; flex: 0 0 auto; border: 1px solid #E4EADF; background: #FFFFFF; border-radius: 10px; padding: 11px 12px; font-size: 14.5px; font-weight: 800;')}
                  />
                  <div style={css('flex: 0 0 auto; width: 150px;')}>
                    <Select
                      variant="tone"
                      ariaLabel="Variant stock"
                      isSearchable={false}
                      value={v.stock}
                      onChange={(next) => updateVariant(v.key, { stock: next })}
                      tone={STOCK_TONE[v.stock] || STOCK_TONE.Available}
                      options={[
                        { value: 'Available', label: 'Available' },
                        { value: 'Low Stock', label: 'Low Stock' },
                        { value: 'Out of Stock', label: 'Out of Stock' },
                      ]}
                    />
                  </div>
                  <button type="button" onClick={() => removeVariant(v.key)} style={css('flex: 0 0 auto; background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; width: 40px; height: 40px; font-size: 15px; font-weight: 800; color: #B3261E; cursor: pointer;')}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Photo</div>
            {imageUrl ? (
              <div style={css('margin-top: 16px; border-radius: 16px; overflow: hidden; height: 210px;')}>
                <img src={imageUrl} alt="" style={css('width: 100%; height: 100%; object-fit: cover;')} />
              </div>
            ) : (
              <div style={css('margin-top: 16px; border: 2px dashed #D8E0D3; border-radius: 16px; height: 210px; display: grid; place-items: center; background: repeating-linear-gradient(135deg,#F7F9F5 0 8px,#F1F4EE 8px 16px);')}>
                <div style={css('text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center;')}>
                  <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; color: #7B857F;')}>product shot · 1:1 · min 800×800</span>
                </div>
              </div>
            )}
            <label style={css('display: inline-block; margin-top: 10px; background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 11px; padding: 11px 18px; font-size: 14px; font-weight: 800; color: #37413A; cursor: pointer;')}>
              {uploading ? 'Uploading…' : imageUrl ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onUploadPhoto} disabled={uploading} style={css('display: none;')} />
            </label>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Availability</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Staff can flip this any time from Quick Stock.</div>
            <div style={css('display: flex; gap: 8px; margin-top: 16px;')}>
              {['Available', 'Low Stock', 'Out of Stock'].map((k, i) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => onNewState(k)}
                  style={css(
                    newState === k
                      ? `background:${ACCENTS[i]};color:#FFFFFF;border:2px solid ${ACCENTS[i]};border-radius:12px;padding:14px 16px;font-size:14.5px;font-weight:800;cursor:pointer;flex:1;`
                      : 'background:#FFFFFF;color:#7B857F;border:2px solid #EAEDE9;border-radius:12px;padding:14px 16px;font-size:14.5px;font-weight:700;cursor:pointer;flex:1;',
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="fc-sticky" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px; position: sticky; top: 110px;')}>
            <div style={css('display: flex; align-items: center; gap: 12px;')}>
              <div style={css('flex: 1;')}>
                <div style={css('font-size: 15px; font-weight: 800;')}>Show in customer app</div>
                <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>Publishes immediately after saving.</div>
              </div>
              <button
                type="button"
                onClick={() => setPublished((p) => !p)}
                style={css(`flex: 0 0 auto; width: 52px; height: 30px; border-radius: 999px; background: ${published ? '#47BB1C' : '#D8E0D3'}; display: flex; align-items: center; justify-content: ${published ? 'flex-end' : 'flex-start'}; padding: 3px; border: none; cursor: pointer;`)}
              >
                <span style={css('width: 24px; height: 24px; border-radius: 50%; background: #FFFFFF;')} />
              </button>
            </div>
            <div style={css('display: flex; flex-direction: column; gap: 10px; margin-top: 20px;')}>
              <button
                type="button"
                className="hv-green"
                disabled={saving}
                onClick={handleSubmit((data) => save(data, false))}
                style={css(`background: ${saving ? '#8FCE6C' : '#47BB1C'}; color: #FFFFFF; border: none; border-radius: 14px; padding: 17px 20px; font-size: 16px; font-weight: 800; cursor: ${saving ? 'default' : 'pointer'};`)}
              >
                {saving ? 'Saving…' : 'Save product'}
              </button>
              {!isEditing ? (
                <button type="button" className="hv-soft" disabled={saving} onClick={handleSubmit((data) => save(data, true))} style={css('background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 14px; padding: 15px 20px; font-size: 15px; font-weight: 800; cursor: pointer;')}>
                  Save &amp; add another
                </button>
              ) : null}
              <button type="button" onClick={onBack} style={css('background: transparent; color: #7B857F; border: none; padding: 10px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
