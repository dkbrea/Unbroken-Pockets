'use client';

import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';

// Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
};

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider component
export const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const value = {
    toasts,
    addToast,
    removeToast
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast component
const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onRemove();
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onRemove]);
  
  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  }[toast.type];
  
  return (
    <div className={`${bgColor} px-4 py-3 rounded-md border mb-2 flex items-center justify-between shadow-md`}>
      <div>{toast.message}</div>
      <button onClick={onRemove} className="ml-4">
        <X size={16} />
      </button>
    </div>
  );
};

// Container for all toasts
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}; 