'use client'

import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
}

export default function ParallaxScroll({ children, className = '' }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  // Create spring-based scroll progress for smoother animation
  const smoothProgress = useSpring(scrollYProgress, { 
    damping: 15, 
    stiffness: 30 
  })

  // Main zoom transform 
  const scale = useTransform(smoothProgress, [0, 1], [1, 3.5])
  const opacity = useTransform(smoothProgress, [0, 0.5, 0.8, 1], [1, 0.8, 0.5, 0])
  
  // Parallax for background elements
  const yBg = useTransform(smoothProgress, [0, 1], ['0%', '30%'])
  const scaleBg = useTransform(smoothProgress, [0, 1], [1, 1.2])

  return (
    <div ref={containerRef} className={`relative w-full min-h-screen ${className}`}>
      {/* Background elements that move slower */}
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        style={{ 
          y: yBg,
          scale: scaleBg,
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern bg-grid-size opacity-50" />
      </motion.div>

      {/* Main content that zooms in */}
      <motion.div 
        className="relative h-full"
        style={{ 
          scale,
          opacity,
          transformOrigin: 'center 35%' // Adjust this to match micro.so's zoom origin
        }}
      >
        {children}
      </motion.div>
    </div>
  )
} 