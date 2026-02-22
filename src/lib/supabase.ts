import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Helper to get env vars without crashing the browser
const getEnv = (name: string): string => {
  const value = process.env[name] || '';
  if (!value && typeof window !== 'undefined') {
    console.warn(`[supabase] Warning: ${name} is not defined in the browser.`);
  }
  return value;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Initialize with fallback strings to avoid "supabaseUrl is required" error
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)