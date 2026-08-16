import { css } from '../lib/css'
import { SkeletonRow } from './Skeleton'

/** Loading / error / empty placeholder, styled to match the table/card chrome used everywhere else. */
export default function StateBlock({ loading, error, empty, emptyText, onRetry, children }) {
  if (loading) {
    return (
      <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; padding: 8px 0; display: flex; flex-direction: column;')}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} columns={4} />
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <div
        style={css(
          'background: #FFF1EF; border: 1px solid #F3B4AC; border-radius: 18px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;',
        )}
      >
        <div style={css('font-size: 14.5px; font-weight: 800; color: #B3261E;')}>
          {error.message || 'Something went wrong loading this.'}
        </div>
        {onRetry ? (
          <button
            onClick={onRetry}
            style={css('background: #B3261E; color: #FFFFFF; border: none; border-radius: 11px; padding: 10px 18px; font-size: 13.5px; font-weight: 800; cursor: pointer;')}
          >
            Retry
          </button>
        ) : null}
      </div>
    )
  }
  if (empty) {
    return (
      <div style={css('background: #FFFFFF; border: 1px solid #EAEDE9; border-radius: 18px; padding: 40px; text-align: center; font-size: 14.5px; font-weight: 700; color: #7B857F;')}>
        {emptyText || 'Nothing here yet.'}
      </div>
    )
  }
  return children
}
