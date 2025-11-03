import { supabase } from './supabase'

export async function sendPasswordResetWithSupabase(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/auth/reset-password`,
    })

    if (error) {
      console.error('Supabase password reset error:', error)
      throw new Error(error.message)
    }

    console.log('Password reset email sent via Supabase:', data)
    return data
  } catch (error) {
    console.error('Failed to send password reset via Supabase:', error)
    throw error
  }
}