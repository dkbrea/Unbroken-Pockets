import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
    } else {
      setMessage('Password reset email sent! Please check your inbox.')
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
        
        <h1 className="text-2xl font-bold text-center text-[#1F3A93] mb-2">Reset your password</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your email and we'll send you a link to reset your password
        </p>
        
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
        
        <form onSubmit={handleResetPassword}>
          <div className="mb-6">
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
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F3A93] text-white py-2 px-4 rounded-md hover:bg-[#152C70] focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link href="/auth/signin" className="text-[#1F3A93] hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 