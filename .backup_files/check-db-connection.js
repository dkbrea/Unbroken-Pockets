import { createClient } from '@supabase/supabase-js'

// Create a direct Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Return DB connection details
  try {
    console.log('Checking Supabase connection...')
    console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 15) + '...' : 'NOT SET')
    console.log('Supabase Key Provided:', !!supabaseKey)
    
    // Step 1: Check connection by listing schemas
    const { data: schemas, error: schemaError } = await supabase
      .from('information_schema.schemata')
      .select('schema_name')
      .limit(5)
    
    if (schemaError) {
      console.error('Schema check error:', schemaError)
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to database',
        details: schemaError,
        config: {
          url_provided: !!supabaseUrl,
          key_provided: !!supabaseKey
        }
      })
    }
    
    console.log('Schemas found:', schemas.map(s => s.schema_name))
    
    // Step 2: Check public tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('Tables check error:', tablesError)
      return res.status(500).json({
        success: false,
        error: 'Failed to list tables',
        details: tablesError,
        schemas: schemas
      })
    }
    
    console.log('Public tables found:', tables.map(t => t.table_name))
    
    // Step 3: Try to use the RPC function
    let rpcResult = null
    let rpcError = null
    
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('create_accounts_table')
      rpcResult = rpcData
      rpcError = rpcErr
    } catch (e) {
      rpcError = {
        message: e.message,
        name: e.name
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Database connection check complete',
      schemas: schemas,
      tables: tables,
      rpc_test: {
        success: !rpcError,
        result: rpcResult,
        error: rpcError
      },
      config: {
        url_provided: !!supabaseUrl,
        key_provided: !!supabaseKey
      }
    })
  } catch (err) {
    console.error('Unexpected error checking database:', err)
    return res.status(500).json({
      success: false,
      error: 'Unexpected error checking database',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
} 