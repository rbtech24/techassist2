import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client when credentials are missing
const mockClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: new Error('Auth not configured') }),
    signOut: async () => ({ error: null })
  },
  from: () => ({
    select: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ data: null, error: null })
  })
} as unknown as ReturnType<typeof createClient>;

// Export either real or mock client
export const supabase = supabaseUrl && supabaseKey
  ? createClient<Database>(supabaseUrl, supabaseKey)
  : mockClient;