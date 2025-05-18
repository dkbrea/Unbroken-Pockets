import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';

// Components will be imported here
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import UIShowcase from '../components/landing/UIShowcase';
import SocialProof from '../components/landing/SocialProof';
import PricingSection from '../components/landing/PricingSection';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';
import CustomCursor from '../components/landing/CustomCursor';

export default function NewLanding() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Scroll progress animation for the progress bar
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent flash of unstyled content
  }

  return (
    <>
      <Head>
        <title>Unbroken Pockets: Master Your Money | Smart Budgeting System</title>
        <meta name="description" content="Take control of your financial future with Unbroken Pockets. Our smart budgeting system helps you master your money and achieve your financial goals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-teal-500 transform origin-left z-50"
        style={{ scaleX }}
      />

      {/* Custom cursor */}
      <CustomCursor />

      {/* Main content */}
      <main className="bg-gray-900 text-white min-h-screen overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <UIShowcase />
        <SocialProof />
        <PricingSection />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
} 