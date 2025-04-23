import { useState } from 'react';

export type CashFlowData = {
  month: string;
  income: number;
  expenses: number;
};

export type CashFlowState = {
  dateFilter: string;
  cashFlowData: CashFlowData[];
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  last3Months: CashFlowData[];
  setDateFilter: (filter: string) => void;
};

export function useCashFlowData(): CashFlowState {
  const [dateFilter, setDateFilter] = useState('Last 3 months');
  
  // Demo cash flow data - in a real app, this would come from an API
  const cashFlowData = [
    { month: 'Jan', income: 5200, expenses: 4320 },
    { month: 'Feb', income: 5350, expenses: 4150 },
    { month: 'Mar', income: 5100, expenses: 4600 },
    { month: 'Apr', income: 5500, expenses: 4200 },
    { month: 'May', income: 5450, expenses: 4100 },
    { month: 'Jun', income: 5300, expenses: 4400 }
  ];

  // Calculate net cash flow for summary
  const totalIncome = cashFlowData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = cashFlowData.reduce((sum, month) => sum + month.expenses, 0);
  const netCashFlow = totalIncome - totalExpenses;
  
  // Get last 3 months for detailed view
  const last3Months = cashFlowData.slice(-3);

  return {
    dateFilter,
    cashFlowData,
    totalIncome,
    totalExpenses,
    netCashFlow,
    last3Months,
    setDateFilter
  };
} 