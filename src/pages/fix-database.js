import { useState } from 'react';

export default function FixDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runFix = async (endpoint) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error running database fix:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Database Fix Tool</h1>
      
      <div className="flex flex-col gap-4 mb-8">
        <p className="text-gray-700">
          Use these buttons to run the database fix scripts that will:
        </p>
        <div className="pl-4">
          <p className="text-gray-700">• Create the accounts table if it doesn't exist</p>
          <p className="text-gray-700">• Add user_id column if it doesn't exist</p>
          <p className="text-gray-700">• Setup Row Level Security policies properly</p>
        </div>
        
        <div className="flex gap-4 mt-4">
          <button 
            className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => runFix('fix-database')}
            disabled={isLoading}
          >
            {isLoading && !result && !error ? (
              <>
                <span className="inline-block animate-spin mr-2">⌛</span>
                Running...
              </>
            ) : (
              'Run Standard Fix'
            )}
          </button>

          <button 
            className={`px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => runFix('direct-fix-alt')}
            disabled={isLoading}
          >
            {isLoading && !result && !error ? (
              <>
                <span className="inline-block animate-spin mr-2">⌛</span>
                Running...
              </>
            ) : (
              'Run Alternative Fix (Hardcoded)'
            )}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Running database fix...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Fix Result:</h2>
          <pre className="p-4 bg-gray-50 rounded-md w-full overflow-x-auto whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}