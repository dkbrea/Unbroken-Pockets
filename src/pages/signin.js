import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Mock authentication - replace with your actual auth logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      console.log('Signing in with:', formData);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-text-dark">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input w-full"
            placeholder="your@email.com"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-medium text-text-dark">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-dark">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input w-full"
            placeholder="••••••••"
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        
        <div className="text-center text-sm text-text-medium">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:text-primary-dark font-medium">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
} 