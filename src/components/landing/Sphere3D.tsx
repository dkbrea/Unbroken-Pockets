'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

interface Sphere3DProps {
  color?: string
  backgroundColor?: string
}

export default function Sphere3D({ color = '#ffffff', backgroundColor = 'transparent' }: Sphere3DProps) {
  const sphereRef = useRef<HTMLDivElement>(null)

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        ref={sphereRef}
        className="rounded-full"
        style={{
          backgroundColor: color,
          width: '100%',
          height: '100%',
          boxShadow: `0 0 60px rgba(255, 255, 255, 0.2)`,
        }}
        animate={{
          scale: [0.97, 1.03, 0.97],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </div>
  )
} 