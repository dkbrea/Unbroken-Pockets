import { supabase } from '@/lib/supabase'; // Corrected import path

// Remove original supabaseClient and initializationAttempts variables
// let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;
// let initializationAttempts = 0;

export function getSupabaseBrowser() {
  // Simply return the global Supabase client instance
  console.log('Using global Supabase client via getSupabaseBrowser'); // Optional: for tracing
  return supabase;
}

// Remove the rest of the old code that created a client and used hardcoded credentials 