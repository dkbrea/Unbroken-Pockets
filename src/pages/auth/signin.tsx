import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { redirect } = router.query

  // Check if we already have a session when the component loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error checking initial session:', error)
        }
        
        // If we already have a session, redirect to dashboard
        if (data.session) {
          console.log('Existing session found, redirecting to dashboard...')
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('Error in session check:', err)
      }
    }
    
    checkSession()
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setDebugInfo(null)

    try {
      const supabase = createClient()
      
      // Sign in with password
      console.log('Attempting sign in with email:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Immediately check the session state again
      const { data: sessionData } = await supabase.auth.getSession()
      
      // Save debugging info
      setDebugInfo({
        signInResult: data,
        sessionCheck: sessionData,
        timestamp: new Date().toISOString()
      })
      
      console.log('Sign in response:', data)
      console.log('Session check after sign in:', sessionData)

      // Verify credentials are correct before redirecting
      if (data.user && data.session) {
        console.log('Authentication successful, redirecting to dashboard with bypass...')
        
        // Use direct navigation with a bypass parameter for debugging
        const redirectPath = typeof redirect === 'string' ? redirect : '/dashboard'
        window.location.href = `${redirectPath}?bypassAuth=true`;
      } else {
        throw new Error('Failed to establish session')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(error.message || 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC] p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.svg" 
            alt="Unbroken Pockets Logo" 
            width={50} 
            height={50} 
            priority
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-[#1F3A93] mb-6">Sign in to your account</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/auth/reset-password" className="text-xs text-[#1F3A93] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F3A93] text-white py-2 px-4 rounded-md hover:bg-[#152C70] focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[#1F3A93] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        
        {debugInfo && (
          <div className="mt-6 p-3 border border-gray-200 rounded-md">
            <details>
              <summary className="text-sm font-medium text-gray-600 cursor-pointer">Debug Information</summary>
              <pre className="mt-2 text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
} 