import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic data-fetching hook shared by every screen. `fetcher` is called
 * once on mount and again whenever `deps` changes or `reload()` is called
 * explicitly (used after a mutation, so the list reflects what was just
 * written rather than trusting an optimistic guess).
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, loading, error, reload }
}
