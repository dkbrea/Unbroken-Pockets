'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Database, MessageSquare, Calendar, Users, ArrowUpRight, Clock, Lock } from 'lucide-react'
import Sphere3D from './Sphere3D'

const features = [
  {
    title: 'Everything in one place',
    description: 'Fully-featured expense tracker, budget manager, and financial planner integrated with your bank accounts and payment services. Plus the ability to create saving goals, spending limits, and more on top of this data.',
    section: 'cards',
    cards: [
      { title: 'Track Expenses', icon: Database, tag: 'High', text: 'Record all spending in real-time' },
      { title: 'Budget Planning', icon: MessageSquare, tag: 'Finance', text: 'Set monthly budgets for different categories' },
      { title: 'Upcoming Bill', icon: Calendar, tag: 'Bill', text: 'Water utility payment due next week' }
    ]
  },
  {
    title: 'Automatically Updated',
    description: "Everything - accounts, transactions, and more - is enriched with hundreds of datapoints from a rich global and personal knowledge graph. Plus any property can be updated automatically when there's new banking or payment activity.",
    section: 'cards',
    cards: [
      { title: 'Auto Categorization', icon: Database, tag: 'Finance', text: 'AI categorizes your transactions automatically' },
      { title: 'Recurring Payments', icon: Clock, tag: 'Bills', text: 'Track and manage your subscriptions' },
      { title: 'Spending Insights', icon: Users, tag: 'Analytics', text: 'View spending patterns and identify trends' }
    ]
  },
  {
    title: 'Collaborative by default',
    description: 'Create custom budgets, savings goals, and more to power any kind of financial planning you can imagine or use AI to generate it from your description.',
    section: 'users',
    users: ['Alex Douglas', 'Max Mason']
  },
  {
    title: 'Built different',
    subtitle: 'so you can build different.',
    section: 'sphere',
    sphereColor: '#ffffff'
  },
  {
    title: 'Designed to let',
    subtitle: 'you focus on your work,',
    subtext: 'not productivity.',
    section: 'sphere',
    sphereColor: '#f5f5dc'
  }
]

const FeatureCard = ({ title, icon: Icon, tag, text }: { title: string, icon: any, tag: string, text: string }) => {
  return (
    <div className="bg-black/90 rounded-xl p-6 border border-gray-800 w-[350px] h-[150px] flex flex-col justify-between">
      <div>
        <div className="flex items-center mb-1">
          <Icon className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="font-medium text-gray-300">{title}</h3>
        </div>
        <span className="inline-block bg-gray-800 text-cyan-400 text-xs px-2 py-1 rounded-md">{tag}</span>
      </div>
      <p className="text-gray-400 text-sm mt-2">{text}</p>
    </div>
  )
}

const UserBubble = ({ name }: { name: string }) => {
  return (
    <div className="bg-cyan-500 text-white rounded-full px-4 py-2 inline-flex">
      {name}
    </div>
  )
}

export default function FeaturesScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  return (
    <div 
      ref={containerRef} 
      className="w-full bg-black bg-grid-pattern bg-grid-size"
    >
      {features.map((feature, index) => (
        <motion.section 
          key={index}
          className="min-h-screen flex flex-col items-center justify-center py-20 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-20%" }}
        >
          <motion.div 
            className="max-w-4xl mx-auto text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{feature.title}</h2>
            {feature.subtitle && (
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{feature.subtitle}</h2>
            )}
            {feature.subtext && (
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-400 mb-6">{feature.subtext}</h2>
            )}
            {feature.description && (
              <p className="text-gray-400 text-lg md:text-xl">{feature.description}</p>
            )}
          </motion.div>

          {feature.section === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {feature.cards?.map((card, cardIndex) => (
                <motion.div
                  key={cardIndex}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * cardIndex }}
                  viewport={{ once: true }}
                >
                  <FeatureCard 
                    title={card.title} 
                    icon={card.icon} 
                    tag={card.tag} 
                    text={card.text} 
                  />
                </motion.div>
              ))}
            </div>
          )}

          {feature.section === 'users' && (
            <div className="relative w-full max-w-4xl">
              <motion.div
                className="absolute left-1/4 top-0"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <UserBubble name={feature.users?.[0] || ''} />
              </motion.div>
              
              <motion.div
                className="absolute right-1/4 bottom-0"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <UserBubble name={feature.users?.[1] || ''} />
              </motion.div>
              
              <div className="h-[400px] flex items-center justify-center">
                <motion.div
                  className="w-[350px] h-[200px] bg-black/90 rounded-xl p-6 border border-gray-800"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-medium text-white mb-2">Demo Meeting</h3>
                  <p className="text-gray-400 text-sm">Send Eric details about integrations ahead of the demo call.</p>
                  <div className="mt-3 text-gray-500 text-sm">
                    $25,000
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">Reform Co / Micro demo Call</span>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {feature.section === 'sphere' && (
            <motion.div
              className="w-80 h-80 relative mt-10 overflow-hidden"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Sphere3D color={feature.sphereColor || '#ffffff'} />
            </motion.div>
          )}
        </motion.section>
      ))}
    </div>
  )
} 