'use client';

import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('Testing Supabase connection via API...');
        
        // Use the server-side health check API
        const response = await fetch('/api/supabase-health');
        console.log('API response received:', response.status);
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (!response.ok || !data.connected) {
          throw new Error(data.message || 'Unknown error connecting to Supabase');
        }
        
        // If we get here, connection is successful
        console.log('Connection successful');
        setStatus('connected');
      } catch (error: any) {
        console.error('Error connecting to Supabase:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Unknown error occurred');
      }
    }

    // Start the connection test
    testConnection();
    
    // Set a timeout to update status even if the connection test hangs
    const timeoutId = setTimeout(() => {
      if (status === 'loading') {
        console.log('Connection test timed out after 8 seconds');
        setStatus('error');
        setErrorMessage('Connection test timed out. Check browser console for details.');
      }
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Supabase Connection Test</h1>
      
      <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Connection Status:</p>
        {status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', color: '#B45309' }}>
            <div style={{ marginRight: '0.5rem', height: '1rem', width: '1rem', borderRadius: '9999px', backgroundColor: '#B45309', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            Testing connection...
          </div>
        )}
        {status === 'connected' && (
          <div style={{ display: 'flex', alignItems: 'center', color: '#047857' }}>
            <div style={{ marginRight: '0.5rem', height: '1rem', width: '1rem', borderRadius: '9999px', backgroundColor: '#047857' }}></div>
            Successfully connected to Supabase!
          </div>
        )}
        {status === 'error' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#DC2626', marginBottom: '0.5rem' }}>
              <div style={{ marginRight: '0.5rem', height: '1rem', width: '1rem', borderRadius: '9999px', backgroundColor: '#DC2626' }}></div>
              Error connecting to Supabase
            </div>
            {errorMessage && (
              <p style={{ fontSize: '0.875rem', color: '#DC2626', backgroundColor: '#FEF2F2', padding: '0.5rem', borderRadius: '0.25rem' }}>{errorMessage}</p>
            )}
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Check the browser console (F12) for more details.
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'white', border: '1px solid #ddd' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Connection Details:</h2>
        <p style={{ marginBottom: '0.5rem' }}><strong>URL:</strong> https://vhtltupeibcofyopizxn.supabase.co</p>
        <p style={{ marginBottom: '0.5rem' }}><strong>Project Reference:</strong> vhtltupeibcofyopizxn</p>
        <p><strong>Status:</strong> {status === 'connected' ? 'Connected' : status === 'loading' ? 'Connecting...' : 'Failed'}</p>
      </div>
      
      {status === 'error' && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#FEF2F2', border: '1px solid #DC2626' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#DC2626' }}>Troubleshooting Steps:</h3>
          <ol style={{ paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Check if the Supabase project exists and is active</li>
            <li style={{ marginBottom: '0.5rem' }}>Verify the anon key is correct in .env.local</li>
            <li style={{ marginBottom: '0.5rem' }}>Check if there are any CORS restrictions on your Supabase project</li>
            <li>Refresh the page and try again</li>
          </ol>
        </div>
      )}
    </div>
  );
} 