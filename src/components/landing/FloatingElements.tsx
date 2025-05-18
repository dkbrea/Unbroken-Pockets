'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface FloatingElement {
  id: number
  text: string
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
}

export default function FloatingElements() {
  // Generate random elements
  const elements: FloatingElement[] = [
    { id: 1, text: 'Analytics', x: 20, y: 15, size: 1, color: 'rgba(14, 165, 233, 0.7)', delay: 0, duration: 35 },
    { id: 2, text: 'Budgeting', x: 70, y: 30, size: 1.2, color: 'rgba(14, 165, 233, 0.5)', delay: 5, duration: 45 },
    { id: 3, text: 'Planning', x: 40, y: 70, size: 0.9, color: 'rgba(14, 165, 233, 0.6)', delay: 2, duration: 40 },
    { id: 4, text: 'Expenses', x: 80, y: 80, size: 1.1, color: 'rgba(14, 165, 233, 0.7)', delay: 7, duration: 38 },
    { id: 5, text: 'Tracking', x: 15, y: 60, size: 1, color: 'rgba(14, 165, 233, 0.5)', delay: 12, duration: 42 },
    { id: 6, text: 'Goals', x: 65, y: 45, size: 0.8, color: 'rgba(14, 165, 233, 0.6)', delay: 9, duration: 39 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute font-medium opacity-30"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            color: element.color,
            fontSize: `${element.size + 0.5}rem`,
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.2, 0.3, 0.2, 0],
            x: [0, 20, -20, 10, 0],
            y: [0, -15, 10, -5, 0],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 10 + 5,
          }}
        >
          {element.text}
        </motion.div>
      ))}
    </div>
  )
} 