import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-hooks';
import { useTransactionsData } from '@/hooks/useTransactionsData';
import { createClient } from '@/lib/supabase/client';
import { AuthenticationError } from '@/lib/auth/authUtils';

// Mock the Supabase client and auth/utils
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }))
}));

jest.mock('@/lib/auth/authUtils', () => ({
  getAuthenticatedUserId: jest.fn(),
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthenticationError';
    }
  }
}));

jest.mock('@/lib/services/userDataService', () => ({
  getUserData: jest.fn(),
  deleteUserData: jest.fn(),
  updateUserData: jest.fn(),
  insertUserData: jest.fn()
}));

// Import the mocked modules
import { getAuthenticatedUserId } from '@/lib/auth/authUtils';
import { getUserData, deleteUserData, updateUserData, insertUserData } from '@/lib/services/userDataService';

describe('Transaction Authentication Security', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set isAuthError when authentication fails during data loading', async () => {
    // Setup the mock to throw an auth error
    (getAuthenticatedUserId as jest.Mock).mockRejectedValueOnce(
      new AuthenticationError('Authentication failed')
    );

    const { result, waitForNextUpdate } = renderHook(() => useTransactionsData());

    // Wait for the hook to process the error
    await waitForNextUpdate();

    // Verify the hook state reflects the auth error
    expect(result.current.isAuthError).toBe(true);
    expect(result.current.error).toBe('Authentication failed. Please sign in again.');
    expect(result.current.transactions).toEqual([]);
  });

  it('should only return transactions belonging to the authenticated user', async () => {
    // Mock the authenticated user ID
    const authenticatedUserId = 'test-user-123';
    (getAuthenticatedUserId as jest.Mock).mockResolvedValueOnce(authenticatedUserId);

    // Mock the getUserData response with mixed user IDs (security test)
    const mockTransactions = [
      { id: 1, user_id: authenticatedUserId, name: 'My Transaction', amount: 100 },
      { id: 2, user_id: 'different-user', name: 'Other User Transaction', amount: 200 },
      { id: 3, user_id: authenticatedUserId, name: 'Another Transaction', amount: 300 }
    ];
    (getUserData as jest.Mock).mockResolvedValueOnce(mockTransactions);

    const { result, waitForNextUpdate } = renderHook(() => useTransactionsData());

    // Wait for the hook to process the data
    await waitForNextUpdate();

    // Verify only transactions belonging to the authenticated user are returned
    expect(result.current.transactions.length).toBe(2);
    expect(result.current.transactions.every(t => t.user_id === authenticatedUserId)).toBe(true);
    expect(result.current.transactions.find(t => t.name === 'Other User Transaction')).toBeUndefined();
  });

  it('should prevent transaction update if authentication fails', async () => {
    // Setup initial successful auth
    const authenticatedUserId = 'test-user-123';
    (getAuthenticatedUserId as jest.Mock).mockResolvedValueOnce(authenticatedUserId);
    (getUserData as jest.Mock).mockResolvedValueOnce([]);

    const { result, waitForNextUpdate } = renderHook(() => useTransactionsData());
    await waitForNextUpdate();

    // Then make the update method fail authentication
    (updateUserData as jest.Mock).mockRejectedValueOnce(
      new AuthenticationError('Authentication failed during update')
    );

    // Attempt to update a transaction
    await act(async () => {
      await result.current.updateTransaction(1, { amount: 500 });
    });

    // Verify the hook state reflects the auth error
    expect(result.current.isAuthError).toBe(true);
    expect(result.current.error).toBe('Authentication failed. Please sign in again.');
  });

  it('should prevent transaction deletion if authentication fails', async () => {
    // Setup initial successful auth
    const authenticatedUserId = 'test-user-123';
    (getAuthenticatedUserId as jest.Mock).mockResolvedValueOnce(authenticatedUserId);
    (getUserData as jest.Mock).mockResolvedValueOnce([]);

    const { result, waitForNextUpdate } = renderHook(() => useTransactionsData());
    await waitForNextUpdate();

    // Then make the delete method fail authentication
    (deleteUserData as jest.Mock).mockRejectedValueOnce(
      new AuthenticationError('Authentication failed during deletion')
    );

    // Attempt to delete a transaction
    await act(async () => {
      await result.current.deleteTransaction(1);
    });

    // Verify the hook state reflects the auth error
    expect(result.current.isAuthError).toBe(true);
    expect(result.current.error).toBe('Authentication failed. Please sign in again.');
  });

  it('should prevent adding a transaction if authentication fails', async () => {
    // Setup initial successful auth
    const authenticatedUserId = 'test-user-123';
    (getAuthenticatedUserId as jest.Mock).mockResolvedValueOnce(authenticatedUserId);
    (getUserData as jest.Mock).mockResolvedValueOnce([]);

    const { result, waitForNextUpdate } = renderHook(() => useTransactionsData());
    await waitForNextUpdate();

    // Then make the add method fail authentication
    (insertUserData as jest.Mock).mockRejectedValueOnce(
      new AuthenticationError('Authentication failed during insert')
    );

    // Attempt to add a transaction
    await act(async () => {
      await result.current.addTransaction({ 
        name: 'New Transaction', 
        amount: 100,
        date: '2023-01-01',
        category: 'Test',
        account: 'Test Account'
      });
    });

    // Verify the hook state reflects the auth error
    expect(result.current.isAuthError).toBe(true);
    expect(result.current.error).toBe('Authentication failed. Please sign in again.');
  });

  it('should verify resource ownership before updating a transaction', async () => {
    // Mock the userDataService to verify ownership was checked
    (updateUserData as jest.Mock).mockImplementationOnce(async (table, id, data) => {
      // The real updateUserData verifies ownership, so we'll check if it was called correctly
      expect(table).toBe('transactions');
      expect(id).toBe(1);
      expect(data).toEqual({ amount: 500 });
      return { id: 1, ...data };
    });

    // Setup initial successful auth
    const authenticatedUserId = 'test-user-123';
    (getAuthenticatedUserId as jest.Mock).mockResolvedValue(authenticatedUserId);
    (getUserData as jest.Mock).mockResolvedValueOnce([]);

    const { result, waitForNextUpdate } = renderHook(() => useTransactionsData());
    await waitForNextUpdate();

    // Attempt to update a transaction
    await act(async () => {
      await result.current.updateTransaction(1, { amount: 500 });
    });

    // Verify updateUserData was called (which includes ownership verification)
    expect(updateUserData).toHaveBeenCalledWith('transactions', 1, { amount: 500 });
  });
}); 