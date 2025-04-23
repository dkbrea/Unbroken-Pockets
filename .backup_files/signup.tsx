import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Create a Supabase client for browser
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      setMessage('Check your email for the confirmation link')
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up')
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
        
        <h1 className="text-2xl font-bold text-center text-[#1F3A93] mb-6">Create an account</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSignUp}>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F3A93] text-white py-2 px-4 rounded-md hover:bg-[#152C70] focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-[#1F3A93] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 