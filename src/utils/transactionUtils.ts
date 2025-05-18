import { 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  subDays, 
  startOfYear, 
  format, 
  isAfter, 
  isBefore,
  startOfDay,
  endOfDay,
  subMonths
} from 'date-fns';
import { DateRange, DateRangeOption, Transaction, TransactionFilter } from '@/types/transactions';

/**
 * Calculate date range based on option
 */
export function getDateRangeFromOption(option: DateRangeOption): DateRange {
  const today = new Date();
  
  switch (option) {
    case 'Last 7 days':
      return {
        startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
      
    case 'Last 30 days':
      return {
        startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
      
    case 'This month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd')
      };
      
    case 'Last month':
      const lastMonth = subMonths(today, 1);
      return {
        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
      };
      
    case 'Last 3 months':
      return {
        startDate: format(subMonths(today, 3), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
      
    case 'Last 6 months':
      return {
        startDate: format(subMonths(today, 6), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
      
    case 'This year':
      return {
        startDate: format(startOfYear(today), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
      
    case 'Custom':
      // Return last 30 days as default for custom until user specifies
      return {
        startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
      
    default:
      // Default to last 30 days
      return {
        startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
  }
}

/**
 * Filter transactions based on filter criteria
 */
export function filterTransactions(
  transactions: Transaction[], 
  filter: TransactionFilter
): Transaction[] {
  // Get date range
  const dateRange = getDateRangeFromOption(filter.dateRange);
  const startDate = parseISO(dateRange.startDate);
  const endDate = parseISO(dateRange.endDate);
  
  return transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    
    // Filter by date range
    if (
      isBefore(transactionDate, startOfDay(startDate)) || 
      isAfter(transactionDate, endOfDay(endDate))
    ) {
      return false;
    }
    
    // Filter by search query
    if (
      filter.searchQuery && 
      !transaction.name.toLowerCase().includes(filter.searchQuery.toLowerCase()) &&
      !transaction.category.toLowerCase().includes(filter.searchQuery.toLowerCase()) &&
      !transaction.account.toLowerCase().includes(filter.searchQuery.toLowerCase()) &&
      !(transaction.notes && transaction.notes.toLowerCase().includes(filter.searchQuery.toLowerCase()))
    ) {
      return false;
    }
    
    // Filter by transaction type
    if (filter.transactionType === 'income' && transaction.amount <= 0) {
      return false;
    }
    if (filter.transactionType === 'expense' && transaction.amount > 0) {
      return false;
    }
    
    // Filter by account
    if (filter.accounts.length > 0 && !filter.accounts.includes(transaction.account)) {
      return false;
    }
    
    // Filter by category
    if (filter.categories.length > 0 && !filter.categories.includes(transaction.category)) {
      return false;
    }
    
    // Filter by amount range
    if (filter.amountRange.min !== null && Math.abs(transaction.amount) < filter.amountRange.min) {
      return false;
    }
    if (filter.amountRange.max !== null && Math.abs(transaction.amount) > filter.amountRange.max) {
      return false;
    }
    
    // Include transaction if it passes all filters
    return true;
  });
}

/**
 * Sort transactions based on sortBy and sortDirection
 */
export function sortTransactions(
  transactions: Transaction[],
  sortBy: keyof Transaction = 'date',
  sortDirection: 'asc' | 'desc' = 'desc'
): Transaction[] {
  return [...transactions].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    // Handle specific sorting cases
    if (sortBy === 'date') {
      // For dates, compare as dates
      valueA = new Date(a.date).getTime();
      valueB = new Date(b.date).getTime();
    } else if (sortBy === 'amount') {
      // For amounts, compare absolute values
      valueA = Math.abs(Number(a.amount));
      valueB = Math.abs(Number(b.amount));
    } else if (typeof valueA === 'string' && typeof valueB === 'string') {
      // For strings, use localeCompare
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // For numbers and dates
    return sortDirection === 'asc'
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number);
  });
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount));
}

/**
 * Format date
 */
export function formatDate(dateString: string, formatStr: string = 'MMM d, yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    return dateString;
  }
}

/**
 * Batch chunk an array for pagination
 */
export function paginateTransactions<T>(items: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

/**
 * Calculate total pages based on item count and page size
 */
export function calculateTotalPages(itemCount: number, pageSize: number): number {
  return Math.ceil(itemCount / pageSize);
} 