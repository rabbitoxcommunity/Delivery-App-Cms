/** Shimmering placeholder — used instead of plain "Loading…" text wherever a screen is waiting on its first fetch. */
export function Skeleton({ width = '100%', height = 14, radius = 8, style }) {
  return <div className="fc-skeleton" style={{ width, height, borderRadius: radius, ...style }} />
}

export function SkeletonRow({ columns = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12, padding: '14px 20px', alignItems: 'center' }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height={13} width={i === 0 ? '70%' : '50%'} />
      ))}
    </div>
  )
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="fc-metrics" style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: '#FFFFFF', border: '1px solid #EAEDE9', borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton width="60%" height={11} />
          <Skeleton width="45%" height={28} />
        </div>
      ))}
    </div>
  )
}
