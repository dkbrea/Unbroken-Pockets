import { supabase } from '../supabase';
import { Database } from '../database.types';

export interface SetupProgress {
  user_id: string;
  accounts_setup: boolean;
  budget_setup: boolean;
  categories_setup: boolean;
  recurring_setup: boolean;
  preferences_setup: boolean;
}

export interface ExtendedSetupProgress extends SetupProgress {
  recurringExpensesSetup: boolean;
  recurringIncomeSetup: boolean;
  subscriptionsSetup: boolean;
  debtSetup: boolean;
  goalsSetup: boolean;
}

export const DEFAULT_SETUP_PROGRESS: SetupProgress = {
  user_id: '',
  accounts_setup: false,
  budget_setup: false,
  categories_setup: false,
  recurring_setup: false,
  preferences_setup: false,
};

export const DEFAULT_EXTENDED_SETUP_PROGRESS: ExtendedSetupProgress = {
  ...DEFAULT_SETUP_PROGRESS,
  recurringExpensesSetup: false,
  recurringIncomeSetup: false,
  subscriptionsSetup: false,
  debtSetup: false,
  goalsSetup: false,
};

export function mapToExtendedProgress(baseProgress: SetupProgress): ExtendedSetupProgress {
  return {
    ...baseProgress,
    recurringExpensesSetup: baseProgress.recurring_setup,
    recurringIncomeSetup: baseProgress.recurring_setup,
    subscriptionsSetup: baseProgress.recurring_setup,
    debtSetup: false,
    goalsSetup: false,
  };
}

export async function getSetupProgress(userId: string): Promise<ExtendedSetupProgress> {
  const { data, error } = await supabase
    .from('setup_progress')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    return { ...DEFAULT_EXTENDED_SETUP_PROGRESS, user_id: userId };
  }
  
  const baseProgress: SetupProgress = {
    user_id: data.user_id,
    accounts_setup: data.accounts_setup,
    budget_setup: data.budget_setup,
    categories_setup: data.categories_setup,
    recurring_setup: data.recurring_setup,
    preferences_setup: data.preferences_setup,
  };

  return mapToExtendedProgress(baseProgress);
}

export async function updateSetupProgress(
  userId: string,
  progress: Partial<Omit<ExtendedSetupProgress, 'user_id'>>
): Promise<ExtendedSetupProgress> {
  const dbProgressUpdate: Partial<Omit<SetupProgress, 'user_id'> & { user_id: string }> = {
    user_id: userId,
    accounts_setup: progress.accounts_setup,
    budget_setup: progress.budget_setup,
    categories_setup: progress.categories_setup,
    recurring_setup: progress.recurring_setup !== undefined ? progress.recurring_setup : (progress.recurringExpensesSetup || progress.recurringIncomeSetup || progress.subscriptionsSetup),
    preferences_setup: progress.preferences_setup,
  };
  
  Object.keys(dbProgressUpdate).forEach(key => {
    const K = key as keyof typeof dbProgressUpdate;
    if (dbProgressUpdate[K] === undefined) {
      delete dbProgressUpdate[K];
    }
  });

  const { error } = await supabase
    .from('setup_progress')
    .upsert(dbProgressUpdate)
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error updating setup progress:', error);
    throw error;
  }

  return getSetupProgress(userId);
}

export async function resetSetupProgress(userId: string): Promise<void> {
  const { error } = await supabase
    .from('setup_progress')
    .delete()
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error resetting setup progress:', error);
    throw error;
  }
}

export async function ensureUserPreferencesExist(userId: string): Promise<void> {
  const { data, error: checkError } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('user_id', userId)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking user preferences:', checkError);
    throw checkError;
  }

  if (!data) {
    const { error: insertError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        theme: 'light',
        currency: 'USD',
        language: 'en',
        notifications_enabled: true
      });
      
    if (insertError) {
      console.error('Error creating user preferences:', insertError);
      throw insertError;
    }
  }
} 