import { useState, useMemo, useEffect, useCallback } from 'react';
import { CircleDollarSign, Car, Home, Plane, GraduationCap, Briefcase, LucideIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export type Contribution = {
  frequency: string;
  amount: number;
};

export type Goal = {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  contributions: Contribution;
};

export type GoalWithProgress = Goal & {
  progressPercent: number;
  remaining: number;
  monthsRemaining: number;
  monthsToComplete: number;
  completionDate: Date;
  onTrack: boolean;
};

export type NewGoal = Omit<Goal, 'id' | 'icon'> & {
  iconName?: string;
};

export type FinancialGoal = {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
};

export type GoalMonthlyContribution = Database['public']['Tables']['goal_monthly_contributions']['Row'];

export type GoalsState = {
  activeTab: 'progress' | 'timeline';
  goals: Goal[];
  goalsWithProgress: GoalWithProgress[];
  inProgressGoals: GoalWithProgress[];
  timelineGoals: GoalWithProgress[];
  activeGoals: GoalWithProgress[];
  totalMonthlyContribution: number;
  setActiveTab: (tab: 'progress' | 'timeline') => void;
  addGoal: (goal: NewGoal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  financialGoals: FinancialGoal[];
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFinancialGoal: (id: number, goal: Partial<FinancialGoal>) => Promise<void>;
  deleteFinancialGoal: (id: number) => Promise<void>;
  refreshFinancialGoals: () => Promise<void>;
  updateGoalContribution: (goalId: number, amount: number, month: string) => Promise<boolean>;
};

// Helper function to map icon names to actual Lucide icons
const getIconByName = (iconName: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    'CircleDollarSign': CircleDollarSign,
    'Car': Car,
    'Home': Home,
    'Plane': Plane,
    'GraduationCap': GraduationCap,
    'Briefcase': Briefcase
  };
  
  return icons[iconName] || CircleDollarSign; // Default to CircleDollarSign if icon not found
};

// Initialize Supabase client outside the hook
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export function useGoalsData(): GoalsState {
  const [activeTab, setActiveTab] = useState<'progress' | 'timeline'>('progress');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch goals from the database
  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Query goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('financial_goals')
        .select('*');
      
      if (goalsError) throw goalsError;

      // Query all monthly contributions for these goals
      const { data: monthlyContributions, error: contributionsError } = await supabase
        .from('goal_monthly_contributions')
        .select('*')
        .in('goal_id', goalsData?.map(g => g.id) || []);

      if (contributionsError) throw contributionsError;

      if (goalsData) {
        // Transform to match the Goal type
        const transformedGoals: Goal[] = goalsData.map(goal => ({
          id: goal.id,
          name: goal.name,
          icon: getIconByName(goal.icon),
          color: goal.color,
          currentAmount: goal.current_amount,
          targetAmount: goal.target_amount,
          targetDate: goal.target_date,
          contributions: {
            frequency: goal.contribution_frequency,
            amount: goal.contribution_amount
          }
        }));
        
        setGoals(transformedGoals);
        setFinancialGoals(goalsData.map(goal => ({
          id: goal.id,
          name: goal.name,
          targetAmount: goal.target_amount,
          currentAmount: goal.current_amount,
          monthlyContribution: goal.contribution_amount,
          targetDate: goal.target_date,
          createdAt: goal.created_at,
          updatedAt: goal.updated_at
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);
  
  // Add a new goal
  const addGoal = useCallback(async (goal: NewGoal) => {
    try {
      // Get the current authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(userError.message);
      }
      
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }
      
      // Use the provided iconName or default to CircleDollarSign
      const iconName = goal.iconName || 'CircleDollarSign';
      
      const { error } = await supabase
        .from('financial_goals')
        .insert({
          name: goal.name,
          icon: iconName,
          color: goal.color,
          current_amount: goal.currentAmount,
          target_amount: goal.targetAmount,
          target_date: goal.targetDate,
          contribution_frequency: goal.contributions.frequency,
          contribution_amount: goal.contributions.amount,
          user_id: userData.user.id
        });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh goals
      await fetchGoals();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error adding goal:', err);
    }
  }, [fetchGoals]);
  
  // Update an existing goal
  const updateGoal = useCallback(async (goal: Goal) => {
    try {
      // Find the icon name from the icon object
      const iconName = Object.entries({
        'CircleDollarSign': CircleDollarSign,
        'Car': Car,
        'Home': Home,
        'Plane': Plane,
        'GraduationCap': GraduationCap,
        'Briefcase': Briefcase
      }).find(([_, icon]) => icon === goal.icon)?.[0] || 'CircleDollarSign';
      
      const { error } = await supabase
        .from('financial_goals')
        .update({
          name: goal.name,
          icon: iconName,
          color: goal.color,
          current_amount: goal.currentAmount,
          target_amount: goal.targetAmount,
          target_date: goal.targetDate,
          contribution_frequency: goal.contributions.frequency,
          contribution_amount: goal.contributions.amount
        })
        .eq('id', goal.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh goals
      await fetchGoals();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error updating goal:', err);
    }
  }, [fetchGoals]);
  
  // Delete a goal
  const deleteGoal = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh goals
      await fetchGoals();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error deleting goal:', err);
    }
  }, [fetchGoals]);
  
  // Fetch goals on initial load
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);
  
  // Calculate progress percentages and sort goals
  const goalsWithProgress = useMemo(() => {
    if (goals.length === 0) return [];
    
    return goals.map(goal => {
      const progressPercent = Math.round((goal.currentAmount / goal.targetAmount) * 100);
      const remaining = goal.targetAmount - goal.currentAmount;
      
      // Calculate months until target date
      const today = new Date();
      const targetDate = new Date(goal.targetDate);
      const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                            targetDate.getMonth() - today.getMonth();
      
      // Estimate completion date based on current contributions
      const monthsToComplete = goal.contributions.amount > 0 
        ? remaining / goal.contributions.amount 
        : Infinity;
      const completionDate = new Date();
      completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
      
      // Check if on track
      const onTrack = monthsToComplete <= monthsRemaining;
      
      return {
        ...goal,
        progressPercent,
        remaining,
        monthsRemaining,
        monthsToComplete: Math.ceil(monthsToComplete),
        completionDate,
        onTrack
      };
    });
  }, [goals]);
  
  // Sort by progress for "In Progress" tab
  const inProgressGoals = useMemo(() => {
    return [...goalsWithProgress]
      .filter(goal => goal.progressPercent < 100)
      .sort((a, b) => b.progressPercent - a.progressPercent);
  }, [goalsWithProgress]);
  
  // Sort by completion date for "Timeline" tab  
  const timelineGoals = useMemo(() => {
    return [...goalsWithProgress]
      .filter(goal => goal.progressPercent < 100)
      .sort((a, b) => a.completionDate.getTime() - b.completionDate.getTime());
  }, [goalsWithProgress]);
  
  // Active goals based on tab
  const activeGoals = useMemo(() => {
    return activeTab === 'progress' ? inProgressGoals : timelineGoals;
  }, [activeTab, inProgressGoals, timelineGoals]);
  
  // Calculate total monthly contribution
  const totalMonthlyContribution = useMemo(() => {
    return goals.reduce((sum, goal) => sum + goal.contributions.amount, 0);
  }, [goals]);

  const updateGoalContribution = useCallback(async (goalId: number, amount: number, month: string) => {
    try {
      // First check if there's an existing contribution for this month
      const { data: existingContribution, error: fetchError } = await supabase
        .from('goal_monthly_contributions')
        .select('*')
        .eq('goal_id', goalId)
        .eq('month', month)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingContribution) {
        // Update existing contribution
        const { error } = await supabase
          .from('goal_monthly_contributions')
          .update({ amount })
          .eq('id', existingContribution.id);

        if (error) throw error;
      } else {
        // Insert new contribution
        const { error } = await supabase
          .from('goal_monthly_contributions')
          .insert({
            goal_id: goalId,
            month,
            amount
          });

        if (error) throw error;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error updating goal contribution:', err);
      return false;
    }
  }, [supabase]);

  return {
    activeTab,
    goals,
    goalsWithProgress,
    inProgressGoals,
    timelineGoals,
    activeGoals,
    totalMonthlyContribution,
    setActiveTab,
    addGoal,
    updateGoal,
    deleteGoal,
    isLoading,
    error,
    refetch: fetchGoals,
    financialGoals,
    addFinancialGoal: async (goal) => {
      // Implementation will be added
    },
    updateFinancialGoal: async (id, goal) => {
      // Implementation will be added
    },
    deleteFinancialGoal: async (id) => {
      // Implementation will be added
    },
    refreshFinancialGoals: async () => {
      // Implementation will be added
    },
    updateGoalContribution
  };
} 