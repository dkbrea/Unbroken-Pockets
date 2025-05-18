export type TransactionType = 
  | 'Fixed Expense'
  | 'Variable Expense'
  | 'Income'
  | 'Debt'
  | 'Savings'
  | 'Debt Payment';

export interface Transaction {
  id?: number;
  user_id?: string;
  date: string;
  name: string;
  category: string;
  amount: number;
  account: string;
  account_id: string;
  logo?: string;
  is_reconciled?: boolean;
  notes?: string | null;
  tags?: string[];
  debt_id?: number | null;
  is_debt_transaction?: boolean;
  is_debt_payment?: boolean;
  budget_category_id?: number | null;
  is_budget_expense?: boolean;
  goal_id?: number | null;
  recurring_id?: number | null;
  created_at?: string;
  updated_at?: string;
  transaction_type: TransactionType;
  is_future?: boolean;
  isProjected?: boolean;
  selected?: boolean;
}

export interface TransactionFilter {
  dateRange: DateRangeOption;
  accounts: string[];
  categories: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
  searchQuery: string;
  transactionType: 'all' | 'income' | 'expense';
}

export type DateRangeOption = 
  | 'Last 7 days' 
  | 'Last 30 days' 
  | 'This month' 
  | 'Last month' 
  | 'Last 3 months' 
  | 'Last 6 months' 
  | 'This year' 
  | 'Custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface BatchOperationOptions {
  selectedIds: number[];
  allSelected: boolean;
  active?: boolean;
}

export interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  onError?: (message: string) => void;
  batchOperations?: BatchOperationOptions;
  onBatchOperationsChange?: (options: BatchOperationOptions) => void;
  onTransactionDelete?: (id: number) => Promise<void>;
  onTransactionEdit?: (transaction: Transaction) => void;
  paginationOptions?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
} 