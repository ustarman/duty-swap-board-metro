import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isMock = !supabaseUrl || supabaseUrl === 'your_supabase_url_here'

// Mock client for development before Supabase is connected
const mockClient = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    setSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => {},
  },
  from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }), insert: async () => ({}) }),
}

export const supabase = isMock ? mockClient : createClient(supabaseUrl, supabaseAnonKey)
