'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface BudgetData {
  budget_entries: any[];
  budget_transactions: any[];
  transactions_with_budget_category: any[];
  analysis: {
    discrepancies: any[];
    missingTransactions: any[];
  };
}

export default function BudgetDataViewer() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('budget_entries');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/debug/budget-data');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching budget data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Budget Data Viewer</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading budget data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Budget Data Viewer</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Budget Data Viewer</h1>
        <p>No data available.</p>
      </div>
    );
  }

  const renderTable = (items: any[], title: string) => {
    if (!items || items.length === 0) {
      return (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p>No {title} data available.</p>
        </div>
      );
    }

    // Get all unique keys from all items
    const keys = [...new Set(items.flatMap(item => Object.keys(item)))];
    
    return (
      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-2">{title} ({items.length} rows)</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {keys.map(key => (
                <th key={key} className="px-4 py-2 text-left border-b border-gray-300">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {keys.map(key => (
                  <td key={`${index}-${key}`} className="px-4 py-2 border-b border-gray-300">
                    {renderCellValue(item[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">NULL</span>;
    }
    
    if (typeof value === 'object') {
      return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
    }
    
    // Format dates nicely if they look like ISO dates
    if (typeof value === 'string' && 
        (value.match(/^\d{4}-\d{2}-\d{2}T/) || value.match(/^\d{4}-\d{2}-\d{2}$/))) {
      try {
        return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
      } catch (e) {
        return value;
      }
    }
    
    return String(value);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Budget Data Viewer</h1>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-300">
          <button 
            className={`px-4 py-2 ${activeTab === 'budget_entries' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('budget_entries')}
          >
            Budget Entries ({data.budget_entries?.length || 0})
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'budget_transactions' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('budget_transactions')}
          >
            Budget Transactions ({data.budget_transactions?.length || 0})
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'transactions' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions ({data.transactions_with_budget_category?.length || 0})
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'analysis' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('analysis')}
          >
            Analysis
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        {activeTab === 'budget_entries' && renderTable(data.budget_entries, 'Budget Entries')}
        {activeTab === 'budget_transactions' && renderTable(data.budget_transactions, 'Budget Transactions')}
        {activeTab === 'transactions' && renderTable(data.transactions_with_budget_category, 'Transactions with Budget Categories')}
        
        {activeTab === 'analysis' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Analysis</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Discrepancies</h3>
              {data.analysis.discrepancies.length > 0 ? (
                renderTable(data.analysis.discrepancies, 'Budget Entry vs Transaction Sum Discrepancies')
              ) : (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-700">No discrepancies found! Budget entries and transactions are in sync.</p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Missing Transactions</h3>
              {data.analysis.missingTransactions.length > 0 ? (
                renderTable(data.analysis.missingTransactions, 'Budget Entries without Matching Transactions')
              ) : (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-700">No missing transactions! All budget entries have corresponding transactions.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 