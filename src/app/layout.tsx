import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import Sidebar from '@/components/layout/Sidebar'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Unbroken Pockets - Personal Finance',
  description: 'Track your finances, manage budgets, and achieve your financial goals.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 text-gray-900`}>
        <Providers>
          <ToastProvider>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto md:ml-64">
                {children}
              </main>
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
