export type TransactionType = 'Variable Expense' | 'Fixed Expense' | 'Income' | 'Debt Payment' | 'Goal Contribution';

export interface Transaction {
  date: string;
  name: string;
  category: string;
  amount: number;
  account: string;
  account_id?: string;
  notes: string;
  tags: string[];
  transaction_type: TransactionType;
  // Optional fields for different transaction types
  recurring_id?: number;
  debt_id?: number;
  debt_account_id?: number;
  is_debt_payment?: boolean;
  budget_category_id?: number;
  is_budget_expense?: boolean;
  goal_id?: number;
  destination_account_id?: string; // For transfers
  is_transfer?: boolean; // Mark as a transfer transaction
  isProjected?: boolean; // Flag for projected/upcoming transactions
} 