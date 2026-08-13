import { css } from '../lib/css'
import { chip } from '../lib/design'
import { STAFF_DEFS } from '../lib/data'

export default function Staff() {
  const staff = STAFF_DEFS.map((d) => {
    const c =
      d.avail === 'Available'
        ? ['#E6F6DE', '#2E7A12']
        : d.avail === 'On delivery'
          ? ['#E1F0F5', '#0B5E86']
          : ['#EEF0EC', '#7B857F']
    return {
      ...d,
      availStyle: `display:inline-flex;background:${c[0]};color:${c[1]};font-size:12.5px;font-weight:800;padding:7px 12px;border-radius:9px;`,
      orders: d.orders.map((o) => ({ id: o[0], who: o[1], status: o[2], chipStyle: chip(o[2]) })),
    }
  })

  return (
    <div style={css('display: flex; flex-direction: column; gap: 16px;')}>
      <div style={css('background: #F1EAFB; border: 1px solid #DCC9F5; border-radius: 16px; padding: 15px 20px; display: flex; align-items: center; gap: 14px;')}>
        <span style={css('width: 34px; height: 34px; border-radius: 10px; background: #7A4BD0; display: grid; place-items: center;')}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15l2-5h12l2 5v3H4z" />
          </svg>
        </span>
        <div style={css('font-size: 14px; font-weight: 700; color: #4A2A85;')}>
          Orders are auto-assigned to the nearest available driver. Curbside pickups never consume a delivery person — staff hand them over at the bay.
        </div>
      </div>

      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;')}>
        {staff.map((d) => (
          <div key={d.name} style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 20px; padding: 20px 22px;')}>
            <div style={css('display: flex; align-items: center; gap: 14px;')}>
              <div style={css('width: 50px; height: 50px; border-radius: 50%; background: #F0F2EE; color: #37413A; display: grid; place-items: center; font-size: 16px; font-weight: 800;')}>{d.initials}</div>
              <div style={css('flex: 1;')}>
                <div style={css('font-size: 18px; font-weight: 800; letter-spacing: -.3px;')}>{d.name}</div>
                <div style={css('font-size: 13px; color: #7B857F; font-weight: 600;')}>{d.vehicle} · {d.phone}</div>
              </div>
              <span style={css(d.availStyle)}>{d.avail}</span>
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
              {d.orders.map((o) => (
                <div key={o.id} style={css('display: flex; align-items: center; gap: 12px; background: #FAFBF9; border: 1px solid #EFF1ED; border-radius: 12px; padding: 11px 14px;')}>
                  <span style={css('font-size: 13.5px; font-weight: 800;')}>#{o.id}</span>
                  <span style={css('font-size: 13.5px; font-weight: 600; color: #4C5850; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;')}>{o.who}</span>
                  <span style={css(o.chipStyle)}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
