import { createPortal } from 'react-dom'

/**
 * Renders children at document.body, outside the routed screen tree.
 *
 * Anything `position: fixed` MUST go through this. `.fc-content` carries the
 * `fc-fade-up` entrance animation, and a CSS animation with `fill-mode: both`
 * leaves the element with a transform once it finishes — even an identity
 * `matrix(1,0,0,1,0,0)`. A non-`none` transform makes that element the
 * containing block for fixed descendants, so a modal backdrop resolved
 * `inset: 0` against the content box instead of the viewport: it covered
 * 381px of a 900px window, started below the header and right of the sidebar,
 * and centred the modal 126px off.
 *
 * A portal sidesteps the whole class of problem rather than depending on no
 * ancestor ever growing a transform, filter or perspective.
 */
export default function Portal({ children }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}
