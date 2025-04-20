export type Account = {
  id: number;
  name: string;
  institution: string;
  balance: number;
  type: string;
  last_updated: string; // Date in ISO format
  is_hidden: boolean;
  icon?: string | null;
  color?: string | null;
  account_number?: string | null;
  notes?: string | null;
  user_id: string; // UUID of the user
  created_at: string;
  updated_at: string;
}; 