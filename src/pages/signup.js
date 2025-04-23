import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock registration - replace with your actual registration logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful registration
      console.log('Registering with:', formData);
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create an Account"
      subtitle="Join thousands of users managing their finances better"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-text-dark">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input w-full"
            placeholder="John Doe"
          />
        </div>
        
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
          <label htmlFor="password" className="block text-sm font-medium text-text-dark">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input w-full"
            placeholder="••••••••"
            minLength="8"
          />
          <p className="text-xs text-text-light">Must be at least 8 characters</p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-dark">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="form-input w-full"
            placeholder="••••••••"
          />
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
        
        <div className="text-center text-sm text-text-medium">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary hover:text-primary-dark font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
} 