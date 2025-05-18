'use client'

import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode
}) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    lenisRef.current = new Lenis({
      duration: 2.2, // Slower for more dramatic effect like micro.so
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Ease out expo
      wheelMultiplier: 0.8, // Slower wheel scrolling
      touchMultiplier: 1.5,
      smoothWheel: true
    })

    // Animation frame loop
    function raf(time: number) {
      if (lenisRef.current) {
        lenisRef.current.raf(time)
      }
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Add lenis-smooth class to html
    document.documentElement.classList.add('lenis-smooth')

    return () => {
      document.documentElement.classList.remove('lenis-smooth')
      if (lenisRef.current) {
        lenisRef.current.destroy()
      }
    }
  }, [])

  return <>{children}</>
} 