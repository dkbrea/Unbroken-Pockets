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
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-sm">
        {/* Logo and app name */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-[#1F3A93] text-white">
          <Link href="/" className="flex items-center">
            <span className="h-8 w-8 rounded-md bg-[#FFC857] flex items-center justify-center mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="white" stroke="white" strokeWidth="2" />
              </svg>
            </span>
            <span className="text-xl font-bold">Unbroken Pockets</span>
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
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-[#FDF6EC] text-[#1F3A93]'
                      : 'text-[#4A4A4A] hover:bg-[#FDF6EC] hover:text-[#1F3A93]'
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-[#FFC857]' : 'text-[#4A4A4A] group-hover:text-[#1F3A93]'
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
                <div className="bg-black text-white rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-sm font-medium">N</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user?.email || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Profile
                  </span>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-gray-500 hover:text-red-600"
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