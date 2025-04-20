// Copy and paste this entire file into your browser's developer console (F12) when on the dashboard page

(function() {
    // Define the storage key
    const STORAGE_KEY = 'setup_progress';
    
    // Define the default setup progress
    const DEFAULT_SETUP_PROGRESS = {
        accountsSetup: false,
        recurringExpensesSetup: false,
        recurringIncomeSetup: false,
        subscriptionsSetup: false,
        debtSetup: false,
        goalsSetup: false
    };
    
    // Helper function to update progress
    function updateSetupProgress(updates) {
        try {
            // Get current progress or use default
            let currentProgress;
            const storedProgress = localStorage.getItem(STORAGE_KEY);
            
            if (storedProgress) {
                currentProgress = JSON.parse(storedProgress);
            } else {
                currentProgress = { ...DEFAULT_SETUP_PROGRESS };
            }
            
            // Update with new values
            const updatedProgress = {
                ...currentProgress,
                ...updates
            };
            
            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
            
            console.log('Successfully updated setup progress:', updatedProgress);
            
            return updatedProgress;
        } catch (error) {
            console.error('Error updating setup progress:', error);
            return null;
        }
    }
    
    // Function to check application data and update setup progress accordingly
    async function updateProgressFromAppData() {
        try {
            console.log('Checking application data to update setup progress...');
            const supabase = window.supabase;
            
            if (!supabase) {
                console.error('Supabase client not found. Make sure you run this on a page where Supabase is initialized.');
                return;
            }
            
            // Get data to check completion status
            const updates = { ...DEFAULT_SETUP_PROGRESS };
            
            // 1. Check accounts
            const { data: accounts, error: accountsError } = await supabase
                .from('accounts')
                .select('id')
                .limit(1);
                
            if (accountsError) {
                console.error('Error checking accounts:', accountsError);
            } else {
                updates.accountsSetup = accounts && accounts.length > 0;
                console.log(`Accounts setup: ${updates.accountsSetup ? 'Complete' : 'Incomplete'}`);
            }
            
            // 2. Check recurring expenses
            const { data: recurringExpenses, error: expensesError } = await supabase
                .from('recurring_transactions')
                .select('id')
                .eq('type', 'expense')
                .limit(1);
                
            if (expensesError) {
                console.error('Error checking recurring expenses:', expensesError);
            } else {
                updates.recurringExpensesSetup = recurringExpenses && recurringExpenses.length > 0;
                console.log(`Recurring expenses setup: ${updates.recurringExpensesSetup ? 'Complete' : 'Incomplete'}`);
            }
            
            // 3. Check recurring income
            const { data: recurringIncome, error: incomeError } = await supabase
                .from('recurring_transactions')
                .select('id')
                .eq('type', 'income')
                .limit(1);
                
            if (incomeError) {
                console.error('Error checking recurring income:', incomeError);
            } else {
                updates.recurringIncomeSetup = recurringIncome && recurringIncome.length > 0;
                console.log(`Recurring income setup: ${updates.recurringIncomeSetup ? 'Complete' : 'Incomplete'}`);
            }
            
            // 4. Check subscriptions
            const { data: subscriptions, error: subscriptionsError } = await supabase
                .from('recurring_transactions')
                .select('id')
                .eq('category', 'subscriptions')
                .limit(1);
                
            if (subscriptionsError) {
                console.error('Error checking subscriptions:', subscriptionsError);
            } else {
                updates.subscriptionsSetup = subscriptions && subscriptions.length > 0;
                console.log(`Subscriptions setup: ${updates.subscriptionsSetup ? 'Complete' : 'Incomplete'}`);
            }
            
            // 5. Check debt tracking
            const { data: debts, error: debtsError } = await supabase
                .from('debts')
                .select('id')
                .limit(1);
                
            if (debtsError) {
                console.error('Error checking debts:', debtsError);
                // Try alternative table name if error occurs
                try {
                    const { data: altDebts, error: altDebtsError } = await supabase
                        .from('debt_tracker')
                        .select('id')
                        .limit(1);
                        
                    if (altDebtsError) {
                        console.error('Error checking alternative debts table:', altDebtsError);
                    } else {
                        updates.debtSetup = altDebts && altDebts.length > 0;
                        console.log(`Debt setup (alt): ${updates.debtSetup ? 'Complete' : 'Incomplete'}`);
                    }
                } catch (e) {
                    console.error('Error in alternative debt check:', e);
                }
            } else {
                updates.debtSetup = debts && debts.length > 0;
                console.log(`Debt setup: ${updates.debtSetup ? 'Complete' : 'Incomplete'}`);
            }
            
            // 6. Check goals (if needed)
            // This is a placeholder - modify as needed based on your actual data structure
            const { data: goals, error: goalsError } = await supabase
                .from('financial_goals')
                .select('id')
                .limit(1);
                
            if (goalsError) {
                console.error('Error checking goals:', goalsError);
            } else {
                updates.goalsSetup = goals && goals.length > 0;
                console.log(`Goals setup: ${updates.goalsSetup ? 'Complete' : 'Incomplete'}`);
            }
            
            // Update the progress with our findings
            const updatedProgress = updateSetupProgress(updates);
            console.log('Updated setup progress based on application data:', updatedProgress);
            
            return updatedProgress;
        } catch (error) {
            console.error('Error updating progress from app data:', error);
            return null;
        }
    }
    
    // Initialize or update from existing data
    async function initializeSetupProgress() {
        // First check if we have progress already saved
        const storedProgress = localStorage.getItem(STORAGE_KEY);
        
        if (!storedProgress) {
            console.log('No saved progress found, initializing from application data...');
            await updateProgressFromAppData();
        } else {
            console.log('Using existing progress, but checking for updates...');
            // Check if we need to update based on app data
            await updateProgressFromAppData();
        }
    }
    
    // Manual helpers for console
    window.updateSetupProgressFromAppData = updateProgressFromAppData;
    window.manualUpdateSetupProgress = updateSetupProgress;
    window.resetSetupProgress = function() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Setup progress reset to defaults');
    };
    
    // Initialize
    initializeSetupProgress().then(() => {
        console.log('Setup progress initialization complete');
        
        // Try to trigger a React state update
        try {
            const event = new Event('storage');
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Error dispatching storage event:', error);
        }
        
        console.log('Refresh the page to see the updated checkmarks');
    });
    
    // Instructions
    console.log('=== SETUP PROGRESS DATA-AWARE PATCHING TOOL ===');
    console.log('Instructions:');
    console.log('1. This tool has automatically checked your app data');
    console.log('2. To manually update from app data: updateSetupProgressFromAppData()');
    console.log('3. To manually set a value: manualUpdateSetupProgress({recurringExpensesSetup: true})');
    console.log('4. To reset: resetSetupProgress()');
    console.log('5. Always refresh the page after changes to see them take effect');
})(); 