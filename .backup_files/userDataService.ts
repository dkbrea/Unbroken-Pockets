import { createClient } from '@/lib/supabase/client';
import { getCurrentUserId } from './accountService';

/**
 * Generic helper service to ensure all data is filtered by the current user ID
 * Use these methods instead of direct Supabase queries to ensure proper user isolation
 */

/**
 * Get data from any table, filtered by the current user's ID
 * @param table The table name to query
 * @param options Additional query options
 * @returns Data belonging to the current user
 */
export async function getUserData(table: string, options: {
  select?: string,
  order?: { column: string, ascending?: boolean },
  limit?: number,
  filters?: Record<string, any>
} = {}) {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Start the query with the table and user_id filter
    let query = supabase
      .from(table)
      .select(options.select || '*')
      .eq('user_id', userId);
    
    // Apply any additional filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    // Apply ordering if specified
    if (options.order) {
      const { column, ascending = true } = options.order;
      query = query.order(column, { ascending });
    }
    
    // Apply limit if specified
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${table} data:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Unexpected error fetching ${table} data:`, error);
    return [];
  }
}

/**
 * Insert data into any table, automatically adding the current user's ID
 * @param table The table name to insert into
 * @param data The data to insert (user_id will be added automatically)
 * @returns The inserted data if successful
 */
export async function insertUserData(table: string, data: Record<string, any>) {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Add user_id to the data
    const dataWithUserId = {
      ...data,
      user_id: userId
    };
    
    const { data: insertedData, error } = await supabase
      .from(table)
      .insert(dataWithUserId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      return null;
    }
    
    return insertedData;
  } catch (error) {
    console.error(`Unexpected error inserting into ${table}:`, error);
    return null;
  }
}

/**
 * Update data in any table, ensuring it belongs to the current user
 * @param table The table name to update
 * @param id The ID of the record to update
 * @param data The data to update
 * @returns The updated data if successful
 */
export async function updateUserData(table: string, id: number | string, data: Record<string, any>) {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Update data only if it belongs to the current user
    const { data: updatedData, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .eq('user_id', userId) // Ensure the record belongs to the current user
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${table} record:`, error);
      return null;
    }
    
    return updatedData;
  } catch (error) {
    console.error(`Unexpected error updating ${table} record:`, error);
    return null;
  }
}

/**
 * Delete data from any table, ensuring it belongs to the current user
 * @param table The table name to delete from
 * @param id The ID of the record to delete
 * @returns True if successful
 */
export async function deleteUserData(table: string, id: number | string) {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Delete data only if it belongs to the current user
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure the record belongs to the current user
    
    if (error) {
      console.error(`Error deleting ${table} record:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Unexpected error deleting ${table} record:`, error);
    return false;
  }
}

/**
 * Delete all user data from a specific table
 * @param table The table name to clear
 * @returns True if successful
 */
export async function clearUserData(table: string) {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Delete all data belonging to the current user
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error(`Error clearing ${table} data:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Unexpected error clearing ${table} data:`, error);
    return false;
  }
} 