'use client'

import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface Section {
  id: string
  title: string
  subtitle?: string
  description?: string
  color?: string
  position?: number
}

interface MicroScrollProps {
  sections: Section[]
}

// Fixed positions for cards that appear during zoom
const cards = [
  { id: 'card1', x: -400, y: -150, scale: 0.7, opacity: 0.8, rotation: -5 },
  { id: 'card2', x: 400, y: -200, scale: 0.6, opacity: 0.7, rotation: 5 },
  { id: 'card3', x: -300, y: 200, scale: 0.5, opacity: 0.6, rotation: -3 },
  { id: 'card4', x: 350, y: 250, scale: 0.65, opacity: 0.75, rotation: 4 },
]

export default function MicroScroll({ sections }: MicroScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Main scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })
  
  // Smoother progress with spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 50,
    stiffness: 100,
    mass: 0.5
  })
  
  // Create transform values based on scroll
  // This creates the zoom effect as you scroll down
  const scale = useTransform(smoothProgress, [0, 1], [1, 5])
  
  // Calculate background grid scale (opposite of content scale)
  const gridScale = useTransform(smoothProgress, [0, 1], [1, 0.8])
  const gridOpacity = useTransform(smoothProgress, [0, 0.8], [0.3, 0])
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-[500vh] overflow-hidden"
    >
      {/* Fixed background grid */}
      <motion.div 
        className="fixed inset-0 w-full h-full bg-grid-pattern bg-grid-size pointer-events-none"
        style={{ 
          scale: gridScale,
          opacity: gridOpacity
        }}
      />
      
      {/* Sections container that scales up */}
      <motion.div
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center"
        style={{ 
          scale,
          transformOrigin: 'center center'
        }}
      >
        {/* Content */}
        <div className="relative w-[1000px] h-[600px]">
          {/* Floating cards that appear during zoom */}
          {cards.map((card) => (
            <motion.div 
              key={card.id}
              className="absolute rounded-xl bg-black/80 border border-gray-800 p-6 w-[300px] h-[180px] text-left"
              style={{
                x: card.x,
                y: card.y,
                rotateZ: card.rotation,
                opacity: useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, card.opacity, card.opacity, 0]),
                scale: useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, card.scale, card.scale, 0]),
              }}
            >
              <div className="w-8 h-8 rounded-full bg-primary mb-4"></div>
              <h3 className="text-white font-medium mb-2">Financial Feature</h3>
              <p className="text-gray-400 text-sm">Track your expenses and manage your finances with ease</p>
            </motion.div>
          ))}
          
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-center"
              style={{
                opacity: useTransform(
                  smoothProgress,
                  [
                    Math.max(0, (index - 0.5) / sections.length),
                    index / sections.length,
                    Math.min(1, (index + 0.5) / sections.length)
                  ],
                  [0, 1, 0]
                ),
                pointerEvents: 'none'
              }}
            >
              <div>
                <h2 className="text-5xl md:text-7xl font-bold mb-6">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <h3 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
                    {section.subtitle}
                  </h3>
                )}
                {section.description && (
                  <p className="text-xl max-w-2xl mx-auto text-gray-400">
                    {section.description}
                  </p>
                )}
              </div>
            </motion.section>
          ))}
        </div>
      </motion.div>
      
      {/* Scroll indicator dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-3">
        {sections.map((section, index) => {
          // Create a motion value that tracks if this section is active
          const isActive = useTransform(
            smoothProgress,
            [
              Math.max(0, (index - 0.5) / sections.length),
              index / sections.length,
              Math.min(1, (index + 0.5) / sections.length)
            ],
            [0, 1, 0]
          )
          
          return (
            <motion.div
              key={section.id}
              className="w-2 h-2 rounded-full bg-white cursor-pointer"
              style={{
                scale: useTransform(isActive, [0, 1], [1, 1.8]),
                opacity: useTransform(isActive, [0, 1], [0.3, 1])
              }}
              onClick={() => {
                const targetPosition = (index / sections.length) * 
                  (containerRef.current?.scrollHeight || 0)
                window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
                })
              }}
            />
          )
        })}
      </div>
    </div>
  )
} 