import { format as dateFnsFormat } from 'date-fns';

export const useFormatter = () => {
  /**
   * Format a date string using the date-fns format
   * @param dateStr Date string or Date object
   * @param formatStr Format string (default: 'MMM d, yyyy')
   * @returns Formatted date string
   */
  const formatDate = (dateStr: string | Date, formatStr: string = 'MMM d, yyyy'): string => {
    if (!dateStr) return '-';
    
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return dateFnsFormat(date, formatStr);
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(dateStr);
    }
  };

  /**
   * Format a number as currency
   * @param amount Number to format
   * @param currency Currency code (default: 'USD')
   * @returns Formatted currency string
   */
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    if (amount === null || amount === undefined) return '-';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `$${amount.toFixed(2)}`;
    }
  };

  /**
   * Format a number with commas for thousands
   * @param num Number to format
   * @returns Formatted number string
   */
  const formatNumber = (num: number): string => {
    if (num === null || num === undefined) return '-';
    
    try {
      return new Intl.NumberFormat('en-US').format(num);
    } catch (error) {
      console.error('Error formatting number:', error);
      return String(num);
    }
  };

  /**
   * Format a percentage
   * @param value Number to format as percentage
   * @param decimalPlaces Number of decimal places
   * @returns Formatted percentage string
   */
  const formatPercent = (value: number, decimalPlaces: number = 2): string => {
    if (value === null || value === undefined) return '-';
    
    try {
      return `${(value * 100).toFixed(decimalPlaces)}%`;
    } catch (error) {
      console.error('Error formatting percentage:', error);
      return `${value}%`;
    }
  };

  return {
    formatDate,
    formatCurrency,
    formatNumber,
    formatPercent
  };
}; 