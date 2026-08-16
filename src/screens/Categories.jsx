import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { css } from '../lib/css'
import { localized } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useLiveReload } from '../lib/useLiveReload'
import { useToast } from '../lib/toast'
import StateBlock from '../components/StateBlock'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

export default function Categories() {
  const navigate = useNavigate()
  const toast = useToast()
  const onGoAddCat = () => navigate('/categories/new')
  const [q, setQ] = useState('')

  const fetchAll = useCallback(async () => {
    const [categories, needsFixing] = await Promise.all([
      api.get('/admin/categories'),
      api.get('/admin/products/needs-fixing?limit=1'),
    ])
    const counts = await Promise.all(
      categories.map((c) => api.get(`/admin/products?category=${c.id}&limit=1`).then((r) => r.total)),
    )
    return { categories, needsFixingTotal: needsFixing.total, counts }
  }, [])

  const { data, loading, error, reload } = useFetch(fetchAll, [])
  useLiveReload(['category.changed'], reload)

  const toggleVisible = async (cat) => {
    try {
      await api.patch(`/admin/categories/${cat.id}`, { visible: !cat.visible })
      reload()
      toast.success(cat.visible ? 'Category hidden' : 'Category shown')
    } catch (e) {
      toast.error(e.message || 'Could not update this category.')
    }
  }

  const categories = data?.categories || []
  const counts = data?.counts || []

  const rows = categories
    .map((c, i) => {
      const state = c.archivedAt ? 'Hidden' : !c.visible ? 'Hidden' : c.status !== 'published' ? 'Needs fixing' : 'Visible'
      const col = state === 'Visible' ? ['#E6F6DE', '#2E7A12'] : state === 'Hidden' ? ['#EEF0EC', '#7B857F'] : ['#FFF6E2', '#7A5205']
      return {
        raw: c,
        order: i + 1,
        name: localized(c.name),
        nameAr: c.name?.ar || '',
        items: counts[i] ?? '—',
        state,
        stateStyle: `display:inline-flex;background:${col[0]};color:${col[1]};font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;`,
        thumbStyle: 'width:46px;height:46px;border-radius:12px;flex:none;display:grid;place-items:center;overflow:hidden;background:repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);',
        rowStyle: `display:grid;grid-template-columns:56px 64px minmax(220px, 2fr) 120px 150px 96px;gap:14px;align-items:center;padding:14px 20px;min-width:920px;border-top:1px solid #F2F4F0;${
          state === 'Needs fixing' ? 'background:#FFFBF2;box-shadow:inset 4px 0 0 #E39A0B;' : ''
        }`,
      }
    })
    .filter((c) => !q.trim() || c.name.toLowerCase().includes(q.trim().toLowerCase()) || c.nameAr.includes(q.trim()))

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; align-items: center; gap: 12px; flex-wrap: wrap;')}>
        <div style={css('position: relative; flex: 1; min-width: 260px;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input placeholder="Search categories" value={q} onChange={(e) => setQ(e.target.value)} style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')} />
        </div>
        <button className="hv-dark" onClick={onGoAddCat} style={css('display: flex; align-items: center; gap: 9px; background: #0F1A12; color: #FFFFFF; border: none; border-radius: 14px; padding: 15px 20px; font-size: 14.5px; font-weight: 800; cursor: pointer;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add category
        </button>
      </div>

      {data?.needsFixingTotal > 0 ? (
        <div className="fc-alert" style={css('background: #FFF6E2; border: 1px solid #F2D18A; border-radius: 16px; padding: 15px 20px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;')}>
          <span style={css('font-size: 14.5px; font-weight: 800; color: #7A5205;')}>{data.needsFixingTotal} products are uncategorised</span>
          <span style={css('font-size: 13.5px; font-weight: 700; color: #96692A; flex: 1;')}>
            They still sell, but customers won't find them by browsing. Open each product to assign one.
          </span>
        </div>
      ) : null}

      <div className="fc-tbl" style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; overflow-x: auto;')}>
        <StateBlock loading={loading} error={error} onRetry={reload} empty={!loading && !error && rows.length === 0} emptyText="No categories yet.">
          <div className="fc-thead" style={css('display: grid; grid-template-columns: 56px 64px minmax(220px, 2fr) 120px 150px 96px; gap: 14px; padding: 13px 20px; min-width: 920px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
            <div>Order</div><div>Image</div><div>Name (EN / AR)</div><div>Products</div><div>Status</div><div />
          </div>

          {rows.map((c, i) => (
            <div key={c.raw.id} className="fc-row fc-fade-up" style={{ ...css(c.rowStyle), animationDelay: `${Math.min(i, 12) * 18}ms` }}>
              <div className="fc-drag" style={css('display: flex; align-items: center; gap: 8px; color: #B7BFB8;')}>
                <span style={css('font-size: 13.5px; font-weight: 800; color: #7B857F;')}>{c.order}</span>
              </div>
              <div style={css(c.thumbStyle)}>
                {c.raw.imageUrl ? (
                  <img src={c.raw.imageUrl} alt="" style={css('width: 100%; height: 100%; object-fit: cover;')} />
                ) : (
                  <span style={css('font-family: ui-monospace, Menlo, monospace; font-size: 8.5px; color: #9AA39C;')}>image</span>
                )}
              </div>
              <div style={css('min-width: 0;')}>
                <div style={css('font-size: 15px; font-weight: 700;')}>{c.name}</div>
                <div dir="rtl" style={css('font-size: 13.5px; font-weight: 600; color: #7B857F; margin-top: 2px;')}>{c.nameAr}</div>
              </div>
              <div data-label="Products" style={css('font-size: 15px; font-weight: 800;')}>{c.items}</div>
              <div data-label="Status"><span style={css(c.stateStyle)}>{c.state}</span></div>
              <div className="fc-act" style={css('display: flex; justify-content: flex-end;')}>
                <button
                  className="hv-soft"
                  onClick={() => toggleVisible(c.raw)}
                  style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #37413A; cursor: pointer;')}
                >
                  {c.raw.visible ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          ))}
        </StateBlock>
      </div>
    </div>
  )
}
