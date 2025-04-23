'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { CircleDollarSign, CreditCard, Wallet, BuildingIcon } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { 
  getAccounts, 
  createAccount as createAccountService,
  updateAccount as updateAccountService,
  deleteAccount as deleteAccountService,
  Account as ServiceAccount,
  AccountType as ServiceAccountType
} from '@/lib/services/accountService';

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

// Map service account to UI account
const mapServiceAccountToUIAccount = (account: ServiceAccount): Account => {
  // Map icon based on account type
  let icon: LucideIcon;
  let color: string;

  switch (account.type) {
    case 'checking':
      icon = CircleDollarSign;
      color = 'text-blue-600';
      break;
    case 'credit':
      icon = CreditCard;
      color = 'text-purple-600';
      break;
    case 'cash':
      icon = Wallet;
      color = 'text-yellow-600';
      break;
    case 'savings':
      icon = BuildingIcon;
      color = 'text-green-600';
      break;
    default:
      icon = BuildingIcon;
      color = 'text-gray-600';
  }

  return {
    id: account.id || 0,
    name: account.name,
    institution: account.institution || 'Unknown',
    balance: account.balance,
    type: account.type as AccountType,
    lastUpdated: account.last_updated || new Date().toISOString().split('T')[0],
    isHidden: account.is_hidden || false,
    icon,
    color,
    accountNumber: account.account_number,
    notes: account.notes
  };
};

// Map UI account to service account
const mapUIAccountToServiceAccount = (account: Partial<Account>): Partial<ServiceAccount> => {
  return {
    name: account.name,
    institution: account.institution,
    balance: account.balance,
    type: account.type as ServiceAccountType,
    is_hidden: account.isHidden,
    account_number: account.accountNumber,
    notes: account.notes
  };
};

export function useAccountsData(): AccountsState {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch accounts from Supabase
  useEffect(() => {
    async function fetchAccounts() {
      setIsLoading(true);
      try {
        const serviceAccounts = await getAccounts();
        const mappedAccounts = serviceAccounts.map(mapServiceAccountToUIAccount);
        setAccounts(mappedAccounts);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccounts();
  }, []);

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
  const addAccount = useCallback(async (account: Omit<Account, 'id' | 'lastUpdated'>) => {
    setIsLoading(true);
    try {
      const serviceAccount = mapUIAccountToServiceAccount(account);
      const createdAccount = await createAccountService(serviceAccount as Omit<ServiceAccount, 'id' | 'user_id' | 'last_updated'>);
      
      if (createdAccount) {
        const newUIAccount = mapServiceAccountToUIAccount(createdAccount);
        setAccounts(prev => [...prev, newUIAccount]);
      }
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (id: number, updates: Partial<Account>) => {
    setIsLoading(true);
    try {
      const serviceUpdates = mapUIAccountToServiceAccount(updates);
      const updatedAccount = await updateAccountService(id, serviceUpdates);
      
      if (updatedAccount) {
        setAccounts(prev => prev.map(account => 
          account.id === id ? mapServiceAccountToUIAccount(updatedAccount) : account
        ));
      }
    } catch (error) {
      console.error('Error updating account:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const success = await deleteAccountService(id);
      
      if (success) {
        setAccounts(prev => prev.filter(account => account.id !== id));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAccountVisibility = useCallback(async (id: number) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    
    const newIsHidden = !account.isHidden;
    
    try {
      await updateAccountService(id, { is_hidden: newIsHidden });
      setAccounts(prev => prev.map(account => 
        account.id === id ? { ...account, isHidden: newIsHidden } : account
      ));
    } catch (error) {
      console.error('Error toggling account visibility:', error);
    }
  }, [accounts]);

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