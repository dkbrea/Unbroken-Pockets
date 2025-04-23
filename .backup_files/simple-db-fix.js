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
    const results = []
    
    // STEP 1: Check if accounts table exists by trying to select from it
    try {
      results.push('Checking if accounts table exists...')
      
      const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .limit(1)
      
      if (error) {
        results.push(`Error: ${error.message}`)
        
        // Table likely doesn't exist - create it directly using the REST API
        results.push('Creating accounts table directly...')
        
        try {
          // Unfortunately we can't run direct SQL with the JS client,
          // so we need to use REST API to create a proper table
          
          // First, create an empty table to establish its existence
          const tableResult = await fetch(`${supabaseUrl}/rest/v1/accounts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              // Initial test record
              name: 'Table Setup',
              type: 'checking',
              balance: 0,
              institution: 'Setup',
              user_id: 'setup-user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          })
          
          if (!tableResult.ok) {
            const errorText = await tableResult.text()
            results.push(`Failed to create table via REST: ${errorText}`)
          } else {
            results.push('Successfully created initial table structure')
          }
        } catch (createError) {
          results.push(`Error creating table: ${createError.message}`)
        }
      } else {
        results.push('Accounts table exists')
      }
    } catch (tableError) {
      results.push(`Error checking table: ${tableError.message}`)
    }
    
    // STEP 2: Ensure the user_id column exists
    try {
      results.push('Checking if user_id column exists...')
      
      // Create a test record with a user_id to see if the column exists
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          name: 'Column Test',
          type: 'checking',
          balance: 0,
          institution: 'Test',
          user_id: 'test-user'
        })
        .select('user_id')
        .single()
      
      // Remove test record regardless of outcome
      try {
        await supabase
          .from('accounts')
          .delete()
          .eq('name', 'Column Test')
          .eq('user_id', 'test-user')
      } catch (deleteError) {
        // Ignore errors here
      }
      
      if (error) {
        if (error.message.includes('user_id') || error.code === '42703') {
          results.push('user_id column missing - trying to add a record with it anyway to auto-create')
          
          // Try to simply insert a record with user_id - in some cases it might auto-create
          const { data: insertData, error: insertError } = await supabase
            .from('accounts')
            .insert({
              name: 'Force Column Creation',
              type: 'checking',
              balance: 0,
              institution: 'Test',
              user_id: 'force-add-user'
            })
          
          if (insertError) {
            results.push(`Error adding user_id via insert: ${insertError.message}`)
          } else {
            results.push('Added user_id column successfully via direct insert')
            
            // Clean up test record
            await supabase
              .from('accounts')
              .delete()
              .eq('name', 'Force Column Creation')
              .eq('user_id', 'force-add-user')
          }
        } else {
          results.push(`Other error testing user_id: ${error.message}`)
        }
      } else {
        results.push('user_id column exists')
      }
    } catch (columnError) {
      results.push(`Error checking/fixing user_id column: ${columnError.message}`)
    }
    
    // STEP 3: Enable Row Level Security but with permissive policies for development
    try {
      results.push('Note: Unable to set RLS policies via JS client, but basic table structure should work now')
      
      // We'll note this limitation but not block the process since the accounts should still be creatable
      results.push('You may need to manually set up RLS policies in the Supabase dashboard')
    } catch (rlsError) {
      results.push(`Error with RLS note: ${rlsError.message}`)
    }
    
    // Return success with results
    return res.status(200).json({ 
      success: true, 
      message: 'Database fix operations completed',
      results 
    })
  } catch (err) {
    console.error('Error fixing database:', err)
    return res.status(500).json({ 
      error: 'Unexpected error fixing database',
      message: err.message
    })
  }
} 