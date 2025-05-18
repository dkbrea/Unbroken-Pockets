'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;
  
  const renderPageNumbers = () => {
    const pages = [];
    
    // Always show the first page
    pages.push(
      <button
        key="page-1"
        onClick={() => onPageChange(1)}
        aria-label={`Go to page 1`}
        aria-current={currentPage === 1 ? 'page' : undefined}
        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
          currentPage === 1
            ? 'z-10 bg-[#1F3A93] text-white focus:z-20'
            : 'text-gray-500 bg-white hover:bg-gray-50 focus:z-20'
        }`}
      >
        1
      </button>
    );
    
    // Logic to show ellipsis and neighboring pages
    if (totalPages > 1) {
      if (currentPage > 3) {
        pages.push(
          <span key="ellipsis-1" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white">
            ...
          </span>
        );
      }
      
      // Calculate range of pages to show around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
        
        pages.push(
          <button
            key={`page-${i}`}
            onClick={() => onPageChange(i)}
            aria-label={`Go to page ${i}`}
            aria-current={currentPage === i ? 'page' : undefined}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
              currentPage === i
                ? 'z-10 bg-[#1F3A93] text-white focus:z-20'
                : 'text-gray-500 bg-white hover:bg-gray-50 focus:z-20'
            }`}
          >
            {i}
          </button>
        );
      }
      
      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis-2" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white">
            ...
          </span>
        );
      }
      
      // Always show the last page
      if (totalPages > 1) {
        pages.push(
          <button
            key={`page-${totalPages}`}
            onClick={() => onPageChange(totalPages)}
            aria-label={`Go to page ${totalPages}`}
            aria-current={currentPage === totalPages ? 'page' : undefined}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? 'z-10 bg-[#1F3A93] text-white focus:z-20'
                : 'text-gray-500 bg-white hover:bg-gray-50 focus:z-20'
            }`}
          >
            {totalPages}
          </button>
        );
      }
    }
    
    return pages;
  };
  
  return (
    <nav
      className={`flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 ${className}`}
      aria-label="Pagination"
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{Math.min((currentPage - 1) * 10 + 1, totalPages * 10)}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> of{' '}
          <span className="font-medium">{totalPages * 10}</span> results
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } mr-3`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>
        
        <div className="hidden md:flex">
          {renderPageNumbers()}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } ml-3`}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </nav>
  );
} 