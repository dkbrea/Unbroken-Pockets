'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  gradient?: string
  delay?: number
}

export default function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  gradient = 'from-cyan-500 to-blue-500',
  delay = 0
}: FeatureCardProps) {
  return (
    <motion.div
      className="p-6 bg-black rounded-xl border border-gray-800 flex flex-col h-full"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      viewport={{ once: true }}
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm flex-grow">{description}</p>
      
      <motion.div 
        className="mt-4 flex items-center text-sm text-cyan-400 cursor-pointer"
        whileHover={{ x: 3 }}
      >
        Learn more
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 ml-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M14 5l7 7m0 0l-7 7m7-7H3" 
          />
        </svg>
      </motion.div>
    </motion.div>
  )
} 