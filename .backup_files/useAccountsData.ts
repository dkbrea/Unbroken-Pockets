'use client';

import { useState, useMemo, useCallback } from 'react';
import { CircleDollarSign, CreditCard, Wallet, BuildingIcon } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment' | 'loan' | 'other';

export type Account = {
  id: number;
  name: string;
  institution: string;
  balance: number;
  type: AccountType;
  lastUpdated: string;
  isHidden?: boolean;
  icon?: LucideIcon;
  color?: string;
  accountNumber?: string; // Last 4 digits only for security
  notes?: string;
};

export type AccountsState = {
  accounts: Account[];
  visibleAccounts: Account[];
  totalBalance: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  isLoading: boolean;
  addAccount: (account: Omit<Account, 'id' | 'lastUpdated'>) => void;
  updateAccount: (id: number, updates: Partial<Account>) => void;
  deleteAccount: (id: number) => void;
  toggleAccountVisibility: (id: number) => void;
};

export function useAccountsData(): AccountsState {
  // Mock accounts data
  const [accounts, setAccounts] = useState<Account[]>([
    { 
      id: 1, 
      name: 'Main Checking', 
      institution: 'Chase Bank',
      balance: 4783.52,
      type: 'checking',
      lastUpdated: '2023-04-28',
      icon: CircleDollarSign,
      color: 'text-blue-600',
      accountNumber: '4567',
    },
    { 
      id: 2, 
      name: 'Savings Account', 
      institution: 'Chase Bank',
      balance: 12450.00,
      type: 'savings',
      lastUpdated: '2023-04-28',
      icon: BuildingIcon,
      color: 'text-green-600',
      accountNumber: '9876',
    },
    { 
      id: 3, 
      name: 'Credit Card Gold', 
      institution: 'American Express',
      balance: -1245.67,
      type: 'credit',
      lastUpdated: '2023-04-28',
      icon: CreditCard,
      color: 'text-purple-600',
      accountNumber: '3456',
    },
    { 
      id: 4, 
      name: 'Cash Wallet', 
      institution: 'Personal',
      balance: 325.00,
      type: 'cash',
      lastUpdated: '2023-04-28',
      icon: Wallet,
      color: 'text-yellow-600',
    },
    { 
      id: 5, 
      name: 'Car Loan', 
      institution: 'Bank of America',
      balance: -15000.00,
      type: 'loan',
      lastUpdated: '2023-04-28',
      icon: BuildingIcon,
      color: 'text-red-600',
      accountNumber: '1234',
      isHidden: true,
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Get visible accounts
  const visibleAccounts = useMemo(() => {
    return accounts.filter(account => !account.isHidden);
  }, [accounts]);

  // Calculate total balance, assets, liabilities and net worth
  const financialSummary = useMemo(() => {
    let totalBalance = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;

    accounts.forEach(account => {
      totalBalance += account.balance;
      
      // Add to assets or liabilities based on balance
      if (account.balance > 0) {
        totalAssets += account.balance;
      } else {
        totalLiabilities += Math.abs(account.balance);
      }
    });

    const netWorth = totalAssets - totalLiabilities;

    return {
      totalBalance,
      totalAssets,
      totalLiabilities,
      netWorth
    };
  }, [accounts]);

  // CRUD operations
  const addAccount = useCallback((account: Omit<Account, 'id' | 'lastUpdated'>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const now = new Date().toISOString().split('T')[0];
      setAccounts(prev => [
        ...prev,
        {
          ...account,
          id: Math.max(...prev.map(a => a.id), 0) + 1,
          lastUpdated: now,
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const updateAccount = useCallback((id: number, updates: Partial<Account>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAccounts(prev => prev.map(account => 
        account.id === id ? { ...account, ...updates } : account
      ));
      setIsLoading(false);
    }, 500);
  }, []);

  const deleteAccount = useCallback((id: number) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAccounts(prev => prev.filter(account => account.id !== id));
      setIsLoading(false);
    }, 500);
  }, []);

  const toggleAccountVisibility = useCallback((id: number) => {
    setAccounts(prev => prev.map(account => 
      account.id === id ? { ...account, isHidden: !account.isHidden } : account
    ));
  }, []);

  return {
    accounts,
    visibleAccounts,
    isLoading,
    ...financialSummary,
    addAccount,
    updateAccount,
    deleteAccount,
    toggleAccountVisibility,
  };
} 