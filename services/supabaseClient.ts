import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both standard Node.js env vars and Next.js public env vars
// Falls back to the provided hardcoded keys for immediate functionality in this environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dcxymobilgfwrfidcuel.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjeHltb2JpbGdmd3JmaWRjdWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDE4NTksImV4cCI6MjA3OTMxNzg1OX0.1YKqJka_Tom_M4lHujWA23Dz7B0yEgSPBgb8qgefmXA";

export const isSupabaseConfigured = (): boolean => {
  console.log('Supabase Config Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl?.length,
    keyLength: supabaseKey?.length
  });
  return !!supabaseUrl && !!supabaseKey;
};

// Only create the client if the configuration exists
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;