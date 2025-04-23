import { getUserData, insertUserData, updateUserData, deleteUserData } from './userDataService';

export interface Transaction {
  id?: number;
  date: string;
  name: string;
  category: string;
  amount: number;
  account: string;
  logo?: string;
  is_reconciled?: boolean;
  notes?: string;
  tags?: string[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

const TABLE_NAME = 'transactions';

/**
 * Get all transactions for the current user
 * @param filters Optional filters for transactions
 * @returns Array of transactions
 */
export async function getTransactions(filters: {
  account?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
} = {}): Promise<Transaction[]> {
  try {
    console.log('Fetching transactions with filters:', filters);
    
    // Build filter conditions for our helper function
    const simpleFilters: Record<string, any> = {};
    
    if (filters.account) {
      simpleFilters.account = filters.account;
    }
    
    if (filters.category) {
      simpleFilters.category = filters.category;
    }
    
    // Get transactions using our helper (which automatically filters by user_id)
    const data = await getUserData(TABLE_NAME, {
      order: { column: 'date', ascending: false },
      filters: simpleFilters
    });
    
    // Apply more complex filters that can't be done with simple eq filters
    const typedData = data as unknown as Transaction[];
    let filteredData = [...typedData];
    
    // Filter by date range if provided
    if (filters.startDate) {
      const startDate = filters.startDate;
      filteredData = filteredData.filter(t => t.date >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = filters.endDate;
      filteredData = filteredData.filter(t => t.date <= endDate);
    }
    
    // Filter by search term if provided
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(t => 
        t.name.toLowerCase().includes(term) || 
        t.category.toLowerCase().includes(term) ||
        t.account.toLowerCase().includes(term) ||
        (t.notes && t.notes.toLowerCase().includes(term))
      );
    }
    
    console.log(`Retrieved ${filteredData.length} transactions after filtering`);
    return filteredData;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Create a new transaction for the current user
 * @param transaction The transaction data to create
 * @returns The created transaction or null if failed
 */
export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Transaction | null> {
  try {
    console.log('Creating transaction:', transaction);
    
    // Use our helper function which automatically adds the user_id
    const newTransaction = await insertUserData(TABLE_NAME, transaction);
    
    if (!newTransaction) {
      throw new Error('Failed to create transaction');
    }
    
    console.log('Transaction created successfully:', newTransaction);
    return newTransaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
}

/**
 * Update an existing transaction
 * @param id The transaction ID
 * @param data The data to update
 * @returns The updated transaction or null if failed
 */
export async function updateTransaction(
  id: number,
  data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Transaction | null> {
  try {
    console.log(`Updating transaction ${id}:`, data);
    
    // Use our helper function which ensures the transaction belongs to the current user
    const updatedTransaction = await updateUserData(TABLE_NAME, id, data);
    
    if (!updatedTransaction) {
      throw new Error(`Failed to update transaction ${id}`);
    }
    
    console.log('Transaction updated successfully:', updatedTransaction);
    return updatedTransaction;
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    return null;
  }
}

/**
 * Delete a transaction
 * @param id The transaction ID to delete
 * @returns True if successful, false otherwise
 */
export async function deleteTransaction(id: number): Promise<boolean> {
  try {
    console.log(`Deleting transaction ${id}`);
    
    // Use our helper function which ensures the transaction belongs to the current user
    const success = await deleteUserData(TABLE_NAME, id);
    
    if (!success) {
      throw new Error(`Failed to delete transaction ${id}`);
    }
    
    console.log(`Transaction ${id} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting transaction ${id}:`, error);
    return false;
  }
} 