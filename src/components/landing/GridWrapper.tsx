'use client'

import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import Image from 'next/image'
import CustomShape3D from './CustomShape3D'

interface GridWrapperProps {
  className?: string
}

export default function GridWrapper({ className = '' }: GridWrapperProps) {
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
  const gridOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0.3])
  
  // Define card positions and animations
  const cards = [
    { 
      id: 'card1', 
      x: -400, 
      y: -150, 
      scale: 0.8, 
      opacity: 0.9, 
      rotation: -5,
      title: 'Salt Lake City',
      name: 'Eric Hoffman',
      role: 'CO / Founder of Reform Co, Mountain Bike Lover',
      connections: 4,
      bgColor: 'linear-gradient(135deg, #4538ff 0%, #ff3a3a 100%)',
      avatarInitial: 'E'
    },
    { 
      id: 'card2', 
      x: 400, 
      y: -200, 
      scale: 0.7, 
      opacity: 0.8, 
      rotation: 5,
      title: 'Santa Cruz, CA',
      name: 'Reform Collective',
      role: 'Digital First Agency - We Live In the Details',
      connections: 4,
      bgColor: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
      avatarInitial: 'R'
    },
    { 
      id: 'card3', 
      x: -300, 
      y: 200, 
      scale: 0.6, 
      opacity: 0.7, 
      rotation: -3,
      title: 'Call Scheduled with Eric',
      subtitle: 'Set up time with Eric',
      actionButton: 'Call Scheduled with Eric',
      bgColor: 'black',
      highlight: true,
      highlightColor: '#8f7be3'
    },
    { 
      id: 'card4', 
      x: 350, 
      y: 250, 
      scale: 0.75, 
      opacity: 0.85, 
      rotation: 4,
      title: 'Demo Meeting',
      subtitle: 'Send Eric details about integrations ahead of the demo call',
      tag: 'Demo Meeting',
      tagColor: '#00cfc4',
      amount: '$25,000',
      rating: 'Very Strong',
      bgColor: 'black'
    },
  ]

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full min-h-[500vh] overflow-hidden bg-black ${className}`}
    >
      {/* Fixed centered content */}
      <motion.div
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center"
        style={{ 
          scale,
          transformOrigin: 'center center'
        }}
      >
        {/* Main grid content */}
        <div className="relative">
          {/* Grid layout */}
          <motion.div 
            className="div-grid-wrapper"
            style={{ 
              scale: gridScale,
              opacity: gridOpacity
            }}
          >
            <div className="icon">
              {/* Simplified grid background with SVG elements */}
              <svg 
                className="group" 
                viewBox="0 0 526 490" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.2">
                  {/* Grid border */}
                  <rect x="1" y="1" width="524" height="488" rx="4" stroke="#333" strokeWidth="0.5" />
                  
                  {/* Horizontal grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line 
                      key={`h-${i}`} 
                      x1="0" 
                      y1={97.6 * i + 1} 
                      x2="526" 
                      y2={97.6 * i + 1} 
                      stroke="#333" 
                      strokeWidth="0.5" 
                    />
                  ))}
                  
                  {/* Vertical grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line 
                      key={`v-${i}`} 
                      x1={105.2 * i + 1} 
                      y1="0" 
                      x2={105.2 * i + 1} 
                      y2="490" 
                      stroke="#333" 
                      strokeWidth="0.5" 
                    />
                  ))}
                </g>
              </svg>
            </div>
          </motion.div>

          {/* Floating cards that appear during zoom */}
          {cards.map((card) => (
            <motion.div 
              key={card.id}
              className="absolute rounded-xl bg-black border border-gray-800 p-6 w-[300px] h-[180px] text-left overflow-hidden"
              style={{
                x: card.x,
                y: card.y,
                rotateZ: card.rotation,
                opacity: useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, card.opacity, card.opacity, 0]),
                scale: useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, card.scale, card.scale, 0]),
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                background: card.bgColor || 'black'
              }}
            >
              {/* Card content based on type */}
              {card.avatarInitial && (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4" 
                  style={{ background: card.bgColor || 'linear-gradient(135deg, #4538ff 0%, #ff3a3a 100%)' }}>
                  {card.avatarInitial}
                </div>
              )}
              
              {card.name && (
                <h3 className="text-white font-medium mb-1">{card.name}</h3>
              )}
              
              {card.role && (
                <p className="text-gray-400 text-sm mb-2">{card.role}</p>
              )}
              
              {card.title && !card.name && (
                <div className="mb-2">
                  {card.tag && (
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium mr-2 mb-2"
                      style={{ color: card.tagColor || '#8f7be3', border: `1px solid ${card.tagColor || '#8f7be3'}` }}>
                      {card.tag}
                    </span>
                  )}
                  <h3 className="text-gray-300 text-sm font-medium">{card.title}</h3>
                </div>
              )}
              
              {card.subtitle && (
                <p className="text-gray-400 text-xs mb-4">{card.subtitle}</p>
              )}
              
              {card.amount && (
                <div className="flex items-center mb-2">
                  <span className="text-gray-300 text-sm mr-4">
                    <span className="text-gray-500 mr-1">$</span>{card.amount.replace('$', '')}
                  </span>
                </div>
              )}
              
              {card.rating && (
                <div className="px-3 py-1 rounded-full text-xs inline-block" 
                  style={{ background: 'rgba(143, 123, 227, 0.1)', color: '#8f7be3' }}>
                  <span className="mr-1">|||</span> {card.rating}
                </div>
              )}
              
              {card.actionButton && (
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="px-4 py-2 rounded-md text-center text-sm" 
                    style={{ 
                      background: 'rgba(143, 123, 227, 0.1)', 
                      color: card.highlightColor || '#8f7be3',
                      border: `1px solid ${card.highlightColor || '#8f7be3'}`
                    }}>
                    {card.actionButton}
                  </div>
                </div>
              )}
              
              {card.connections && (
                <div className="absolute bottom-4 left-6 flex items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-xs">👥</span>
                  </div>
                  <span className="text-gray-400 text-xs ml-2">{card.connections} connections</span>
                </div>
              )}
              
              {card.title === 'Salt Lake City' && (
                <div className="absolute bottom-4 left-6">
                  <span className="text-gray-400 text-xs">{card.title}</span>
                </div>
              )}
            </motion.div>
          ))}

          {/* 3D Shape in the center */}
          <motion.div
            className="absolute"
            style={{
              opacity: useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]),
              scale: useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]),
              filter: 'drop-shadow(0 0 30px rgba(255,215,170,0.3))',
              width: '300px',
              height: '300px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CustomShape3D />
          </motion.div>
            
          {/* Heading text that appears and scales */}
          <motion.div
            className="absolute top-0 left-0 w-full text-center"
            style={{
              y: useTransform(smoothProgress, [0, 0.5], [-100, -400]),
              opacity: useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]),
              scale: useTransform(smoothProgress, [0, 0.5], [0.8, 1.2]),
            }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mt-36 mb-4">
              Micro works the way
            </h1>
            <h2 className="text-5xl md:text-7xl font-bold text-white">
              you want to work
            </h2>
          </motion.div>

          {/* Feature text at the bottom */}
          <motion.div
            className="absolute bottom-20 left-0 w-full text-center"
            style={{
              y: useTransform(smoothProgress, [0.5, 1], [400, 0]),
              opacity: useTransform(smoothProgress, [0.4, 0.6, 0.8, 1], [0, 1, 1, 0]),
            }}
          >
            <p className="text-amber-500 uppercase tracking-wider mb-2 text-sm">AI-POWERED</p>
            <h3 className="text-3xl font-bold text-white">Everything in one place</h3>
            <p className="max-w-xl mx-auto text-gray-300 mt-4">
              Fully-featured email client, CRM, task manager and more integrated with Gmail, Calendar, LinkedIn, WhatsApp and other tools.
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Mountain-like shapes at the bottom */}
      <motion.div
        className="fixed bottom-0 left-0 w-full h-[200px] pointer-events-none"
        style={{
          opacity: useTransform(smoothProgress, [0, 0.5, 1], [0, 1, 0.7]),
          y: useTransform(smoothProgress, [0, 1], [50, 0]),
        }}
      >
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 200L50 180C100 160 200 120 300 110C400 100 500 120 600 130C700 140 800 140 900 130C1000 120 1100 100 1150 90L1200 80V200H1150C1100 200 1000 200 900 200C800 200 700 200 600 200C500 200 400 200 300 200C200 200 100 200 50 200H0Z" 
              fill="#222" 
              opacity="0.7"
            />
            <path 
              d="M0 200L50 190C100 180 200 160 300 155C400 150 500 160 600 165C700 170 800 170 900 165C1000 160 1100 150 1150 145L1200 140V200H1150C1100 200 1000 200 900 200C800 200 700 200 600 200C500 200 400 200 300 200C200 200 100 200 50 200H0Z" 
              fill="#333" 
              opacity="0.8"
            />
          </svg>
        </div>
      </motion.div>
      
      {/* Scroll indicator dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-3 z-50">
        {[0, 0.25, 0.5, 0.75, 1].map((section, index) => {
          // Create a motion value that tracks if this section is active
          const isActive = useTransform(
            smoothProgress,
            [
              Math.max(0, section - 0.15),
              section,
              Math.min(1, section + 0.15)
            ],
            [0, 1, 0]
          )
          
          return (
            <motion.div
              key={`section-${index}`}
              className="w-2 h-2 rounded-full bg-white cursor-pointer"
              style={{
                scale: useTransform(isActive, [0, 1], [1, 1.8]),
                opacity: useTransform(isActive, [0, 1], [0.3, 1])
              }}
              onClick={() => {
                const targetPosition = section * 
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

      {/* CSS for the custom shape */}
      <style jsx>{`
        .div-grid-wrapper,
        .div-grid-wrapper * {
          box-sizing: border-box;
        }
        
        .div-grid-wrapper {
          height: 593.12px;
          position: relative;
        }
        
        .icon {
          width: 579.12px;
          height: 593.12px;
          position: absolute;
          left: 0px;
          top: 0px;
        }
        
        .group {
          width: 100%;
          height: 100%;
          position: absolute;
          right: 0;
          left: 0;
          bottom: 0;
          top: 0;
          overflow: visible;
        }
      `}</style>
    </div>
  )
} 