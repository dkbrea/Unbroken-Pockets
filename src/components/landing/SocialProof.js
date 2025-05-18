import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const stats = [
  {
    label: 'Active Users',
    value: 150000,
    prefix: '',
    suffix: '+',
    description: 'people managing their finances'
  },
  {
    label: 'Money Managed',
    value: 2500000000,
    prefix: '$',
    suffix: '',
    description: 'tracked through our platform'
  },
  {
    label: 'Average Savings',
    value: 27,
    prefix: '',
    suffix: '%',
    description: 'increase in first year'
  }
];

const testimonials = [
  {
    id: 1,
    text: "Unbroken Pockets transformed my financial life. I've saved more in 6 months than I did in the past 2 years combined.",
    author: "Emily Chen",
    role: "Small Business Owner",
    image: "/dashboard-icon.svg"
  },
  {
    id: 2,
    text: "The automated insights have helped me identify and eliminate unnecessary expenses I didn't even know I had.",
    author: "Marcus Johnson",
    role: "Software Engineer",
    image: "/dashboard-icon.svg"
  },
  {
    id: 3,
    text: "Finally, a budgeting app that actually understands how modern finances work. The AI recommendations are spot-on!",
    author: "Sarah Williams",
    role: "Marketing Director",
    image: "/dashboard-icon.svg"
  }
];

const securityBadges = [
  {
    name: "256-bit Encryption",
    icon: "/dashboard-icon.svg"
  },
  {
    name: "SOC 2 Certified",
    icon: "/dashboard-icon.svg"
  },
  {
    name: "GDPR Compliant",
    icon: "/dashboard-icon.svg"
  }
];

export default function SocialProof() {
  const containerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Animated counter hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (!isAnimating) return;

      let startTime = null;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = (currentTime - startTime) / duration;

        if (progress < 1) {
          setCount(Math.floor(end * progress));
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, [end, duration, isAnimating]);

    return [count, setIsAnimating];
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 text-center border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  delay: index * 0.2
                }
              }}
              viewport={{ once: true }}
              onViewportEnter={() => {
                if (!hasAnimated) {
                  setHasAnimated(true);
                  // Start counter animation
                }
              }}
            >
              <motion.div
                className="text-4xl font-bold text-teal-500 mb-2"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
              >
                {stat.prefix}
                {formatNumber(stat.value)}
                {stat.suffix}
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">{stat.label}</h3>
              <p className="text-gray-400">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              What Our Users Say
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    delay: index * 0.2
                  }
                }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.author}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security badges */}
        <div className="text-center">
          <motion.h3
            className="text-xl text-gray-400 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Your Security is Our Priority
          </motion.h3>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {securityBadges.map((badge, index) => (
              <motion.div
                key={badge.name}
                className="flex items-center bg-gray-800/30 rounded-full px-6 py-3"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.2
                  }
                }}
                viewport={{ once: true }}
              >
                <Image
                  src={badge.icon}
                  alt={badge.name}
                  width={24}
                  height={24}
                  className="mr-3"
                />
                <span className="text-gray-300 text-sm font-medium">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
} 