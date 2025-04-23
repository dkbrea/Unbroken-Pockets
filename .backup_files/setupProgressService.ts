import { createClient } from '@/lib/supabase/client';
import { getCurrentUserId } from './accountService';

export interface SetupProgress {
  accountsSetup: boolean;
  recurringExpensesSetup: boolean;
  recurringIncomeSetup: boolean;
  subscriptionsSetup: boolean;
  debtSetup: boolean;
  goalsSetup: boolean;
}

// Default setup progress state
export const DEFAULT_SETUP_PROGRESS: SetupProgress = {
  accountsSetup: false,
  recurringExpensesSetup: false,
  recurringIncomeSetup: false,
  subscriptionsSetup: false,
  debtSetup: false,
  goalsSetup: false
};

// Use a constant key for localStorage that works consistently
const STORAGE_KEY = 'setup_progress';

/**
 * Gets the current setup progress 
 * @returns The setup progress state
 */
export async function getSetupProgress(): Promise<SetupProgress> {
  try {
    console.log('setupProgressService: Getting setup progress');
    
    // Always get from localStorage first - this is the most reliable source
    if (typeof window !== 'undefined') {
      const storedProgress = localStorage.getItem(STORAGE_KEY);
      console.log('setupProgressService: Found in localStorage:', storedProgress ? 'yes' : 'no');
      
      if (storedProgress) {
        try {
          const parsedProgress = JSON.parse(storedProgress);
          console.log('setupProgressService: Parsed progress from localStorage:', parsedProgress);
          return parsedProgress;
        } catch (parseError) {
          console.error('setupProgressService: Error parsing localStorage value:', parseError);
        }
      }
    }

    // If not in localStorage, try to get it from database
    try {
      const userId = await getCurrentUserId();
      console.log('setupProgressService: Checking database for user:', userId);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_preferences')
        .select('setup_progress')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('setupProgressService: Database error:', error);
      } else if (data && data.setup_progress) {
        console.log('setupProgressService: Found progress in database:', data.setup_progress);
        
        // Store in localStorage for future use
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.setup_progress));
          console.log('setupProgressService: Saved database progress to localStorage');
        }
        
        return data.setup_progress;
      } else {
        console.log('setupProgressService: No progress found in database');
      }
    } catch (dbError) {
      console.error('setupProgressService: Database lookup error:', dbError);
    }

    // If not found anywhere, use default and save it
    console.log('setupProgressService: Using default progress');
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETUP_PROGRESS));
      console.log('setupProgressService: Saved default progress to localStorage');
    }
    
    return DEFAULT_SETUP_PROGRESS;
  } catch (error) {
    console.error('setupProgressService: Error getting setup progress:', error);
    return DEFAULT_SETUP_PROGRESS;
  }
}

/**
 * Updates the setup progress
 * @param progressUpdates Updates to apply to the setup progress
 * @returns The updated setup progress
 */
export async function updateSetupProgress(progressUpdates: Partial<SetupProgress>): Promise<SetupProgress> {
  try {
    console.log('setupProgressService: Updating setup progress with:', progressUpdates);
    
    // Get the current progress
    const currentProgress = await getSetupProgress();
    console.log('setupProgressService: Current progress before update:', currentProgress);
    
    // Update with new values
    const updatedProgress = {
      ...currentProgress,
      ...progressUpdates
    };
    console.log('setupProgressService: Updated progress after merge:', updatedProgress);
    
    // Always save to localStorage first - this is the most reliable
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
        console.log('setupProgressService: Saved updated progress to localStorage');
      } catch (localStorageError) {
        console.error('setupProgressService: Error saving to localStorage:', localStorageError);
      }
    }
    
    // Try to save to database as well, but don't let DB errors prevent progress from updating
    try {
      await saveProgressToDatabase(updatedProgress);
    } catch (dbError) {
      console.error('setupProgressService: Database save error:', dbError);
      // Continue with localStorage version only
    }
    
    return updatedProgress;
  } catch (error) {
    console.error('setupProgressService: Error updating setup progress:', error);
    // Don't throw the error - return the current progress + updates anyway
    // This allows the UI to update even if there's a database error
    if (typeof window !== 'undefined') {
      const storedProgress = localStorage.getItem(STORAGE_KEY);
      if (storedProgress) {
        try {
          const currentProgress = JSON.parse(storedProgress);
          return {
            ...currentProgress,
            ...progressUpdates
          };
        } catch (e) {
          // Ignore parse error and continue
        }
      }
    }
    return {
      ...DEFAULT_SETUP_PROGRESS,
      ...progressUpdates
    };
  }
}

/**
 * Helper function to save progress to database
 * @param progress The progress to save
 */
async function saveProgressToDatabase(progress: SetupProgress): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    console.log('setupProgressService: Saving to database for user:', userId);
    
    const supabase = createClient();
    
    // First check if preferences record exists
    const { data: existingData, error: checkError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('setupProgressService: Error checking existing preferences:', checkError);
      return;
    }
    
    if (existingData) {
      // Update existing record
      console.log('setupProgressService: Updating existing preferences record');
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ setup_progress: progress })
        .eq('id', existingData.id);
        
      if (updateError) {
        console.error('setupProgressService: Error updating preferences:', updateError);
      } else {
        console.log('setupProgressService: Database update successful');
      }
    } else {
      // Create new preferences record with all required fields
      console.log('setupProgressService: Creating new preferences record');
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          setup_progress: progress,
          currency: 'USD',
          date_format: 'MM/DD/YYYY',
          theme: 'light',
          hide_balances: false,
          email_notifications: true,
          browser_notifications: false,
          mobile_notifications: false,
          dashboard_widgets: ['cashflow', 'budget', 'goals', 'recentTransactions', 'accounts']
        });
        
      if (insertError) {
        console.error('setupProgressService: Error creating preferences:', insertError);
      } else {
        console.log('setupProgressService: Database insert successful');
      }
    }
  } catch (error) {
    console.error('setupProgressService: Database save operation failed:', error);
    throw error;
  }
}

/**
 * Resets the setup progress to default values
 * @returns The reset progress (defaults)
 */
export async function resetSetupProgress(): Promise<SetupProgress> {
  try {
    console.log('setupProgressService: Resetting setup progress to defaults');
    
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      console.log('setupProgressService: Removed progress from localStorage');
    }
    
    // Try to reset in database too
    try {
      const userId = await getCurrentUserId();
      console.log('setupProgressService: Resetting in database for user:', userId);
      
      const supabase = createClient();
      const { error } = await supabase
        .from('user_preferences')
        .update({ setup_progress: DEFAULT_SETUP_PROGRESS })
        .eq('user_id', userId);
        
      if (error) {
        console.error('setupProgressService: Error resetting in database:', error);
      } else {
        console.log('setupProgressService: Database reset successful');
      }
    } catch (dbError) {
      console.error('setupProgressService: Database reset error:', dbError);
    }
    
    return DEFAULT_SETUP_PROGRESS;
  } catch (error) {
    console.error('setupProgressService: Error resetting setup progress:', error);
    return DEFAULT_SETUP_PROGRESS;
  }
}

/**
 * Ensures that user preferences exist for the current user
 * @returns true if the preferences were created or already exist, false if there was an error
 */
export async function ensureUserPreferencesExist(): Promise<boolean> {
  try {
    console.log('setupProgressService: Ensuring user preferences exist');
    
    try {
      const userId = await getCurrentUserId();
      console.log('setupProgressService: User ID for preferences check:', userId);
      
      if (!userId) {
        console.error('setupProgressService: Could not get valid user ID');
        return false;
      }
      
      const supabase = createClient();
      
      // First, ensure user exists in the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('setupProgressService: Error checking user existence:', userError);
      }
      
      if (!userData) {
        console.log('setupProgressService: User does not exist in users table, creating placeholder record');
        
        // Try to get user email from auth
        let email = 'user@example.com'; // Fallback
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user?.email) {
            email = authData.user.email;
          }
        } catch (e) {
          console.error('setupProgressService: Error getting user email:', e);
        }
        
        // Create minimal user record to satisfy foreign key constraint
        const { error: insertUserError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: email,
            first_name: 'User',
            last_name: 'Account'
          });
          
        if (insertUserError) {
          console.error('setupProgressService: Error creating user record:', insertUserError);
          return false;
        }
        
        console.log('setupProgressService: Created placeholder user record');
      }
      
      // Now check if preferences already exist
      const { data, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('setupProgressService: Error checking user preferences:', checkError);
        return false;
      }
        
      if (data) {
        console.log('setupProgressService: User preferences already exist, ID:', data.id);
        return true;
      }
      
      console.log('setupProgressService: User preferences not found, creating new record');
      
      // Get current progress from localStorage to preserve it
      let setupProgress = DEFAULT_SETUP_PROGRESS;
      if (typeof window !== 'undefined') {
        const storedProgress = localStorage.getItem(STORAGE_KEY);
        if (storedProgress) {
          try {
            setupProgress = JSON.parse(storedProgress);
            console.log('setupProgressService: Using progress from localStorage for new record');
          } catch (e) {
            console.error('setupProgressService: Error parsing localStorage for new record:', e);
          }
        }
      }
      
      // Add setup_progress field to the schema if it doesn't exist
      try {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            currency: 'USD',
            date_format: 'MM/DD/YYYY',
            theme: 'light',
            hide_balances: false,
            email_notifications: true,
            browser_notifications: false,
            mobile_notifications: false,
            dashboard_widgets: ['cashflow', 'budget', 'goals', 'recentTransactions', 'accounts'],
            setup_progress: setupProgress
          });
          
        if (insertError) {
          console.error('setupProgressService: Error creating user preferences:', insertError);
          
          // If the error is about the setup_progress column not existing, try without it
          if (insertError.message?.includes('column "setup_progress" of relation "user_preferences" does not exist')) {
            console.log('setupProgressService: Trying to insert without setup_progress field');
            
            const { error: fallbackError } = await supabase
              .from('user_preferences')
              .insert({
                user_id: userId,
                currency: 'USD',
                date_format: 'MM/DD/YYYY',
                theme: 'light',
                hide_balances: false,
                email_notifications: true,
                browser_notifications: false,
                mobile_notifications: false,
                dashboard_widgets: ['cashflow', 'budget', 'goals', 'recentTransactions', 'accounts']
              });
              
            if (fallbackError) {
              console.error('setupProgressService: Error with fallback insert:', fallbackError);
              return false;
            }
            
            console.log('setupProgressService: Created user preferences with fallback approach');
            
            // Store setup progress in localStorage only
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(setupProgress));
            }
            
            return true;
          }
          
          return false;
        }
        
        console.log('setupProgressService: Created user preferences successfully');
        return true;
      } catch (error) {
        console.error('setupProgressService: Error in preference creation attempt:', error);
        return false;
      }
    } catch (error) {
      console.error('setupProgressService: Error creating user preferences:', error);
      return false;
    }
  } catch (error) {
    console.error('setupProgressService: Error ensuring user preferences exist:', error);
    return false;
  }
} 