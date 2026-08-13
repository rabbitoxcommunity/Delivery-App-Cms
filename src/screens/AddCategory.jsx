import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { localized } from '../lib/adapt'
import { api } from '../lib/api'
import { uploadImage } from '../lib/upload'
import { useFetch } from '../lib/useFetch'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

// The full icon catalog lives in the backend's shared/icon-catalog.json —
// this is the category-relevant subset (cat-* names) for a lightweight picker.
const CATEGORY_ICONS = ['cat-fruits', 'cat-dairy', 'cat-bakery', 'cat-beverages', 'cat-snacks', 'cat-meat', 'cat-household', 'cat-baby']

const slugify = (s) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`

export default function AddCategory() {
  const navigate = useNavigate()
  const onBack = () => navigate('/categories')
  const { data: categories } = useFetch(() => api.get('/admin/categories'), [])

  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [parentId, setParentId] = useState('')
  const [icon, setIcon] = useState(CATEGORY_ICONS[0])
  const [imageUrl, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [visible, setVisible] = useState(true)
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onUploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      setImageUrl(await uploadImage(file, 'category-tile'))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const searchProducts = async (value) => {
    setProductQuery(value)
    if (!value.trim()) return setProductResults([])
    const { items } = await api.get(`/admin/products?q=${encodeURIComponent(value.trim())}&limit=6`)
    setProductResults(items)
  }

  const toggleProduct = (p) => {
    setSelectedProducts((prev) => (prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p]))
  }

  const save = async () => {
    setError('')
    if (!nameEn.trim()) return setError('Category name (English) is required.')
    if (!nameAr.trim()) return setError('Arabic name is required to publish.')
    setSaving(true)
    try {
      let categoryId
      if (parentId) {
        const parent = categories.find((c) => c.id === parentId)
        const subcategories = [...(parent.subcategories || []), { slug: slugify(nameEn), name: { en: nameEn, ar: nameAr } }]
        await api.patch(`/admin/categories/${parentId}`, { subcategories })
        categoryId = parentId
      } else {
        const created = await api.post('/admin/categories', {
          slug: slugify(nameEn),
          name: { en: nameEn, ar: nameAr },
          icon,
          imageUrl,
          visible,
          status: 'published',
        })
        categoryId = created.id
      }
      await Promise.all(selectedProducts.map((p) => api.patch(`/admin/products/${p.id}`, { categoryId })))
      onBack()
    } catch (err) {
      setError(err.message || 'Could not save this category.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px; max-width: 1080px;')}>
      <button className="hv-link" onClick={onBack} style={css('display: flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; border: none; padding: 0; font-size: 14px; font-weight: 800; color: #7B857F; cursor: pointer;')}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        Back to categories
      </button>

      {error ? (
        <div style={css('background: #FFF1EF; border: 1px solid #F3B4AC; color: #B3261E; border-radius: 12px; padding: 12px 14px; font-size: 13.5px; font-weight: 700;')}>{error}</div>
      ) : null}

      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; align-items: start;')}>
        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Category details</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Both names appear on the customer app home screen.</div>
            <div style={css('display: flex; flex-direction: column; gap: 14px; margin-top: 18px;')}>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Category name (English)</div>
                <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Frozen foods" style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 16px; font-weight: 700;')} />
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>اسم الفئة (Arabic)</div>
                <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: مجمدات" dir="rtl" style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 16px; font-weight: 700;')} />
              </div>
              <div>
                <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Sits under</div>
                <select value={parentId} onChange={(e) => setParentId(e.target.value)} style={css('width: 100%; padding: 15px 16px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 15px; font-weight: 700; background: #FFFFFF; color: #14181A;')}>
                  <option value="">Top level (shown on home screen)</option>
                  {(categories || []).map((c) => (
                    <option key={c.id} value={c.id}>{localized(c.name)}</option>
                  ))}
                </select>
                {parentId ? (
                  <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600; margin-top: 6px;')}>
                    Saved as a subcategory (filter chip) under this category — icon and tile image only apply to top-level categories.
                  </div>
                ) : null}
              </div>
              {!parentId ? (
                <div>
                  <div style={css('font-size: 12.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;')}>Icon</div>
                  <div style={css('display: flex; gap: 8px; flex-wrap: wrap;')}>
                    {CATEGORY_ICONS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(i)}
                        title={i}
                        style={css(
                          `width:44px;height:44px;border-radius:11px;font-family:ui-monospace,Menlo,monospace;font-size:9px;cursor:pointer;background:${
                            icon === i ? '#E6F6DE' : '#F3F6F1'
                          };color:${icon === i ? '#2E7A12' : '#7B857F'};border:2px solid ${icon === i ? GREEN : 'transparent'};`,
                        )}
                      >
                        {i.replace('cat-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Move products in</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;')}>Optional — you can also assign products later from the product list.</div>
            <div style={css('position: relative; margin-top: 16px;')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
                <path d={SEARCH_ICON} />
              </svg>
              <input
                value={productQuery}
                onChange={(e) => searchProducts(e.target.value)}
                placeholder="Search products to add to this category"
                style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 12px; font-size: 14.5px; font-weight: 600;')}
              />
            </div>
            {productResults.length > 0 ? (
              <div style={css('display: flex; flex-direction: column; gap: 4px; margin-top: 10px; max-height: 220px; overflow-y: auto;')}>
                {productResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p)}
                    style={css(`text-align:left;background:${selectedProducts.some((x) => x.id === p.id) ? '#E6F6DE' : 'transparent'};border:none;border-radius:10px;padding:10px 12px;font-size:14px;font-weight:600;cursor:pointer;`)}
                  >
                    {localized(p.name)}
                  </button>
                ))}
              </div>
            ) : null}
            <div style={css('display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px;')}>
              {selectedProducts.map((p) => (
                <span key={p.id} onClick={() => toggleProduct(p)} style={css('cursor: pointer; display: inline-flex; align-items: center; gap: 8px; background: #E6F6DE; color: #2E7A12; border-radius: 10px; padding: 9px 13px; font-size: 13.5px; font-weight: 800;')}>
                  {localized(p.name)} ✕
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          {!parentId ? (
            <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
              <div style={css('font-size: 17px; font-weight: 800;')}>Category image</div>
              {imageUrl ? (
                <div style={css('margin-top: 16px; border-radius: 16px; overflow: hidden; height: 180px;')}>
                  <img src={imageUrl} alt="" style={css('width: 100%; height: 100%; object-fit: cover;')} />
                </div>
              ) : (
                <div style={css('margin-top: 16px; border: 2px dashed #D8E0D3; border-radius: 16px; height: 180px; display: grid; place-items: center; background: repeating-linear-gradient(135deg,#F7F9F5 0 8px,#F1F4EE 8px 16px);')}>
                  <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; color: #7B857F;')}>category tile · 2:1 · min 800×400</span>
                </div>
              )}
              <label style={css('display: inline-block; margin-top: 10px; background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 11px; padding: 11px 18px; font-size: 14px; font-weight: 800; color: #37413A; cursor: pointer;')}>
                {uploading ? 'Uploading…' : imageUrl ? 'Replace image' : 'Upload image'}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onUploadImage} disabled={uploading} style={css('display: none;')} />
              </label>
            </div>
          ) : null}

          {!parentId ? (
            <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px;')}>
              <div style={css('font-size: 17px; font-weight: 800;')}>Visibility</div>
              <div style={css('display: flex; gap: 8px; margin-top: 16px;')}>
                {[{ label: 'Visible in app', v: true }, { label: 'Hidden', v: false }].map((k) => (
                  <button
                    type="button"
                    key={k.label}
                    onClick={() => setVisible(k.v)}
                    style={css(
                      visible === k.v
                        ? `background:${GREEN};color:#FFFFFF;border:2px solid ${GREEN};border-radius:12px;padding:14px 18px;font-size:14.5px;font-weight:800;cursor:pointer;flex:1;`
                        : 'background:#FFFFFF;color:#7B857F;border:2px solid #EAEDE9;border-radius:12px;padding:14px 18px;font-size:14.5px;font-weight:700;cursor:pointer;flex:1;',
                    )}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
              <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 10px;')}>Hidden categories keep their products, but customers can't browse them.</div>
            </div>
          ) : null}

          <div className="fc-sticky" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 24px; position: sticky; top: 110px; display: flex; flex-direction: column; gap: 10px;')}>
            <button
              type="button"
              className="hv-green"
              disabled={saving}
              onClick={save}
              style={css(`background: ${saving ? '#8FCE6C' : '#47BB1C'}; color: #FFFFFF; border: none; border-radius: 14px; padding: 17px 20px; font-size: 16px; font-weight: 800; cursor: ${saving ? 'default' : 'pointer'};`)}
            >
              {saving ? 'Saving…' : 'Save category'}
            </button>
            <button type="button" onClick={onBack} style={css('background: transparent; color: #7B857F; border: none; padding: 10px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
