import { useState, useRef, useEffect } from 'react'
import { lookupLawmakers, type LawmakerLookupResult } from '@/services/lawmakers'

export interface UseLawmakerLookupReturn {
  lookup: (zipCode: string) => Promise<void>
  result: LawmakerLookupResult | null
  loading: boolean
  error: Error | null
  reset: () => void
}

export function useLawmakerLookup(): UseLawmakerLookupReturn {
  const [result, setResult] = useState<LawmakerLookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const lookup = async (zipCode: string) => {
    // Validate zip code
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      const validationError = new Error('Invalid zip code. Must be 5 digits.')
      setError(validationError)
      setLoading(false)
      return
    }

    setResult(null)
    setError(null)
    setLoading(true)

    try {
      const data = await lookupLawmakers(zipCode)
      if (isMountedRef.current) {
        setResult(data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    setLoading(false)
  }

  return { lookup, result, loading, error, reset }
}
