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
  LogOut,
  Wallet,
  LucideIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface User {
  email?: string;
  [key: string]: any;
}

const Sidebar = () => {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    const loadUserData = async () => {
      // Try to get from localStorage first (for our bypass auth method)
      const storedUser = localStorage.getItem('mock_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
        return
      }
      
      // Otherwise try to get from Supabase
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    
    loadUserData()
  }, [])
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      router.push('/auth/signin')
    }
  }

  const navigation: NavigationItem[] = [
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
    <div className="flex md:w-[var(--sidebar-width)] lg:w-[var(--sidebar-collapsed-width)] xl:w-[var(--sidebar-width)] md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-300 group/sidebar">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-md overflow-hidden">
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
          <nav className="mt-5 flex-1 px-4 space-y-[var(--item-spacing)]">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group/item flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-background-light text-primary shadow-sm'
                      : 'text-text-medium hover:bg-background-lighter hover:text-primary hover:-translate-y-1'
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 lg:mr-0 xl:mr-3 ${
                      isActive ? 'text-primary-light' : 'text-text-medium group-hover:text-primary'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="lg:hidden xl:inline">{item.name}</span>
                  {/* Tooltip - only show when sidebar is collapsed */}
                  <div className="hidden lg:group-hover/sidebar:group-hover/item:block xl:hidden absolute left-[var(--sidebar-collapsed-width)] ml-2 bg-white px-2 py-1 rounded-md shadow-md text-sm whitespace-nowrap z-50">
                    {item.name}
                  </div>
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
                    {user?.email || 'Guest User'}
                  </span>
                  <span className="text-xs text-text-light">
                    {user?.email ? 'Profile' : 'Not signed in'}
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