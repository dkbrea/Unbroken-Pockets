export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      budget_categories: {
        Row: {
          id: number
          name: string
          allocated: number
          spent: number
          icon: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          allocated: number
          spent: number
          icon: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          allocated?: number
          spent?: number
          icon?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      budget_periods: {
        Row: {
          id: number
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cash_flow: {
        Row: {
          id: number
          month: string
          income: number
          expenses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          month: string
          income: number
          expenses: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          month?: string
          income?: number
          expenses?: number
          created_at?: string
          updated_at?: string
        }
      }
      financial_goals: {
        Row: {
          id: number
          name: string
          icon: string
          color: string
          current_amount: number
          target_amount: number
          target_date: string
          contribution_frequency: string
          contribution_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          icon: string
          color: string
          current_amount: number
          target_amount: number
          target_date: string
          contribution_frequency: string
          contribution_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          icon?: string
          color?: string
          current_amount?: number
          target_amount?: number
          target_date?: string
          contribution_frequency?: string
          contribution_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      investment_portfolio: {
        Row: {
          id: number
          total_value: number
          change_amount: number
          change_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          total_value: number
          change_amount: number
          change_percentage: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          total_value?: number
          change_amount?: number
          change_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_performance: {
        Row: {
          id: number
          time_range: string
          amount: number
          percentage: number
          portfolio_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          time_range: string
          amount: number
          percentage: number
          portfolio_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          time_range?: string
          amount?: number
          percentage?: number
          portfolio_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      asset_allocation: {
        Row: {
          id: number
          name: string
          value: number
          percentage: number
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          value: number
          percentage: number
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          value?: number
          percentage?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      investment_accounts: {
        Row: {
          id: number
          name: string
          institution: string
          balance: number
          change_amount: number
          change_percentage: number
          account_type: string
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          institution: string
          balance: number
          change_amount: number
          change_percentage: number
          account_type: string
          last_updated: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          institution?: string
          balance?: number
          change_amount?: number
          change_percentage?: number
          account_type?: string
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
      }
      holdings: {
        Row: {
          id: number
          symbol: string
          name: string
          value: number
          shares: number
          price_per_share: number
          change_amount: number
          change_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          symbol: string
          name: string
          value: number
          shares: number
          price_per_share: number
          change_amount: number
          change_percentage: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          symbol?: string
          name?: string
          value?: number
          shares?: number
          price_per_share?: number
          change_amount?: number
          change_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      report_types: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          icon: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      spending_categories: {
        Row: {
          id: number
          report_type_id: string | null
          category: string
          amount: number
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          report_type_id?: string | null
          category: string
          amount: number
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          report_type_id?: string | null
          category?: string
          amount?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: number
          name: string
          institution: string
          balance: number
          type: string
          last_updated: string
          is_hidden: boolean
          icon: string | null
          color: string | null
          account_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          institution: string
          balance: number
          type: string
          last_updated: string
          is_hidden?: boolean
          icon?: string | null
          color?: string | null
          account_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          institution?: string
          balance?: number
          type?: string
          last_updated?: string
          is_hidden?: boolean
          icon?: string | null
          color?: string | null
          account_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: number
          date: string
          name: string
          category: string
          amount: number
          account: string
          logo: string | null
          is_reconciled: boolean
          notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          date: string
          name: string
          category: string
          amount: number
          account: string
          logo?: string | null
          is_reconciled?: boolean
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          date?: string
          name?: string
          category?: string
          amount?: number
          account?: string
          logo?: string | null
          is_reconciled?: boolean
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          avatar: string | null
          created_at: string
          last_login: string
          is_email_verified: boolean
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          avatar?: string | null
          created_at?: string
          last_login?: string
          is_email_verified?: boolean
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar?: string | null
          created_at?: string
          last_login?: string
          is_email_verified?: boolean
        }
      }
      user_preferences: {
        Row: {
          id: number
          user_id: string
          currency: string
          date_format: string
          theme: string
          hide_balances: boolean
          email_notifications: boolean
          browser_notifications: boolean
          mobile_notifications: boolean
          dashboard_widgets: string[]
          setup_progress: {
            accountsSetup: boolean
            recurringExpensesSetup: boolean
            recurringIncomeSetup: boolean
            subscriptionsSetup: boolean
            debtSetup: boolean
            goalsSetup: boolean
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          currency?: string
          date_format?: string
          theme?: string
          hide_balances?: boolean
          email_notifications?: boolean
          browser_notifications?: boolean
          mobile_notifications?: boolean
          dashboard_widgets?: string[]
          setup_progress?: {
            accountsSetup?: boolean
            recurringExpensesSetup?: boolean
            recurringIncomeSetup?: boolean
            subscriptionsSetup?: boolean
            debtSetup?: boolean
            goalsSetup?: boolean
          } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          currency?: string
          date_format?: string
          theme?: string
          hide_balances?: boolean
          email_notifications?: boolean
          browser_notifications?: boolean
          mobile_notifications?: boolean
          dashboard_widgets?: string[]
          setup_progress?: {
            accountsSetup?: boolean
            recurringExpensesSetup?: boolean
            recurringIncomeSetup?: boolean
            subscriptionsSetup?: boolean
            debtSetup?: boolean
            goalsSetup?: boolean
          } | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          timestamp: string
          type: string
          source: string
          is_read: boolean
          action_url: string | null
          action_label: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          title: string
          message: string
          timestamp?: string
          type: string
          source: string
          is_read?: boolean
          action_url?: string | null
          action_label?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          timestamp?: string
          type?: string
          source?: string
          is_read?: boolean
          action_url?: string | null
          action_label?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      debts: {
        Row: {
          id: number
          name: string
          balance: number
          interest_rate: number
          minimum_payment: number
          category: string | null
          lender: string | null
          notes: string | null
          due_date: number | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          balance: number
          interest_rate: number
          minimum_payment: number
          category?: string | null
          lender?: string | null
          notes?: string | null
          due_date?: number | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          balance?: number
          interest_rate?: number
          minimum_payment?: number
          category?: string | null
          lender?: string | null
          notes?: string | null
          due_date?: number | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 