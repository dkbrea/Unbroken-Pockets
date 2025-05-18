'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function MicroZoom() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollHeight, setScrollHeight] = useState<number>(0)
  
  // Set up a large scroll height
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setScrollHeight(window.innerHeight * 5) // 5 times the viewport height for scrolling
    }
  }, [])
  
  // Get scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Transform values based on scroll progress
  const scale = useTransform(scrollYProgress, [0, 1], [0.2, 5])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 0.2, 0])
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [1, 1, 0, 0])
  const gridScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.5])
  
  // Card animations
  const card1X = useTransform(scrollYProgress, [0, 0.4], [-300, -600])
  const card1Y = useTransform(scrollYProgress, [0, 0.4], [-100, -200])
  const card1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 0.8], [0, 1, 1, 0])
  
  const card2X = useTransform(scrollYProgress, [0, 0.4], [300, 600])
  const card2Y = useTransform(scrollYProgress, [0, 0.4], [-150, -300])
  const card2Opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 0.9], [0, 1, 1, 0])
  
  const card3X = useTransform(scrollYProgress, [0, 0.4], [-250, -500])
  const card3Y = useTransform(scrollYProgress, [0, 0.4], [150, 300])
  const card3Opacity = useTransform(scrollYProgress, [0.1, 0.4, 0.7, 0.9], [0, 1, 1, 0])
  
  const card4X = useTransform(scrollYProgress, [0, 0.4], [250, 500])
  const card4Y = useTransform(scrollYProgress, [0, 0.4], [200, 400])
  const card4Opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8, 1], [0, 1, 1, 0])

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-black"
      style={{ height: `${scrollHeight}px` }}
    >
      {/* Fixed viewport content that transforms as you scroll */}
      <div className="fixed inset-0 flex items-center justify-center perspective">
        {/* Center content that scales */}
        <motion.div 
          className="relative z-10"
          style={{
            scale,
            transformOrigin: 'center center'
          }}
        >
          {/* Heading */}
          <motion.div 
            className="text-center mb-4"
            style={{ opacity: textOpacity }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Micro works the way
            </h1>
            <h2 className="text-5xl md:text-7xl font-bold text-white mt-4">
              you want to work
            </h2>
          </motion.div>
          
          {/* 3D sphere in the center */}
          <div className="w-[300px] h-[300px] mx-auto relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-600" />
          </div>
        </motion.div>
        
        {/* Grid background */}
        <motion.div 
          className="absolute inset-0 z-0" 
          style={{ 
            opacity,
            scale: gridScale
          }}
        >
          <div className="w-full h-full grid grid-cols-5 grid-rows-5">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="border border-gray-800 opacity-20" />
            ))}
          </div>
        </motion.div>
        
        {/* Cards */}
        <motion.div 
          className="absolute w-[280px] h-[160px] rounded-xl bg-black border border-gray-800 p-5 z-20"
          style={{ 
            x: card1X,
            y: card1Y,
            opacity: card1Opacity,
            rotate: -5
          }}
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 mb-3"></div>
          <h3 className="text-white font-medium mb-1">Eric Hoffman</h3>
          <p className="text-gray-400 text-sm">CO / Founder at Reform Co.</p>
          <div className="absolute bottom-4 left-5">
            <span className="text-gray-400 text-xs">Salt Lake City</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute w-[280px] h-[160px] rounded-xl bg-black border border-gray-800 p-5 z-20"
          style={{ 
            x: card2X,
            y: card2Y,
            opacity: card2Opacity,
            rotate: 5
          }}
        >
          <div className="w-10 h-10 rounded-full bg-purple-600 mb-3"></div>
          <h3 className="text-white font-medium mb-1">Reform Collective</h3>
          <p className="text-gray-400 text-sm">Digital First Agency</p>
          <div className="absolute bottom-4 left-5 flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center mr-2">
              <span className="text-white text-[8px]">👥</span>
            </div>
            <span className="text-gray-400 text-xs">4 connections</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute w-[280px] h-[160px] rounded-xl bg-black border border-gray-800 p-5 z-20"
          style={{ 
            x: card3X,
            y: card3Y,
            opacity: card3Opacity,
            rotate: -3
          }}
        >
          <h3 className="text-gray-300 text-sm font-medium mb-1">Call Scheduled with Eric</h3>
          <p className="text-gray-400 text-xs mb-4">Set up time with Eric</p>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="px-4 py-2 rounded-md text-center text-sm bg-opacity-10 bg-purple-600 text-purple-400 border border-purple-400">
              Call Scheduled with Eric
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute w-[280px] h-[160px] rounded-xl bg-black border border-gray-800 p-5 z-20"
          style={{ 
            x: card4X,
            y: card4Y,
            opacity: card4Opacity,
            rotate: 4
          }}
        >
          <div className="mb-2">
            <span className="inline-block px-2 py-1 rounded text-xs font-medium mr-2 mb-2 border border-teal-400 text-teal-400">
              Demo Meeting
            </span>
            <h3 className="text-gray-300 text-sm font-medium">Demo Meeting</h3>
          </div>
          <p className="text-gray-400 text-xs mb-2">Send Eric details about integrations</p>
          <div className="flex items-center mb-2">
            <span className="text-gray-300 text-sm">
              <span className="text-gray-500 mr-1">$</span>25,000
            </span>
          </div>
          <div className="px-3 py-1 rounded-full text-xs inline-block bg-purple-900 bg-opacity-20 text-purple-400">
            <span className="mr-1">|||</span> Very Strong
          </div>
        </motion.div>
        
        {/* Scroll indicator dots */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-3 z-50">
          {[0, 0.25, 0.5, 0.75, 1].map((section, index) => {
            const isActive = useTransform(
              scrollYProgress,
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
                  const targetPosition = section * scrollHeight
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
      
      {/* Content that appears as you scroll near the end */}
      <motion.div 
        className="fixed bottom-20 left-0 w-full text-center px-4 z-30"
        style={{
          opacity: useTransform(scrollYProgress, [0.7, 0.8, 0.9, 1], [0, 1, 1, 1])
        }}
      >
        <p className="text-amber-500 uppercase tracking-wider mb-2 text-sm">ALL-IN-ONE TOOL</p>
        <h3 className="text-3xl font-bold text-white">Everything in one place</h3>
        <p className="max-w-xl mx-auto text-gray-300 mt-4">
          Fully-featured email client, CRM, task manager and more integrated with Gmail, Calendar, LinkedIn, WhatsApp and other tools.
        </p>
      </motion.div>
    </div>
  )
} 