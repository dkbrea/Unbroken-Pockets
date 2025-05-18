'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { LineChart, Wallet, Bell, Calendar, Settings, ArrowUpRight } from 'lucide-react'

const features = [
  {
    title: 'Smart Analytics',
    description: 'Get detailed insights into your spending patterns and financial health with AI-powered analytics.',
    icon: LineChart,
    gradient: 'from-blue-500 to-blue-400'
  },
  {
    title: 'Budget Management',
    description: 'Create and manage budgets easily. Track your expenses and stay within your financial goals.',
    icon: Wallet,
    gradient: 'from-purple-500 to-purple-400'
  },
  {
    title: 'Smart Notifications',
    description: 'Get timely alerts about bills, unusual spending, and investment opportunities.',
    icon: Bell,
    gradient: 'from-pink-500 to-pink-400'
  },
  {
    title: 'Financial Calendar',
    description: 'View and manage all your financial events and deadlines in one place.',
    icon: Calendar,
    gradient: 'from-green-500 to-green-400'
  },
  {
    title: 'Custom Settings',
    description: 'Personalize your experience with custom categories, tags, and notification preferences.',
    icon: Settings,
    gradient: 'from-yellow-500 to-yellow-400'
  }
]

const FeatureCard = ({ 
  feature, 
  index 
}: { 
  feature: typeof features[0]
  index: number 
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  const Icon = feature.icon

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      <motion.div
        className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        style={{ y, scale, opacity }}
        whileHover={{ scale: 1.05 }}
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
        <p className="text-gray-600">{feature.description}</p>
        <motion.div
          className="mt-4 flex items-center text-primary font-medium cursor-pointer"
          whileHover={{ x: 5 }}
        >
          Learn more
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function FeaturesGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
              Financial Success
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to take control of your finances, all in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
} 