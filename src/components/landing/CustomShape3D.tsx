'use client'

import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'

interface CustomShape3DProps {
  className?: string
}

export default function CustomShape3D({ className = '' }: CustomShape3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  
  // Mouse movement tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Transform values for subtle 3D effect
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { left, top, width, height } = containerRef.current?.getBoundingClientRect() || 
        { left: 0, top: 0, width: 0, height: 0 }
      
      // Calculate mouse position relative to center of element
      mouseX.set(clientX - (left + width / 2))
      mouseY.set(clientY - (top + height / 2))
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    // Animation sequence
    const animateSequence = async () => {
      await controls.start({
        y: [0, -5, 0, 5, 0],
        transition: { duration: 8, ease: "easeInOut", repeat: Infinity }
      })
    }
    
    animateSequence()
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseX, mouseY, controls])
  
  return (
    <div 
      ref={containerRef}
      className={`w-full h-full perspective-1000 relative ${className}`}
    >
      {/* 3D Container */}
      <motion.div
        className="w-full h-full origin-center preserve-3d"
        style={{
          rotateX,
          rotateY
        }}
        animate={controls}
      >
        {/* Custom shape */}
        <div className="div-h-13-dg-3-u-8 mx-auto">
          <div className="icon">
            {/* Create inline SVGs for the group and mask-group */}
            <svg 
              className="group" 
              viewBox="0 0 346 401" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse 
                cx="173" 
                cy="200.5" 
                rx="173" 
                ry="200.5" 
                fill="url(#gradient)"
              />
              <defs>
                <radialGradient 
                  id="gradient" 
                  cx="0" 
                  cy="0" 
                  r="1" 
                  gradientUnits="userSpaceOnUse" 
                  gradientTransform="translate(173 200.5) rotate(90) scale(200.5 173)"
                >
                  <stop stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.2" />
                </radialGradient>
              </defs>
            </svg>
            
            <svg 
              className="mask-group" 
              viewBox="0 0 335 518" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse 
                cx="167.5" 
                cy="167.4" 
                rx="167.5" 
                ry="167.4" 
                fill="black"
              />
            </svg>
          </div>
        </div>
        
        {/* Reflection effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full rounded-[167.4px] bg-white opacity-5"></div>
          <div className="absolute top-[10%] left-[10%] w-[80%] h-[40%] bg-white opacity-10 rounded-full blur-md"></div>
        </div>
      </motion.div>
      
      {/* CSS for the custom shape */}
      <style jsx>{`
        .div-h-13-dg-3-u-8,
        .div-h-13-dg-3-u-8 * {
          box-sizing: border-box;
        }
        .div-h-13-dg-3-u-8 {
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 1) 100%
          );
          border-radius: 167.4px;
          height: 334.8px;
          width: 334.8px;
          position: relative;
        }
        .icon {
          width: 334.8px;
          height: 518.4px;
          position: absolute;
          left: 0px;
          top: 0px;
        }
        .group {
          width: 103.22%;
          height: 77.26%;
          position: absolute;
          right: -1.34%;
          left: -1.88%;
          bottom: 1.56%;
          top: 21.18%;
          overflow: visible;
        }
        .mask-group {
          height: auto;
          position: absolute;
          left: 0px;
          top: 0px;
          overflow: visible;
        }
      `}</style>
    </div>
  )
} 