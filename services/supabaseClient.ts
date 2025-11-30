import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both standard Node.js env vars and Next.js public env vars
// Falls back to the provided hardcoded keys for immediate functionality in this environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseKey;
};

// Only create the client if the configuration exists
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;