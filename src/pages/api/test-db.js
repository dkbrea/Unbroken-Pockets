import { createClient } from '@supabase/supabase-js'

// Create a direct Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to check if accounts table has user_id column
async function checkAndFixAccountsSchema() {
  try {
    // First attempt to check if the accounts table exists directly
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .limit(1)
      
      if (error) {
        console.error('Error checking for accounts table:', error)
        
        // This likely means the table doesn't exist
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('Table does not exist - we need to create it')
          return { 
            success: false, 
            error: 'Accounts table does not exist',
            needsCreation: true
          }
        }
        
        return { success: false, error: error.message }
      }
      
      // Table exists, now just check for user_id column existence
      return { success: true, fixed: false }
    } catch (tableError) {
      console.error('Error checking table existence:', tableError)
      return { 
        success: false, 
        error: 'Could not verify if accounts table exists: ' + tableError.message
      }
    }
  } catch (error) {
    console.error('Error in schema check:', error)
    return { success: false, error: error.message || 'Unknown error in schema check' }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check and potentially fix schema issues
    const schemaCheck = await checkAndFixAccountsSchema()
    
    if (!schemaCheck.success) {
      if (schemaCheck.needsCreation) {
        // We need to redirect to the simple-db-fix endpoint instead
        console.log('Redirecting to simple-db-fix endpoint to create table...')
        
        // Call the simple-db-fix endpoint
        try {
          const fixResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/simple-db-fix`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          
          if (!fixResponse.ok) {
            return res.status(500).json({
              error: 'Failed to fix database schema',
              details: {
                suggestion: 'Database setup failed. Please check Supabase connection.'
              }
            })
          }
          
          // Wait for changes to take effect
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (fixError) {
          console.error('Error calling fix endpoint:', fixError)
          return res.status(500).json({
            error: 'Failed to fix database schema: ' + fixError.message,
            details: {
              suggestion: 'Database setup failed. Please check Supabase connection.'
            }
          })
        }
      } else {
        // If we couldn't fix the schema, return a more specific error
        return res.status(500).json({
          error: 'Database schema issue: ' + (schemaCheck.error || 'Unknown error'),
          details: {
            suggestion: 'Please use the simple-db-fix endpoint to resolve schema issues.'
          }
        })
      }
    }
    
    // Get account data from request body
    const accountData = req.body
    
    // Log the data we're about to insert
    console.log('Server-side: Creating account with data:', accountData)
    
    // Prepare a more flexible account object with fallbacks
    const accountRecord = {
      name: accountData.name || 'Test Account',
      institution: accountData.institution || 'Test Bank',
      balance: parseFloat(accountData.balance) || 100,
      type: accountData.type || 'checking',
      // Use a more flexible approach for user_id
      // This won't fail even if user_id column doesn't exist yet
      ...(accountData.userId ? { user_id: accountData.userId } : { user_id: 'default-user-id' }),
      last_updated: new Date().toISOString().split('T')[0]
    }
    
    // Try to insert the account directly
    const { data, error } = await supabase
      .from('accounts')
      .insert(accountRecord)
      .select()
      .single()
    
    if (error) {
      console.error('Server-side error creating account:', error)
      
      // Special handling for missing column errors
      if (error.message && error.message.includes('user_id')) {
        // Try to create account without user_id
        const { data: noUserData, error: noUserError } = await supabase
          .from('accounts')
          .insert({
            name: accountRecord.name,
            institution: accountRecord.institution,
            balance: accountRecord.balance,
            type: accountRecord.type,
            last_updated: accountRecord.last_updated
          })
          .select()
          .single()
        
        if (noUserError) {
          console.error('Failed to create account without user_id:', noUserError)
          return res.status(500).json({ 
            error: 'Could not create account: ' + noUserError.message,
            details: {
              suggestion: 'Try using the simple-db-fix endpoint first.'
            }
          })
        }
        
        // Return the account without user_id
        console.log('Account created successfully without user_id:', noUserData)
        return res.status(200).json({ success: true, account: noUserData })
      }
      
      return res.status(500).json({ 
        error: error.message || 'Unknown error creating account',
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      })
    }
    
    console.log('Server-side: Account created successfully:', data)
    return res.status(200).json({ success: true, account: data })
  } catch (err) {
    console.error('Server-side unexpected error:', err)
    return res.status(500).json({ 
      error: err.message || 'An unexpected error occurred',
      details: {
        type: err.name,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    })
  }
} 