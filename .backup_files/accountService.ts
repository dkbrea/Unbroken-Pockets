import { createClient } from '@/lib/supabase/client';

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment';

export interface Account {
  id?: number;
  name: string;
  institution?: string;
  balance: number;
  type: AccountType;
  last_updated?: string;
  is_hidden?: boolean;
  icon?: string;
  color?: string;
  account_number?: string;
  notes?: string;
  user_id?: string;
}

/**
 * Creates a new account in the database
 * @param accountData The account data to be saved
 * @returns The newly created account
 */
export async function createAccount(accountData: Omit<Account, 'id' | 'user_id' | 'last_updated'>): Promise<Account | null> {
  try {
    console.log('Creating account with data:', accountData);
    
    // Try the API endpoint first since it's more reliable
    try {
      console.log('Trying API endpoint for account creation');
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: accountData.name,
          institution: accountData.institution || 'Personal',
          balance: accountData.balance,
          type: accountData.type,
          // Don't send user_id since our API endpoint will handle that
        }),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('API endpoint error:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          errorData = { error: `HTTP error ${response.status}` };
        }
        
        // If there's a database schema issue, try fixing it with the simple-db-fix endpoint
        if (errorData.error && (
          errorData.error.includes('schema') || 
          errorData.error.includes('relation') || 
          errorData.error.includes('column') ||
          errorData.error.includes('table') ||
          errorData.error.includes('function') ||
          errorData.error.includes('not a function')
        )) {
          console.log('Detected database schema issue, attempting to fix...');
          
          // Call the simple-db-fix endpoint instead of the old fix-database endpoint
          const fixResponse = await fetch('/api/simple-db-fix', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (fixResponse.ok) {
            console.log('Database schema fix applied successfully');
            
            // Try the original request again after a short delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry the original request
            const retryResponse = await fetch('/api/test-db', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: accountData.name,
                institution: accountData.institution || 'Personal',
                balance: accountData.balance,
                type: accountData.type,
              }),
            });
            
            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();
              if (retryResult.success && retryResult.account) {
                console.log('Account created successfully after schema fix:', retryResult.account);
                return retryResult.account;
              }
            }
          }
        }
        
        // Throw a more detailed error message
        throw new Error(errorData.error || `API error (${response.status}): Failed to create account`);
      }
      
      // Parse the successful response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Could not parse success response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (result.success && result.account) {
        console.log('Account created successfully via API:', result.account);
        return result.account;
      } else {
        console.error('Unexpected API response format:', result);
        throw new Error('Invalid response format from server');
      }
    } catch (apiError: any) {
      console.error('Error using API endpoint:', apiError);
      // Continue to the fallback method
    }
    
    // Fallback: Use Supabase client directly
    console.log('Fallback: Using Supabase client directly');
    const supabase = createClient();
    
    // Get current user ID consistently
    const userId = await getCurrentUserId();
    console.log('Current authenticated user ID:', userId);
    
    // Prepare the account data with the user ID and current date
    const newAccount = {
      ...accountData,
      institution: accountData.institution || 'Personal', // Default value
      last_updated: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      user_id: userId
    };
    
    // IMPORTANT: Only add user_id conditionally to handle broken schemas
    try {
      // First try without user_id
      console.log('Trying insert without user_id field');
      const insertResult = await supabase
        .from('accounts')
        .insert(newAccount)
        .select()
        .single();
      
      if (insertResult.error) {
        // If that fails, try with user_id
        console.log('Insert without user_id failed, trying with user_id:', insertResult.error);
        
        const { data, error } = await supabase
          .from('accounts')
          .insert({ ...newAccount, user_id: userId })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating account with user_id:', error);
          throw error;
        }
        
        return data;
      } else {
        return insertResult.data;
      }
    } catch (insertError: any) {
      console.error('Error creating account:', insertError);
      
      // Try calling the fix-database endpoint to repair schema issues
      if (typeof window !== 'undefined' && (
        insertError.message?.includes('relation') || 
        insertError.message?.includes('schema') ||
        insertError.message?.includes('column') ||
        insertError.message?.includes('table') ||
        insertError.message?.includes('function') ||
        insertError.message?.includes('not a function')
      )) {
        try {
          console.log('Attempting to fix schema via simple-db-fix endpoint');
          
          const fixResponse = await fetch('/api/simple-db-fix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (fixResponse.ok) {
            console.log('Database schema fix applied successfully, retrying account creation');
            
            // Wait for changes to apply
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try insert again after fixing schema
            const { data, error } = await supabase
              .from('accounts')
              .insert({ ...newAccount, user_id: userId })
              .select()
              .single();
            
            if (error) {
              console.error('Error creating account after schema fix:', error);
              throw error;
            }
            
            return data;
          }
        } catch (fixError) {
          console.error('Failed to fix schema via endpoint:', fixError);
        }
      }
      
      throw insertError; // Re-throw the original error
    }
  } catch (error: any) {
    console.error('Unexpected error creating account:', error);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error; // Re-throw so the UI can handle it
  }
}

/**
 * Gets the current user ID from auth or fallbacks
 * @returns The user ID string
 */
export async function getCurrentUserId(): Promise<string> {
  try {
    console.log('accountService: Getting current user ID');
    const supabase = createClient();
    
    // Get current user from auth
    const { data, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('accountService: Error getting authenticated user:', userError);
    }
    
    const user = data?.user;
    
    if (user?.id) {
      console.log('accountService: Found authenticated user ID:', user.id);
      return user.id;
    }
    
    // Check if we're in bypassAuth mode
    const isBypassMode = typeof window !== 'undefined' && 
      window.location.search.includes('bypassAuth=true');
    
    console.log('accountService: In bypass mode?', isBypassMode);
    
    // If in bypass mode, try to get mock user from localStorage
    if (isBypassMode && typeof window !== 'undefined') {
      try {
        const mockUserStr = localStorage.getItem('mock_user');
        if (mockUserStr) {
          const mockUser = JSON.parse(mockUserStr);
          if (mockUser?.id) {
            console.log('accountService: Using mock user ID from localStorage:', mockUser.id);
            return mockUser.id;
          }
        }
      } catch (e) {
        console.error('accountService: Error reading mock user from localStorage:', e);
      }
    }
    
    // Last resort fallback
    const fallbackId = 'default-user-id';
    console.warn('accountService: Using fallback user ID:', fallbackId);
    return fallbackId;
  } catch (error) {
    console.error('accountService: Error getting current user ID:', error);
    return 'default-user-id';
  }
}

/**
 * Gets all accounts for the current user
 * @returns A list of accounts
 */
export async function getAccounts(): Promise<Account[]> {
  try {
    console.log('Fetching accounts for current user');
    const supabase = createClient();
    
    // Get user ID consistently
    const userId = await getCurrentUserId();
    console.log('Current user ID for accounts query:', userId);
    
    // First check if user_id exists in the accounts table
    let { data: accountsData, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .order('name');
      
    if (accountsError) {
      console.error('Error getting all accounts:', accountsError);
      return [];
    }
    
    console.log(`Found ${accountsData?.length || 0} total accounts in database`);
    
    if (accountsData && accountsData.length > 0) {
      // Check if any accounts exist for this user
      const userAccounts = accountsData.filter(acc => acc.user_id === userId);
      console.log(`Found ${userAccounts.length} accounts for user ${userId}`);
      
      if (userAccounts.length > 0) {
        return userAccounts;
      }
      
      // If we have accounts but none for this user, let's check if any lack a user_id
      const unassignedAccounts = accountsData.filter(acc => !acc.user_id);
      
      if (unassignedAccounts.length > 0) {
        console.log(`Found ${unassignedAccounts.length} unassigned accounts. Attempting to claim them.`);
        
        // Attempt to update the first unassigned account
        try {
          for (const account of unassignedAccounts) {
            const { error: updateError } = await supabase
              .from('accounts')
              .update({ user_id: userId })
              .eq('id', account.id);
              
            if (updateError) {
              console.error(`Error assigning account ${account.id} to user:`, updateError);
            } else {
              console.log(`Successfully assigned account ${account.id} to user ${userId}`);
              // Update the local account object
              account.user_id = userId;
            }
          }
          
          // Return the now-assigned accounts
          return accountsData.filter(acc => acc.user_id === userId);
        } catch (updateError) {
          console.error('Error updating unassigned accounts:', updateError);
        }
      }
    }
    
    // Get only accounts for this user (standard query)
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) {
      console.error('Error fetching accounts by user ID:', error);
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} accounts for user ${userId}:`, data);
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching accounts:', error);
    return [];
  }
}

/**
 * Gets the total balance of all accounts for the current user
 * @returns The total balance
 */
export async function getTotalBalance(): Promise<number> {
  try {
    const accounts = await getAccounts();
    
    // Calculate total balance
    // For credit accounts (negative balance), we subtract from the total
    const total = accounts.reduce((sum, account) => {
      if (account.type === 'credit') {
        // Credit accounts typically have negative balances
        return sum - Math.abs(account.balance);
      }
      return sum + account.balance;
    }, 0);
    
    console.log('Calculated total balance:', total);
    return total;
  } catch (error) {
    console.error('Error calculating total balance:', error);
    return 0;
  }
}

/**
 * Updates an existing account
 * @param id The ID of the account to update
 * @param accountData The updated account data
 * @returns The updated account
 */
export async function updateAccount(id: number, accountData: Partial<Account>): Promise<Account | null> {
  try {
    const supabase = createClient();
    
    // Update the last_updated field
    const updateData = {
      ...accountData,
      last_updated: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
    
    const { data, error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating account:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating account:', error);
    return null;
  }
}

/**
 * Deletes an account
 * @param id The ID of the account to delete
 * @returns True if successful, false otherwise
 */
export async function deleteAccount(id: number): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting account:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting account:', error);
    return false;
  }
}

/**
 * Clear all accounts for the current user (DEVELOPMENT ONLY)
 * @returns True if successful, false otherwise
 */
export async function clearAllAccounts(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    console.error('clearAllAccounts is not available in production');
    return false;
  }
  
  try {
    console.log('Attempting to clear all accounts for current user');
    const supabase = createClient();
    
    // Get user ID consistently
    const userId = await getCurrentUserId();
    console.log('Clearing accounts for user ID:', userId);
    
    // Delete all accounts for the current user
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error clearing accounts:', error);
      return false;
    }
    
    console.log('Successfully cleared all accounts for user', userId);
    return true;
  } catch (error) {
    console.error('Unexpected error clearing accounts:', error);
    return false;
  }
} 