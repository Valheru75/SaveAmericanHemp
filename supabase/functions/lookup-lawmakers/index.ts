import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_CIVIC_API_KEY = Deno.env.get('GOOGLE_CIVIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface LookupRequest {
  zipCode: string
}

interface GoogleCivicOfficial {
  name: string
  party?: string
  phones?: string[]
  emails?: string[]
  photoUrl?: string
  urls?: string[]
  channels?: Array<{ type: string; id: string }>
  address?: Array<{
    line1?: string
    line2?: string
    city?: string
    state?: string
    zip?: string
  }>
}

interface GoogleCivicOffice {
  name: string
  divisionId: string
  levels?: string[]
  roles?: string[]
  officialIndices?: number[]
}

interface GoogleCivicResponse {
  normalizedInput?: {
    line1?: string
    city?: string
    state?: string
    zip?: string
  }
  offices?: GoogleCivicOffice[]
  officials?: GoogleCivicOfficial[]
}

serve(async (req) => {
  // Validate environment variables
  if (!GOOGLE_CIVIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST',
      },
    })
  }

  try {
    // Parse request
    const { zipCode }: LookupRequest = await req.json()

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid zip code. Must be 5 digits.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Call Google Civic Information API
    const civicUrl = `https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&levels=country&roles=legislatorUpperBody&roles=legislatorLowerBody&key=${GOOGLE_CIVIC_API_KEY}`

    const civicResponse = await fetch(civicUrl)

    if (!civicResponse.ok) {
      throw new Error(`Google Civic API error: ${civicResponse.statusText}`)
    }

    const civicData: GoogleCivicResponse = await civicResponse.json()

    // Extract state from normalized input
    const state = civicData.normalizedInput?.state?.toUpperCase()

    if (!state) {
      return new Response(
        JSON.stringify({ error: 'Could not determine state from zip code' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Process lawmakers
    const lawmakerIds: string[] = []

    if (civicData.offices && civicData.officials) {
      for (const office of civicData.offices) {
        if (!office.officialIndices) continue

        // Determine chamber from office name
        const officeName = office.name.toLowerCase()
        const chamber = officeName.includes('senate')
          ? 'senate'
          : officeName.includes('house') || officeName.includes('representative')
          ? 'house'
          : null

        if (!chamber) {
          console.warn('Could not determine chamber for office:', office.name)
          continue
        }

        for (const index of office.officialIndices) {
          const official = civicData.officials[index]
          if (!official) continue

          // Create external ID from name and office (unique identifier)
          const externalId = `${state.toLowerCase()}-${chamber}-${official.name.replace(/\s+/g, '-').toLowerCase()}`

          // Extract district from division ID if present
          const districtMatch = office.divisionId.match(/cd:(\d+)/)
          const district = districtMatch ? districtMatch[1] : null

          // Check if lawmaker exists
          const { data: existing } = await supabase
            .from('lawmakers')
            .select('id')
            .eq('external_id', externalId)
            .single()

          if (existing) {
            // Update last_synced_at
            const { error: updateError } = await supabase
              .from('lawmakers')
              .update({ last_synced_at: new Date().toISOString() })
              .eq('id', existing.id)

            if (updateError) {
              console.error('Error updating lawmaker:', updateError)
            }

            lawmakerIds.push(existing.id)
          } else {
            // Create new lawmaker
            const { data: newLawmaker, error } = await supabase
              .from('lawmakers')
              .insert({
                external_id: externalId,
                name: official.name,
                chamber,
                state,
                district,
                party: official.party || null,
                photo_url: official.photoUrl || null,
                email: official.emails?.[0] || null,
                phone: official.phones?.[0] || null,
                contact_form_url: official.urls?.[0] || null,
                office_addresses: official.address || null,
              })
              .select('id')
              .single()

            if (error) {
              console.error('Error creating lawmaker:', error)
            } else if (newLawmaker) {
              lawmakerIds.push(newLawmaker.id)
            }
          }
        }
      }
    }

    // Return empty result if no lawmakers found
    if (lawmakerIds.length === 0) {
      return new Response(
        JSON.stringify({ senators: [], representative: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch full lawmaker objects
    const { data: lawmakers, error: fetchError } = await supabase
      .from('lawmakers')
      .select('*')
      .in('id', lawmakerIds)

    if (fetchError) {
      throw new Error(`Error fetching lawmakers: ${fetchError.message}`)
    }

    // Separate senators and representative
    const senators = lawmakers?.filter(l => l.chamber === 'senate') || []
    const representative = lawmakers?.find(l => l.chamber === 'house') || null

    return new Response(
      JSON.stringify({ senators, representative }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in lookup-lawmakers:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
