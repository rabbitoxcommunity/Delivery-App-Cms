import { useCallback } from 'react'
import { css } from '../lib/css'
import { GREEN } from '../lib/design'
import { fromFils, localized } from '../lib/adapt'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import StateBlock from '../components/StateBlock'

const CAT_BAR_COLORS = ['#2E7A12', GREEN, '#6FCF45', '#96DE74', '#C3EBAD']

function dateKey(d) {
  return d.toISOString().slice(0, 10)
}

function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase()
}

export default function Insights() {
  const fetchAll = useCallback(async () => {
    const today = new Date()
    const from = new Date(today)
    from.setDate(from.getDate() - 29)
    const fromKey = dateKey(from)
    const yesterdayKey = dateKey(new Date(today.getTime() - 86400000))
    // Today INCLUDED. This used to stop at yesterday because rollups were only
    // ever written for completed days — which meant a shop whose orders were all
    // from today saw three permanently empty panels next to a working "today"
    // tile. The analytics endpoints now refresh today's rollup on demand, so the
    // range can honestly be the last 30 days.
    const toKey = dateKey(today)

    const [todayStats, summary, products, categories, customers] = await Promise.all([
      api.get('/admin/analytics/today'),
      api.get(`/admin/analytics/summary?from=${fromKey}&to=${toKey}`),
      api.get(`/admin/analytics/products?from=${fromKey}&to=${toKey}`),
      api.get(`/admin/analytics/categories?from=${fromKey}&to=${toKey}`),
      api.get('/admin/analytics/customers'),
    ])

    const yesterday = summary.days.find((d) => d.date === yesterdayKey)
    const sparkDays = summary.days.slice(-11).map((d) => d.orders.count)
    const spark = [...sparkDays, todayStats.orderCount]
    const maxSpark = Math.max(1, ...spark)

    const byFulfillment = summary.days.reduce(
      (acc, d) => ({
        delivery: acc.delivery + (d.orders.byFulfillment?.delivery || 0),
        curbside: acc.curbside + (d.orders.byFulfillment?.curbside || 0),
      }),
      { delivery: 0, curbside: 0 },
    )

    return { todayStats, yesterday, spark: spark.map((v) => Math.round((v / maxSpark) * 100)), products, categories, customers, byFulfillment }
  }, [])

  const { data, loading, error, reload } = useFetch(fetchAll, [])

  if (loading || error) {
    return <StateBlock loading={loading} error={error} onRetry={reload} />
  }

  const { todayStats, yesterday, spark, products, categories, customers, byFulfillment } = data
  const revenueAed = fromFils(todayStats.revenue)
  const avgBasket = todayStats.orderCount > 0 ? revenueAed / todayStats.orderCount : 0
  const yesterdayCount = yesterday?.orders?.count ?? null
  const vsYesterdayPct = yesterdayCount ? Math.round(((todayStats.orderCount - yesterdayCount) / yesterdayCount) * 100) : null

  const totalProductRevenue = products.reduce((s, p) => s + p.revenue, 0) || 1
  const bestSellers = products.slice(0, 6).map((p, i) => ({
    ...p,
    rank: i + 1,
    rankStyle: `width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-size:13px;font-weight:800;${
      i < 3 ? `background:${GREEN};color:#FFFFFF;` : 'background:#F0F2EE;color:#4C5850;'
    }`,
    barStyle: `height:100%;width:${Math.round((p.revenue / totalProductRevenue) * 100)}%;border-radius:3px;background:${i < 3 ? GREEN : '#A9DC8C'};`,
  }))

  const catRows = categories.slice(0, 5).map((c, i) => ({
    ...c,
    barStyle: `height:100%;width:${c.share}%;border-radius:5px;background:${CAT_BAR_COLORS[i] || '#C3EBAD'};`,
  }))

  const totalFulfillment = byFulfillment.delivery + byFulfillment.curbside || 1
  const deliveryPct = Math.round((byFulfillment.delivery / totalFulfillment) * 100)

  const topCustomer = customers[0]

  return (
    <div style={css('display: flex; flex-direction: column; gap: 18px;')}>
      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;')}>
        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
          <div style={css("font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;")}>Today's orders</div>
          <div className="fc-xl" style={css('font-size: 60px; font-weight: 800; letter-spacing: -2.5px; line-height: 1.05; margin-top: 10px;')}>{todayStats.orderCount}</div>
          {vsYesterdayPct != null ? (
            <div style={css('display: flex; align-items: center; gap: 8px; margin-top: 8px;')}>
              <span style={css(`background:${vsYesterdayPct >= 0 ? '#E6F6DE' : '#FFE8E5'};color:${vsYesterdayPct >= 0 ? '#2E7A12' : '#B3261E'};font-size:13px;font-weight:800;padding:5px 10px;border-radius:8px;`)}>
                {vsYesterdayPct >= 0 ? '▲' : '▼'} {Math.abs(vsYesterdayPct)}%
              </span>
              <span style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>vs yesterday ({yesterdayCount})</span>
            </div>
          ) : null}
          <div style={css('display: flex; align-items: flex-end; gap: 6px; height: 54px; margin-top: 18px;')}>
            {spark.map((h, i) => (
              <div key={i} style={css(`flex:1;height:${Math.max(4, h)}%;border-radius:4px;background:${h >= 90 ? GREEN : '#CDEBBB'};`)} />
            ))}
          </div>
        </div>

        <div style={css('background: #0F1A12; color: #FFFFFF; border-radius: 20px; padding: 22px 24px;')}>
          <div style={css("font-size: 13px; font-weight: 800; color: #8FA894; text-transform: uppercase; letter-spacing: .6px;")}>Today's revenue</div>
          <div className="fc-xl" style={css('font-size: 54px; font-weight: 800; letter-spacing: -2px; line-height: 1.05; margin-top: 10px; color: #7BE04A;')}>AED {revenueAed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div style={css('font-size: 13px; color: #8FA894; font-weight: 600; margin-top: 8px;')}>Avg basket AED {avgBasket.toFixed(0)}</div>
        </div>

        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
          <div style={css('font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;')}>Top customer (30 days)</div>
          {topCustomer ? (
            <>
              <div style={css('display: flex; align-items: center; gap: 14px; margin-top: 16px;')}>
                <div style={css('width: 56px; height: 56px; border-radius: 50%; background: #E6F6DE; color: #2E7A12; display: grid; place-items: center; font-size: 19px; font-weight: 800;')}>
                  {initialsOf(topCustomer.customer?.name)}
                </div>
                <div>
                  <div style={css('font-size: 22px; font-weight: 800; letter-spacing: -.5px;')}>{topCustomer.customer?.name || 'Customer'}</div>
                  <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>{topCustomer.frequency} orders in 30 days</div>
                </div>
              </div>
              <div style={css('display: flex; gap: 26px; margin-top: 20px; padding-top: 18px; border-top: 1px solid #EFF1ED;')}>
                <div>
                  <div style={css('font-size: 11.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .4px;')}>Spend</div>
                  <div style={css('font-size: 28px; font-weight: 800; color: #2E7A12; letter-spacing: -1px;')}>AED {fromFils(topCustomer.monetary).toFixed(0)}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={css('font-size: 14px; color: #7B857F; font-weight: 700; margin-top: 16px;')}>No orders in the last 30 days yet.</div>
          )}
        </div>
      </div>

      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px;')}>
        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
          <div style={css('display: flex; align-items: baseline; gap: 10px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Best-selling products (30 days)</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-left: auto;')}>by revenue</div>
          </div>
          {bestSellers.length === 0 ? (
            <div style={css('font-size: 14px; color: #7B857F; font-weight: 700; margin-top: 16px;')}>No sales recorded yet.</div>
          ) : (
            <div style={css('display: flex; flex-direction: column; gap: 2px; margin-top: 16px;')}>
              {bestSellers.map((p) => (
                <div key={p.productId} style={css('display: grid; grid-template-columns: 34px 1fr 96px; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid #F2F4F0;')}>
                  <div style={css(p.rankStyle)}>{p.rank}</div>
                  <div style={css('min-width: 0;')}>
                    <div style={css('font-size: 14.5px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;')}>
                      {localized(p.name) || 'Unknown product'}
                    </div>
                    <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 700; margin-top: 2px;')}>{p.units} sold</div>
                    <div style={css('height: 6px; border-radius: 3px; background: #F0F2EE; margin-top: 7px; overflow: hidden;')}>
                      <div style={css(p.barStyle)} />
                    </div>
                  </div>
                  <div style={css('font-size: 13px; font-weight: 700; color: #2E7A12; text-align: right;')}>AED {fromFils(p.revenue).toFixed(0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Category performance</div>
            <div style={css("font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;")}>Share of the last 30 days' revenue</div>
            {catRows.length === 0 ? (
              <div style={css('font-size: 14px; color: #7B857F; font-weight: 700; margin-top: 16px;')}>No sales recorded yet.</div>
            ) : (
              <div style={css('display: flex; flex-direction: column; gap: 13px; margin-top: 18px;')}>
                {catRows.map((c) => (
                  <div key={c.categoryId}>
                    <div style={css('display: flex; align-items: baseline; gap: 8px; font-size: 13.5px; font-weight: 700;')}>
                      <span style={css('min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;')}>
                        {localized(c.name) || 'Uncategorised'}
                      </span>
                      <span style={css('margin-left: auto; font-weight: 800;')}>AED {fromFils(c.revenue).toFixed(0)}</span>
                      <span style={css('color: #7B857F; font-weight: 700; width: 42px; text-align: right;')}>{c.share}%</span>
                    </div>
                    <div style={css('height: 10px; border-radius: 5px; background: #F0F2EE; margin-top: 6px; overflow: hidden;')}>
                      <div style={css(c.barStyle)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Delivery vs curbside (30 days)</div>
            <div style={css('display: flex; align-items: center; gap: 22px; margin-top: 16px;')}>
              <div style={css(`width:132px;height:132px;border-radius:50%;position:relative;flex:none;background:conic-gradient(${GREEN} 0 ${deliveryPct}%, #7A4BD0 ${deliveryPct}% 100%);`)}>
                <div style={css('position: absolute; inset: 22px; background: #FFFFFF; border-radius: 50%; display: grid; place-items: center;')}>
                  <div style={css('text-align: center;')}>
                    <div style={css('font-size: 22px; font-weight: 800; line-height: 1;')}>{totalFulfillment}</div>
                    <div style={css('font-size: 10.5px; font-weight: 700; color: #7B857F; text-transform: uppercase;')}>orders</div>
                  </div>
                </div>
              </div>
              <div style={css('display: flex; flex-direction: column; gap: 14px;')}>
                <div>
                  <div style={css('display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700;')}>
                    <span style={css('width: 10px; height: 10px; border-radius: 3px; background: #47BB1C;')} />Home delivery
                  </div>
                  <div style={css('font-size: 20px; font-weight: 800; margin-top: 3px;')}>
                    {byFulfillment.delivery} <span style={css('font-size: 13px; color: #7B857F; font-weight: 700;')}>· {deliveryPct}%</span>
                  </div>
                </div>
                <div>
                  <div style={css('display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700;')}>
                    <span style={css('width: 10px; height: 10px; border-radius: 3px; background: #7A4BD0;')} />Curbside pickup
                  </div>
                  <div style={css('font-size: 20px; font-weight: 800; margin-top: 3px;')}>
                    {byFulfillment.curbside} <span style={css('font-size: 13px; color: #7B857F; font-weight: 700;')}>· {100 - deliveryPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
        <div style={css('font-size: 17px; font-weight: 800;')}>Top customers by spend (30 days)</div>
        {customers.length === 0 ? (
          <div style={css('font-size: 14px; color: #7B857F; font-weight: 700; margin-top: 16px;')}>No orders in the last 30 days yet.</div>
        ) : (
          <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 18px;')}>
            {customers.slice(0, 5).map((c) => (
              <div key={c.customerId} style={css('background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 16px; padding: 16px;')}>
                <div style={css('display: flex; align-items: center; gap: 10px;')}>
                  <div style={css('width: 34px; height: 34px; border-radius: 50%; background: #E6F6DE; color: #2E7A12; display: grid; place-items: center; font-size: 12.5px; font-weight: 800;')}>
                    {initialsOf(c.customer?.name)}
                  </div>
                  <div style={css('font-size: 13.5px; font-weight: 700; line-height: 1.2;')}>{c.customer?.name || 'Customer'}</div>
                </div>
                <div style={css('font-size: 24px; font-weight: 800; letter-spacing: -.8px; margin-top: 12px;')}>AED {fromFils(c.monetary).toFixed(0)}</div>
                <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>{c.frequency} orders</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
