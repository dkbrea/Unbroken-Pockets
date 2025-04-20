import { createClient } from '@supabase/supabase-js'

// Create a direct Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // First verify the accounts table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'accounts')
    
    if (tableError) {
      console.error('Error checking for accounts table:', tableError)
      return res.status(500).json({ 
        error: 'Error checking for accounts table', 
        details: tableError 
      })
    }
    
    if (!tables || tables.length === 0) {
      // The accounts table doesn't exist yet, so we need to create it first
      try {
        const { error: createError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            balance DECIMAL(12,2) NOT NULL,
            institution VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id VARCHAR(255)
          );
        `)
        
        if (createError) {
          console.error('Error creating accounts table:', createError)
          return res.status(500).json({ 
            error: 'Failed to create accounts table', 
            details: createError 
          })
        }
        
        return res.status(200).json({
          success: true,
          message: 'Accounts table created with user_id column'
        })
      } catch (sqlError) {
        console.error('SQL error creating table:', sqlError)
        return res.status(500).json({ 
          error: 'SQL error creating accounts table', 
          details: sqlError 
        })
      }
    }
    
    // The table exists, so check if the column exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'accounts')
      .eq('column_name', 'user_id')
    
    if (columnError) {
      console.error('Error checking for user_id column:', columnError)
      return res.status(500).json({ 
        error: 'Error checking for user_id column', 
        details: columnError 
      })
    }
    
    if (!columns || columns.length === 0) {
      // The column doesn't exist, add it
      try {
        const { error: alterError } = await supabase.query(`
          ALTER TABLE public.accounts ADD COLUMN user_id VARCHAR(255);
        `)
        
        if (alterError) {
          console.error('Error adding user_id column:', alterError)
          return res.status(500).json({ 
            error: 'Failed to add user_id column', 
            details: alterError 
          })
        }
        
        // Also set up RLS
        try {
          await supabase.query(`
            -- Enable RLS for the accounts table
            ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
            
            -- Drop any existing policies
            DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
            DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
            DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
            DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
            DROP POLICY IF EXISTS "Development mode access for anon users" ON accounts;
            DROP POLICY IF EXISTS "Allow all operations for any user" ON accounts;
          `)
          
          // For development, use a permissive policy
          await supabase.query(`
            -- Create simple permissive policy
            CREATE POLICY "Allow all operations for any user" ON accounts
            USING (true)
            WITH CHECK (true);
          `)
        } catch (rlsError) {
          console.warn('Warning: Could not set up RLS policies:', rlsError)
          // Continue anyway, we've added the column
        }
        
        return res.status(200).json({
          success: true,
          message: 'user_id column added to accounts table'
        })
      } catch (sqlError) {
        console.error('SQL error adding column:', sqlError)
        return res.status(500).json({ 
          error: 'SQL error adding user_id column', 
          details: sqlError 
        })
      }
    } else {
      // The column already exists
      return res.status(200).json({
        success: true,
        message: 'user_id column already exists'
      })
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ 
      error: 'Unexpected error',
      message: err.message
    })
  }
} 