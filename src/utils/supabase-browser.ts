import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;
let initializationAttempts = 0;

export function getSupabaseBrowser() {
  // If client already exists, return it
  if (supabaseClient) {
    console.log('Using existing Supabase client');
    return supabaseClient;
  }

  initializationAttempts++;
  console.log(`Initializing Supabase client (attempt ${initializationAttempts})`);

  try {
    // Use hardcoded values for the test
    const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
    // Hardcoded anon key for testing
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.VKavoRA5X9L1RDjf25oKEZ--EtJxPkxVmttwHTIbbHw';

    console.log(`Creating Supabase client with URL: ${supabaseUrl}`);
    
    // Create the client with additional debugging options
    supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-client-info': 'supabase-js/2.x'
        }
      }
    });

    console.log('Supabase client created successfully');
    return supabaseClient;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
} 