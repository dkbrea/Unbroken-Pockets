import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-gray-900/80 to-gray-900/50 backdrop-blur-md rounded-full" />
          
          <div className="relative flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Unbroken Pockets
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
              <NavLink href="#about">About</NavLink>
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full text-white font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }) {
  return (
    <Link 
      href={href}
      className="text-gray-300 hover:text-white transition-colors duration-200"
    >
      {children}
    </Link>
  );
} 