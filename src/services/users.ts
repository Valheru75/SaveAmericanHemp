import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/supabase'

export interface CreateUserData {
  email: string
  zipCode: string
  role: UserRole
}

export async function createUser(data: CreateUserData) {
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: data.email,
      zip_code: data.zipCode,
      role: data.role,
    })
    .select()
    .single()

  if (error) {
    // Check if user already exists
    if (error.code === '23505') { // unique violation
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email)
        .single()

      if (existingUser) {
        return existingUser
      }
    }
    throw error
  }

  return user
}
