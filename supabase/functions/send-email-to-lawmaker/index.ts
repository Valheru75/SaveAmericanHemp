import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, lawmakerId, emailSubject, emailBody } = await req.json()

    if (!userId || !lawmakerId || !emailSubject || !emailBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    // Fetch lawmaker
    const { data: lawmaker, error: lawmakerError } = await supabase
      .from('lawmakers')
      .select('*')
      .eq('id', lawmakerId)
      .single()

    if (lawmakerError || !lawmaker) {
      throw new Error('Lawmaker not found')
    }

    if (!lawmaker.email) {
      throw new Error('Lawmaker does not have an email address on file')
    }

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hemp Action Campaign <action@dontbanhemp.org>',
        to: [lawmaker.email],
        reply_to: [user.email],
        subject: emailSubject,
        text: emailBody,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    // Log email action
    const { error: logError } = await supabase
      .from('email_actions')
      .insert({
        user_id: userId,
        lawmaker_id: lawmakerId,
        email_subject: emailSubject,
        email_body: emailBody,
        resend_message_id: resendData.id,
        status: 'sent',
      })

    if (logError) {
      console.error('Failed to log email action:', logError)
    }

    return new Response(
      JSON.stringify({ success: true, message_id: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
