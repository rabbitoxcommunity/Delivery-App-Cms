import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { css } from '../lib/css'
import { localized } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import { useLiveReload } from '../lib/useLiveReload'
import { useToast } from '../lib/toast'
import { useDialogs } from '../lib/dialogs'
import StateBlock from '../components/StateBlock'

const SEARCH_ICON = 'M11 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 15l5 5'

export default function Categories() {
  const navigate = useNavigate()
  const toast = useToast()
  const { confirm } = useDialogs()
  const onGoAddCat = () => navigate('/categories/new')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  // Search is server-side now that the list is paged — filtering the current
  // page only would hide matches sitting on other pages. Debounced so typing
  // doesn't fire a request per keystroke.
  const [debouncedQ, setDebouncedQ] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => clearTimeout(id)
  }, [q])
  useEffect(() => setPage(1), [debouncedQ])

  const fetchAll = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (debouncedQ) params.set('q', debouncedQ)
    // productCount now arrives on each row. This screen used to fetch it with
    // one request per category — 89 round trips to draw one page.
    const [list, needsFixing] = await Promise.all([
      api.get(`/admin/categories?${params.toString()}`),
      api.get('/admin/products/needs-fixing?limit=1'),
    ])
    return { ...list, needsFixingTotal: needsFixing.total }
  }, [page, debouncedQ])

  const { data, loading, error, reload } = useFetch(fetchAll, [page, debouncedQ])
  useLiveReload(['category.changed'], reload)

  // Bounded by the UNFILTERED count. `total` is the number of rows matching the
  // current search, so using it here capped every move at 1 while searching.
  const move = async (cat, name, position) => {
    const max = data?.overallTotal ?? 0
    if (!Number.isFinite(position) || position < 1 || position > max) {
      toast.error(`Position must be between 1 and ${max}.`)
      return
    }
    try {
      await api.patch(`/admin/categories/${cat.id}/position`, { position })
      reload()
      toast.success(`"${name}" moved to position ${position}`)
    } catch (e) {
      toast.error(e.message || 'Could not reorder this category.')
    }
  }

  // Permanent, and the server refuses while any product still points at this
  // category — surface that message rather than a generic failure, since it
  // tells the owner exactly what to do first.
  const remove = async (cat, name, itemCount) => {
    const ok = await confirm({
      title: `Delete "${name}"?`,
      body:
        itemCount > 0
          ? `${itemCount} product(s) are still in this category. Move them elsewhere first — the delete will be refused otherwise.`
          : 'This permanently removes the category — it cannot be undone.',
      tone: 'danger',
      confirmLabel: 'Delete permanently',
    })
    if (!ok) return
    try {
      await api.delete(`/admin/categories/${cat.id}`)
      reload()
      toast.success(`"${name}" deleted`)
    } catch (e) {
      toast.error(e.message || 'Could not delete this category.')
    }
  }

  const toggleVisible = async (cat) => {
    try {
      await api.patch(`/admin/categories/${cat.id}`, { visible: !cat.visible })
      reload()
      toast.success(cat.visible ? 'Category hidden' : 'Category shown')
    } catch (e) {
      toast.error(e.message || 'Could not update this category.')
    }
  }

  const categories = data?.items || []
  const total = data?.total ?? 0
  const overallTotal = data?.overallTotal ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const offset = (page - 1) * limit

  const rows = categories.map((c) => {
    const state = c.archivedAt ? 'Hidden' : !c.visible ? 'Hidden' : c.status !== 'published' ? 'Needs fixing' : 'Visible'
    const col = state === 'Visible' ? ['#E6F6DE', '#2E7A12'] : state === 'Hidden' ? ['#EEF0EC', '#7B857F'] : ['#FFF6E2', '#7A5205']
    return {
      raw: c,
      // Resolved server-side against the full ordering. Deriving it from the row
      // index only holds on an unfiltered page 1 — under a search every match
      // came out as position 1.
      order: c.position,
      name: localized(c.name),
      nameAr: c.name?.ar || '',
      items: c.productCount ?? 0,
      state,
      stateStyle: `display:inline-flex;background:${col[0]};color:${col[1]};font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;`,
      thumbStyle: 'width:46px;height:46px;border-radius:12px;flex:none;display:grid;place-items:center;overflow:hidden;background:repeating-linear-gradient(135deg,#F4F6F2 0 6px,#EDEFEB 6px 12px);',
      rowStyle: `display:grid;grid-template-columns:118px 64px minmax(200px, 2fr) 110px 140px 190px;gap:14px;align-items:center;padding:14px 20px;min-width:1042px;border-top:1px solid #F2F4F0;${
        state === 'Needs fixing' ? 'background:#FFFBF2;box-shadow:inset 4px 0 0 #E39A0B;' : ''
      }`,
    }
  })

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div className="fc-toolbar" style={css('display: flex; align-items: center; gap: 12px; flex-wrap: wrap;')}>
        <div style={css('position: relative; flex: 1; min-width: 260px;')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" style={css('position: absolute; left: 16px; top: 15px;')}>
            <path d={SEARCH_ICON} />
          </svg>
          <input placeholder={`Search ${overallTotal.toLocaleString()} categories by name or Arabic name`} value={q} onChange={(e) => setQ(e.target.value)} style={css('width: 100%; padding: 15px 16px 15px 44px; border: 1px solid #E4EADF; border-radius: 14px; background: #FFFFFF; font-size: 14.5px; font-weight: 600;')} />
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
          <div className="fc-thead" style={css('display: grid; grid-template-columns: 118px 64px minmax(200px, 2fr) 110px 140px 190px; gap: 14px; padding: 13px 20px; min-width: 1042px; background: #FAFBF9; font-size: 12px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .5px;')}>
            <div>Position</div><div>Image</div><div>Name (EN / AR)</div><div>Products</div><div>Status</div><div />
          </div>

          {rows.map((c, i) => (
            <div key={c.raw.id} className="fc-row fc-fade-up" style={{ ...css(c.rowStyle), animationDelay: `${Math.min(i, 12) * 18}ms` }}>
              <div className="fc-drag" style={css('display: flex; align-items: center; gap: 4px; color: #B7BFB8;')}>
                {/* Typed position rather than drag-and-drop: the list is paged, and
                    you cannot drag a row from page 1 to page 5. Enter or blur commits. */}
                <input
                  type="number"
                  min="1"
                  max={overallTotal}
                  defaultValue={c.order}
                  key={`${c.raw.id}-${c.order}`}
                  aria-label={`Position of ${c.name}`}
                  title={`Position ${c.order} of ${overallTotal} — type a new one and press Enter`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') {
                      e.currentTarget.value = String(c.order)
                      e.currentTarget.blur()
                    }
                  }}
                  onBlur={(e) => {
                    const next = Number(e.target.value)
                    if (next === c.order) return
                    move(c.raw, c.name, next)
                  }}
                  style={css('width: 52px; padding: 7px 8px; border: 1px solid #E4EADF; border-radius: 9px; background: #FFFFFF; font-size: 13.5px; font-weight: 800; color: #37413A; text-align: center;')}
                />
                <div style={css('display: flex; flex-direction: column; gap: 2px;')}>
                  <button
                    onClick={() => move(c.raw, c.name, c.order - 1)}
                    disabled={c.order <= 1}
                    title="Move up"
                    aria-label={`Move ${c.name} up`}
                    style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 6px; padding: 1px 4px; cursor: ${c.order <= 1 ? 'default' : 'pointer'}; opacity: ${c.order <= 1 ? 0.4 : 1}; line-height: 1; color: #37413A;`)}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
                  </button>
                  <button
                    onClick={() => move(c.raw, c.name, c.order + 1)}
                    disabled={c.order >= overallTotal}
                    title="Move down"
                    aria-label={`Move ${c.name} down`}
                    style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 6px; padding: 1px 4px; cursor: ${c.order >= overallTotal ? 'default' : 'pointer'}; opacity: ${c.order >= overallTotal ? 0.4 : 1}; line-height: 1; color: #37413A;`)}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                </div>
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
              <div className="fc-act" style={css('display: flex; justify-content: flex-end; gap: 6px;')}>
                <button
                  className="hv-soft"
                  onClick={() => navigate(`/categories/${c.raw.id}/edit`)}
                  style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #37413A; cursor: pointer;')}
                >
                  Edit
                </button>
                <button
                  className="hv-soft"
                  onClick={() => toggleVisible(c.raw)}
                  style={css('background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #37413A; cursor: pointer;')}
                >
                  {c.raw.visible ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => remove(c.raw, c.name, typeof c.items === 'number' ? c.items : 0)}
                  title="Delete category"
                  aria-label={`Delete ${c.name}`}
                  style={css('background: #FFFFFF; border: 1px solid #F3B4AC; border-radius: 10px; padding: 8px 10px; font-size: 13px; font-weight: 800; color: #B3261E; cursor: pointer; display: flex; align-items: center;')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {total > 0 ? (
            <div className="fc-tblfoot" style={css('display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 20px; min-width: 1042px; border-top: 1px solid #F2F4F0; background: #FAFBF9;')}>
              <div style={css('font-size: 13.5px; font-weight: 700; color: #7B857F;')}>
                Showing {rows.length === 0 ? 0 : offset + 1}–{offset + rows.length} of {total.toLocaleString()} categories
              </div>
              <div style={css('display: flex; align-items: center; gap: 8px;')}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 9px 14px; font-size: 13.5px; font-weight: 800; color: #37413A; cursor: ${page <= 1 ? 'default' : 'pointer'}; opacity: ${page <= 1 ? 0.5 : 1};`)}
                >
                  Previous
                </button>
                <span style={css('font-size: 13.5px; font-weight: 800; color: #37413A;')}>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  style={css(`background: #FFFFFF; border: 1px solid #E4EADF; border-radius: 10px; padding: 9px 14px; font-size: 13.5px; font-weight: 800; color: #37413A; cursor: ${page >= totalPages ? 'default' : 'pointer'}; opacity: ${page >= totalPages ? 0.5 : 1};`)}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </StateBlock>
      </div>
    </div>
  )
}
