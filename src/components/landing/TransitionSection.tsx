'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

interface TransitionSectionProps {
  children: React.ReactNode
  index: number
  zoomOrigin?: string
}

export default function TransitionSection({ 
  children, 
  index, 
  zoomOrigin = 'center 35%'
}: TransitionSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })

  // Create zoom effect on section enter
  const scale = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [0.8, 1, 1, 0.8]
  )
  
  // Opacity based on scroll position
  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [0, 1, 1, 0]
  )
  
  // Calculate subtle y movement for parallax
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [100, -100] // Moves up slightly as scrolling down
  )
  
  // Staggered entrance animation based on index
  const initialDelay = index * 0.1

  return (
    <motion.div
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center py-20 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: initialDelay }}
    >
      <motion.div
        className="max-w-6xl w-full"
        style={{ 
          scale,
          opacity,
          y,
          transformOrigin: zoomOrigin
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
} 