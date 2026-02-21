import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function requireEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
  const value = process.env[name] || process.env[name.replace('NEXT_PUBLIC_', 'VITE_')]
  if (!value) {
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      // Log warning during build but don't crash if possible, 
      // though Supabase init needs these.
      console.warn(`[supabase] Warning: Missing ${name}.`)
      return ""
    }
    throw new Error(`[supabase] Missing ${name}. Check your .env.local / Vercel env vars.`)
  }
  return value
}

// NextJS Supabase Client
export const supabase: SupabaseClient = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
