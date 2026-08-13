import { useCallback, useState } from 'react'
import { css } from '../lib/css'
import { PROPS, stockPill } from '../lib/design'
import { fromFils, localized, toFils } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import StateBlock from '../components/StateBlock'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'
const STOCK_LABEL = { available: 'Available', low: 'Low Stock', out: 'Out of Stock' }

const THUMB = 'width:46px;height:46px;border-radius:10px;display:grid;place-items:center;background:repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);overflow:hidden;'
const VAR_THUMB = 'width:38px;height:38px;border-radius:9px;margin-left:16px;display:grid;place-items:center;background:repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);'
const ROW = 'display:grid;grid-template-columns:64px minmax(240px, 2.1fr) 1fr 130px 150px 96px;gap:14px;align-items:center;padding:13px 20px;min-width:1000px;border-top:1px solid #F2F4F0;'
const VAR_ROW = 'display:grid;grid-template-columns:64px minmax(240px, 2.1fr) 1fr 130px 150px 96px;gap:14px;align-items:center;padding:11px 20px 11px 32px;min-width:1000px;border-top:1px solid #F6F8F4;background:#FCFDFB;'

export default function Products({ open, onToggle, onGoAdd, onEdit }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (q.trim()) params.set('q', q.trim())
    const [list, categories, needsFixing] = await Promise.all([
      api.get(`/admin/products?${params.toString()}`),
      api.get('/admin/categories'),
      api.get('/admin/products/needs-fixing?limit=1'),
    ])
    const catById = Object.fromEntries(categories.map((c) => [c.id, localized(c.name)]))
    return { ...list, catById, needsFixingTotal: needsFixing.total }
  }, [page, q])

  const { data, loading, error, reload } = useFetch(fetchProducts, [fetchProducts])

  const search = (value) => {
    setQ(value)
    setPage(1)
  }

  const saveField = async (product, patch) => {
    await api.patch(`/admin/products/${product.id}`, patch)
    reload()
  }

  const products = data?.items || []
  const catById = data?.catById || {}

  const rows = []
  products.forEach((p) => {
    const isOpen = !!open[p.id]
    const firstVariant = p.variants[0]
    const category = p.categoryId ? catById[p.categoryId] || 'Category' : 'Uncategorised'

    rows.push({
      key: p.id,
      product: p,
      variant: null,
      imageUrl: p.imageUrl,
      name: localized(p.name),
      nameAr: p.name?.ar || '',
      category,
      price: firstVariant ? fromFils(firstVariant.price).toFixed(2) : '0.00',
      stock: STOCK_LABEL[firstVariant?.stock] || 'Available',
      variantCount: p.variants.length > 1 ? p.variants.length : false,
      variantLabel: (isOpen ? '▾ ' : '▸ ') + p.variants.length + ' variants',
      isUncategorised: !p.categoryId,
      rowStyle: ROW,
    })

    if (isOpen && p.variants.length > 1) {
      p.variants.forEach((v) => {
        const label = localized(v.label) || Array.from(Object.values(v.optionIds || {})).join(', ') || 'Variant'
        rows.push({
          key: p.id + v.id,
          product: p,
          variant: v,
          imageUrl: null,
          name: label,
          nameAr: v.label?.ar || '',
          category: 'variant of ' + localized(p.name),
          price: fromFils(v.price).toFixed(2),
          stock: STOCK_LABEL[v.stock] || 'Available',
          variantCount: false,
          variantLabel: '',
          isUncategorised: false,
          rowStyle: VAR_ROW,
        })
      })
    }
  })

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
            placeholder={`Search ${total.toLocaleString()} products by name, barcode or Arabic name`}
            value={q}
            onChange={(e) => search(e.target.value)}
            style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')}
          />
        </div>
        <button className="hv-dark" onClick={onGoAdd} style={css('display: flex; align-items: center; gap: 9px; background: #0F1A12; color: #FFFFFF; border: none; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add product manually
        </button>
        <button
          className="hv-green"
          onClick={() => window.alert('Excel import is coming soon — the backend endpoint exists but this screen isn’t wired to it yet.')}
          style={css('display: flex; align-items: center; gap: 9px; background: #47BB1C; color: #FFFFFF; border: none; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 16V4M8 8l4-4 4 4M4 20h16" /></svg>
          Import from Excel
        </button>
        {data?.needsFixingTotal > 0 ? (
          <button
            className="hv-soft"
            onClick={() => search('')}
            title="Products without a category — open a product to assign one"
            style={css('display: flex; align-items: center; gap: 9px; background: #FFFFFF; color: #37413A; border: 1px solid #E4EADF; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
            Needs fixing
            <span style={css('background: #FFF6E2; color: #7A5205; font-size: 12px; font-weight: 800; padding: 3px 8px; border-radius: 7px;')}>{data.needsFixingTotal}</span>
          </button>
        ) : null}
      </div>

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <StateBlock loading={loading} error={error} onRetry={reload} empty={!loading && !error && rows.length === 0} emptyText="No products match this search.">
          <div className="fc-thead" style={css('display: grid; grid-template-columns: 64px minmax(240px, 2.1fr) 1fr 130px 150px 96px; gap: 14px; padding: 13px 20px; min-width: 1000px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
            <div>Photo</div><div>Name (EN / AR)</div><div>Category</div><div>Price</div><div>Stock</div><div />
          </div>

          {rows.map((p) => (
            <div key={p.key} className="fc-row" style={css(p.rowStyle)}>
              <div style={css(p.variant ? VAR_THUMB : THUMB)}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" style={css('width: 100%; height: 100%; object-fit: cover;')} />
                ) : (
                  <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 8.5px; color: #9AA39C;')}>{p.variant ? 'var' : 'photo'}</span>
                )}
              </div>
              <div style={css('min-width: 0;')}>
                <div style={css('display: flex; align-items: center; gap: 8px;')}>
                  {p.variant ? (
                    <span style={css('font-size: 14px; font-weight: 600; color: #37413A;')}>{p.name}</span>
                  ) : (
                    <input
                      defaultValue={p.name}
                      onBlur={(e) => {
                        if (e.target.value !== p.name) saveField(p.product, { name: { en: e.target.value, ar: p.nameAr } })
                      }}
                      style={css('flex:1;min-width:0;border:1px solid transparent;background:transparent;border-radius:8px;padding:5px 8px;font-size:15px;font-weight:700;color:#14181A;')}
                    />
                  )}
                  {p.variantCount ? (
                    <button onClick={() => onToggle(p.product.id)} style={css('background: #F1EAFB; color: #5A31A8; border: none; border-radius: 8px; padding: 4px 9px; font-size: 11.5px; font-weight: 800; cursor: pointer; white-space: nowrap;')}>
                      {p.variantLabel}
                    </button>
                  ) : null}
                </div>
                {PROPS.showArabicNames && !p.variant ? (
                  <input
                    className="hv-input"
                    defaultValue={p.nameAr}
                    dir="rtl"
                    onBlur={(e) => {
                      if (e.target.value !== p.nameAr) saveField(p.product, { name: { en: p.name, ar: e.target.value } })
                    }}
                    style={css('width: 100%; border: 1px solid transparent; background: transparent; border-radius: 8px; padding: 4px 8px; font-size: 13.5px; font-weight: 600; color: #7B857F; margin-top: 2px;')}
                  />
                ) : null}
              </div>
              <div data-label="Category">
                <span
                  style={css(
                    `display:inline-flex;background:${p.isUncategorised ? '#FFF6E2' : '#F0F2EE'};color:${
                      p.isUncategorised ? '#7A5205' : '#4C5850'
                    };font-size:12.5px;font-weight:700;padding:6px 11px;border-radius:9px;`,
                  )}
                >
                  {p.category}
                </span>
              </div>
              <div data-label="Price" style={css('display: flex; align-items: center; gap: 6px;')}>
                <span style={css('font-size: 12.5px; color: #7B857F; font-weight: 700;')}>AED</span>
                <input
                  defaultValue={p.price}
                  onBlur={(e) => {
                    const newFils = toFils(e.target.value)
                    if (!Number.isFinite(newFils) || newFils === toFils(p.price)) return
                    const variants = p.product.variants.map((v) =>
                      v.id === (p.variant?.id ?? p.product.variants[0].id) ? { ...v, price: newFils } : v,
                    )
                    saveField(p.product, { variants })
                  }}
                  style={css('width: 74px; border: 1px solid #E4EADF; background: #FFFFFF; border-radius: 9px; padding: 8px 10px; font-size: 14.5px; font-weight: 800;')}
                />
              </div>
              <div data-label="Stock"><span style={css(stockPill(p.stock))}>{p.stock}</span></div>
              <div className="fc-act" style={css('display: flex; justify-content: flex-end;')}>
                <button
                  className="hv-soft"
                  onClick={() => onEdit(p.product.id)}
                  style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #37413A; cursor: pointer;')}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          <div className="fc-tblfoot" style={css('display: flex; align-items: center; gap: 14px; padding: 15px 20px; min-width: 1000px; border-top: 1px solid #EFF1ED; font-size: 13.5px; color: #7B857F; font-weight: 700;')}>
            Showing {products.length} of {total.toLocaleString()} products
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
