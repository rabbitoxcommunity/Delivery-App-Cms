import { css } from '../lib/css'
import { GREEN, PROPS } from '../lib/design'
import { BEST_SELLERS, CATEGORY_PERF, ORDERS_SPARK, TOP_CUSTOMERS } from '../lib/data'

const CAT_BAR_COLORS = ['#2E7A12', GREEN, '#6FCF45', '#96DE74', '#C3EBAD']

export default function Insights({ onGoStock }) {
  const bestSellers = BEST_SELLERS.map((b, i) => ({
    rank: i + 1,
    name: b[0],
    units: b[1].toLocaleString(),
    revenue: 'AED ' + (b[1] * 11).toLocaleString(),
    rankStyle: `width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-size:13px;font-weight:800;${
      i < 3 ? `background:${GREEN};color:#FFFFFF;` : 'background:#F0F2EE;color:#4C5850;'
    }`,
    barStyle: `height:100%;width:${b[2]}%;border-radius:3px;background:${i < 3 ? GREEN : '#A9DC8C'};`,
  }))

  const categories = CATEGORY_PERF.map((c, i) => ({
    name: c[0],
    value: c[1],
    pct: c[2] + '%',
    barStyle: `height:100%;width:${c[3]}%;border-radius:5px;background:${CAT_BAR_COLORS[i]};`,
  }))

  return (
    <div style={css('display: flex; flex-direction: column; gap: 18px;')}>
      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;')}>
        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
          <div style={css("font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;")}>Today's orders</div>
          <div className="fc-xl" style={css('font-size: 60px; font-weight: 800; letter-spacing: -2.5px; line-height: 1.05; margin-top: 10px;')}>148</div>
          <div style={css('display: flex; align-items: center; gap: 8px; margin-top: 8px;')}>
            <span style={css('background: #E6F6DE; color: #2E7A12; font-size: 13px; font-weight: 800; padding: 5px 10px; border-radius: 8px;')}>▲ 12%</span>
            <span style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>vs yesterday (132)</span>
          </div>
          <div style={css('display: flex; align-items: flex-end; gap: 6px; height: 54px; margin-top: 18px;')}>
            {ORDERS_SPARK.map((h, i) => (
              <div key={i} style={css(`flex:1;height:${h}%;border-radius:4px;background:${h >= 90 ? GREEN : '#CDEBBB'};`)} />
            ))}
          </div>
        </div>

        <div style={css('background: #0F1A12; color: #FFFFFF; border-radius: 20px; padding: 22px 24px;')}>
          <div style={css("font-size: 13px; font-weight: 800; color: #8FA894; text-transform: uppercase; letter-spacing: .6px;")}>Today's revenue</div>
          <div className="fc-xl" style={css('font-size: 54px; font-weight: 800; letter-spacing: -2px; line-height: 1.05; margin-top: 10px; color: #7BE04A;')}>AED 18,420</div>
          <div style={css('display: flex; align-items: center; gap: 8px; margin-top: 8px;')}>
            <span style={css('background: #1E3520; color: #7BE04A; font-size: 13px; font-weight: 800; padding: 5px 10px; border-radius: 8px;')}>▲ 9%</span>
            <span style={css('font-size: 13px; color: #8FA894; font-weight: 600;')}>Avg basket AED 124</span>
          </div>
          <div style={css('display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;')}>
            <div style={css('background: #17251A; border-radius: 12px; padding: 12px 14px;')}>
              <div style={css('font-size: 11.5px; color: #8FA894; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;')}>Card</div>
              <div style={css('font-size: 20px; font-weight: 800; margin-top: 2px;')}>AED 14,980</div>
            </div>
            <div style={css('background: #17251A; border-radius: 12px; padding: 12px 14px;')}>
              <div style={css('font-size: 11.5px; color: #8FA894; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;')}>Shop credit</div>
              <div style={css('font-size: 20px; font-weight: 800; margin-top: 2px;')}>AED 3,440</div>
            </div>
          </div>
        </div>

        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
          <div style={css('font-size: 13px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .6px;')}>Top customer</div>
          <div style={css('display: flex; align-items: center; gap: 14px; margin-top: 16px;')}>
            <div style={css('width: 56px; height: 56px; border-radius: 50%; background: #E6F6DE; color: #2E7A12; display: grid; place-items: center; font-size: 19px; font-weight: 800;')}>FA</div>
            <div>
              <div style={css('font-size: 24px; font-weight: 800; letter-spacing: -.6px;')}>Fatima Al Amri</div>
              <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>Villa 22, Al Wasl · 31 orders this month</div>
            </div>
          </div>
          <div style={css('display: flex; gap: 26px; margin-top: 20px; padding-top: 18px; border-top: 1px solid #EFF1ED;')}>
            <div>
              <div style={css('font-size: 11.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .4px;')}>Spend this month</div>
              <div style={css('font-size: 28px; font-weight: 800; color: #2E7A12; letter-spacing: -1px;')}>AED 2,340</div>
            </div>
            <div>
              <div style={css('font-size: 11.5px; font-weight: 800; color: #7B857F; text-transform: uppercase; letter-spacing: .4px;')}>Prefers</div>
              <div style={css('font-size: 28px; font-weight: 800; letter-spacing: -1px;')}>Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {PROPS.showSeasonalAlert ? (
        <div className="fc-alert" style={css('background: #FFF6E2; border: 1.5px solid #F2D18A; border-radius: 20px; padding: 20px 24px; display: flex; align-items: center; gap: 18px;')}>
          <div style={css('width: 46px; height: 46px; border-radius: 14px; background: #E39A0B; display: grid; place-items: center;')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4v10M12 18h.01" />
            </svg>
          </div>
          <div style={css('flex: 1;')}>
            <div style={css('font-size: 17px; font-weight: 800; color: #7A5205;')}>Festive items usually spike next month — consider restocking</div>
            <div style={css('font-size: 13.5px; color: #96692A; font-weight: 600; margin-top: 4px;')}>
              Last year dates, nuts, laban and cooking oil sold 3.4× their normal volume in this period. 6 of those lines are already low on stock.
            </div>
          </div>
          <button className="hv-amber" onClick={onGoStock} style={css('background: #7A5205; color: #FFF6E2; border: none; border-radius: 12px; padding: 13px 20px; font-size: 14px; font-weight: 800; cursor: pointer;')}>
            Review 6 items
          </button>
        </div>
      ) : null}

      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px;')}>
        <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
          <div style={css('display: flex; align-items: baseline; gap: 10px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Best-selling products this month</div>
            <div style={css('font-size: 13px; color: #7B857F; font-weight: 600; margin-left: auto;')}>by units sold</div>
          </div>
          <div style={css('display: flex; flex-direction: column; gap: 2px; margin-top: 16px;')}>
            {bestSellers.map((p) => (
              <div key={p.name} style={css('display: grid; grid-template-columns: 34px 1fr 96px 80px; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid #F2F4F0;')}>
                <div style={css(p.rankStyle)}>{p.rank}</div>
                <div style={css('min-width: 0;')}>
                  <div style={css('font-size: 14.5px; font-weight: 700;')}>{p.name}</div>
                  <div style={css('height: 6px; border-radius: 3px; background: #F0F2EE; margin-top: 7px; overflow: hidden;')}>
                    <div style={css(p.barStyle)} />
                  </div>
                </div>
                <div style={css('font-size: 15px; font-weight: 800; text-align: right;')}>{p.units}</div>
                <div style={css('font-size: 13px; font-weight: 700; color: #2E7A12; text-align: right;')}>{p.revenue}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Category performance</div>
            <div style={css("font-size: 13px; color: #7B857F; font-weight: 600; margin-top: 3px;")}>Share of this month's revenue</div>
            <div style={css('display: flex; flex-direction: column; gap: 13px; margin-top: 18px;')}>
              {categories.map((c) => (
                <div key={c.name}>
                  <div style={css('display: flex; align-items: baseline; gap: 8px; font-size: 13.5px; font-weight: 700;')}>
                    <span>{c.name}</span>
                    <span style={css('margin-left: auto; font-weight: 800;')}>{c.value}</span>
                    <span style={css('color: #7B857F; font-weight: 700; width: 42px; text-align: right;')}>{c.pct}</span>
                  </div>
                  <div style={css('height: 10px; border-radius: 5px; background: #F0F2EE; margin-top: 6px; overflow: hidden;')}>
                    <div style={css(c.barStyle)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
            <div style={css('font-size: 17px; font-weight: 800;')}>Delivery vs curbside</div>
            <div style={css('display: flex; align-items: center; gap: 22px; margin-top: 16px;')}>
              <div style={css(`width:132px;height:132px;border-radius:50%;position:relative;flex:none;background:conic-gradient(${GREEN} 0 68%, #7A4BD0 68% 100%);`)}>
                <div style={css('position: absolute; inset: 22px; background: #FFFFFF; border-radius: 50%; display: grid; place-items: center;')}>
                  <div style={css('text-align: center;')}>
                    <div style={css('font-size: 22px; font-weight: 800; line-height: 1;')}>148</div>
                    <div style={css('font-size: 10.5px; font-weight: 700; color: #7B857F; text-transform: uppercase;')}>today</div>
                  </div>
                </div>
              </div>
              <div style={css('display: flex; flex-direction: column; gap: 14px;')}>
                <div>
                  <div style={css('display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700;')}>
                    <span style={css('width: 10px; height: 10px; border-radius: 3px; background: #47BB1C;')} />Home delivery
                  </div>
                  <div style={css('font-size: 20px; font-weight: 800; margin-top: 3px;')}>
                    101 <span style={css('font-size: 13px; color: #7B857F; font-weight: 700;')}>· 68%</span>
                  </div>
                </div>
                <div>
                  <div style={css('display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700;')}>
                    <span style={css('width: 10px; height: 10px; border-radius: 3px; background: #7A4BD0;')} />Curbside pickup
                  </div>
                  <div style={css('font-size: 20px; font-weight: 800; margin-top: 3px;')}>
                    47 <span style={css('font-size: 13px; color: #7B857F; font-weight: 700;')}>· 32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 22px 24px;')}>
        <div style={css('font-size: 17px; font-weight: 800;')}>Top customers by spend</div>
        <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 18px;')}>
          {TOP_CUSTOMERS.map((c) => (
            <div key={c.name} style={css('background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 16px; padding: 16px;')}>
              <div style={css('display: flex; align-items: center; gap: 10px;')}>
                <div style={css('width: 34px; height: 34px; border-radius: 50%; background: #E6F6DE; color: #2E7A12; display: grid; place-items: center; font-size: 12.5px; font-weight: 800;')}>{c.initials}</div>
                <div style={css('font-size: 13.5px; font-weight: 700; line-height: 1.2;')}>{c.name}</div>
              </div>
              <div style={css('font-size: 24px; font-weight: 800; letter-spacing: -.8px; margin-top: 12px;')}>{c.spend}</div>
              <div style={css('font-size: 12.5px; color: #7B857F; font-weight: 600; margin-top: 2px;')}>{c.orders} orders · {c.pref}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
