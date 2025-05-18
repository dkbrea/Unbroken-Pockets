'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSessionValid } from '@/lib/auth/authUtils';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Authentication Guard component that ensures user is authenticated
 * before rendering children components.
 */
export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const validSession = await isSessionValid();
        
        if (!validSession) {
          console.log('AuthGuard: No valid session found, redirecting to login');
          router.push('/auth/signin');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('AuthGuard: Error checking authentication:', error);
        router.push('/auth/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Set up a listener to detect auth state changes after initial load
  useEffect(() => {
    const supabase = createClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          console.log('AuthGuard: User signed out, redirecting to login');
          setIsAuthenticated(false);
          router.push('/auth/signin');
        } else if (event === 'SIGNED_IN' && session) {
          console.log('AuthGuard: User signed in');
          setIsAuthenticated(true);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('AuthGuard: Token refreshed');
          setIsAuthenticated(true);
        } else if (event === 'USER_UPDATED' && session) {
          console.log('AuthGuard: User updated');
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse text-lg">
          Verifying authentication...
        </div>
      </div>
    );
  }

  // If we're not authenticated and have a fallback, show the fallback
  if (!isAuthenticated && fallback) {
    return <>{fallback}</>;
  }

  // If we're not authenticated and don't have a fallback, return null
  if (!isAuthenticated) {
    return null;
  }

  // If we're authenticated, render the children
  return <>{children}</>;
} 