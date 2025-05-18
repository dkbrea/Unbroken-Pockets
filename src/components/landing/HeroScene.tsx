'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from 'react-error-boundary'

// Dynamically import Three.js components
const ThreeScene = dynamic(
  () => import('./ThreeScene').then((mod) => mod.default),
  { ssr: false }
)

function ErrorFallback() {
  return (
    <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading 3D scene...</p>
    </div>
  )
}

export default function HeroScene() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="w-full h-[600px]">
        <ThreeScene />
      </div>
    </ErrorBoundary>
  )
} 