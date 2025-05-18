'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
  autoHideAfter?: number;
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  onClose, 
  className = '',
  autoHideAfter
}: ErrorMessageProps) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (autoHideAfter && autoHideAfter > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, autoHideAfter);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideAfter]);
  
  if (!visible) return null;
  
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`} role="alert">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" aria-hidden="true" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-1 text-sm text-red-700">{message}</div>
        </div>
        {onRetry && (
          <button
            className="ml-auto inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => {
              onRetry();
              if (autoHideAfter) setVisible(false);
            }}
            aria-label="Retry"
          >
            <RefreshCw className="h-4 w-4 mr-1" aria-hidden="true" />
            Retry
          </button>
        )}
        <button
          type="button"
          className="ml-auto bg-red-50 rounded-md p-1.5 inline-flex items-center justify-center text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
} 