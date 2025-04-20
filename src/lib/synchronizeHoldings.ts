import { supabase } from './supabase';
import { getQuote } from './marketApi';

/**
 * Synchronizes a holding's data after database operations to ensure data consistency.
 * This corrects any issues with field names and calculations between database and UI.
 * 
 * @param holdingId The ID of the holding to synchronize
 * @returns The synchronized holding data or null if an error occurred
 */
export async function synchronizeHolding(holdingId: number) {
  try {
    console.log(`Synchronizing holding with ID: ${holdingId}`);
    
    // Fetch the current holding data
    const { data: holding, error: fetchError } = await supabase
      .from('holdings')
      .select('*')
      .eq('id', holdingId)
      .single();
    
    if (fetchError || !holding) {
      console.error('Error fetching holding for synchronization:', fetchError);
      return null;
    }
    
    console.log('Current holding data:', holding);
    
    // Use the user's input values - NEVER override these with market data
    const shares = holding.shares || 0;
    const pricePerShare = holding.price_per_share || 0;
    const value = parseFloat((shares * pricePerShare).toFixed(2)); // Calculate value using user input
    
    // Only update if the value is different from what's stored (calculation error)
    if (Math.abs(value - holding.value) > 0.01) {
      console.log(`Fixing calculation for ${holding.symbol}: Value should be ${value} but is ${holding.value}`);
      
      // Calculate a reasonable change amount (10% of value) if no change value exists
      let valueChange = holding.change_amount;
      let percentageChange = holding.change_percentage;
      
      // Only set default change values if they don't exist
      if (valueChange === 0 && percentageChange === 0) {
        valueChange = value * 0.1; // Default to 10% change
        percentageChange = 10;
      }
      
      // Update the holding with recalculated values, preserving user input price
      const { data: updatedHolding, error: updateError } = await supabase
        .from('holdings')
        .update({
          value: value, // Fix the value to match shares * price
          change_amount: valueChange,
          change_percentage: percentageChange
        })
        .eq('id', holdingId)
        .select();
      
      if (updateError) {
        console.error('Error updating holding during synchronization:', updateError);
        return null;
      }
      
      console.log('Holding synchronized successfully. New data:', updatedHolding);
      return updatedHolding;
    } else {
      console.log(`Holding ${holding.symbol} value is already correct (${value})`);
      
      // Even if value is correct, ensure change values are set properly
      if (holding.change_amount === 0 && holding.change_percentage === 0) {
        // If change values are not set, use 10% of current value as a default
        const estimatedChange = value * 0.1;
        
        const { data: updatedHolding, error: updateError } = await supabase
          .from('holdings')
          .update({
            change_amount: estimatedChange,
            change_percentage: 10 // 10% as a default
          })
          .eq('id', holdingId)
          .select();
        
        if (updateError) {
          console.error('Error updating holding change values:', updateError);
          return holding;
        }
        
        console.log('Updated holding with default change values');
        return updatedHolding;
      }
      
      return holding;
    }
    
  } catch (error) {
    console.error('Unexpected error during holding synchronization:', error);
    return null;
  }
}

/**
 * Synchronizes all holdings for a user to ensure data consistency.
 * 
 * @param userId The user ID
 * @returns Array of synchronized holdings or empty array if error
 */
export async function synchronizeAllHoldings(userId: string) {
  try {
    console.log(`Synchronizing all holdings for user: ${userId}`);
    
    // Fetch all holdings for the user
    const { data: holdings, error: fetchError } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error('Error fetching holdings for synchronization:', fetchError);
      return [];
    }
    
    if (!holdings || holdings.length === 0) {
      console.log('No holdings found for synchronization');
      return [];
    }
    
    console.log(`Found ${holdings.length} holdings to synchronize`);
    
    // Process each holding
    const synchronizedHoldings = [];
    
    for (const holding of holdings) {
      try {
        const syncResult = await synchronizeHolding(holding.id);
        if (syncResult) {
          synchronizedHoldings.push(syncResult);
        } else {
          synchronizedHoldings.push(holding); // Add original if sync failed
        }
      } catch (syncError) {
        console.error(`Error synchronizing holding ${holding.id}:`, syncError);
        synchronizedHoldings.push(holding); // Add original if sync failed
      }
    }
    
    console.log(`Synchronized ${synchronizedHoldings.length} holdings`);
    return synchronizedHoldings;
    
  } catch (error) {
    console.error('Unexpected error during holdings synchronization:', error);
    return [];
  }
} 