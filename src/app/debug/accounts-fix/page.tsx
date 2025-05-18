'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AccountsFix() {
  const [status, setStatus] = useState<string>('Checking database status...')
  const [accounts, setAccounts] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isFixing, setIsFixing] = useState(false)

  useEffect(() => {
    checkDatabase()
  }, [])

  async function checkDatabase() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        setStatus(`Auth error: ${authError.message}`)
        return
      }
      
      if (!user) {
        setStatus('No user logged in. Please sign in first.')
        return
      }
      
      setUser(user)
      
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
      
      if (accountsError) {
        setStatus(`Error fetching accounts: ${accountsError.message}`)
        return
      }
      
      setAccounts(accountsData || [])
      
      const missingUserIdAccounts = accountsData.filter(acc => !acc.user_id)
      
      if (missingUserIdAccounts.length > 0) {
        setStatus(`Found ${missingUserIdAccounts.length} accounts with missing user_id.`)
      } else if (accountsData.length === 0) {
        setStatus('No accounts found in the database.')
      } else {
        const userAccounts = accountsData.filter(acc => acc.user_id === user.id)
        if (userAccounts.length === 0) {
          setStatus(`Found ${accountsData.length} accounts, but none belong to your user ID (${user.id}).`)
        } else {
          setStatus(`Found ${userAccounts.length} accounts belonging to your user ID (${user.id}).`)
        }
      }
    } catch (error: any) {
      setStatus(`Unexpected error: ${error.message}`)
    }
  }

  async function fixAccounts() {
    setIsFixing(true)
    try {
      const { data: accountsWithoutUserId, error: queryError } = await supabase
        .from('accounts')
        .select('id')
        .is('user_id', null)
      
      if (queryError) {
        setStatus(`Error querying accounts: ${queryError.message}`)
        setIsFixing(false)
        return
      }
      
      let updatedCount = 0
      
      for (const account of accountsWithoutUserId || []) {
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ user_id: user.id })
          .eq('id', account.id)
        
        if (!updateError) {
          updatedCount++
        }
      }
      
      if (updatedCount === 0) {
        const { data: otherAccounts, error: otherAccountsError } = await supabase
          .from('accounts')
          .select('id')
          .neq('user_id', user.id)
        
        if (!otherAccountsError && otherAccounts.length > 0) {
          if (confirm(`Found ${otherAccounts.length} accounts belonging to other users. Do you want to claim them?`)) {
            for (const account of otherAccounts) {
              const { error: updateError } = await supabase
                .from('accounts')
                .update({ user_id: user.id })
                .eq('id', account.id)
              
              if (!updateError) {
                updatedCount++
              }
            }
          }
        }
      }
      
      await checkDatabase()
      setStatus(`Fixed ${updatedCount} accounts. Refresh the Accounts page to see your accounts.`)
    } catch (error: any) {
      setStatus(`Fix error: ${error.message}`)
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Accounts Database Fix</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Database Status</h2>
        <p className="mb-4">{status}</p>
        
        {user && (
          <div className="mb-4">
            <p><strong>Your user ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={checkDatabase}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
            disabled={isFixing}
          >
            Refresh Status
          </button>
          
          <button
            onClick={fixAccounts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={isFixing}
          >
            {isFixing ? 'Fixing...' : 'Fix Accounts'}
          </button>
        </div>
      </div>
      
      {accounts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">All Accounts ({accounts.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map(account => (
                  <tr key={account.id} className={account.user_id === user?.id ? 'bg-green-50' : account.user_id ? 'bg-yellow-50' : 'bg-red-50'}>
                    <td className="px-4 py-2 text-sm">{account.id}</td>
                    <td className="px-4 py-2 text-sm">{account.name}</td>
                    <td className="px-4 py-2 text-sm">${account.balance.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm font-mono text-xs">
                      {account.user_id ? 
                        (account.user_id === user?.id ? 
                          <span className="text-green-600">{account.user_id} (yours)</span> : 
                          <span className="text-yellow-600">{account.user_id}</span>) : 
                        <span className="text-red-600">missing</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
} 