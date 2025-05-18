import { supabase } from '../supabase';
import { UserProfile } from '../types/states';

export async function getUserData(userId: string): Promise<Partial<UserProfile> | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
  return data;
}

export async function updateUserData(userId: string, updates: Partial<UserProfile>): Promise<Partial<UserProfile> | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user data:', error);
    return null;
  }
  return data;
}

export async function insertUserData(userData: UserProfile): Promise<Partial<UserProfile> | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(userData)
    .select()
    .single();
    
  if (error) {
    console.error('Error inserting user data:', error);
    return null;
  }
  return data;
}

export async function deleteUserData(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting user data:', error);
    return false;
  }
  return true;
} 