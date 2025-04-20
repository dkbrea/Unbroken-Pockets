import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type Debt = {
  id: number;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  category: string;
  lender: string;
  notes: string;
  dueDate?: number;
  createdAt: string;
  updatedAt: string;
  user_id: string;
};

export type DebtInput = Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>;

export type DebtState = {
  debts: Debt[];
  totalDebt: number;
  totalMinPayment: number;
  totalInterestPaid: number;
  addDebt: (debt: DebtInput) => Promise<void>;
  updateDebt: (id: number, debt: Partial<DebtInput>) => Promise<void>;
  deleteDebt: (id: number) => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
};

// Helper function to convert database snake_case to frontend camelCase
const transformDebtFromDatabase = (dbDebt: any): Debt => {
  return {
    id: dbDebt.id,
    name: dbDebt.name || '',
    balance: typeof dbDebt.balance === 'number' ? dbDebt.balance : 0,
    interestRate: typeof dbDebt.interest_rate === 'number' ? dbDebt.interest_rate : 0,
    minimumPayment: typeof dbDebt.minimum_payment === 'number' ? dbDebt.minimum_payment : 0,
    category: dbDebt.category || '',
    lender: dbDebt.lender || '',
    notes: dbDebt.notes || '',
    dueDate: dbDebt.due_date || 1,
    createdAt: dbDebt.created_at || new Date().toISOString(),
    updatedAt: dbDebt.updated_at || new Date().toISOString(),
    user_id: dbDebt.user_id || '',
  };
};

// Helper function to convert frontend camelCase to database snake_case
const transformDebtToDatabase = (frontendDebt: Partial<DebtInput>): any => {
  const dbDebt: any = {};
  
  // Only include properties that exist in the input
  if ('name' in frontendDebt) dbDebt.name = frontendDebt.name;
  if ('balance' in frontendDebt) dbDebt.balance = frontendDebt.balance;
  if ('interestRate' in frontendDebt) dbDebt.interest_rate = frontendDebt.interestRate;
  if ('minimumPayment' in frontendDebt) dbDebt.minimum_payment = frontendDebt.minimumPayment;
  if ('category' in frontendDebt) dbDebt.category = frontendDebt.category;
  if ('lender' in frontendDebt) dbDebt.lender = frontendDebt.lender;
  if ('notes' in frontendDebt) dbDebt.notes = frontendDebt.notes;
  if ('dueDate' in frontendDebt) dbDebt.due_date = frontendDebt.dueDate;
  
  return dbDebt;
};

export function useDebtData(): DebtState {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  
  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting authenticated user:', error);
          // Fallback for development - use a mock user ID
          console.log('Using mock user ID for development');
          setUser({ id: 'test-user-id' });
          return;
        }
        
        if (data && data.user) {
          console.log('Authentication successful. User ID:', data.user.id);
          setUser({ id: data.user.id });
        } else {
          console.log('No authenticated user found, using mock user ID');
          setUser({ id: 'test-user-id' });
        }
      } catch (err) {
        console.error('Error in authentication check:', err);
        // Fallback for development - use a mock user ID
        console.log('Using mock user ID due to authentication error');
        setUser({ id: 'test-user-id' });
      }
    };
    
    loadUser();
  }, []);
  
  // First, try to load from localStorage if available (for offline capability)
  useEffect(() => {
    try {
      const savedDebts = localStorage.getItem('debt_data');
      if (savedDebts) {
        const parsedDebts = JSON.parse(savedDebts);
        if (Array.isArray(parsedDebts)) {
          console.log("Loaded debts from localStorage:", parsedDebts);
          setDebts(parsedDebts);
        }
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
    }
  }, []);
  
  // Function to migrate localStorage data to Supabase
  const migrateLocalDataToSupabase = useCallback(async () => {
    try {
      if (!user) {
        console.log('Cannot migrate local data: No authenticated user');
        return;
      }
      
      // Get local data
      const savedDebts = localStorage.getItem('debt_data');
      if (!savedDebts) return;
      
      const localDebts = JSON.parse(savedDebts);
      if (!Array.isArray(localDebts) || localDebts.length === 0) return;
      
      console.log(`Starting migration of ${localDebts.length} local debts to Supabase...`);
      
      // Filter out any debts that have positive IDs (already in Supabase)
      const localOnlyDebts = localDebts.filter(debt => debt.id < 0);
      
      if (localOnlyDebts.length === 0) {
        console.log('No local-only debts to migrate.');
        return;
      }
      
      console.log(`Found ${localOnlyDebts.length} local-only debts to migrate.`);
      
      // Prepare debts for upload (format correctly for Supabase)
      const debtsToUpload = localOnlyDebts.map(debt => {
        // Transform to database format
        const dbDebt = transformDebtToDatabase(debt);
        // Add user_id
        dbDebt.user_id = user.id;
        return dbDebt;
      });
      
      console.log('Preparing to upload debts to Supabase:', debtsToUpload);
      
      // Upload to Supabase
      const { data, error } = await supabase
        .from('debts')
        .insert(debtsToUpload)
        .select();
        
      if (error) {
        console.error('Error inserting debts:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Successfully migrated ${data.length} debts to Supabase:`, data);
        
        // Get all debts from Supabase to make sure we're in sync
        const { data: allDebts, error: fetchError } = await supabase
          .from('debts')
          .select('*')
          .eq('user_id', user.id);
          
        if (fetchError) {
          console.error('Error fetching all debts after migration:', fetchError);
          throw fetchError;
        }
        
        if (allDebts) {
          // Transform data from database format to frontend format
          const transformedDebts = allDebts.map(transformDebtFromDatabase);
          
          // Update local state and localStorage
          setDebts(transformedDebts);
          localStorage.setItem('debt_data', JSON.stringify(transformedDebts));
          console.log('Local data now in sync with Supabase.');
        }
      }
      
    } catch (err) {
      console.error('Error migrating local data to Supabase:', err);
    }
  }, [user]);
  
  // Load debts from Supabase when user is available
  useEffect(() => {
    const fetchDebts = async () => {
      if (!user) {
        console.log('Cannot fetch debts: No authenticated user');
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log('Fetching debts for user:', user.id);
        
        // Try to fetch from Supabase
        try {
          const { data, error } = await supabase
            .from('debts')
            .select('*')
            .eq('user_id', user.id)
            .order('balance', { ascending: true });
            
          if (error) {
            if (error.code === '42P01') { // Table doesn't exist
              console.log("Debts table doesn't exist yet. Using localStorage for now.");
              return; // Just use localStorage data
            }
            console.error('Supabase query error:', error);
            throw error;
          }
          
          if (data) {
            // Transform data from snake_case to camelCase
            const transformedDebts = data.map(transformDebtFromDatabase);
            console.log(`Fetched ${data.length} debts from Supabase:`, transformedDebts);
            setDebts(transformedDebts);
            
            // Save to localStorage for offline access
            try {
              localStorage.setItem('debt_data', JSON.stringify(transformedDebts));
            } catch (err) {
              console.error("Error saving to localStorage:", err);
            }
            
            // After fetching data successfully, try to migrate any local data
            // that might not be in Supabase yet
            await migrateLocalDataToSupabase();
          }
        } catch (err) {
          console.error("Error fetching debts:", err);
          setError(err instanceof Error ? err : new Error(String(err)));
          
          // If we failed to fetch from Supabase, keep using the localStorage data
          console.log("Using localStorage data due to Supabase error");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDebts();
  }, [user, migrateLocalDataToSupabase]);
  
  // Calculate total debt
  const totalDebt = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.balance, 0);
  }, [debts]);
  
  // Calculate total minimum payments
  const totalMinPayment = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  }, [debts]);
  
  // Calculate total interest that will be paid
  const totalInterestPaid = useMemo(() => {
    return debts.reduce((sum, debt) => {
      // Simplified calculation - actual interest depends on amortization schedule
      const monthlyInterestRate = debt.interestRate / 100 / 12;
      const monthsToPayoff = debt.balance / debt.minimumPayment;
      const estimatedInterest = debt.balance * monthlyInterestRate * monthsToPayoff;
      return sum + estimatedInterest;
    }, 0);
  }, [debts]);
  
  // Add a new debt
  const addDebt = useCallback(async (debt: DebtInput) => {
    if (!user) {
      console.error("No user logged in, cannot add debt");
      return;
    }
    
    console.log('Adding new debt:', debt);
    const now = new Date().toISOString();
    
    // Create a temporary debt with a local ID for immediate display
    const tempDebt: Debt = {
      id: Math.floor(Math.random() * -1000), // Negative ID to avoid conflicts with DB
      ...debt,
      user_id: user.id,
      createdAt: now,
      updatedAt: now,
    };
    
    // Update local state first for immediate UI update
    setDebts(prev => [...prev, tempDebt]);
    
    try {
      // Try to save to Supabase
      try {
        console.log('Saving debt to Supabase for user:', user.id);
        
        // Transform debt from frontend format to database format
        const dbDebt = transformDebtToDatabase(debt);
        
        // Add user_id
        dbDebt.user_id = user.id;
        
        console.log('Transformed debt for database:', dbDebt);
        
        const { data, error } = await supabase
          .from("debts")
          .insert([dbDebt])
          .select();
          
        if (error) {
          console.error('Error inserting debt:', error);
          if (error.code === '42P01') { // Table doesn't exist
            console.log("Debts table doesn't exist yet. Using local storage only.");
            // Update localStorage with the temp debt
            const updatedDebts = [...debts, tempDebt];
            localStorage.setItem('debt_data', JSON.stringify(updatedDebts));
            return;
          }
          throw error;
        }
        
        if (data && data.length > 0) {
          // Transform the returned data from Supabase
          const transformedDebt = transformDebtFromDatabase(data[0]);
          // Replace the temporary debt with the one from the database
          setDebts(prevDebts => prevDebts.map((d: Debt) => d.id === tempDebt.id ? transformedDebt : d));
          console.log("Debt added to Supabase:", transformedDebt);
          
          // Check if we should create a recurring transaction for this debt
          try {
            console.log('Creating recurring transaction for debt payment');
            
            // Calculate the next payment date based on the due date of the debt
            const today = new Date();
            const nextDate = new Date();
            
            // Set day of month to the debt's due date (or default to 1st if not specified)
            const dueDay = debt.dueDate || 1;
            nextDate.setDate(dueDay);
            
            // If the due date for this month has already passed, move to next month
            if (nextDate < today) {
              nextDate.setMonth(nextDate.getMonth() + 1);
            }
            
            // Format to ISO string and take the date part only (YYYY-MM-DD)
            const formattedDate = nextDate.toISOString().split('T')[0];
            
            console.log(`Creating recurring transaction with due date on day ${dueDay} of the month, next payment: ${formattedDate}`);
            
            // Create the recurring transaction
            console.log('About to create recurring transaction with data:', {
              name: `Payment for ${debt.name}`,
              amount: -debt.minimumPayment,
              frequency: "Monthly",
              next_date: formattedDate,
              category: "Debt Payment",
              debt_id: data[0].id,
              user_id: user.id,
              payment_method: "Default",
              status: 'active',
              type: 'debt_payment'
            });
            
            // Validate the data before insertion
            if (!data[0].id) {
              console.error("ERROR: debt_id is undefined, cannot create recurring transaction");
              throw new Error("Missing debt_id for recurring transaction");
            }
            
            if (!user.id) {
              console.error("ERROR: user_id is undefined, cannot create recurring transaction");
              throw new Error("Missing user_id for recurring transaction");
            }
            
            try {
              const { error: recurringError } = await supabase
                .from("recurring_transactions")
                .insert([
                  {
                    name: `Payment for ${debt.name}`,
                    amount: -debt.minimumPayment,
                    frequency: "Monthly", 
                    next_date: formattedDate,
                    category: "Debt Payment",
                    debt_id: data[0].id,
                    user_id: user.id,
                    payment_method: "Default",
                    status: 'active',
                    type: 'debt_payment'
                  },
                ]);
              
              if (recurringError) {
                console.error("Error creating recurring transaction for debt:", recurringError);
                console.error("Full error details:", JSON.stringify(recurringError, null, 2));
              } else {
                console.log("Successfully created recurring transaction for debt payment");
              }
            } catch (err) {
              console.error("Exception thrown during recurring transaction creation:", err);
              console.error("Exception details:", JSON.stringify(err, null, 2));
            }
          } catch (err) {
            console.error("Error creating recurring transaction:", err);
          }
          
          // Update localStorage
          const updatedDebts = debts.map((d: Debt) => d.id === tempDebt.id ? transformedDebt : d);
          localStorage.setItem('debt_data', JSON.stringify(updatedDebts));
        }
      } catch (err) {
        console.error("Error adding debt to Supabase:", err);
        
        // Keep the local data even if Supabase fails
        localStorage.setItem('debt_data', JSON.stringify(debts));
      }
    } catch (err) {
      console.error("Error adding debt to Supabase:", err);
      
      // Keep the local data even if Supabase fails
      localStorage.setItem('debt_data', JSON.stringify(debts));
    }
  }, [debts, user]);
  
  // Update an existing debt
  const updateDebt = useCallback(async (id: number, debtUpdates: Partial<DebtInput>) => {
    if (!user) {
      console.error("No user logged in, cannot update debt");
      return;
    }
    
    console.log(`Updating debt ${id}:`, debtUpdates);
    
    // Find the existing debt
    const existingDebt = debts.find(debt => debt.id === id);
    if (!existingDebt) {
      console.error("Debt not found for update");
      return;
    }
    
    // Update local state first for immediate UI update
    setDebts(prev => prev.map(debt => 
      debt.id === id ? { ...debt, ...debtUpdates, updatedAt: new Date().toISOString() } : debt
    ));
    
    try {
      // Try to update in Supabase
      try {
        console.log('Updating debt in Supabase for user:', user.id);
        
        // Transform updates from frontend format to database format
        const dbUpdates = transformDebtToDatabase(debtUpdates);
        
        // Add the updated timestamp
        dbUpdates.updated_at = new Date().toISOString();
        
        console.log('Transformed updates for database:', dbUpdates);
        
        const { data, error } = await supabase
          .from('debts')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', user.id)  // Make sure we're updating the user's own debt
          .select();
          
        if (error) {
          console.error('Error updating debt:', error);
          if (error.code === '42P01') { // Table doesn't exist
            console.log("Debts table doesn't exist yet. Using local storage only.");
            // Update localStorage with the updated debt
            localStorage.setItem('debt_data', JSON.stringify(debts));
            return;
          }
          throw error;
        }
        
        console.log("Debt updated in Supabase:", data);
        
        // Transform the updated debt from database format
        if (data && data.length > 0) {
          const transformedDebt = transformDebtFromDatabase(data[0]);
          
          // Update local state with the transformed debt from the database
          setDebts(prev => prev.map(debt => 
            debt.id === id ? transformedDebt : debt
          ));
          
          // Update localStorage with transformed debts
          const updatedDebts = debts.map(debt => debt.id === id ? transformedDebt : debt);
          localStorage.setItem('debt_data', JSON.stringify(updatedDebts));
        }
        
        // Update recurring transaction if needed
        const needsUpdate = (
          (debtUpdates.minimumPayment !== undefined) || 
          (debtUpdates.dueDate !== undefined)
        );
        
        if (needsUpdate) {
          try {
            console.log('Checking if recurring transaction needs updates');
            // Find the recurring transaction for this debt
            const { data: recurringData, error: recurringFetchError } = await supabase
              .from("recurring_transactions")
              .select("*")
              .eq("user_id", user.id)
              .eq("debt_id", id)
              .limit(1);
              
            if (recurringFetchError) {
              console.error("Error fetching recurring transaction for debt:", recurringFetchError);
            } else if (recurringData && recurringData.length > 0) {
              // Prepare updates for the recurring transaction
              const updateFields: Record<string, any> = {
                // Remove updated_at if it's not in the database table
              };
              
              // Update amount if minimum payment provided
              if (debtUpdates.minimumPayment !== undefined) {
                updateFields.amount = -Math.abs(debtUpdates.minimumPayment);
              }
              
              // Update next_date if due date provided
              if (debtUpdates.dueDate !== undefined) {
                // Calculate the next payment date based on the new due date
                const today = new Date();
                const nextDate = new Date();
                
                const dueDay = debtUpdates.dueDate;
                nextDate.setDate(dueDay);
                
                // If the due date for this month has already passed, move to next month
                if (nextDate < today) {
                  nextDate.setMonth(nextDate.getMonth() + 1);
                }
                
                // Format to ISO string and take the date part only (YYYY-MM-DD)
                updateFields.next_date = nextDate.toISOString().split('T')[0];
              }
              
              // Update the recurring transaction
              const { error: updateError } = await supabase
                .from("recurring_transactions")
                .update(updateFields)
                .eq("id", recurringData[0].id);
                
              if (updateError) {
                console.error("Error updating recurring transaction for debt:", updateError);
              } else {
                console.log("Updated recurring transaction for debt payment");
              }
            } else {
              console.log("No recurring transaction found for this debt, creating one");
              // Create a new recurring transaction
              
              // Calculate the next payment date based on the due date of the debt
              const today = new Date();
              const nextDate = new Date();
              
              // Set day of month to the debt's due date (or default to 1st if not specified)
              const dueDay = existingDebt.dueDate || 1;
              nextDate.setDate(dueDay);
              
              // If the due date for this month has already passed, move to next month
              if (nextDate < today) {
                nextDate.setMonth(nextDate.getMonth() + 1);
              }
              
              // Format to ISO string and take the date part only (YYYY-MM-DD)
              const formattedDate = nextDate.toISOString().split('T')[0];
              
              console.log(`About to create recurring transaction for debt ${id} with data:`, {
                name: `Payment for ${existingDebt.name}`,
                amount: debtUpdates.minimumPayment ? -Math.abs(debtUpdates.minimumPayment) : -existingDebt.minimumPayment,
                frequency: "Monthly",
                next_date: formattedDate,
                category: "Debt Payment",
                debt_id: id,
                user_id: user.id,
                payment_method: "Default",
                status: 'active',
                type: 'debt_payment'
              });
              
              const { error: createError } = await supabase
                .from("recurring_transactions")
                .insert([{
                  name: `Payment for ${existingDebt.name}`,
                  amount: debtUpdates.minimumPayment ? -Math.abs(debtUpdates.minimumPayment) : -existingDebt.minimumPayment,
                  frequency: "Monthly",
                  next_date: formattedDate,
                  category: "Debt Payment",
                  debt_id: id,
                  user_id: user.id,
                  payment_method: "Default",
                  status: 'active',
                  type: 'debt_payment'
                }]);
                
              if (createError) {
                console.error("Error creating recurring transaction for debt:", createError);
                console.error("Full error details:", JSON.stringify(createError, null, 2));
              } else {
                console.log("Successfully created recurring transaction for debt payment");
              }
            }
          } catch (err) {
            console.error("Error syncing debt update with recurring transactions:", err);
          }
        }
      } catch (err) {
        console.error("Error updating debt in Supabase:", err);
      }
      
      // Update localStorage
      localStorage.setItem('debt_data', JSON.stringify(debts));
      
    } catch (err) {
      console.error("Error updating debt in Supabase:", err);
      
      // Keep the local data even if Supabase fails
      localStorage.setItem('debt_data', JSON.stringify(debts));
    }
  }, [debts, user]);
  
  // Delete a debt
  const deleteDebt = useCallback(async (id: number) => {
    if (!user) {
      console.error("No user logged in, cannot delete debt");
      return;
    }
    
    console.log(`Deleting debt ${id}`);
    
    // Find the debt before removal (for related operations)
    const debtToDelete = debts.find(debt => debt.id === id);
    
    // Update local state first for immediate UI update
    setDebts(prev => prev.filter(debt => debt.id !== id));
    
    try {
      // Try to delete from Supabase
      try { 
        console.log('Deleting debt from Supabase for user:', user.id);
        const { error } = await supabase
          .from('debts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);  // Make sure we're deleting the user's own debt
          
        if (error) {
          console.error('Error deleting debt:', error);
          if (error.code === '42P01') { // Table doesn't exist
            console.log("Debts table doesn't exist yet. Using local storage only.");
            // Update localStorage without the deleted debt
            localStorage.setItem('debt_data', JSON.stringify(debts.filter(d => d.id !== id)));
            return;
          }
          throw error;
        }
        
        console.log("Debt deleted from Supabase");
        
        // Also delete any associated recurring transactions
        try {
          console.log('Deleting associated recurring transactions');
          const { error: recurringError } = await supabase
            .from("recurring_transactions")
            .delete()
            .eq("debt_id", id);
            
          if (recurringError) {
            console.error("Error deleting recurring transaction for debt:", recurringError);
          } else {
            console.log("Deleted recurring transaction for debt payment");
            
            // Also clean up recurring transactions in localStorage
            try {
              const localRecurringData = localStorage.getItem('recurring_transactions');
              if (localRecurringData) {
                const parsedRecurring = JSON.parse(localRecurringData);
                if (Array.isArray(parsedRecurring)) {
                  // Filter out any transactions associated with this debt
                  const cleanedRecurring = parsedRecurring.filter((tx: any) => tx.debtId !== id);
                  localStorage.setItem('recurring_transactions', JSON.stringify(cleanedRecurring));
                  console.log(`Cleaned up ${parsedRecurring.length - cleanedRecurring.length} recurring transactions from localStorage`);
                }
              }
            } catch (err) {
              console.error("Error cleaning up localStorage recurring transactions:", err);
            }
          }
        } catch (err) {
          console.error("Error deleting recurring transaction:", err);
        }
      } catch (err) {
        console.error("Error deleting debt from Supabase:", err);
      }
      
      // Update localStorage
      localStorage.setItem('debt_data', JSON.stringify(debts.filter(d => d.id !== id)));
      
    } catch (err) {
      console.error("Error deleting debt from Supabase:", err);
      
      // Keep the local data even if Supabase fails
      localStorage.setItem('debt_data', JSON.stringify(debts));
    }
  }, [debts, user]);
  
  // Calculate payment plan
  const paymentPlan = useMemo(() => {
    if (debts.length === 0) return null;
    
    // This is a simplified calculation and would be more complex in a real app
    // It would consider interest accrual, payment order, etc.
    const extraPaymentAmount = 0; // Default to 0 if no extra payment is specified
    const totalMonthlyPayment = totalMinPayment + extraPaymentAmount;
    const monthsUntilDebtFree = totalDebt / totalMonthlyPayment;
    
    return {
      monthsUntilDebtFree,
      interestSaved: 0, // Would calculate this based on actual amortization
    };
  }, [debts, totalDebt, totalMinPayment]);
  
  return {
    debts,
    totalDebt,
    totalMinPayment,
    totalInterestPaid,
    addDebt,
    updateDebt,
    deleteDebt,
    isLoading,
    error
  };
} 