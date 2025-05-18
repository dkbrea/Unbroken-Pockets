'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Search, 
  User, 
  Menu, 
  X,
  ChevronDown,
  LogOut
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

const FloatingShape = ({ 
  className, 
  delay = 0,
  duration = 20,
  initialScale = 1
}: { 
  className: string
  delay?: number
  duration?: number
  initialScale?: number
}) => {
  return (
    <motion.div
      className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`}
      initial={{ 
        scale: 0,
        opacity: 0,
        y: 100 
      }}
      animate={{ 
        scale: initialScale,
        opacity: 0.7,
        y: 0,
      }}
      transition={{
        delay,
        duration: 1.5,
        ease: "easeOut"
      }}
    >
      <motion.div
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0],
          rotate: [0, 360]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-full h-full"
      />
    </motion.div>
  )
}

const Header = () => {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: fetchedUser }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user in Header:", error);
      } else {
        setUser(fetchedUser);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  // Function to truncate email
  const truncateEmail = (email: string) => {
    if (!email) return ''
    if (email.length <= 20) return email
    return email.substring(0, 17) + '...'
  }

  if (!mounted) return null

  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* Background shapes */}
      <FloatingShape 
        className="w-[400px] h-[400px] left-[-100px] top-[-100px] bg-blue-200"
        delay={0}
        duration={25}
        initialScale={1.2}
      />
      <FloatingShape 
        className="w-[300px] h-[300px] right-[-50px] top-[100px] bg-purple-200"
        delay={0.2}
        duration={20}
        initialScale={0.8}
      />
      <FloatingShape 
        className="w-[200px] h-[200px] left-[40%] top-[20px] bg-green-200"
        delay={0.4}
        duration={15}
        initialScale={0.6}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Take Control of Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
              Financial Future
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            Track, analyze, and optimize your finances with our powerful yet simple tools.
            Start your journey to financial freedom today.
          </motion.p>

          <motion.div
            className="mt-10 flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Link 
              href="/dashboard" 
              className="px-8 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-3 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors duration-300"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Header 