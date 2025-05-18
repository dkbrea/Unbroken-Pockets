import { Transaction } from '@/types/transactions';

export class TransactionService {
  /**
   * Delete a transaction by ID
   * @param id Transaction ID
   * @returns Promise that resolves when the transaction is deleted
   */
  static async deleteTransaction(id: number): Promise<void> {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Create a new transaction
   * @param transaction Transaction data
   * @returns Promise that resolves with the created transaction
   */
  static async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Update an existing transaction
   * @param transaction Transaction data with ID
   * @returns Promise that resolves with the updated transaction
   */
  static async updateTransaction(transaction: Transaction): Promise<Transaction>;

  /**
   * Update an existing transaction
   * @param id Transaction ID
   * @param transaction Updated transaction data
   * @returns Promise that resolves with the updated transaction
   */
  static async updateTransaction(idOrTransaction: number | Transaction, transactionData?: Partial<Transaction>): Promise<Transaction> {
    try {
      let id: number;
      let data: Partial<Transaction>;

      // Handle both function signature patterns
      if (typeof idOrTransaction === 'number') {
        id = idOrTransaction;
        data = transactionData || {};
      } else {
        // First parameter is the full transaction object with ID
        if (!idOrTransaction.id) {
          throw new Error('Transaction ID is required for update');
        }
        id = idOrTransaction.id;
        data = { ...idOrTransaction };
        delete data.id; // Remove id from the data to avoid conflicts
      }

      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }
} 