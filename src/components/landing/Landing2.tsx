import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Animated SVG background blob
const AnimatedBlob = () => (
  <motion.svg
    className="absolute top-0 left-0 w-full h-full z-0"
    viewBox="0 0 800 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.25 }}
    transition={{ duration: 1 }}
    style={{ pointerEvents: 'none' }}
  >
    <motion.path
      d="M 400 300 Q 600 100 700 300 Q 800 500 600 500 Q 400 600 200 500 Q 0 400 100 200 Q 200 0 400 100 Q 600 200 400 300 Z"
      fill="#0ea5e9"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2 }}
    />
  </motion.svg>
);

const features = [
  {
    title: 'Dashboard',
    description: 'Your financial overview at a glance.',
    icon: '📊',
  },
  {
    title: 'Accounts',
    description: 'All your accounts, one place.',
    icon: '🏦',
  },
  {
    title: 'Budget',
    description: 'Plan, track, and optimize spending.',
    icon: '🗂️',
  },
  {
    title: 'Cash Flow',
    description: 'Visualize income and expenses.',
    icon: '💸',
  },
  {
    title: 'Debt',
    description: 'Track and pay off debts faster.',
    icon: '💳',
  },
  {
    title: 'Goals',
    description: 'Set and achieve financial goals.',
    icon: '🎯',
  },
  {
    title: 'Investments',
    description: 'Monitor your portfolio.',
    icon: '📈',
  },
  {
    title: 'Recurring',
    description: 'Automate bills & subscriptions.',
    icon: '🔄',
  },
  {
    title: 'Reports',
    description: 'Detailed insights and analytics.',
    icon: '📑',
  },
  {
    title: 'Transactions',
    description: 'Effortless tracking and categorization.',
    icon: '📝',
  },
];

const testimonials = [
  {
    quote: "Unbroken Pockets helped me finally get control of my spending!",
    name: "Sarah K.",
  },
  {
    quote: "The best budgeting app I've ever used.",
    name: "James R.",
  },
  {
    quote: "I love the insights and the clean UI!",
    name: "Priya S.",
  },
];

const Landing2: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-sky-900 text-white overflow-x-hidden">
      <AnimatedBlob />
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] text-center z-10">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Unbroken Pockets
        </motion.h1>
        <motion.p
          className="text-2xl md:text-3xl mb-8 font-light tracking-wide"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Master Your Money
        </motion.p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link href="/signup">
            <span className="inline-block px-8 py-4 bg-teal-500 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-teal-400 transition-transform transform hover:scale-105 cursor-pointer">
              Get Started
            </span>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              className="bg-white/10 rounded-2xl p-8 flex flex-col items-center shadow-lg backdrop-blur-md hover:scale-105 hover:bg-white/20 transition-transform duration-300"
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-base opacity-80">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* UI Showcase Section */}
      <section className="relative py-20 z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">See Unbroken Pockets in Action</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {/* Replace these with real screenshots or animated mockups */}
          <motion.div className="w-72 h-44 bg-white/10 rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            Dashboard Screenshot
          </motion.div>
          <motion.div className="w-72 h-44 bg-white/10 rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
            Budgeting UI
          </motion.div>
          <motion.div className="w-72 h-44 bg-white/10 rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
            Insights & Reports
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-white/10 rounded-xl p-8 shadow-md max-w-sm"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-lg italic mb-4">“{t.quote}”</p>
              <div className="text-right font-semibold">- {t.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 text-center z-10">
        <motion.h2
          className="text-3xl md:text-5xl font-bold mb-6"
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Ready to Master Your Money?
        </motion.h2>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Link href="/signup">
            <span className="inline-block px-10 py-5 bg-teal-500 text-white text-xl font-semibold rounded-full shadow-lg hover:bg-teal-400 transition-transform transform hover:scale-105 cursor-pointer">
              Get Started Now
            </span>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 text-center text-sm text-white/70 z-10">
        &copy; {new Date().getFullYear()} Unbroken Pockets. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing2;
