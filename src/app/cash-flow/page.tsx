'use client'

import { useState, useEffect } from 'react'
import { 
  Filter, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown, 
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  Info,
  CreditCard,
  DollarSign,
  ArrowRight,
  Zap,
  AlertTriangle,
  CheckCircle,
  Wallet
} from 'lucide-react'
import { useCashFlowData, MonthData } from '@/hooks/useCashFlowData'
import { useFinancialGoalsData } from '@/hooks/useFinancialGoalsData'

export default function CashFlow() {
  const [timeRange, setTimeRange] = useState('3months')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)) // YYYY-MM format
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  
  const { financialGoals, isLoading: isLoadingGoals } = useFinancialGoalsData();
  
  const {
    cashFlowMetrics,
    monthlyData,
    cashFlowScore,
    upcomingTransactions,
    isLoading
  } = useCashFlowData({
    timeRange,
    selectedMonth,
    includeCategories: true
  });

  // Initialize the selectedContribution after cashFlowMetrics is available
  const [selectedContribution, setSelectedContribution] = useState(
    Math.min(2000, Math.max(100, (cashFlowMetrics?.netCashFlow || 0) * 0.2))
  );

  // Set the selected goal when financial goals are loaded
  useEffect(() => {
    if (financialGoals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(financialGoals[0].id);
    }
  }, [financialGoals, selectedGoalId]);

  // Find the selected goal object
  const selectedGoal = financialGoals.find(goal => goal.id === selectedGoalId);
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format percentage for display
  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return "Invalid date";
    }
  };
  
  // Get future date formatted for display
  const getFutureDateFormatted = (daysFromNow: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return formatDate(date.toISOString().split('T')[0]);
  };
  
  // Safe date formatting for any type of date input
  const safeFormatDate = (dateInput: Date | string): string => {
    if (dateInput instanceof Date) {
      return formatDate(dateInput.toISOString().split('T')[0]);
    }
    return formatDate(dateInput);
  };
  
  // Get the current month and year for demo data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentDay = new Date().getDate();
  
  // Demo dates - always show within the next 30 days
  const paycheckDate = new Date(currentYear, currentMonth, currentDay + 15);
  const rentDate = new Date(currentYear, currentMonth, currentDay + 5);
  const utilitiesDate = new Date(currentYear, currentMonth, currentDay + 8);
  
  // Helper function to get future date in ISO format
  const getFutureDateISO = (daysFromNow: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  };

  // Test data array with consistent dates
  const getTestData = (userId: string) => [
    {
      name: "Rent Payment",
      amount: 1200,
      category: "Housing",
      frequency: "monthly",
      next_date: getFutureDateISO(5), // Always 5 days from today
      type: "expense",
      status: "active",
      description: "Monthly rent payment",
      user_id: userId
    },
    {
      name: "Paycheck",
      amount: 3500,
      category: "Salary",
      frequency: "bi-weekly",
      next_date: getFutureDateISO(15), // Always 15 days from today
      type: "income",
      status: "active",
      description: "Regular salary payment",
      user_id: userId
    },
    {
      name: "Utilities",
      amount: 150, 
      category: "Utilities",
      frequency: "monthly",
      next_date: getFutureDateISO(7), // Always 7 days from today
      type: "expense",
      status: "active",
      description: "Monthly utilities payment",
      user_id: userId
    }
  ];
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-700">Loading cash flow data...</span>
      </div>
    );
  }

  // Generate automated insights based on cash flow data
  const getInsights = () => {
    const insights = [];
    
    // Income change insight
    if (Math.abs(cashFlowMetrics.incomeChangePercent) > 10) {
      insights.push({
        type: cashFlowMetrics.incomeChangePercent > 0 ? 'positive' : 'negative',
        icon: cashFlowMetrics.incomeChangePercent > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />,
        title: `Income ${cashFlowMetrics.incomeChangePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(cashFlowMetrics.incomeChangePercent).toFixed(1)}%`,
        description: `Your income has ${cashFlowMetrics.incomeChangePercent > 0 ? 'increased' : 'decreased'} by ${formatCurrency(Math.abs(cashFlowMetrics.totalIncome - cashFlowMetrics.previousTotalIncome))} compared to last month.`
      });
    }
    
    // Expense change insight
    if (Math.abs(cashFlowMetrics.expensesChangePercent) > 10) {
      insights.push({
        type: cashFlowMetrics.expensesChangePercent < 0 ? 'positive' : 'negative',
        icon: cashFlowMetrics.expensesChangePercent < 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />,
        title: `Expenses ${cashFlowMetrics.expensesChangePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(cashFlowMetrics.expensesChangePercent).toFixed(1)}%`,
        description: `Your expenses have ${cashFlowMetrics.expensesChangePercent > 0 ? 'increased' : 'decreased'} by ${formatCurrency(Math.abs(cashFlowMetrics.totalExpenses - cashFlowMetrics.previousTotalExpenses))} compared to last month.`
      });
    }
    
    // Savings rate insight
    const savingsRate = cashFlowMetrics.totalIncome > 0 ? (cashFlowMetrics.netCashFlow / cashFlowMetrics.totalIncome) * 100 : 0;
    if (savingsRate > 20) {
      insights.push({
        type: 'positive',
        icon: <CheckCircle className="h-5 w-5" />,
        title: `Great savings rate of ${savingsRate.toFixed(1)}%`,
        description: `You're saving ${savingsRate.toFixed(1)}% of your income this month, which is above the recommended 20%.`
      });
    } else if (savingsRate < 10 && cashFlowMetrics.totalIncome > 0) {
      insights.push({
        type: 'warning',
        icon: <AlertTriangle className="h-5 w-5" />,
        title: `Low savings rate of ${savingsRate.toFixed(1)}%`,
        description: `You're only saving ${savingsRate.toFixed(1)}% of your income. Aim for at least 20% for better financial health.`
      });
    }
    
    // Top expense category insight
    if (cashFlowMetrics.topExpenseCategories.length > 0) {
      const topCategory = cashFlowMetrics.topExpenseCategories[0];
      if (topCategory.percentage > 30) {
        insights.push({
          type: 'warning',
          icon: <PieChart className="h-5 w-5" />,
          title: `High spending in ${topCategory.name}`,
          description: `${topCategory.name} accounts for ${topCategory.percentage.toFixed(1)}% of your expenses. Consider if this aligns with your financial goals.`
        });
      }
    }
    
    return insights;
  };
  
  const insights = getInsights();
  
  // Get health score status
  const getHealthScoreStatus = () => {
    if (cashFlowScore >= 80) return 'Excellent';
    if (cashFlowScore >= 60) return 'Good';
    if (cashFlowScore >= 40) return 'Fair';
    return 'Needs Attention';
  };
  
  // Get health score color
  const getHealthScoreColor = () => {
    if (cashFlowScore >= 80) return 'text-green-600';
    if (cashFlowScore >= 60) return 'text-blue-600';
    if (cashFlowScore >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Add test recurring transactions to database
  const addTestRecurringTransactions = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Must be logged in to add test data");
      return;
    }
    
    const userId = user.id;
    
    // Get test data using the new function
    const testData = getTestData(userId);
    
    try {
      // Check for existing recurring transactions with the same names
      const { data: existingTransactions, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('id, name')
        .eq('user_id', userId)
        .in('name', testData.map(item => item.name));
      
      if (fetchError) {
        console.error("Error checking existing transactions:", fetchError);
        alert("Error checking existing transactions: " + fetchError.message);
        return;
      }
      
      // Create a map of existing transaction names to IDs
      const existingTransactionMap: Record<string, string> = (existingTransactions || []).reduce((map: Record<string, string>, trans) => {
        map[trans.name] = trans.id;
        return map;
      }, {});
      
      // Separate items to update and items to insert
      const itemsToUpdate = [];
      const itemsToInsert = [];
      
      for (const item of testData) {
        if (existingTransactionMap[item.name]) {
          // If this transaction name exists, update it
          itemsToUpdate.push({
            id: existingTransactionMap[item.name],
            ...item
          });
        } else {
          // Otherwise, insert a new one
          itemsToInsert.push(item);
        }
      }
      
      // Process updates if needed
      if (itemsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('recurring_transactions')
          .upsert(itemsToUpdate);
          
        if (updateError) {
          console.error("Error updating existing transactions:", updateError);
          alert("Error updating existing transactions: " + updateError.message);
          return;
        }
      }
      
      // Process inserts if needed
      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('recurring_transactions')
          .insert(itemsToInsert);
          
        if (insertError) {
          console.error("Error inserting new transactions:", insertError);
          alert("Error inserting new transactions: " + insertError.message);
          return;
        }
      }
      
      alert(`Test data processed: ${itemsToUpdate.length} updated, ${itemsToInsert.length} inserted`);
      
      // Reload page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error processing test data:", error);
      alert("Error processing test data");
    }
  };

  // Remove test recurring transactions from database
  const removeTestRecurringTransactions = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Must be logged in to remove test data");
      return;
    }
    
    const userId = user.id;
    
    try {
      // Find test data records (using the specific test names we added)
      const testNames = ["Rent Payment", "Paycheck", "Utilities"];
      
      const { data: testTransactions, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('id')
        .eq('user_id', userId)
        .in('name', testNames);
      
      if (fetchError) {
        console.error("Error finding test transactions:", fetchError);
        alert("Error finding test transactions: " + fetchError.message);
        return;
      }
      
      if (!testTransactions || testTransactions.length === 0) {
        alert("No test data found to remove");
        return;
      }
      
      // Delete the test transactions
      const { error: deleteError } = await supabase
        .from('recurring_transactions')
        .delete()
        .in('id', testTransactions.map(t => t.id));
      
      if (deleteError) {
        console.error("Error deleting test transactions:", deleteError);
        alert("Error deleting test transactions: " + deleteError.message);
        return;
      }
      
      alert(`Successfully removed ${testTransactions.length} test transactions`);
      
      // Reload page to update data
      window.location.reload();
    } catch (error) {
      console.error("Error removing test data:", error);
      alert("Error removing test data");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1F3A93] mb-4 md:mb-0">Cash Flow</h1>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={addTestRecurringTransactions}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Add Test Data
          </button>
          
          <button 
            onClick={removeTestRecurringTransactions}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Remove Test Data
          </button>
        
          <div className="relative">
            <select
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <input
              type="month"
              className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={new Date().toISOString().substring(0, 7)}
            />
          </div>
          
          <button className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            Filter
          </button>
          
          <button className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="mr-2 h-4 w-4 text-gray-500" />
            Export
          </button>
        </div>
      </div>

      {/* Cash Flow Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Income */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Total Income</h2>
          <div className="flex items-center mb-2">
            <ArrowUp className="h-6 w-6 text-green-500 mr-3" />
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(cashFlowMetrics.totalIncome || 0)}</span>
          </div>
          <div className="flex items-center">
            <span className={`flex items-center text-sm ${(cashFlowMetrics.incomeChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(cashFlowMetrics.incomeChangePercent || 0) >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              {formatPercent(cashFlowMetrics.incomeChangePercent || 0)} vs last month
            </span>
          </div>
        </div>
        
        {/* Total Expenses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Total Expenses</h2>
          <div className="flex items-center mb-2">
            <ArrowDown className="h-6 w-6 text-red-500 mr-3" />
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(cashFlowMetrics.totalExpenses || 0)}</span>
          </div>
          <div className="flex items-center">
            <span className={`flex items-center text-sm ${(cashFlowMetrics.expensesChangePercent || 0) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(cashFlowMetrics.expensesChangePercent || 0) <= 0 ? 
                <TrendingDown className="h-4 w-4 mr-1" /> : 
                <TrendingUp className="h-4 w-4 mr-1" />
              }
              {formatPercent(Math.abs(cashFlowMetrics.expensesChangePercent || 0))} vs last month
            </span>
          </div>
        </div>
        
        {/* Net Cash Flow */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Net Cash Flow</h2>
          <div className="flex items-center mb-2">
            {(cashFlowMetrics.netCashFlow || 0) >= 0 ? (
              <ArrowUp className="h-6 w-6 text-green-500 mr-3" />
            ) : (
              <ArrowDown className="h-6 w-6 text-red-500 mr-3" />
            )}
            <span className={`text-2xl font-bold ${(cashFlowMetrics.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(cashFlowMetrics.netCashFlow || 0))}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`flex items-center text-sm ${(cashFlowMetrics.netCashFlowChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(cashFlowMetrics.netCashFlowChangePercent || 0) >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              {formatPercent(cashFlowMetrics.netCashFlowChangePercent || 0)} vs last month
            </span>
          </div>
        </div>
      </div>

      {/* Cash Flow Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium text-gray-700">Cash Flow Health Score</h2>
            <div className="bg-blue-100 rounded-full p-1">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative w-24 h-24 mr-4">
              <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="12" 
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke={cashFlowScore >= 70 ? "#10B981" : cashFlowScore >= 40 ? "#F59E0B" : "#EF4444"} 
                  strokeWidth="12" 
                  strokeDasharray="339.3"
                  strokeDashoffset={339.3 - (339.3 * (cashFlowScore || 0) / 100)} 
                  transform="rotate(-90 60 60)" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getHealthScoreColor()}`}>{cashFlowScore}</span>
              </div>
            </div>
            
            <div>
              <p className={`text-lg font-medium ${getHealthScoreColor()}`}>{getHealthScoreStatus()}</p>
              <p className="text-sm text-gray-600 mt-1">Your cash flow is {cashFlowScore >= 60 ? 'healthy' : 'needs improvement'}</p>
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                How to improve <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Insights Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium text-gray-700">Automated Insights</h2>
            <div className="bg-blue-100 rounded-full p-1">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className={`flex items-start p-3 rounded-lg ${
                  insight.type === 'positive' ? 'bg-green-50' : 
                  insight.type === 'negative' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <div className={`rounded-full p-2 mr-3 ${
                    insight.type === 'positive' ? 'bg-green-100 text-green-600' : 
                    insight.type === 'negative' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {insight.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{insight.title}</p>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No significant insights for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Income vs Expenses Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Income vs Expenses Timeline</h2>
        
        <div className="flex mb-4 space-x-4">
          <button className="px-3 py-1 text-sm border-b-2 border-blue-500 text-blue-600 font-medium">Monthly</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">Quarterly</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">Yearly</button>
        </div>
        
        <div className="h-72 w-full">
          {/* Interactive Chart would go here - simplified visualization for now */}
          <div className="h-60 flex items-end justify-around">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-full flex justify-center space-x-1">
                  <div className="w-12 bg-green-500 rounded-t" 
                    style={{ height: `${(month.income / Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)))) * 180}px` }}>
                    <div className="opacity-0 group-hover:opacity-100 bg-black text-white text-xs p-1 rounded absolute -mt-6 ml-1 pointer-events-none transition-opacity">
                      {formatCurrency(month.income)}
                    </div>
                  </div>
                  <div className="w-12 bg-red-500 rounded-t" 
                    style={{ height: `${(month.expenses / Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)))) * 180}px` }}>
                    <div className="opacity-0 group-hover:opacity-100 bg-black text-white text-xs p-1 rounded absolute -mt-6 ml-1 pointer-events-none transition-opacity">
                      {formatCurrency(month.expenses)}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-600 mt-2">{month.month}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-8">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Cash Flow */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Cash Flow Forecast</h2>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">Based on your recurring transactions, here's your projected cash flow for the next 30 days:</p>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-lg font-semibold">{formatCurrency(Math.max(0, cashFlowMetrics.netCashFlow * 3))}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Projected Balance</p>
              <p className="text-lg font-semibold">
                {formatCurrency(Math.max(0, cashFlowMetrics.netCashFlow * 3 + cashFlowMetrics.netCashFlow))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-3">Upcoming Expenses</h3>
            <div className="space-y-2">
              {upcomingTransactions.filter(t => t.amount < 0).length > 0 ? (
                upcomingTransactions
                  .filter(t => t.amount < 0)
                  .map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        {transaction.debt_id || transaction.is_debt_transaction ? (
                          <Wallet className="h-4 w-4 text-blue-600 mr-2" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-red-600 mr-2" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{transaction.name}</p>
                          <p className="text-xs text-gray-500">Due on {safeFormatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${transaction.debt_id || transaction.is_debt_transaction ? 'text-blue-600' : 'text-red-600'}`}>
                        -{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </div>
                  ))
              ) : (
                upcomingTransactions && upcomingTransactions.length > 0 ? (
                  <p className="text-sm text-gray-500 italic py-3">No upcoming expense transactions (but there are {upcomingTransactions.length} other transactions)</p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 italic py-3">No upcoming expenses detected (Demo Mode)</p>
                    {/* Demo data for testing */}
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Rent</p>
                          <p className="text-xs text-gray-500">Due on {safeFormatDate(rentDate)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-red-600">-{formatCurrency(1200)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg mt-2">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Utilities</p>
                          <p className="text-xs text-gray-500">Due on {safeFormatDate(utilitiesDate)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-red-600">-{formatCurrency(150)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg mt-2">
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Credit Card Payment</p>
                          <p className="text-xs text-gray-500">Due on {safeFormatDate(new Date(rentDate.getTime() + 86400000 * 2))}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">-{formatCurrency(120)}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-3">Upcoming Income</h3>
            <div className="space-y-2">
              {upcomingTransactions.filter(t => t.amount > 0).length > 0 ? (
                upcomingTransactions
                  .filter(t => t.amount > 0)
                  .map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{transaction.name}</p>
                          <p className="text-xs text-gray-500">Expected on {safeFormatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{formatCurrency(transaction.amount)}</span>
                    </div>
                  ))
              ) : (
                upcomingTransactions && upcomingTransactions.length > 0 ? (
                  <p className="text-sm text-gray-500 italic py-3">No upcoming income transactions (but there are {upcomingTransactions.length} other transactions)</p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 italic py-3">No upcoming income detected (Demo Mode)</p>
                    {/* Demo data for testing */}
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Paycheck</p>
                          <p className="text-xs text-gray-500">Expected on {safeFormatDate(paycheckDate)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{formatCurrency(3500)}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium text-gray-700">Expense Categories</h2>
            <div className="bg-blue-100 rounded-full p-1">
              <PieChart className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-5">
            {cashFlowMetrics.topExpenseCategories.length > 0 ? (
              cashFlowMetrics.topExpenseCategories.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${category.color || 'bg-blue-500'}`} 
                        style={{ width: `${category.percentage}%` }}>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{category.percentage.toFixed(1)}% of expenses</span>
                    {category.changePercent !== undefined && (
                      <span className={`flex items-center ${category.changePercent < 0 ? 'text-green-600' : category.changePercent > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {category.changePercent < 0 ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : category.changePercent > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : null}
                        {category.changePercent > 0 ? '+' : ''}{category.changePercent.toFixed(1)}% vs. last month
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No expense data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Income Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium text-gray-700">Income Sources</h2>
            <div className="bg-blue-100 rounded-full p-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-5">
            {cashFlowMetrics.topIncomeCategories.length > 0 ? (
              cashFlowMetrics.topIncomeCategories.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${category.color || 'bg-green-500'}`} 
                        style={{ width: `${category.percentage}%` }}>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{category.percentage.toFixed(1)}% of income</span>
                    {category.changePercent !== undefined && (
                      <span className={`flex items-center ${category.changePercent > 0 ? 'text-green-600' : category.changePercent < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {category.changePercent > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : category.changePercent < 0 ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : null}
                        {category.changePercent > 0 ? '+' : ''}{category.changePercent.toFixed(1)}% vs. last month
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No income data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seasonality Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-medium text-gray-700">Seasonality Analysis</h2>
          <div className="bg-blue-100 rounded-full p-1">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">See how your spending patterns change throughout the year</p>
        </div>
        
        <div className="h-64 w-full">
          {/* This would be a proper seasonality chart in a real implementation */}
          <div className="grid grid-cols-12 h-40 gap-1">
            {/* Simulate monthly spending patterns */}
            {Array.from({ length: 12 }).map((_, index) => {
              // Create a simulated seasonal pattern
              const month = new Date(2023, index).toLocaleString('default', { month: 'short' });
              const height = 30 + Math.sin((index / 12) * Math.PI * 2) * 20 + Math.random() * 30;
              const heightPercent = Math.max(10, Math.min(100, height));
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex-grow w-full flex items-end">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{month}</span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4">
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 12 }).map((_, index) => {
                const month = new Date(2023, index).toLocaleString('default', { month: 'short' });
                const isCurrent = new Date().getMonth() === index;
                const isHighSpending = [10, 11, 4, 5].includes(index); // Nov, Dec, May, Jun
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    {isCurrent ? (
                      <div className="text-xs font-medium text-blue-600 border-t-2 border-blue-600 pt-1 w-full text-center">
                        Current
                      </div>
                    ) : isHighSpending ? (
                      <div className="text-xs text-yellow-600 border-t-2 border-yellow-600 pt-1 w-full text-center">
                        High
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Key Insights</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-1 mr-2 mt-0.5">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600">Your spending typically increases by ~40% during November-December (holiday season)</p>
            </li>
            <li className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-1 mr-2 mt-0.5">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600">May-June shows elevated spending (summer activities)</p>
            </li>
            <li className="flex items-start">
              <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">February and September are your lowest spending months</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Goal-Based Cash Flow Planning */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-medium text-gray-700">Goal-Based Cash Flow Planning</h2>
          <div className="bg-blue-100 rounded-full p-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">See how your current cash flow affects your financial goals and explore what-if scenarios</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Goals Progress */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-3">Financial Goals Progress</h3>
            
            <div className="space-y-4">
              {isLoadingGoals ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading goals...</span>
                </div>
              ) : financialGoals.length > 0 ? (
                financialGoals.map(goal => {
                  // Calculate progress percentage
                  const progress = goal.current_amount / goal.target_amount * 100;
                  // Calculate remaining amount
                  const remaining = goal.target_amount - goal.current_amount;
                  // Estimate months to complete based on current savings rate
                  let monthsToComplete = 0;
                  if (goal.contribution_amount && goal.contribution_amount > 0) {
                    monthsToComplete = Math.ceil(remaining / goal.contribution_amount);
                  } else if (cashFlowMetrics.netCashFlow > 0) {
                    // If no contribution amount is set, use a percentage of net cash flow
                    const estimatedMonthlyContribution = cashFlowMetrics.netCashFlow * 0.2; // Assume 20% of net cash flow
                    monthsToComplete = Math.ceil(remaining / estimatedMonthlyContribution);
                  }
                  
                  return (
                    <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{goal.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">Target: {formatCurrency(goal.target_amount)}</p>
                        </div>
                        <span className="text-sm font-medium text-blue-600">{Math.round(progress)}% complete</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, progress)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center text-sm">
                        <div className="text-gray-500">Current: {formatCurrency(goal.current_amount)}</div>
                        <div className="text-gray-500">Remaining: {formatCurrency(remaining)}</div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-600">
                        <span className="font-medium">Estimated completion:</span> {
                          monthsToComplete > 0 
                            ? `${monthsToComplete} month${monthsToComplete !== 1 ? 's' : ''} at current savings rate`
                            : 'Unable to estimate (increase savings rate)'
                        }
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 border border-gray-200 rounded-lg text-center">
                  <p className="text-gray-500">No financial goals found</p>
                  <a href="/goals" className="text-blue-600 text-sm mt-2 inline-block">
                    Set up your financial goals
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* What-If Scenarios */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-3">What-If Scenarios</h3>
            
            <div className="p-4 border border-gray-200 rounded-lg mb-4">
              <h4 className="font-medium text-gray-800 mb-3">How would changing your savings affect your goals?</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Monthly contribution</label>
                  <div className="flex items-center">
                    <input 
                      type="range" 
                      min="100" 
                      max="2000" 
                      step="100" 
                      value={selectedContribution}
                      onChange={(e) => setSelectedContribution(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatCurrency(100)}/month</span>
                    <span>{formatCurrency(selectedContribution)}/month</span>
                    <span>{formatCurrency(2000)}/month</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Select goal</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={selectedGoalId || ''}
                    onChange={(e) => setSelectedGoalId(e.target.value ? Number(e.target.value) : null)}
                  >
                    {financialGoals.length > 0 ? (
                      financialGoals.map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.name}</option>
                      ))
                    ) : (
                      <option value="">No goals available</option>
                    )}
                  </select>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-800">Results</h5>
                  {selectedGoal ? (
                    <div className="text-sm text-gray-600 mt-1">
                      <p>At {formatCurrency(selectedContribution)}/month:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {selectedContribution > 0 ? (
                          <>
                            <li>{selectedGoal.name}: Complete in {Math.ceil((selectedGoal.target_amount - selectedGoal.current_amount) / selectedContribution)} months</li>
                            {selectedGoal.contribution_amount && selectedGoal.contribution_amount !== selectedContribution && (
                              <li>
                                {selectedContribution > selectedGoal.contribution_amount 
                                  ? `Time saved: ${Math.max(0, Math.ceil((selectedGoal.target_amount - selectedGoal.current_amount) / selectedGoal.contribution_amount) - Math.ceil((selectedGoal.target_amount - selectedGoal.current_amount) / selectedContribution))} months` 
                                  : `Time added: ${Math.max(0, Math.ceil((selectedGoal.target_amount - selectedGoal.current_amount) / selectedContribution) - Math.ceil((selectedGoal.target_amount - selectedGoal.current_amount) / selectedGoal.contribution_amount))} months`}
                              </li>
                            )}
                          </>
                        ) : (
                          <li>Please enter a contribution amount greater than zero</li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Select a goal to see projections</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Impact of reducing expenses</h4>
              
              <div className="space-y-3">
                {cashFlowMetrics.topExpenseCategories.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Reduce {cashFlowMetrics.topExpenseCategories[0]?.name} by 20%</span>
                      <span className="text-sm font-medium text-green-600">+{formatCurrency(Math.abs(cashFlowMetrics.topExpenseCategories[0]?.amount || 0) * 0.2)}/mo</span>
                    </div>
                    
                    {cashFlowMetrics.topExpenseCategories.length > 1 && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Reduce {cashFlowMetrics.topExpenseCategories[1]?.name} by 15%</span>
                        <span className="text-sm font-medium text-green-600">+{formatCurrency(Math.abs(cashFlowMetrics.topExpenseCategories[1]?.amount || 0) * 0.15)}/mo</span>
                      </div>
                    )}
                    
                    {cashFlowMetrics.topExpenseCategories.length > 2 && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Reduce {cashFlowMetrics.topExpenseCategories[2]?.name} by 10%</span>
                        <span className="text-sm font-medium text-green-600">+{formatCurrency(Math.abs(cashFlowMetrics.topExpenseCategories[2]?.amount || 0) * 0.1)}/mo</span>
                      </div>
                    )}
                    
                    <div className="p-3 mt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total monthly impact</span>
                        <span className="text-sm font-medium text-green-600">+{formatCurrency(
                          (Math.abs(cashFlowMetrics.topExpenseCategories[0]?.amount || 0) * 0.2) +
                          (cashFlowMetrics.topExpenseCategories.length > 1 ? Math.abs(cashFlowMetrics.topExpenseCategories[1]?.amount || 0) * 0.15 : 0) +
                          (cashFlowMetrics.topExpenseCategories.length > 2 ? Math.abs(cashFlowMetrics.topExpenseCategories[2]?.amount || 0) * 0.1 : 0)
                        )}/mo</span>
                      </div>
                      {financialGoals.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          This would shorten your {financialGoals[0]?.name} goal by approximately {
                            Math.floor((financialGoals[0]?.target_amount - financialGoals[0]?.current_amount) / (cashFlowMetrics.netCashFlow * 0.2)) -
                            Math.floor((financialGoals[0]?.target_amount - financialGoals[0]?.current_amount) / ((cashFlowMetrics.netCashFlow * 0.2) + 
                              (Math.abs(cashFlowMetrics.topExpenseCategories[0]?.amount || 0) * 0.2) +
                              (cashFlowMetrics.topExpenseCategories.length > 1 ? Math.abs(cashFlowMetrics.topExpenseCategories[1]?.amount || 0) * 0.15 : 0) +
                              (cashFlowMetrics.topExpenseCategories.length > 2 ? Math.abs(cashFlowMetrics.topExpenseCategories[2]?.amount || 0) * 0.1 : 0)
                            ))
                          } months.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">No expense data available to analyze</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <a href="/goals" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Create a Personalized Savings Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  );
} 