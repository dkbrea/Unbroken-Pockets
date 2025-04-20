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
    
    // Get the initialized Supabase client from the window object
    function getSupabaseClient() {
        // Try different ways the client might be available
        if (window.supabase) {
            return window.supabase;
        }
        
        // Try to find it in global namespace
        if (window.createClient && typeof window.createClient === 'function') {
            try {
                return window.createClient();
            } catch (e) {
                console.error('Error creating client:', e);
            }
        }
        
        // Try to find it in React's __REACT_DEVTOOLS_GLOBAL_HOOK__
        try {
            const reactInstances = document.querySelectorAll('[data-reactroot]');
            console.log('Found', reactInstances.length, 'React root instances');
            
            // Just a hint that we're in a React app, not actually getting the client
        } catch (e) {
            console.error('Error finding React instances:', e);
        }
        
        // As a fallback for testing, create a mock client that will just log calls
        console.warn('No Supabase client found, creating a mock for testing. This will not work with real data.');
        return {
            from: (table) => ({
                select: (cols) => ({
                    eq: (col, val) => ({
                        limit: (n) => {
                            console.log(`Mock Supabase query: SELECT ${cols} FROM ${table} WHERE ${col} = ${val} LIMIT ${n}`);
                            return Promise.resolve({ data: [], error: null });
                        },
                        execute: () => {
                            console.log(`Mock Supabase query: SELECT ${cols} FROM ${table} WHERE ${col} = ${val}`);
                            return Promise.resolve({ data: [], error: null });
                        }
                    }),
                    ilike: (col, val) => ({
                        limit: (n) => {
                            console.log(`Mock Supabase query: SELECT ${cols} FROM ${table} WHERE ${col} ILIKE ${val} LIMIT ${n}`);
                            return Promise.resolve({ data: [], error: null });
                        },
                        execute: () => {
                            console.log(`Mock Supabase query: SELECT ${cols} FROM ${table} WHERE ${col} ILIKE ${val}`);
                            return Promise.resolve({ data: [], error: null });
                        }
                    }),
                    limit: (n) => {
                        console.log(`Mock Supabase query: SELECT ${cols} FROM ${table} LIMIT ${n}`);
                        return Promise.resolve({ data: [], error: null });
                    },
                    execute: () => {
                        console.log(`Mock Supabase query: SELECT ${cols} FROM ${table}`);
                        return Promise.resolve({ data: [], error: null });
                    }
                })
            })
        };
    }
    
    // Function to check application data and update setup progress accordingly
    async function updateProgressFromAppData() {
        try {
            console.log('Checking application data to update setup progress...');
            const supabase = getSupabaseClient();
            
            // Get data to check completion status
            const updates = { ...DEFAULT_SETUP_PROGRESS };
            
            // 1. Check accounts
            try {
                const { data: accounts, error: accountsError } = await supabase
                    .from('accounts')
                    .select('id')
                    .limit(1);
                    
                if (accountsError) {
                    console.error('Error checking accounts:', accountsError);
                } else {
                    updates.accountsSetup = accounts && accounts.length > 0;
                    console.log(`Accounts setup: ${updates.accountsSetup ? 'Complete ✅' : 'Incomplete ❌'}`);
                }
            } catch (e) {
                console.error('Error in accounts check:', e);
            }
            
            // 2. Try multiple approaches to check recurring expenses
            try {
                // First try with 'type' field
                let recurringExpensesFound = false;
                
                // Approach 1: Check for 'type' = 'expense'
                const { data: recurringExpenses1, error: expensesError1 } = await supabase
                    .from('recurring_transactions')
                    .select('id')
                    .eq('type', 'expense')
                    .limit(1);
                    
                if (!expensesError1 && recurringExpenses1 && recurringExpenses1.length > 0) {
                    recurringExpensesFound = true;
                } else {
                    console.log('No expenses found with type=expense, trying alternative approaches...');
                    
                    // Approach 2: Check for negative amount (expenses are often negative)
                    try {
                        const { data: recurringExpenses2, error: expensesError2 } = await supabase
                            .from('recurring_transactions')
                            .select('id, amount')
                            .limit(10);
                            
                        if (!expensesError2 && recurringExpenses2) {
                            // Check if any have negative amounts
                            const expenses = recurringExpenses2.filter(item => 
                                (typeof item.amount === 'number' && item.amount < 0) ||
                                (typeof item.amount === 'string' && parseFloat(item.amount) < 0)
                            );
                            
                            if (expenses.length > 0) {
                                recurringExpensesFound = true;
                            }
                        }
                    } catch (e) {
                        console.error('Error in recurring expenses amount check:', e);
                    }
                    
                    // Approach 3: Check for category containing expense-related terms
                    try {
                        const { data: recurringExpenses3, error: expensesError3 } = await supabase
                            .from('recurring_transactions')
                            .select('id, category')
                            .limit(10);
                            
                        if (!expensesError3 && recurringExpenses3) {
                            // Check for expense-related categories
                            const expenseCategories = ['expense', 'bill', 'utility', 'rent', 'mortgage', 'loan'];
                            const expenses = recurringExpenses3.filter(item => {
                                if (!item.category) return false;
                                const category = item.category.toLowerCase();
                                return expenseCategories.some(term => category.includes(term));
                            });
                            
                            if (expenses.length > 0) {
                                recurringExpensesFound = true;
                            }
                        }
                    } catch (e) {
                        console.error('Error in recurring expenses category check:', e);
                    }
                }
                
                updates.recurringExpensesSetup = recurringExpensesFound;
                console.log(`Recurring expenses setup: ${updates.recurringExpensesSetup ? 'Complete ✅' : 'Incomplete ❌'}`);
            } catch (e) {
                console.error('Error in recurring expenses check:', e);
            }
            
            // 3. Check recurring income with multiple approaches
            try {
                let recurringIncomeFound = false;
                
                // Approach 1: Check for 'type' = 'income'
                const { data: recurringIncome1, error: incomeError1 } = await supabase
                    .from('recurring_transactions')
                    .select('id')
                    .eq('type', 'income')
                    .limit(1);
                    
                if (!incomeError1 && recurringIncome1 && recurringIncome1.length > 0) {
                    recurringIncomeFound = true;
                } else {
                    console.log('No income found with type=income, trying alternative approaches...');
                    
                    // Approach 2: Check for positive amount (income is positive)
                    try {
                        const { data: recurringIncome2, error: incomeError2 } = await supabase
                            .from('recurring_transactions')
                            .select('id, amount')
                            .limit(10);
                            
                        if (!incomeError2 && recurringIncome2) {
                            // Check if any have positive amounts
                            const income = recurringIncome2.filter(item => 
                                (typeof item.amount === 'number' && item.amount > 0) ||
                                (typeof item.amount === 'string' && parseFloat(item.amount) > 0)
                            );
                            
                            if (income.length > 0) {
                                recurringIncomeFound = true;
                            }
                        }
                    } catch (e) {
                        console.error('Error in recurring income amount check:', e);
                    }
                    
                    // Approach 3: Check for category containing income-related terms
                    try {
                        const { data: recurringIncome3, error: incomeError3 } = await supabase
                            .from('recurring_transactions')
                            .select('id, category')
                            .limit(10);
                            
                        if (!incomeError3 && recurringIncome3) {
                            // Check for income-related categories
                            const incomeCategories = ['income', 'salary', 'wage', 'payment', 'revenue'];
                            const income = recurringIncome3.filter(item => {
                                if (!item.category) return false;
                                const category = item.category.toLowerCase();
                                return incomeCategories.some(term => category.includes(term));
                            });
                            
                            if (income.length > 0) {
                                recurringIncomeFound = true;
                            }
                        }
                    } catch (e) {
                        console.error('Error in recurring income category check:', e);
                    }
                }
                
                updates.recurringIncomeSetup = recurringIncomeFound;
                console.log(`Recurring income setup: ${updates.recurringIncomeSetup ? 'Complete ✅' : 'Incomplete ❌'}`);
            } catch (e) {
                console.error('Error in recurring income check:', e);
            }
            
            // 4. Check subscriptions with multiple approaches
            try {
                let subscriptionsFound = false;
                
                // Approach 1: Check for 'category' = 'subscriptions'
                const { data: subscriptions1, error: subscriptionsError1 } = await supabase
                    .from('recurring_transactions')
                    .select('id')
                    .eq('category', 'subscriptions')
                    .limit(1);
                    
                if (!subscriptionsError1 && subscriptions1 && subscriptions1.length > 0) {
                    subscriptionsFound = true;
                } else {
                    console.log('No explicit subscriptions found, trying alternative approaches...');
                    
                    // Approach 2: Check for category containing subscription-related terms
                    try {
                        const { data: subscriptions2, error: subscriptionsError2 } = await supabase
                            .from('recurring_transactions')
                            .select('id, category, name, description')
                            .limit(20);
                            
                        if (!subscriptionsError2 && subscriptions2) {
                            // Check for subscription-related terms in category, name, or description
                            const subscriptionTerms = [
                                'subscription', 'netflix', 'spotify', 'hulu', 'disney+', 
                                'amazon prime', 'youtube', 'apple music', 'icloud', 'membership',
                                'monthly fee', 'service fee'
                            ];
                            
                            const subs = subscriptions2.filter(item => {
                                // Check each field that might contain subscription info
                                const fields = [
                                    item.category, 
                                    item.name, 
                                    item.description
                                ].filter(field => field && typeof field === 'string');
                                
                                // Check if any field contains subscription terms
                                return fields.some(field => {
                                    const lowered = field.toLowerCase();
                                    return subscriptionTerms.some(term => lowered.includes(term));
                                });
                            });
                            
                            if (subs.length > 0) {
                                subscriptionsFound = true;
                            }
                        }
                    } catch (e) {
                        console.error('Error in subscriptions search check:', e);
                    }
                }
                
                updates.subscriptionsSetup = subscriptionsFound;
                console.log(`Subscriptions setup: ${updates.subscriptionsSetup ? 'Complete ✅' : 'Incomplete ❌'}`);
            } catch (e) {
                console.error('Error in subscriptions check:', e);
            }
            
            // 5. Check debt tracking with multiple approaches
            try {
                let debtsFound = false;
                
                // Try multiple possible debt table names
                const possibleDebtTables = ['debts', 'debt_tracker', 'debt_items', 'loans'];
                
                for (const table of possibleDebtTables) {
                    try {
                        const { data, error } = await supabase
                            .from(table)
                            .select('id')
                            .limit(1);
                            
                        if (!error && data && data.length > 0) {
                            debtsFound = true;
                            console.log(`Found debt items in table '${table}'`);
                            break;
                        }
                    } catch (e) {
                        console.log(`Table '${table}' not found or error:`, e);
                    }
                }
                
                // If no dedicated debt table, check for debt categories in transactions
                if (!debtsFound) {
                    try {
                        const { data: transactions, error } = await supabase
                            .from('recurring_transactions')
                            .select('id, category, name, description')
                            .limit(20);
                            
                        if (!error && transactions) {
                            const debtTerms = ['debt', 'loan', 'mortgage', 'credit card', 'payment'];
                            
                            const debtItems = transactions.filter(item => {
                                // Check each field that might contain debt info
                                const fields = [
                                    item.category, 
                                    item.name, 
                                    item.description
                                ].filter(field => field && typeof field === 'string');
                                
                                // Check if any field contains debt terms
                                return fields.some(field => {
                                    const lowered = field.toLowerCase();
                                    return debtTerms.some(term => lowered.includes(term));
                                });
                            });
                            
                            if (debtItems.length > 0) {
                                debtsFound = true;
                                console.log('Found debt-related transactions');
                            }
                        }
                    } catch (e) {
                        console.error('Error in recurring transactions debt check:', e);
                    }
                }
                
                updates.debtSetup = debtsFound;
                console.log(`Debt setup: ${updates.debtSetup ? 'Complete ✅' : 'Incomplete ❌'}`);
            } catch (e) {
                console.error('Error in debt tracking check:', e);
            }
            
            // 6. Check goals with multiple approaches
            try {
                let goalsFound = false;
                
                // Try multiple possible goals table names
                const possibleGoalsTables = ['financial_goals', 'goals', 'savings_goals'];
                
                for (const table of possibleGoalsTables) {
                    try {
                        const { data, error } = await supabase
                            .from(table)
                            .select('id')
                            .limit(1);
                            
                        if (!error && data && data.length > 0) {
                            goalsFound = true;
                            console.log(`Found goals in table '${table}'`);
                            break;
                        }
                    } catch (e) {
                        console.log(`Table '${table}' not found or error:`, e);
                    }
                }
                
                updates.goalsSetup = goalsFound;
                console.log(`Goals setup: ${updates.goalsSetup ? 'Complete ✅' : 'Incomplete ❌'}`);
            } catch (e) {
                console.error('Error in goals check:', e);
            }
            
            // Update the progress with our findings
            const updatedProgress = updateSetupProgress(updates);
            console.log('🎉 Updated setup progress based on application data:', updatedProgress);
            
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
        
        // Trigger a refresh of the page
        console.log('Consider refreshing the page to see the updated checkmarks');
    });
    
    // Instructions
    console.log('=== DATA-AWARE SETUP PROGRESS TOOL ===');
    console.log('Instructions:');
    console.log('1. This tool has automatically checked your app data');
    console.log('2. To manually update from app data: updateSetupProgressFromAppData()');
    console.log('3. To manually set a value: manualUpdateSetupProgress({recurringExpensesSetup: true})');
    console.log('4. To reset: resetSetupProgress()');
    console.log('5. Refresh the page to see the updated checkmarks');
})(); 