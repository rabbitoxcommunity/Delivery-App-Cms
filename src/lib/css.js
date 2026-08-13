// The source design expresses every rule as an inline CSS string. Keeping those
// strings verbatim is what guarantees the rendered result is pixel-identical, so
// instead of hand-translating them we parse them into React style objects once
// and memoise the result.
const cache = new Map()

export function css(str) {
  if (!str) return undefined
  if (typeof str === 'object') return str

  const hit = cache.get(str)
  if (hit) return hit

  const out = {}
  for (const decl of str.split(';')) {
    const i = decl.indexOf(':')
    if (i === -1) continue
    const prop = decl.slice(0, i).trim()
    const value = decl.slice(i + 1).trim()
    if (!prop || !value) continue
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    out[key] = value
  }

  cache.set(str, out)
  return out
}
