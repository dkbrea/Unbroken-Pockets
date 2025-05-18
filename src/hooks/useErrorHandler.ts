import { useState } from 'react';

interface ErrorHandlerOptions {
  fallbackMessage?: string;
  onError?: (message: string) => void;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles different types of errors and returns a user-friendly error message
   * @param error The error object
   * @param options Options for error handling including fallback message and error callback
   * @returns A user-friendly error message
   */
  const handleError = (
    error: unknown, 
    options?: ErrorHandlerOptions | string
  ): string => {
    console.error('Error caught by useErrorHandler:', error);
    
    let fallbackMessage = 'An unexpected error occurred';
    let onError: ((message: string) => void) | undefined;
    
    // Handle both the legacy string parameter and the new options object
    if (typeof options === 'string') {
      fallbackMessage = options;
    } else if (options && typeof options === 'object') {
      fallbackMessage = options.fallbackMessage || fallbackMessage;
      onError = options.onError;
    }
    
    // Extract the error message
    let errorMessage: string;
    
    // If the error is a string, use it directly
    if (typeof error === 'string') {
      errorMessage = error;
    }
    // If it's an Error object
    else if (error instanceof Error) {
      errorMessage = error.message;
    }
    // If it's a response object with a message
    else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    // If we couldn't determine the error type, use the fallback message
    else {
      errorMessage = fallbackMessage;
    }
    
    // Set the internal error state
    setError(errorMessage);
    
    // Call the onError callback if provided
    if (onError && typeof onError === 'function') {
      onError(errorMessage);
    }
    
    return errorMessage;
  };

  return {
    error,
    setError,
    handleError,
    clearError: () => setError(null)
  };
}; 