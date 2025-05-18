'use client';

import { CreditCard } from 'lucide-react';

interface DebitInfoBannerProps {
  debitAccountsCount: number;
  hasAccountFilter: boolean;
  className?: string;
}

export default function DebitInfoBanner({
  debitAccountsCount,
  hasAccountFilter,
  className = ''
}: DebitInfoBannerProps) {
  if (debitAccountsCount === 0 || hasAccountFilter) {
    return null;
  }

  return (
    <div className={`bg-purple-50 border border-purple-200 rounded-lg p-4 ${className}`} role="region" aria-label="Information about debt accounts">
      <h2 className="text-lg font-semibold text-purple-800 flex items-center">
        <CreditCard className="mr-2 h-5 w-5" aria-hidden="true" /> 
        Credit Card & Debt Accounts
      </h2>
      <p className="text-purple-700 mt-1">
        Transactions made using credit cards or other debt accounts are indicated with a <CreditCard className="inline h-3 w-3 mx-1" aria-hidden="true" /> icon.
        These expenses don't reduce your budget balance immediately, but should be paid off later to stay on budget.
      </p>
    </div>
  );
} 