'use client'

import { ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="md:pl-64 flex flex-col flex-1 min-h-screen">
      <div className="p-6 flex-grow w-full">
        {children}
      </div>
    </main>
  )
}

export default MainContent 