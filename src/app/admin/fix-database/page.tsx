'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FixDatabasePage() {
  const router = useRouter()
  const [isFixing, setIsFixing] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [connectionInfo, setConnectionInfo] = useState<any>(null)
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [columnResult, setColumnResult] = useState<string | null>(null)
  const [isDirectFixing, setIsDirectFixing] = useState(false)
  const [directFixResult, setDirectFixResult] = useState<any>(null)

  const runFixScript = async () => {
    try {
      setIsFixing(true)
      setError(null)
      setResults([])
      setSuccess(false)

      // Call the API endpoint to fix the database
      const response = await fetch('/api/fix-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to run database fix script')
      }

      const data = await response.json()
      setResults(data.results || [])
      setSuccess(data.success)
    } catch (error: any) {
      console.error('Error fixing database:', error)
      setError(error.message || 'An unknown error occurred')
    } finally {
      setIsFixing(false)
    }
  }

  const checkDatabaseConnection = async () => {
    try {
      setIsCheckingConnection(true)
      setError(null)
      
      // Call the API endpoint to check database connection
      const response = await fetch('/api/check-db-connection')
      const data = await response.json()
      
      console.log('Connection check result:', data)
      setConnectionInfo(data)
      
      if (!data.success) {
        setError(data.error || 'Connection check failed')
      }
    } catch (error: any) {
      console.error('Error checking database connection:', error)
      setError(error.message || 'An unknown error occurred during connection check')
    } finally {
      setIsCheckingConnection(false)
    }
  }

  const addUserIdColumn = async () => {
    try {
      setIsAddingColumn(true)
      setError(null)
      setColumnResult(null)
      
      // Call the API endpoint to add the user_id column
      const response = await fetch('/api/add-user-id-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      console.log('Add column result:', data)
      
      if (data.success) {
        setColumnResult(data.message || 'Successfully added user_id column')
      } else {
        setError(data.error || 'Failed to add user_id column')
      }
    } catch (error: any) {
      console.error('Error adding user_id column:', error)
      setError(error.message || 'An unknown error occurred while adding column')
    } finally {
      setIsAddingColumn(false)
    }
  }

  const runDirectFix = async () => {
    try {
      setIsDirectFixing(true)
      setError(null)
      
      // Call the direct fix API endpoint
      const response = await fetch('/api/direct-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      console.log('Direct fix result:', data)
      
      if (data.success) {
        setDirectFixResult(data)
        setSuccess(true)
        setResults(['Direct fix applied successfully', 
                   ...Object.entries(data.results || {}).map(([key, val]) => `${key}: ${val ? 'Success' : 'Failed'}`)])
      } else {
        setError(data.error || 'Direct fix failed')
      }
    } catch (error: any) {
      console.error('Error running direct fix:', error)
      setError(error.message || 'An unknown error occurred during direct fix')
    } finally {
      setIsDirectFixing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Database Maintenance</h1>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This page allows you to run a maintenance script that will fix potential issues with your database.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                The script will:
              </p>
              <ul className="list-disc ml-5 mt-1 text-sm text-yellow-700">
                <li>Check if the accounts table exists and create it if needed</li>
                <li>Add the user_id column if it's missing</li>
                <li>Fix Row Level Security (RLS) policies</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={runDirectFix}
            disabled={isDirectFixing}
            className={`flex-1 py-3 rounded-md text-white font-medium ${
              isDirectFixing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isDirectFixing ? 'Running Direct Fix...' : 'Run Direct Fix (Recommended)'}
          </button>
          
          <button
            onClick={runFixScript}
            disabled={isFixing}
            className={`py-3 px-4 rounded-md text-white font-medium ${
              isFixing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isFixing ? 'Running Fix Script...' : 'Run Fix Script'}
          </button>
          
          <button
            onClick={addUserIdColumn}
            disabled={isAddingColumn}
            className={`py-3 px-4 rounded-md text-white font-medium ${
              isAddingColumn ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isAddingColumn ? 'Adding Column...' : 'Add user_id Column'}
          </button>
          
          <button
            onClick={checkDatabaseConnection}
            disabled={isCheckingConnection}
            className={`px-4 py-3 rounded-md font-medium border ${
              isCheckingConnection 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300'
            }`}
          >
            {isCheckingConnection ? 'Checking...' : 'Check Connection'}
          </button>
        </div>

        {/* Connection info display */}
        {connectionInfo && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-md font-medium text-gray-800 mb-2 flex items-center">
              <span className={connectionInfo.success ? "text-green-500" : "text-red-500"}>●</span>
              <span className="ml-2">Database Connection Status</span>
            </h3>
            
            <div className="overflow-auto max-h-60 text-sm">
              {/* Configuration */}
              <div className="mb-2">
                <p className="font-medium">Configuration:</p>
                <ul className="ml-5 list-disc">
                  <li>URL provided: {connectionInfo.config?.url_provided ? 'Yes' : 'No'}</li>
                  <li>API key provided: {connectionInfo.config?.key_provided ? 'Yes' : 'No'}</li>
                </ul>
              </div>
              
              {/* Schemas */}
              {connectionInfo.schemas && (
                <div className="mb-2">
                  <p className="font-medium">Available Schemas:</p>
                  <ul className="ml-5 list-disc">
                    {connectionInfo.schemas.map((schema: any) => (
                      <li key={schema.schema_name}>{schema.schema_name}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Tables */}
              {connectionInfo.tables && (
                <div className="mb-2">
                  <p className="font-medium">Public Tables:</p>
                  <ul className="ml-5 list-disc">
                    {connectionInfo.tables.map((table: any) => (
                      <li key={table.table_name}>{table.table_name}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* RPC Test */}
              {connectionInfo.rpc_test && (
                <div className="mb-2">
                  <p className="font-medium">RPC Function Test:</p>
                  <p className="ml-5">
                    Status: {connectionInfo.rpc_test.success ? 
                      <span className="text-green-600">Success</span> : 
                      <span className="text-red-600">Failed</span>
                    }
                  </p>
                  {connectionInfo.rpc_test.error && (
                    <div className="ml-5 mt-1">
                      <p className="text-red-600">Error: {connectionInfo.rpc_test.error.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Column addition result */}
        {columnResult && (
          <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Column Added</p>
                <p className="text-sm text-green-700 mt-1">{columnResult}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Success</p>
                <p className="text-sm text-green-700 mt-1">
                  Database fix operations completed successfully.
                </p>
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Operation Results</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <ul className="space-y-1 text-sm text-gray-700">
                {results.map((result, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-2">What Next?</h3>
          <p className="text-gray-600 mb-4">
            After running the fix script, return to the dashboard and try adding an account again.
            If you continue to experience issues, please contact support.
          </p>
          <div className="flex space-x-3">
            <Link
              href="/dashboard"
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/accounts"
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              View Accounts
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 