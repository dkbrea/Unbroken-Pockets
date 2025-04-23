'use client'

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

const Header = () => {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      // Create a Supabase client
      const supabase = createClient()
      
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
      
      // Listen for auth state changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setUser(session?.user || null)
        }
      )
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    getUser()
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

  return (
    <header className="bg-white shadow-sm h-16 flex items-center fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="h-8 w-8 rounded-md bg-[#FFC857] flex items-center justify-center mr-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="white" stroke="white" strokeWidth="2" />
                </svg>
              </span>
              <span className="text-xl font-bold text-[#1F3A93]">Unbroken Pockets</span>
            </Link>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard" className="text-[#4A4A4A] hover:text-[#1F3A93] px-3 py-2 text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/accounts" className="text-[#4A4A4A] hover:text-[#1F3A93] px-3 py-2 text-sm font-medium">
              Accounts
            </Link>
            <Link href="/transactions" className="text-[#4A4A4A] hover:text-[#1F3A93] px-3 py-2 text-sm font-medium">
              Transactions
            </Link>
            <Link href="/cash-flow" className="text-[#4A4A4A] hover:text-[#1F3A93] px-3 py-2 text-sm font-medium">
              Cash Flow
            </Link>
            <Link href="/debt" className="text-[#4A4A4A] hover:text-[#1F3A93] px-3 py-2 text-sm font-medium">
              Debt Tracker
            </Link>
            <Link href="/reports" className="text-[#4A4A4A] hover:text-[#1F3A93] px-3 py-2 text-sm font-medium">
              Reports
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-md"></div>
            ) : user ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 text-[#4A4A4A] hover:text-[#1F3A93] px-3 py-2 text-sm font-medium"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="bg-[#1F3A93] text-white rounded-full p-1">
                    <User className="h-4 w-4" />
                  </div>
                  <span>{truncateEmail(user.email)}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleSignOut()
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/signin" className="text-[#4A4A4A] hover:text-[#1F3A93] px-3 py-2 text-sm font-medium">
                  Sign in
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-[#FFC857] text-white hover:bg-[#e6b54e] rounded-md px-4 py-2 text-sm font-medium"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-[#4A4A4A] hover:text-[#1F3A93] focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/dashboard" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#4A4A4A] hover:text-[#1F3A93] hover:bg-[#FDF6EC]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/accounts" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#4A4A4A] hover:text-[#1F3A93] hover:bg-[#FDF6EC]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accounts
            </Link>
            <Link 
              href="/transactions" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#4A4A4A] hover:text-[#1F3A93] hover:bg-[#FDF6EC]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Transactions
            </Link>
            <Link 
              href="/cash-flow" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#4A4A4A] hover:text-[#1F3A93] hover:bg-[#FDF6EC]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cash Flow
            </Link>
            <Link 
              href="/debt" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#4A4A4A] hover:text-[#1F3A93] hover:bg-[#FDF6EC]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Debt Tracker
            </Link>
            <Link
              href="/reports" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#4A4A4A] hover:text-[#1F3A93] hover:bg-[#FDF6EC]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reports
            </Link>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-5">
                {user ? (
                  <div className="flex flex-col w-full">
                    <div className="flex items-center mb-2">
                      <div className="bg-[#1F3A93] text-white rounded-full p-1 mr-2">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.email}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href="/profile" 
                        className="flex-1 block px-3 py-2 rounded-md text-sm font-medium text-[#4A4A4A] hover:text-[#1F3A93] hover:bg-[#FDF6EC] text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={() => {
                          setMobileMenuOpen(false)
                          handleSignOut()
                        }}
                        className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link 
                      href="/auth/signin" 
                      className="block px-3 py-2 rounded-md text-base font-medium text-[#4A4A4A] hover:text-[#1F3A93] hover:bg-[#FDF6EC]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="ml-2 block px-3 py-2 rounded-md text-base font-medium bg-[#FFC857] text-white hover:bg-[#e6b54e]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 