import { createClient as createClientBase } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClientBase(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
); 