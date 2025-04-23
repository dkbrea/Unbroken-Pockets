import { useState } from 'react';
import { syncLocalRecurringToSupabase } from '@/lib/syncLocalRecurringData';
import { Cloud, CloudOff, AlertCircle, CheckCircle } from 'lucide-react';

type SyncRecurringButtonProps = {
  className?: string;
  onSync?: () => void;
};

const SyncRecurringButton = ({ className = '', onSync }: SyncRecurringButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncResult({ status: 'idle', message: '' });
      
      const result = await syncLocalRecurringToSupabase();
      
      if (result.success) {
        if (result.newlySynced > 0) {
          setSyncResult({
            status: 'success',
            message: `Successfully synced ${result.newlySynced} transactions to the database.`
          });
        } else {
          setSyncResult({
            status: 'success',
            message: 'All transactions are already in sync.'
          });
        }
        
        // Call the callback if provided
        if (onSync) {
          onSync();
        }
      } else {
        setSyncResult({
          status: 'error',
          message: `Error syncing transactions: ${result.error?.message || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error syncing recurring transactions:', error);
      setSyncResult({
        status: 'error',
        message: `Unexpected error: ${(error as Error).message || 'Unknown error'}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSyncing ? (
          <>
            <Cloud className="w-5 h-5 mr-2 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <Cloud className="w-5 h-5 mr-2" />
            Sync Local Data
          </>
        )}
      </button>
      
      {syncResult.status !== 'idle' && (
        <div className={`mt-2 text-sm p-2 rounded-md ${
          syncResult.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {syncResult.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="ml-2">{syncResult.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncRecurringButton; 