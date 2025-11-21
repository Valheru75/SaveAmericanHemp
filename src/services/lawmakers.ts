import { supabase } from '@/lib/supabase'
import type { Lawmaker } from '@/lib/supabase'

export interface LawmakerLookupResult {
  senators: Lawmaker[]
  representative: Lawmaker | null
}

export async function lookupLawmakers(zipCode: string): Promise<LawmakerLookupResult> {
  // Call the Edge Function
  const { data, error } = await supabase.functions.invoke('lookup-lawmakers', {
    body: { zipCode },
  })

  if (error) {
    const errorMessage = error.message || error.toString() || 'Unknown error occurred'
    throw new Error(`Failed to lookup lawmakers: ${errorMessage}`)
  }

  return data as LawmakerLookupResult
}
