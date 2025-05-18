export interface Database {
  public: {
    Tables: {
      setup_progress: {
        Row: {
          user_id: string
          accounts_setup: boolean
          budget_setup: boolean
          categories_setup: boolean
          recurring_setup: boolean
          preferences_setup: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          accounts_setup?: boolean
          budget_setup?: boolean
          categories_setup?: boolean
          recurring_setup?: boolean
          preferences_setup?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          accounts_setup?: boolean
          budget_setup?: boolean
          categories_setup?: boolean
          recurring_setup?: boolean
          preferences_setup?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: string
          currency: string
          language: string
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          currency?: string
          language?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: string
          currency?: string
          language?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string
          amount: number
          type: 'income' | 'expense'
          description: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id: string
          amount: number
          type: 'income' | 'expense'
          description: string
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string
          amount?: number
          type?: 'income' | 'expense'
          description?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          balance: number
          institution: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          balance: number
          institution: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          balance?: number
          institution?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 