import { supabase } from '@/lib/supabase'

export interface SendEmailData {
  userId: string
  lawmakerId: string
  emailSubject: string
  emailBody: string
}

export async function sendEmailToLawmaker(data: SendEmailData) {
  const { data: result, error } = await supabase.functions.invoke('send-email-to-lawmaker', {
    body: data,
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }

  return result
}
