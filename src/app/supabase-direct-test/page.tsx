import { createClient } from '@supabase/supabase-js';

// Server component that tests the connection
export default async function SupabaseDirectTest() {
  let status = 'unknown';
  let message = '';
  
  try {
    // Create a new client instance directly
    const supabase = createClient(
      'https://vhtltupeibcofyopizxn.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.VKavoRA5X9L1RDjf25oKEZ--EtJxPkxVmttwHTIbbHw'
    );
    
    // Attempt a simple query
    let data = null;
    let error = null;
    
    try {
      const result = await supabase.from('_test').select('*').limit(1);
      data = result.data;
      error = result.error;
    } catch (queryError: any) {
      error = { message: queryError.message || 'Request failed' };
    }
    
    if (error) {
      // If it's a table not found error, that's still a successful connection
      if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
        status = 'connected';
        message = 'Table not found, but connection successful';
      } else {
        status = 'error';
        message = error.message;
      }
    } else {
      status = 'connected';
      message = 'Connection successful';
    }
  } catch (error: any) {
    status = 'error';
    message = error.message || 'Unknown error occurred';
  }
  
  // Choose color based on status
  const statusColor = status === 'connected' ? 'green' : status === 'error' ? 'red' : 'gray';
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Supabase Direct Connection Test
      </h1>
      
      <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '5px' }}>
        <p style={{ fontWeight: 'bold' }}>Connection Status:</p>
        <p style={{ color: statusColor }}>
          {status === 'connected' ? '✅ Connected' : status === 'error' ? '❌ Error' : '⏳ Unknown'}
        </p>
      </div>
      
      <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '5px' }}>
        <p style={{ fontWeight: 'bold' }}>Details:</p>
        <p>{message}</p>
      </div>
      
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <p style={{ fontWeight: 'bold' }}>Connection Info:</p>
        <p><strong>URL:</strong> https://vhtltupeibcofyopizxn.supabase.co</p>
        <p><strong>Project Reference:</strong> vhtltupeibcofyopizxn</p>
      </div>
    </div>
  );
} 