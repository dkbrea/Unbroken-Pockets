import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const features = [
  {
    title: "Smart Budget Automation",
    description: "AI-powered system that learns from your spending patterns and automatically adjusts your budget categories for optimal savings.",
    icon: "/budget-icon.svg",
    testimonial: {
      text: "The smart automation helped me save an extra $500 every month without even thinking about it!",
      author: "Sarah M."
    }
  },
  {
    title: "Real-time Insights",
    description: "Get instant notifications and visual breakdowns of your spending habits with actionable recommendations for improvement.",
    icon: "/tracking-icon.svg",
    testimonial: {
      text: "The real-time insights completely changed how I view my daily spending decisions.",
      author: "Michael R."
    }
  },
  {
    title: "Goal Achievement Engine",
    description: "Set and track financial goals with our intelligent system that adapts to your progress and helps you stay on track.",
    icon: "/reports-icon.svg",
    testimonial: {
      text: "I finally achieved my savings goal for a house down payment thanks to the goal tracking system!",
      author: "David K."
    }
  }
];

export default function FeaturesSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative py-24 bg-gray-900 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ y, opacity }}
      >
        <div className="text-center mb-20">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Powerful Features for Your Financial Success
          </motion.h2>
          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything you need to take control of your finances and achieve your goals
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              {/* Feature Card */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-teal-500 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Icon */}
                <motion.div
                  className="w-16 h-16 mb-6 relative"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={64}
                    height={64}
                    className="text-teal-500"
                  />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 mb-6">
                  {feature.description}
                </p>

                {/* Testimonial */}
                <motion.div
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-gray-400 italic text-sm mb-2">
                    "{feature.testimonial.text}"
                  </p>
                  <p className="text-teal-500 text-sm font-medium">
                    - {feature.testimonial.author}
                  </p>
                </motion.div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -z-10 inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 blur-xl rounded-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
} 