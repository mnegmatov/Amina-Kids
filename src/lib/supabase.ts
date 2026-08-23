import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  // A missing/empty key here is the single most common cause of a 401
  // that only shows up deep inside a Supabase call (e.g. "customers").
  // Warn at startup; fallback data will be used automatically.
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not set. ' +
      'Using fallback product data.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)