'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseExample() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');

  useEffect(() => {
    async function checkConnection() {
      try {
        // Simple query to check if we can connect
        const { data, error } = await supabase.from('_dummy_query_').select('*').limit(1);
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "Table not found" which is expected for a dummy query
          // If we get any other error, it's likely a connection issue
          setError(`Connection error: ${error.message}`);
          setConnectionStatus('failed');
        } else {
          setConnectionStatus('connected');
        }
      } catch (err) {
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
        setConnectionStatus('failed');
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Status</h2>
      
      {loading ? (
        <p>Checking connection to Supabase...</p>
      ) : connectionStatus === 'connected' ? (
        <div className="text-green-600">
          <p>✅ Connected to Supabase!</p>
          <p className="text-sm mt-2">
            You can now use the Supabase client to interact with your database.
          </p>
        </div>
      ) : (
        <div className="text-red-600">
          <p>❌ Failed to connect to Supabase</p>
          {error && <p className="text-sm mt-2">{error}</p>}
          <p className="text-sm mt-2">
            Please check your connection settings or make sure your Supabase instance is running.
          </p>
        </div>
      )}
    </div>
  );
} 