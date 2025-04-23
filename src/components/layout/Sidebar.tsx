'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CreditCard, 
  ReceiptText, 
  LineChart, 
  BarChart3, 
  PiggyBank, 
  CalendarClock, 
  Target, 
  TrendingUp,
  User,
  LogOut,
  Wallet
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    const loadUserData = async () => {
      // Try to get from localStorage first (for our bypass auth method)
      const storedUser = localStorage.getItem('mock_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
        return
      }
      
      // Otherwise try to get from Supabase
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    
    loadUserData()
  }, [])
  
  const handleSignOut = async () => {
    try {
      console.log('Signing out user...');
      
      // First, remove any mock user from localStorage
      localStorage.removeItem('mock_user');
      
      // Then, sign out from Supabase
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      console.log('Sign out successful, redirecting to sign in page...');
      
      // Use direct navigation for a clean logout
      window.location.href = '/auth/signin';
    } catch (err) {
      console.error('Error during sign out:', err);
      alert('There was a problem signing out. Please try again.');
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: ReceiptText },
    { name: 'Cash Flow', href: '/cash-flow', icon: LineChart },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Budget', href: '/budget', icon: PiggyBank },
    { name: 'Recurring', href: '/recurring', icon: CalendarClock },
    { name: 'Debt Tracker', href: '/debt', icon: Wallet },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Investments', href: '/investments', icon: TrendingUp },
  ]

  return (
    <div className="flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-md">
        {/* Logo and app name */}
        <div className="flex items-center h-20 flex-shrink-0 px-4 bg-gradient-primary text-white">
          <Link href="/" className="flex flex-col items-center w-full transition-transform duration-300 hover:-translate-y-1">
            <div className="h-10 w-10 rounded-md bg-white/20 flex items-center justify-center mb-1 shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="white" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-center">Unbroken Pockets</span>
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-background-light text-primary shadow-sm'
                      : 'text-text-medium hover:bg-background-lighter hover:text-primary hover:-translate-y-1'
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-primary-light' : 'text-text-medium group-hover:text-primary'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* User Profile Section */}
          <div className="border-t border-gray-200 mt-auto">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-white rounded-full h-9 w-9 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-dark truncate max-w-[120px]">
                    {user?.email || 'User'}
                  </span>
                  <span className="text-xs text-text-light">
                    Profile
                  </span>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-text-light hover:text-primary transition-colors duration-300"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 