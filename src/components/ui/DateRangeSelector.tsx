'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateRangeOption } from '@/types/transactions';

interface DateRangeSelectorProps {
  currentOption: DateRangeOption;
  onOptionChange: (option: DateRangeOption) => void;
  className?: string;
}

export default function DateRangeSelector({
  currentOption,
  onOptionChange,
  className = '',
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const options: DateRangeOption[] = [
    'Last 7 days',
    'Last 30 days',
    'This month',
    'Last month',
    'Last 3 months',
    'Last 6 months',
    'This year',
    'Custom',
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, option?: DateRangeOption) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        if (option) {
          onOptionChange(option);
          setIsOpen(false);
        } else {
          setIsOpen(prev => !prev);
        }
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (isOpen) {
          const nextIndex = options.indexOf(currentOption) + 1;
          if (nextIndex < options.length) {
            onOptionChange(options[nextIndex]);
          }
        } else {
          setIsOpen(true);
        }
        e.preventDefault();
        break;
      case 'ArrowUp':
        if (isOpen) {
          const prevIndex = options.indexOf(currentOption) - 1;
          if (prevIndex >= 0) {
            onOptionChange(options[prevIndex]);
          }
        }
        e.preventDefault();
        break;
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select date range"
      >
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-[#4A4A4A]" aria-hidden="true" />
          <span>{currentOption}</span>
        </div>
        <ChevronDown className="ml-2 h-4 w-4 text-[#4A4A4A]" aria-hidden="true" />
      </button>
      
      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg"
          role="listbox"
          aria-labelledby="date-range-button"
        >
          {options.map((option) => (
            <button
              key={option}
              className={`w-full text-left px-4 py-2 text-sm ${
                currentOption === option
                  ? 'bg-[#F0F4FF] text-[#1F3A93]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                onOptionChange(option);
                setIsOpen(false);
              }}
              onKeyDown={(e) => handleKeyDown(e, option)}
              role="option"
              aria-selected={currentOption === option}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 