'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'

interface ImmersiveSectionProps {
  title: string
  subtitle?: string
  description?: string
  bgColor?: string
  textColor?: string
  highligthColor?: string
  children?: React.ReactNode
}

export default function ImmersiveSection({
  title,
  subtitle,
  description,
  bgColor = '#000000',
  textColor = '#ffffff',
  highligthColor = '#0ea5e9',
  children
}: ImmersiveSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const controls = useAnimation()
  
  // Mouse movement effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    const { clientX, clientY } = e
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    
    // Calculate mouse position relative to container center (from -0.5 to 0.5)
    const x = (clientX - left - width / 2) / width
    const y = (clientY - top - height / 2) / height
    
    setMousePosition({ x, y })
  }

  // Apply tilt effect
  useEffect(() => {
    controls.start({
      rotateX: mousePosition.y * -5, // Tilt up/down
      rotateY: mousePosition.x * 5,  // Tilt left/right
      transition: { type: 'spring', stiffness: 100, damping: 30 }
    })
  }, [mousePosition, controls])

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center py-20 px-4 perspective-1000"
      style={{ backgroundColor: bgColor }}
      onMouseMove={handleMouseMove}
    >
      <motion.div 
        className="max-w-4xl w-full relative"
        animate={controls}
        initial={{ rotateX: 0, rotateY: 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative z-10 text-center">
          <motion.h2 
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            style={{ color: textColor }}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
          
          {subtitle && (
            <motion.h3 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8"
              style={{ color: highligthColor }}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {subtitle}
            </motion.h3>
          )}
          
          {description && (
            <motion.p 
              className="text-xl md:text-2xl max-w-2xl mx-auto opacity-80"
              style={{ color: textColor }}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {description}
            </motion.p>
          )}
          
          {children && (
            <motion.div 
              className="mt-12"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {children}
            </motion.div>
          )}
        </div>
        
        {/* 3D floating dots for dimension */}
        <div className="absolute inset-0 -z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: `${highligthColor}${Math.random() * 50 + 10}`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `translateZ(${Math.random() * 100}px)`,
              }}
              animate={{
                y: [0, Math.random() * 30 - 15],
                x: [0, Math.random() * 30 - 15],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: Math.random() * 5 + 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
} 