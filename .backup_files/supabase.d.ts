declare module '@supabase/ssr' {
  export function createBrowserClient(
    supabaseUrl: string, 
    supabaseKey: string, 
    options?: any
  ): any
  
  export function createServerClient(
    supabaseUrl: string, 
    supabaseKey: string,
    options?: any
  ): any
  
  export type CookieOptions = {
    name?: string
    value?: string
    maxAge?: number
    domain?: string
    path?: string
    expires?: Date
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }
} 