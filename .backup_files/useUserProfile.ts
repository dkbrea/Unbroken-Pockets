'use client';

import { useState, useCallback } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type Theme = 'light' | 'dark' | 'system';

export type UserPreferences = {
  currency: Currency;
  dateFormat: DateFormat;
  theme: Theme;
  hideBalances: boolean;
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  dashboardWidgets: string[];
  setupProgress?: {
    accountsSetup: boolean;
    recurringExpensesSetup: boolean;
    recurringIncomeSetup: boolean;
    subscriptionsSetup: boolean;
    debtSetup: boolean;
    goalsSetup: boolean;
  };
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  isEmailVerified: boolean;
  preferences: UserPreferences;
};

export type UserProfileState = {
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
};

export function useUserProfile(): UserProfileState {
  // Mock user profile data
  const [profile, setProfile] = useState<UserProfile | null>({
    id: 'usr_123456',
    email: 'user@example.com',
    firstName: 'Alex',
    lastName: 'Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=1F3A93&color=fff',
    createdAt: '2023-01-15',
    lastLogin: '2023-04-28',
    isEmailVerified: true,
    preferences: {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light',
      hideBalances: false,
      notifications: {
        email: true,
        browser: true,
        mobile: false,
      },
      dashboardWidgets: [
        'cashflow',
        'budget',
        'goals',
        'recentTransactions',
        'accounts',
      ],
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Mock authenticated state

  // Update the user profile
  const updateProfile = useCallback((updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setIsLoading(false);
    }, 500);
  }, []);

  // Update user preferences
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            ...updates,
          },
        };
      });
      setIsLoading(false);
    }, 500);
  }, []);

  // Mock login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful login if email includes "user"
        const success = email.includes('user');
        
        if (success) {
          setIsAuthenticated(true);
          setProfile({
            id: 'usr_123456',
            email,
            firstName: 'Alex',
            lastName: 'Johnson',
            avatar: `https://ui-avatars.com/api/?name=Alex+Johnson&background=1F3A93&color=fff`,
            createdAt: '2023-01-15',
            lastLogin: new Date().toISOString().split('T')[0],
            isEmailVerified: true,
            preferences: {
              currency: 'USD',
              dateFormat: 'MM/DD/YYYY',
              theme: 'light',
              hideBalances: false,
              notifications: {
                email: true,
                browser: true,
                mobile: false,
              },
              dashboardWidgets: [
                'cashflow',
                'budget',
                'goals',
                'recentTransactions',
                'accounts',
              ],
            },
          });
        }
        
        setIsLoading(false);
        resolve(success);
      }, 1000);
    });
  }, []);

  // Mock logout function
  const logout = useCallback(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAuthenticated(false);
      setProfile(null);
      setIsLoading(false);
    }, 500);
  }, []);

  // Mock password reset
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Always succeed in the mock implementation
        setIsLoading(false);
        resolve(true);
      }, 1000);
    });
  }, []);

  return {
    profile,
    isLoading,
    isAuthenticated,
    updateProfile,
    updatePreferences,
    login,
    logout,
    resetPassword,
  };
} 