'use client'

import { ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="md:pl-[var(--sidebar-width)] lg:pl-[var(--sidebar-collapsed-width)] xl:pl-[var(--sidebar-width)] flex flex-col flex-1 min-h-screen transition-all duration-300">
      <div className="px-[var(--content-padding)] py-8 flex-grow w-full max-w-[var(--content-max-width)] mx-auto">
        <div className="grid gap-[var(--grid-gap)]">
          {children}
        </div>
      </div>
    </main>
  )
}

export default MainContent