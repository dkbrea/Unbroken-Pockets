import { createClient } from '@supabase/supabase-js'

// Create a direct Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Attempt to run the fix directly
    const fixResults = []
    
    // First, verify that the Supabase connection is working
    try {
      // Use a simple RPC call to check connection
      const { data: connectionCheck, error: connectionError } = await supabase.rpc('check_if_accounts_table_exists')
      
      if (connectionError) {
        console.error('Database connection error:', connectionError)
        return res.status(500).json({ 
          error: 'Database connection failed',
          details: connectionError,
          message: 'Could not connect to the Supabase database. Please check your credentials and connection.'
        })
      }
      
      fixResults.push('Database connection successful')
    } catch (connectionError) {
      console.error('Connection check error:', connectionError)
      return res.status(500).json({
        error: 'Database connection failed',
        details: connectionError,
        message: 'Could not connect to the Supabase database'
      })
    }
    
    // Step 1: Check and create the accounts table if needed
    try {
      console.log('Checking for accounts table...')
      const { data: tableExists, error: tableCheckError } = await supabase.rpc('check_if_accounts_table_exists')
      
      if (tableCheckError) {
        console.error('Error checking for accounts table:', tableCheckError)
        fixResults.push(`Error checking for accounts table: ${tableCheckError.message}`)
        return res.status(500).json({ 
          error: 'Error checking for accounts table',
          details: tableCheckError,
          fixResults 
        })
      }
      
      if (!tableExists) {
        fixResults.push('accounts table does not exist - creating it')
        
        // Try using the RPC function to create the table
        try {
          const { error: createTableError } = await supabase.rpc('create_accounts_table')
          
          if (createTableError) {
            fixResults.push(`Failed to create accounts table via RPC: ${createTableError.message}`)
            return res.status(500).json({ 
              error: 'Failed to create accounts table',
              details: createTableError,
              results: fixResults
            })
          }
          
          fixResults.push('accounts table created successfully via RPC')
        } catch (rpcError) {
          fixResults.push(`RPC error creating table: ${rpcError.message}`)
          return res.status(500).json({
            error: 'Could not create accounts table',
            details: rpcError,
            results: fixResults
          })
        }
      } else {
        fixResults.push('accounts table exists')
      }
    } catch (tableCheckError) {
      console.error('Error during table check:', tableCheckError)
      fixResults.push(`Error during table check: ${tableCheckError.message}`)
      return res.status(500).json({
        error: 'Error during table check',
        details: tableCheckError,
        results: fixResults
      })
    }
    
    // Step 2: Add user_id column if it doesn't exist
    try {
      fixResults.push('Ensuring user_id column exists')
      const { error: columnError } = await supabase.rpc('add_user_id_column_to_accounts')
      
      if (columnError) {
        fixResults.push(`Error ensuring user_id column exists: ${columnError.message}`)
      } else {
        fixResults.push('user_id column check completed successfully')
      }
    } catch (columnError) {
      fixResults.push(`Error in user_id column check: ${columnError.message}`)
    }
    
    // Step 3: Set up RLS policies (using a proper RPC function)
    try {
      fixResults.push('Setting up RLS policies for accounts table')
      const { error: rlsError } = await supabase.rpc('setup_accounts_rls_policies')
      
      if (rlsError) {
        fixResults.push(`Error setting up RLS policies: ${rlsError.message}`)
      } else {
        fixResults.push('RLS policies setup completed successfully')
      }
    } catch (rlsError) {
      fixResults.push(`Error in RLS policy setup: ${rlsError.message}`)
    }
    
    // Return success with results
    return res.status(200).json({ 
      success: true, 
      message: 'Database fix operations completed',
      results: fixResults
    })
  } catch (err) {
    console.error('Error fixing database:', err)
    return res.status(500).json({ 
      error: 'Unexpected error fixing database',
      message: err.message
    })
  }
} 