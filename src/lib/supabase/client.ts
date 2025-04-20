import { createClient as createClientBase } from '@supabase/supabase-js'

// Get the Supabase URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Get project reference from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || ''

export function createClient() {
  return createClientBase(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Match cookie name format that Supabase uses
        storageKey: `sb-${projectRef}-auth-token`
      }
    }
  )
} 