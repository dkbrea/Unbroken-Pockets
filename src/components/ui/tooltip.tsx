"use client"

import * as React from "react"
import { useState } from "react"

// Simple tooltip components that don't mess with layout
export const TooltipProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return <>{children}</>
}

export const Tooltip: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Clone children with isOpen state
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        isOpen, 
        setIsOpen
      } as any)
    }
    return child
  })
  
  return <span className="inline-flex items-center relative">{childrenWithProps}</span>
}

// Trigger element that shows/hides tooltip
type TooltipTriggerProps = {
  asChild?: boolean
  children: React.ReactNode
  isOpen?: boolean
  setIsOpen?: (isOpen: boolean) => void
} & React.HTMLAttributes<HTMLSpanElement>

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ 
  children, 
  asChild = false,
  isOpen,
  setIsOpen,
  ...props 
}) => {
  const handleMouseEnter = () => setIsOpen?.(true)
  const handleMouseLeave = () => setIsOpen?.(false)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      ...props
    } as any)
  }
  
  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </span>
  )
}

// Content that appears when tooltip is open
type TooltipContentProps = {
  children: React.ReactNode
  isOpen?: boolean
}

export const TooltipContent: React.FC<TooltipContentProps> = ({ 
  children,
  isOpen 
}) => {
  if (!isOpen) return null
  
  return (
    <div 
      className="absolute z-50 px-2 py-1 text-xs text-white bg-black/80 rounded-sm shadow-sm min-w-max"
      style={{ 
        top: '100%', 
        left: '50%', 
        transform: 'translateX(-50%)',
        marginTop: '4px'
      }}
    >
      {children}
    </div>
  )
} 