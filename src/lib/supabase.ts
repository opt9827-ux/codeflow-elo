import { createClient } from '@supabase/supabase-js'

// Using the '!' tells TypeScript these MUST exist.
// Direct access to process.env ensures the Next.js compiler 'inlines' the values.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})