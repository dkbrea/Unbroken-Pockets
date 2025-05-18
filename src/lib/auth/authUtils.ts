import { supabase } from '../supabase'; // Assuming supabase client is here

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Placeholder: Implement your actual logic to get the authenticated user's ID
export async function getAuthenticatedUserId(): Promise<string> {
  console.log('[authUtils] getAuthenticatedUserId: Attempting to get session...');
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('[authUtils] getAuthenticatedUserId: supabase.auth.getSession() completed.');

  if (error) {
    console.error('[authUtils] getAuthenticatedUserId: Error getting session:', error);
    throw new AuthenticationError('Failed to get user session.');
  }

  if (!session || !session.user) {
    console.log('[authUtils] getAuthenticatedUserId: No session or user found.');
    throw new AuthenticationError('User is not authenticated.');
  }
  console.log('[authUtils] getAuthenticatedUserId: User ID found:', session.user.id);
  return session.user.id;
} 