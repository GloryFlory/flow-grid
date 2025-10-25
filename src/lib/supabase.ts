import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  // We intentionally do not throw here so that dev environments without keys won't crash the editor.
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_KEY not set; supabase operations will fail at runtime')
}

export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export default supabase
