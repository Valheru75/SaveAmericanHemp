import { useState } from 'react'
import { lookupLawmakers, type LawmakerLookupResult } from '@/services/lawmakers'

interface UseLawmakerLookupReturn {
  lookup: (zipCode: string) => Promise<void>
  result: LawmakerLookupResult | null
  loading: boolean
  error: Error | null
}

export function useLawmakerLookup(): UseLawmakerLookupReturn {
  const [result, setResult] = useState<LawmakerLookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const lookup = async (zipCode: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await lookupLawmakers(zipCode)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return { lookup, result, loading, error }
}
