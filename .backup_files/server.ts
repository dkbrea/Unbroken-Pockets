import { createClient as createClientBase } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Get the Supabase URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Get project reference from URL 
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || ''

export async function createClient() {
  const cookieStore = cookies()
  
  // Convert cookies to a header string
  const cookieHeader = cookieStore.toString()
  
  console.log('Server cookie header length:', cookieHeader?.length || 0)
  
  return createClientBase(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Match cookie name format that Supabase uses
        storageKey: `sb-${projectRef}-auth-token`
      },
      global: {
        headers: {
          cookie: cookieHeader,
        },
      },
    }
  )
} 