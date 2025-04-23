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
    
    // Monkey patch the real functions to ensure they use our localStorage key
    if (window._fixingSetupProgress) {
        console.log('Setup progress patch already applied!');
        return;
    }
    
    // Create a reference to import the service
    const oldGetSetupProgress = window.getSetupProgress;
    const oldUpdateSetupProgress = window.updateSetupProgress;
    
    // Monkey patch the getSetupProgress function
    window.getSetupProgress = async function() {
        console.log('Patched getSetupProgress called');
        try {
            const storedProgress = localStorage.getItem(STORAGE_KEY);
            if (storedProgress) {
                const parsedProgress = JSON.parse(storedProgress);
                console.log('Found progress in localStorage:', parsedProgress);
                return parsedProgress;
            }
            console.log('No progress found in localStorage, using defaults');
            return DEFAULT_SETUP_PROGRESS;
        } catch (error) {
            console.error('Error in patched getSetupProgress:', error);
            return DEFAULT_SETUP_PROGRESS;
        }
    };
    
    // Monkey patch the updateSetupProgress function
    window.updateSetupProgress = async function(updates) {
        console.log('Patched updateSetupProgress called with:', updates);
        return updateSetupProgress(updates);
    };
    
    // Mark as fixed
    window._fixingSetupProgress = true;
    
    // Apply some fixes right away
    
    // 1. Fix the state in localStorage
    console.log('Checking current localStorage state...');
    const currentState = localStorage.getItem(STORAGE_KEY);
    console.log('Current localStorage state:', currentState || 'Not found');
    
    // 2. Update our component state directly if we can find the React state
    // This is highly experimental and may not work
    try {
        const reactInstances = document.querySelectorAll('[data-reactroot]');
        console.log('Found', reactInstances.length, 'React root instances');
        
        if (reactInstances.length > 0) {
            console.log('Attempting to update React state directly...');
            // This won't work most likely, but it's worth a try
            const event = new Event('storage');
            window.dispatchEvent(event);
        }
    } catch (error) {
        console.error('Error trying to update React state:', error);
    }
    
    console.log('Setup progress patch applied successfully!');
    console.log('Instructions:');
    console.log('1. Use updateSetupProgress({item: true}) to update an item');
    console.log('2. For example: updateSetupProgress({recurringExpensesSetup: true})');
    console.log('3. Refresh the page to see changes take effect');
    
    // Provide helper functions
    window.enableAllSetupItems = function() {
        updateSetupProgress({
            accountsSetup: true,
            recurringExpensesSetup: true,
            recurringIncomeSetup: true,
            subscriptionsSetup: true,
            debtSetup: true,
            goalsSetup: true
        });
        console.log('All setup items marked as complete! Refresh the page to see changes.');
    };
    
    window.resetAllSetupItems = function() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('All setup items reset! Refresh the page to see changes.');
    };
    
    // Show the current state
    try {
        const currentProgress = localStorage.getItem(STORAGE_KEY);
        if (currentProgress) {
            console.log('Current setup progress:', JSON.parse(currentProgress));
        } else {
            console.log('No setup progress found in localStorage');
        }
    } catch (error) {
        console.error('Error reading current progress:', error);
    }
})(); 