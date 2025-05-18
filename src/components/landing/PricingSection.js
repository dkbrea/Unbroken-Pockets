import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started with basic budgeting',
    features: [
      'Basic budget tracking',
      'Up to 2 bank accounts',
      'Monthly spending reports',
      'Basic insights',
      'Mobile app access'
    ],
    limitations: [
      'Limited transaction history',
      'Basic support only',
      'No AI recommendations',
      'No custom categories'
    ]
  },
  {
    name: 'Pro',
    price: 9.99,
    description: 'Advanced features for serious money management',
    features: [
      'Everything in Free, plus:',
      'Unlimited bank accounts',
      'AI-powered insights',
      'Custom categories',
      'Bill tracking & reminders',
      'Investment tracking',
      'Priority support',
      'Detailed analytics'
    ],
    recommended: true
  },
  {
    name: 'Business',
    price: 24.99,
    description: 'Complete solution for business finances',
    features: [
      'Everything in Pro, plus:',
      'Multiple users',
      'Team collaboration',
      'Invoice tracking',
      'Tax preparation',
      'Business insights',
      'API access',
      'Dedicated support'
    ]
  }
];

const featureComparison = [
  {
    category: 'Core Features',
    features: [
      {
        name: 'Budget Tracking',
        free: true,
        pro: true,
        business: true,
        description: 'Track your income and expenses'
      },
      {
        name: 'Bank Accounts',
        free: '2 accounts',
        pro: 'Unlimited',
        business: 'Unlimited',
        description: 'Connect and manage your bank accounts'
      },
      {
        name: 'Transaction History',
        free: '3 months',
        pro: 'Unlimited',
        business: 'Unlimited',
        description: 'Access to historical transaction data'
      }
    ]
  },
  {
    category: 'Advanced Features',
    features: [
      {
        name: 'AI Insights',
        free: false,
        pro: true,
        business: true,
        description: 'Smart recommendations and insights'
      },
      {
        name: 'Custom Categories',
        free: false,
        pro: true,
        business: true,
        description: 'Create and manage custom categories'
      },
      {
        name: 'Investment Tracking',
        free: false,
        pro: true,
        business: true,
        description: 'Track your investment portfolio'
      }
    ]
  }
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const calculatePrice = (basePrice) => {
    if (basePrice === 0) return 'Free';
    const price = isYearly ? basePrice * 10 : basePrice;
    return `$${price}${isYearly ? '/yr' : '/mo'}`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.03,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <section
      ref={containerRef}
      className="relative py-24 bg-gray-900 overflow-hidden"
    >
      {/* Background elements with animated gradient */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(to bottom right, #1a1a1a, #2a2a2a)",
            "linear-gradient(to bottom right, #2a2a2a, #1a1a1a)"
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
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
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Start for free, upgrade when you need more features
          </motion.p>

          {/* Enhanced billing toggle */}
          <motion.div
            className="flex justify-center items-center gap-4 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.span 
              className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}
              animate={{ opacity: !isYearly ? 1 : 0.6 }}
            >
              Monthly
            </motion.span>
            <motion.button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 bg-gray-700 rounded-full p-1 transition-colors duration-300 hover:bg-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-6 h-6 bg-teal-500 rounded-full shadow-lg"
                animate={{ 
                  x: isYearly ? 32 : 0,
                  backgroundColor: isYearly ? "#14b8a6" : "#0d9488"
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            </motion.button>
            <motion.span 
              className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}
              animate={{ opacity: isYearly ? 1 : 0.6 }}
            >
              Yearly <span className="text-teal-500 font-medium">(Save 20%)</span>
            </motion.span>
          </motion.div>
        </div>

        {/* Enhanced pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border ${
                plan.recommended
                  ? 'border-teal-500 shadow-teal-500/20 shadow-lg'
                  : 'border-gray-700'
              }`}
              variants={cardVariants}
              custom={index}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
              onHoverStart={() => setHoveredCard(plan.name)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              {plan.recommended && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Recommended
                </motion.div>
              )}

              <motion.h3 
                className="text-2xl font-bold text-white mb-2"
                animate={{
                  color: hoveredCard === plan.name ? "#14b8a6" : "#ffffff"
                }}
              >
                {plan.name}
              </motion.h3>
              
              <motion.div 
                className="text-4xl font-bold text-white mb-4"
                initial={{ scale: 1 }}
                animate={{
                  scale: hoveredCard === plan.name ? 1.1 : 1
                }}
              >
                {calculatePrice(plan.price)}
              </motion.div>

              <p className="text-gray-400 mb-6">{plan.description}</p>

              <motion.button
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.recommended
                    ? 'bg-teal-500 hover:bg-teal-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>

              <div className="mt-8">
                <h4 className="text-white font-medium mb-4">Features</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={feature}
                      className="flex items-center text-gray-300"
                      variants={featureVariants}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      <motion.svg
                        className="w-5 h-5 text-teal-500 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced feature comparison table */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Feature Comparison</h3>
          
          {featureComparison.map((category, categoryIndex) => (
            <div key={category.category} className="mb-8">
              <motion.h4 
                className="text-lg font-medium text-white mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.2 }}
              >
                {category.category}
              </motion.h4>
              
              <div className="space-y-4">
                {category.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature.name}
                    className="grid grid-cols-4 gap-4 items-center py-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (categoryIndex * 0.2) + (featureIndex * 0.1) }}
                  >
                    <div className="text-gray-300">{feature.name}</div>
                    {['free', 'pro', 'business'].map((plan) => (
                      <div key={plan} className="text-center">
                        {typeof feature[plan] === 'boolean' ? (
                          <motion.svg
                            className={`w-6 h-6 mx-auto ${
                              feature[plan] ? 'text-teal-500' : 'text-gray-600'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {feature[plan] ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            )}
                          </motion.svg>
                        ) : (
                          <span className="text-gray-300">{feature[plan]}</span>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
} 