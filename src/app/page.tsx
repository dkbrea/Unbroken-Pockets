'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CustomCursor from '@/components/landing/CustomCursor'
import MicroScroll from '@/components/landing/MicroScroll'
import SmoothScroll from '@/components/landing/SmoothScroll'
import FloatingElements from '@/components/landing/FloatingElements'
import GridWrapper from '@/components/landing/GridWrapper'
import MicroZoom from '@/components/landing/MicroZoom'
import SmoothScrollProvider from '@/components/landing/SmoothScrollProvider'
import Link from 'next/link'

// Define sections similar to micro.so
const sections = [
  {
    id: 'hero',
    title: 'Financial Freedom',
    description: 'Take control of your financial future with powerful yet simple tools.',
    color: '#0ea5e9'
  },
  {
    id: 'everything',
    title: 'Everything in one place',
    description: 'Fully-featured expense tracker, budget manager, and financial planner integrated with your bank accounts and payment services.',
    color: '#0ea5e9'
  },
  {
    id: 'automatic',
    title: 'Smart Insights',
    description: "AI-powered analysis of your spending patterns, automatic categorization of transactions, and personalized financial recommendations.",
    color: '#0ea5e9'
  },
  {
    id: 'collaborative',
    title: 'Complete Control',
    description: 'Create custom budgets, track investments, set savings goals, and manage all your transactions in one unified platform.',
    color: '#0ea5e9'
  },
  {
    id: 'different',
    title: 'Financial Wellness',
    subtitle: 'at your fingertips.',
    color: '#0ea5e9'
  },
  {
    id: 'designed',
    title: 'Designed to let',
    subtitle: 'you focus on your life,',
    description: 'not just your finances.',
    color: '#0ea5e9'
  },
]

export default function Home() {
  return (
    <main className="h-screen w-full flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Unbroken Pockets</h1>
        <p className="mb-4">Please <Link href="/auth/signin" className="text-blue-400 underline">log in</Link> to continue.</p>
      </div>
    </main>
  )
} 