import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if we have a hash in the URL (required for password update)
    const hash = window.location.hash
    if (!hash) {
      setError('Invalid password reset link. Please request a new password reset link.')
    }
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      const supabase = createClient()
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        throw error
      }

      setMessage('Your password has been updated successfully')
      
      // Redirect to sign in page after a delay
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating your password')
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
        
        <h1 className="text-2xl font-bold text-center text-[#1F3A93] mb-2">Set New Password</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter and confirm your new password
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
        
        <form onSubmit={handleUpdatePassword}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              required
              minLength={8}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              required
              minLength={8}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F3A93] text-white py-2 px-4 rounded-md hover:bg-[#152C70] focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
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