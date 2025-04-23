'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import MainContent from '@/components/layout/MainContent'
import { ToastProvider } from '@/components/ui/toast'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're on an auth page (signin/signup) where we don't want sidebar layout
  const isAuthPage = pathname?.startsWith('/auth/');
  
  return (
    <ToastProvider>
      {!isAuthPage && <MainContent>{children}</MainContent>}
      {isAuthPage && <div className="w-full">{children}</div>}
    </ToastProvider>
  );
} 