import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ZoomParallax({ children, baseVelocity = 0.2 }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.5, 2.5]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.8, 1],
    [1, 0.8, 0.5, 0]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "50%"]
  );

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <motion.div
        className="relative w-full h-full"
        style={{
          scale,
          opacity,
          y
        }}
      >
        {children}
      </motion.div>
    </div>
  );
} 