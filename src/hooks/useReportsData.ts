import { useState } from 'react';
import { BarChart2, PieChart, LineChart, BarChart } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type ReportType = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
};

export type CategoryData = {
  category: string;
  amount: number;
  color: string;
};

export type ReportsState = {
  activeTab: string;
  dateRange: string;
  reportTypes: ReportType[];
  categoryData: CategoryData[];
  totalSpending: number;
  setActiveTab: (tab: string) => void;
  setDateRange: (range: string) => void;
};

export function useReportsData(): ReportsState {
  const [activeTab, setActiveTab] = useState('spending');
  const [dateRange, setDateRange] = useState('Last 6 months');
  
  // Report categories
  const reportTypes = [
    { id: 'spending', name: 'Spending by Category', icon: PieChart, color: 'bg-blue-100 text-blue-600' },
    { id: 'income', name: 'Income Analysis', icon: BarChart2, color: 'bg-green-100 text-green-600' },
    { id: 'trends', name: 'Spending Trends', icon: LineChart, color: 'bg-purple-100 text-purple-600' },
    { id: 'tax', name: 'Tax Report', icon: BarChart, color: 'bg-yellow-100 text-yellow-600' }
  ];
  
  // Demo category data for pie chart
  const categoryData = [
    { category: 'Housing', amount: 1850, color: 'bg-blue-500' },
    { category: 'Food', amount: 850, color: 'bg-green-500' },
    { category: 'Transportation', amount: 450, color: 'bg-purple-500' },
    { category: 'Entertainment', amount: 350, color: 'bg-yellow-500' },
    { category: 'Utilities', amount: 320, color: 'bg-red-500' },
    { category: 'Other', amount: 580, color: 'bg-gray-500' }
  ];
  
  const totalSpending = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

  return {
    activeTab,
    dateRange,
    reportTypes,
    categoryData,
    totalSpending,
    setActiveTab,
    setDateRange
  };
} 