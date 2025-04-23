'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Wallet } from 'lucide-react';
import { RecurringTransaction } from '@/hooks/useRecurringData';

// Define interfaces for calendar data
interface CalendarDayTransaction extends RecurringTransaction {
  isHistorical?: boolean;
}

interface CalendarDay {
  day: number | null;
  isCurrentMonth: boolean;
  date?: Date;
  transactions: CalendarDayTransaction[];
  dailyTotal: number;
}

interface RecurringCalendarProps {
  transactions: RecurringTransaction[];
  onTransactionClick?: (transaction: RecurringTransaction) => void;
  currentMonth?: Date;
  onMonthChange?: (month: Date) => void;
}

interface FrequencyConfig {
  [key: string]: {
    days?: number;
    months?: number;
    years?: number;
    daysInMonth?: boolean;
  };
}

const RecurringCalendar = ({ 
  transactions, 
  onTransactionClick,
  currentMonth: externalMonth,
  onMonthChange 
}: RecurringCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(externalMonth || new Date());
  
  // Update local state when prop changes
  useEffect(() => {
    if (externalMonth) {
      setCurrentMonth(externalMonth);
    }
  }, [externalMonth]);
  
  // Get current year and month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Change month handler
  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };
  
  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };
  
  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (onMonthChange) {
      onMonthChange(today);
    }
  };
  
  // Format month and year
  const monthYearFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth);
  
  // Generate calendar days
  const calendarDays = useMemo(() => {
    console.log("Generating calendar days with transactions:", transactions);
    console.log("Debt-related transactions:", transactions.filter(t => t.debtId));
    
    // Get first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create calendar grid (6 rows x 7 columns)
    const days: CalendarDay[] = [];
    
    // Add previous month days to fill in the first row
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false, transactions: [], dailyTotal: 0 });
    }
    
    // Generate historical transactions for the current month
    const getHistoricalTransactions = (originalDate: Date, frequency: string): Date[] => {
      const frequencies: FrequencyConfig = {
        'daily': { days: 1 },
        'weekly': { days: 7 },
        'bi-weekly': { days: 14 },
        'semi-monthly': { daysInMonth: true },
        'monthly': { months: 1 },
        'quarterly': { months: 3 },
        'semi-annually': { months: 6 },
        'annually': { years: 1 }
      };
      
      const freqKey = frequency.toLowerCase();
      
      // Special handling for semi-monthly (typically 1st and 15th or 15th and last day)
      if (freqKey === 'semi-monthly') {
        const day = originalDate.getDate();
        if (day === 1 || day === 15) {
          // If original is on 1st, add 15th, if on 15th, add 1st
          const secondDate = new Date(originalDate);
          secondDate.setDate(day === 1 ? 15 : 1);
          
          // Only return dates for the current month we're viewing
          if (secondDate.getMonth() === month && secondDate.getFullYear() === year) {
            return [secondDate];
          }
          return [];
        }
        // For other days with semi-monthly frequency, default to 1st and 15th
        const firstDate = new Date(year, month, 1);
        const fifteenthDate = new Date(year, month, 15);
        
        return [firstDate, fifteenthDate];
      }
      
      // For other frequencies
      const dates: Date[] = [];
      
      // Calculate both past and future occurrences
      // This function now calculates both backwards and forwards from originalDate
      // to ensure recurring transactions appear in future months too
      
      // Function to add dates based on frequency
      const addOccurrences = (startDate: Date, direction: 'past' | 'future'): void => {
        let tempDate = new Date(startDate);
        const config = frequencies[freqKey];
        if (!config) return;
        
        // Loop for 24 months in either direction to cover a reasonable time range
        for (let i = 0; i < 24; i++) {
          // Apply frequency to get previous/next occurrence
          if (config.days) {
            tempDate = new Date(tempDate);
            tempDate.setDate(tempDate.getDate() + (direction === 'past' ? -config.days : config.days));
          } else if (config.months) {
            tempDate = new Date(tempDate);
            tempDate.setMonth(tempDate.getMonth() + (direction === 'past' ? -config.months : config.months));
          } else if (config.years) {
            tempDate = new Date(tempDate);
            tempDate.setFullYear(tempDate.getFullYear() + (direction === 'past' ? -config.years : config.years));
          } else {
            break; // Unknown frequency
          }
          
          // Check if this occurrence is in the month we're viewing
          if (tempDate.getMonth() === month && tempDate.getFullYear() === year) {
            dates.push(new Date(tempDate));
          }
          
          // Stop if we've gone beyond the current viewing month in either direction
          if (direction === 'past' && (tempDate.getFullYear() < year || 
              (tempDate.getFullYear() === year && tempDate.getMonth() < month))) {
            break;
          }
          
          if (direction === 'future' && (tempDate.getFullYear() > year || 
              (tempDate.getFullYear() === year && tempDate.getMonth() > month))) {
            break;
          }
        }
      };
      
      // Calculate past occurrences
      addOccurrences(originalDate, 'past');
      
      // Calculate future occurrences
      addOccurrences(originalDate, 'future');
      
      return dates;
    };
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      let dayTransactions: CalendarDayTransaction[] = [];
      
      // Find transactions that occur on this day
      transactions.forEach(transaction => {
        // Check for debt transactions
        if (transaction.debtId) {
          console.log(`Processing debt transaction on day ${day}:`, transaction);
        }
        
        // Fix timezone issue by using a consistent date format
        const nextDateStr = transaction.nextDate; // e.g. "2023-05-01"
        const [yearStr, monthStr, dayStr] = nextDateStr.split('-').map(num => parseInt(num, 10));
        const nextDate = new Date(yearStr, monthStr - 1, dayStr);
        
        // Check if this transaction falls on the current day directly
        if (yearStr === year && monthStr - 1 === month && dayStr === day) {
          if (transaction.debtId) {
            console.log(`Direct debt transaction match on ${month+1}/${day}/${year}:`, transaction);
          }
          dayTransactions.push(transaction);
        } else {
          // Check for historical occurrences based on frequency
          const historicalDates = getHistoricalTransactions(nextDate, transaction.frequency);
          
          historicalDates.forEach(historicalDate => {
            if (historicalDate.getDate() === day) {
              // Create a copy of the transaction with the historical date
              const historicalTransaction: CalendarDayTransaction = {
                ...transaction,
                nextDate: historicalDate.toISOString().split('T')[0],
                isHistorical: true
              };
              
              if (transaction.debtId) {
                console.log(`Historical debt transaction on ${month+1}/${day}/${year}:`, historicalTransaction);
              }
              
              dayTransactions.push(historicalTransaction);
            }
          });
        }
      });
      
      // Calculate daily totals
      const dailyTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      days.push({ 
        day, 
        isCurrentMonth: true, 
        date, 
        transactions: dayTransactions,
        dailyTotal
      });
    }
    
    // Add next month days to fill the remaining cells (if any)
    const remainingCells = 42 - days.length; // 6 rows x 7 days = 42 cells
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, isCurrentMonth: false, transactions: [], dailyTotal: 0 });
    }
    
    return days;
  }, [year, month, transactions]);
  
  // Days of the week
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  // Transaction click handler
  const handleTransactionClick = (transaction: RecurringTransaction) => {
    if (onTransactionClick) {
      onTransactionClick(transaction);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-800">
          {monthYearFormat}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleTodayClick}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekdays.map(day => (
            <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-rows-6">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
              {week.map((dayObj, dayIndex) => (
                <div 
                  key={`${weekIndex}-${dayIndex}`} 
                  className={`min-h-[100px] p-1 border-r border-gray-200 last:border-r-0 ${
                    dayObj.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${
                    dayObj.day === new Date().getDate() && 
                    month === new Date().getMonth() && 
                    year === new Date().getFullYear() ? 
                      'bg-blue-50' : ''
                  }`}
                >
                  {dayObj.day && (
                    <div className="p-1">
                      <div className={`text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center ${
                        dayObj.day === new Date().getDate() && 
                        month === new Date().getMonth() && 
                        year === new Date().getFullYear() ? 
                          'bg-[#1F3A93] text-white' : 
                          dayObj.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {dayObj.day}
                      </div>
                      
                      <div className="mt-1 space-y-1 max-h-[80px] overflow-auto">
                        {dayObj.transactions.map((transaction, index) => (
                          <div 
                            key={transaction.id} 
                            className={`text-xs truncate px-2 py-1 rounded-md ${
                              transaction.amount > 0 ? 'bg-green-100 text-green-800' : transaction.debtId ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            } ${transaction.isHistorical ? 'opacity-70' : ''} ${onTransactionClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                            title={`${transaction.name}
Amount: $${Math.abs(transaction.amount).toLocaleString()}
Frequency: ${transaction.frequency}
Method: ${transaction.paymentMethod}
${transaction.debtId ? 'Debt Payment' : ''}
${transaction.isHistorical ? 'Recurring instance based on frequency' : 'Original next occurrence: ' + new Date(transaction.nextDate).toLocaleDateString()}
Click to edit`}
                            onClick={() => handleTransactionClick(transaction)}
                          >
                            <div className="flex items-center">
                              {transaction.debtId ? (
                                <Wallet className="h-3 w-3 mr-1 flex-shrink-0" />
                              ) : transaction.amount > 0 ? (
                                <ArrowUp className="h-3 w-3 mr-1 flex-shrink-0" />
                              ) : (
                                <ArrowDown className="h-3 w-3 mr-1 flex-shrink-0" />
                              )}
                              <span className="truncate">{transaction.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Daily total */}
                      {dayObj.transactions && dayObj.transactions.length > 0 && (
                        <div className="mt-1 pt-1 border-t border-gray-200">
                          <div className={`text-xs font-medium ${dayObj.dailyTotal > 0 ? 'text-green-600' : dayObj.dailyTotal < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            Total: ${dayObj.dailyTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecurringCalendar; 