import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import './custom-signin-styles.css'
import './global-styles-override.css'

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

  // Add dynamic gradient effect
  useEffect(() => {
    const dynamicGradient = document.querySelector('.dynamic-gradient');
    
    if (dynamicGradient) {
      const handleMouseMove = (e: MouseEvent) => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const mouseXpercentage = Math.round((e.pageX / windowWidth) * 100);
        const mouseYpercentage = Math.round((e.pageY / windowHeight) * 100);
        
        (dynamicGradient as HTMLElement).style.background = 
          `radial-gradient(at ${mouseXpercentage}% ${mouseYpercentage}%, rgba(74, 111, 161, 0.3), rgba(126, 180, 226, 0.1))`;
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      
      // Clean up event listener
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);

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
    <>
      {/* Background elements */}
      <div className="dynamic-gradient"></div>
      
      {/* Main container */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Decorative shapes */}
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          
          {/* Logo and header */}
          <div className="logo-container">
            <Image 
              src="/logo.svg" 
              alt="Unbroken Pockets Logo" 
              width={60} 
              height={60} 
              priority
            />
          </div>
          
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage your finances</p>
          
          {/* Error message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {/* Sign-in form */}
          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Link href="/auth/reset-password" className="auth-link" style={{ fontSize: '0.85rem', display: 'block', textAlign: 'right', marginTop: '0.5rem' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
            <p>
              Don't have an account?{' '}
              <Link href="/auth/signup" className="auth-link">
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
    </>
  )
} 