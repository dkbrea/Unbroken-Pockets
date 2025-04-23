import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from the URL
        const code = router.query.code as string
        
        if (!code) {
          throw new Error('No code found in URL')
        }
        
        // Create a Supabase client for browser
        const supabase = createClient()
        
        // Exchange the code for a session if code is present
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            throw error
          }
        }
        
        // Get the session to verify it's established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (!session) {
          throw new Error('Failed to establish session')
        }
        
        console.log('Authentication successful in callback, redirecting to dashboard...')
        
        // Redirect to the dashboard after successful login
        // Use small timeout to ensure session is fully established
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      } catch (err: any) {
        console.error('Error in auth callback:', err)
        setError(err.message)
        // Redirect to the signin page after a brief delay to show the error
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      }
    }

    // Only run the callback handler if we have a query parameter
    if (router.isReady) {
      handleAuthCallback()
    }
  }, [router, router.isReady])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-[#1F3A93] mb-2">
          {error ? 'Authentication Error' : 'Processing your login'}
        </h1>
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <p className="text-gray-600">Please wait while we complete the authentication process...</p>
            <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="animate-pulse h-full bg-[#1F3A93] rounded-full"></div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 