import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function requireEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
  const value = process.env[name]
  if (!value) {
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
