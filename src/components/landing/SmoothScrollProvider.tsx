'use client'

import { useState, useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export default function SmoothScrollProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    if (!lenis) {
      const lenisInstance = new Lenis({
        duration: 1.5, // Adjust for smoother scrolling
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      })
      
      // Animation frame loop
      function raf(time: number) {
        lenisInstance.raf(time)
        requestAnimationFrame(raf)
      }
      
      requestAnimationFrame(raf)
      
      // Store lenis instance
      setLenis(lenisInstance)
      
      // Add lenis-smooth class to html
      document.documentElement.classList.add('lenis-smooth')
      
      return () => {
        document.documentElement.classList.remove('lenis-smooth')
        lenisInstance.destroy()
      }
    }
  }, [lenis])

  return <>{children}</>
} 