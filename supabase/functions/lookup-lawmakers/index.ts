import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
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
          headers: { 'Content-Type': 'application/json' },
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

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Process lawmakers
    const lawmakerIds: string[] = []

    if (civicData.offices && civicData.officials) {
      for (const office of civicData.offices) {
        if (!office.officialIndices) continue

        // Determine chamber from office name
        const chamber = office.name.toLowerCase().includes('senate')
          ? 'senate'
          : 'house'

        for (const index of office.officialIndices) {
          const official = civicData.officials[index]
          if (!official) continue

          // Create external ID from name and office (unique identifier)
          const externalId = `${official.name.replace(/\s+/g, '-').toLowerCase()}-${chamber}`

          // Extract state from division ID (e.g., "ocd-division/country:us/state:ca")
          const stateMatch = office.divisionId.match(/state:([a-z]{2})/)
          const state = stateMatch ? stateMatch[1].toUpperCase() : 'US'

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
            await supabase
              .from('lawmakers')
              .update({ last_synced_at: new Date().toISOString() })
              .eq('id', existing.id)

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

    return new Response(JSON.stringify({ lawmakerIds }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error in lookup-lawmakers:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
