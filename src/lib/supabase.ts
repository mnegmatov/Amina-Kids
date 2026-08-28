import { createClient } from '@supabase/supabase-js'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  !envUrl.includes('placeholder') &&
  !envKey.includes('placeholder') &&
  envUrl.startsWith('http')
)

const supabaseUrl = isSupabaseConfigured ? envUrl : 'https://placeholder.supabase.co'
const supabasePublishableKey = isSupabaseConfigured ? envKey : 'placeholder-anon-key'

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not set or using placeholder values. ' +
      'Using fallback product data.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)