'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, MoreVertical, Home, CircleDollarSign, Plane, GraduationCap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

interface Transaction {
  date: string
  category: string
  amount: number
  status: 'Completed' | 'Pending' | 'Failed'
  merchant: string
}

interface FinancialGoal {
  id: number
  name: string
  icon: string
  color: string
  current_amount: number
  target_amount: number
  target_date: string
  contribution_frequency: string
  contribution_amount: number
}

export default function DashboardPage() {
  const { user } = useUser()
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [transactionError, setTransactionError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    let isMounted = true
    
    async function fetchData() {
      try {
        setIsLoading(true)
        setIsLoadingTransactions(true)
        setError(null)
        setTransactionError(null)
        
        const supabase = createClient()
        
        // Fetch goals for the current user
        const { data: goalsData, error: goalsError } = await supabase
          .from('financial_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (goalsError) throw goalsError

        // Fetch recent transactions for the current user
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5)
        
        if (transactionsError) throw transactionsError
        
        if (isMounted) {
          setGoals(goalsData || [])
          setTransactions(transactionsData || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        if (isMounted) {
          setError('Failed to load financial goals')
          setTransactionError('Failed to load transactions')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsLoadingTransactions(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Financial Goals */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Financial Goals</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
            Show all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              // Loading skeleton
              [...Array(4)].map((_, index) => (
                <div key={`skeleton-${index}`} className="p-4 border rounded-lg animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-gray-200 rounded-full h-2 w-1/3"></div>
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : goals.length === 0 ? (
              <div className="col-span-4 text-center py-4 text-gray-500">
                No financial goals found. Add one to get started!
              </div>
            ) : goals.map((goal) => {
              const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
              return (
                <div key={goal.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`p-2 rounded-lg flex-shrink-0 ${goal.color}`}>
                        {goal.icon === 'Home' && <Home className="h-4 w-4" />}
                        {goal.icon === 'CircleDollarSign' && <CircleDollarSign className="h-4 w-4" />}
                        {goal.icon === 'Plane' && <Plane className="h-4 w-4" />}
                        {goal.icon === 'GraduationCap' && <GraduationCap className="h-4 w-4" />}
                      </span>
                      <h4 className="font-medium truncate">{goal.name}</h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${Number(goal.current_amount).toLocaleString()}</span>
                      <span>${Number(goal.target_amount).toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: goal.color.replace('bg-', 'rgb(var(--')?.replace('-100', '-500))') || '#3B82F6'
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600 truncate">
                        <span className="font-medium">${Number(goal.contribution_amount).toLocaleString()}</span>
                        <span className="text-gray-500">/{goal.contribution_frequency.toLowerCase()}</span>
                      </div>
                      <div className="text-gray-600 text-right truncate">
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>


      {/* Transactions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded px-2 py-1"
            />
            <button className="border rounded px-3 py-1 flex items-center gap-1">
              Filter
            </button>
          </div>
        </div>
        {transactionError ? (
          <div className="text-center py-4 text-red-500">{transactionError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Account</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTransactions ? (
                  [...Array(3)].map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-b last:border-0">
                      <td className="py-2"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-2"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-2"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-2"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-2"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-2"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="py-2"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div></td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-0">
                      <td className="py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="py-2">{transaction.name}</td>
                      <td className="py-2">{transaction.category}</td>
                      <td className="py-2" style={{ color: transaction.amount < 0 ? '#EF4444' : '#10B981' }}>
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td className="py-2">{transaction.account}</td>
                      <td className="py-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            transaction.transaction_type === 'Fixed Expense'
                              ? 'bg-blue-100 text-blue-800'
                              : transaction.transaction_type === 'Variable Expense'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaction.transaction_type === 'Debt Payment'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className="py-2">
                        <button className="text-gray-500 hover:text-gray-700">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}  
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
