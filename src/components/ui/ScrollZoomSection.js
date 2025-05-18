import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollZoomSection({ children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);

  return (
    <motion.div
      ref={ref}
      className="relative py-40 overflow-hidden"
      style={{
        scale,
        opacity,
        y
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10"
        style={{
          scale: useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 0.8])
        }}
      />
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
} 