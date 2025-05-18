import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const demoScreens = [
  {
    id: 'dashboard',
    title: 'Smart Dashboard',
    description: 'Get a complete overview of your finances at a glance',
    image: '/dashboard-preview.svg',
    data: {
      totalBalance: 24532.80,
      monthlyGrowth: 5.8,
      savingsGoal: 3250,
      recentTransactions: [
        { id: 1, name: 'Grocery Shopping', amount: -128.50, category: 'Food' },
        { id: 2, name: 'Salary Deposit', amount: 3200.00, category: 'Income' },
        { id: 3, name: 'Netflix Subscription', amount: -15.99, category: 'Entertainment' }
      ]
    }
  },
  {
    id: 'budget',
    title: 'Budget Planner',
    description: 'Set and track your budgets with intelligent recommendations',
    image: '/dashboard-preview.svg',
    data: {
      monthlyBudget: 4000,
      spent: 2450,
      remaining: 1550,
      categories: [
        { name: 'Housing', allocated: 1400, spent: 1400 },
        { name: 'Food', allocated: 600, spent: 450 },
        { name: 'Transport', allocated: 300, spent: 200 },
        { name: 'Entertainment', allocated: 200, spent: 150 }
      ]
    }
  },
  {
    id: 'goals',
    title: 'Goal Tracking',
    description: 'Visualize and achieve your financial goals',
    image: '/dashboard-preview.svg',
    data: {
      goals: [
        { name: 'Emergency Fund', target: 10000, current: 7500, deadline: '2024-06' },
        { name: 'New Car', target: 25000, current: 12000, deadline: '2024-12' },
        { name: 'Vacation', target: 5000, current: 3200, deadline: '2024-08' }
      ]
    }
  }
];

export default function UIShowcase() {
  const [activeScreen, setActiveScreen] = useState(demoScreens[0]);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <section
      ref={containerRef}
      className="relative py-24 bg-gray-900 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
      
      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ y, opacity }}
      >
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Powerful Tools at Your Fingertips
          </motion.h2>
          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Experience our intuitive interface designed to make financial management effortless
          </motion.p>
        </div>

        {/* Screen selector */}
        <div className="flex justify-center gap-4 mb-12">
          {demoScreens.map((screen) => (
            <motion.button
              key={screen.id}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeScreen.id === screen.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveScreen(screen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {screen.title}
            </motion.button>
          ))}
        </div>

        {/* Screen preview */}
        <motion.div
          key={activeScreen.id}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Screen content */}
          <div className="bg-gray-800 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Screen info */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {activeScreen.title}
                </h3>
                <p className="text-gray-400 mb-8">
                  {activeScreen.description}
                </p>

                {/* Dynamic data visualization based on screen type */}
                {activeScreen.id === 'dashboard' && (
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="bg-gray-900/50 rounded-lg p-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-gray-400 text-sm">Total Balance</p>
                      <p className="text-2xl font-bold text-teal-500">
                        {formatCurrency(activeScreen.data.totalBalance)}
                      </p>
                    </motion.div>
                    <motion.div
                      className="bg-gray-900/50 rounded-lg p-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-gray-400 text-sm">Monthly Growth</p>
                      <p className="text-2xl font-bold text-green-500">
                        +{activeScreen.data.monthlyGrowth}%
                      </p>
                    </motion.div>
                  </div>
                )}

                {activeScreen.id === 'budget' && (
                  <div className="space-y-4">
                    {activeScreen.data.categories.map((category) => (
                      <motion.div
                        key={category.name}
                        className="bg-gray-900/50 rounded-lg p-4"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between mb-2">
                          <p className="text-gray-400">{category.name}</p>
                          <p className="text-teal-500">
                            {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                          </p>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-teal-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(category.spent / category.allocated) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeScreen.id === 'goals' && (
                  <div className="space-y-6">
                    {activeScreen.data.goals.map((goal) => (
                      <motion.div
                        key={goal.name}
                        className="bg-gray-900/50 rounded-lg p-4"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between mb-2">
                          <p className="text-gray-400">{goal.name}</p>
                          <p className="text-sm text-gray-500">Due {goal.deadline}</p>
                        </div>
                        <div className="flex justify-between mb-2">
                          <p className="text-teal-500">{formatCurrency(goal.current)}</p>
                          <p className="text-gray-400">{formatCurrency(goal.target)}</p>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-teal-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Screen preview */}
              <motion.div
                className="relative rounded-lg overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={activeScreen.image}
                  alt={activeScreen.title}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                
                {/* Interactive overlay elements */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
} 