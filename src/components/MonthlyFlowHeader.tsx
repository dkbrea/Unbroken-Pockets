import React from 'react';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';

type MonthlyFlowHeaderProps = {
  month: Date;
  income: number;
  fixedExpenses: number;
  subscriptions: number;
  variableExpenses: number;
  debtPayments: number;
  goalContributions: number;
  onHeaderClick?: () => void;
};

export const MonthlyFlowHeader: React.FC<MonthlyFlowHeaderProps> = ({
  month,
  income,
  fixedExpenses,
  subscriptions,
  variableExpenses,
  debtPayments,
  goalContributions,
  onHeaderClick,
}) => {
  const totalAllocated = fixedExpenses + subscriptions + variableExpenses + debtPayments + goalContributions;
  const remaining = income - totalAllocated;
  const isZeroBased = Math.abs(remaining) < 0.01;
  const isOverAllocated = remaining < 0;

  return (
    <div 
      className={`p-4 ${
        isZeroBased 
          ? 'bg-green-50' 
          : isOverAllocated 
            ? 'bg-red-50' 
            : 'bg-yellow-50'
      } cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={onHeaderClick}
    >
      <div className="text-sm font-medium mb-2">
        {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>
      
      {/* Income Arrow */}
      <div className="flex items-center justify-center text-gray-600 mb-2">
        <ArrowDown className="h-4 w-4 mr-1" />
        <span className="font-medium">${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Allocation Box */}
      <div className={`border rounded-md p-2 mb-2 ${
        isZeroBased 
          ? 'border-green-200 bg-green-50' 
          : isOverAllocated 
            ? 'border-red-200 bg-red-50' 
            : 'border-yellow-200 bg-yellow-50'
      }`}>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-orange-600">Fixed</span>
            <span>${fixedExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-600">Subscriptions</span>
            <span>${subscriptions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">Variable</span>
            <span>${variableExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-600">Debt</span>
            <span>${debtPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600">Goals</span>
            <span>${goalContributions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Status Arrow */}
      <div className={`flex items-center justify-center text-sm ${
        isZeroBased 
          ? 'text-green-600' 
          : isOverAllocated 
            ? 'text-red-600' 
            : 'text-yellow-600'
      }`}>
        {isZeroBased ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            <span>Perfect Balance!</span>
          </>
        ) : isOverAllocated ? (
          <>
            <ArrowUp className="h-4 w-4 mr-1" />
            <span>${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })} over</span>
          </>
        ) : (
          <>
            <ArrowDown className="h-4 w-4 mr-1" />
            <span>${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} left</span>
          </>
        )}
      </div>
    </div>
  );
}; 