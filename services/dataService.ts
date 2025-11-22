import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, InteractionLog } from '../types';
import { COLLEGE_DATA } from '../constants';

// Helper to generate UUIDs client-side to avoid needing RLS 'select' permissions
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create a new lead in the database
export const createLead = async (user: User): Promise<User> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("Supabase not configured. Storing locally only.");
    return { ...user, id: 'local-' + Date.now() };
  }

  try {
    // Use existing ID (e.g., from Auth) or generate a new one
    const newId = user.id || generateUUID();

    // Map frontend User object to DB columns
    const payload = {
      id: newId,
      name: user.name, 
      phone: user.phone,
      email: user.email || null,
      location: user.location || null,
      preferred_college: user.preferred_college || null,
      preferred_course: user.preferred_course || null,
      program: user.program || null
    };

    const { error } = await supabase
      .from('leads')
      .insert([payload]);
    // NOTE: Do NOT chain .select() here. 
    // The RLS policy prevents public users from reading data, even what they just inserted.

    if (error) {
      console.error("Supabase Insert Error Details:", JSON.stringify(error, null, 2));
      throw error;
    }
    
    // Return the user object with the ID used
    return { ...user, id: newId };
  } catch (error: any) {
    console.error("Error creating lead:", error.message || error);
    // Fallback to local ID if DB fails, to allow app to function
    return { ...user, id: 'offline-' + Date.now() };
  }
};

// Log chat interaction and detect college interest
export const logInteraction = async (log: InteractionLog): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    // Simple keyword matching to detect which colleges the user is interested in
    const interestTags = COLLEGE_DATA
      .filter(college => 
        log.message.toLowerCase().includes(college.name.toLowerCase()) ||
        (college.name.includes('IIT') && log.message.toLowerCase().includes('iit')) ||
        (college.name.includes('VIT') && log.message.toLowerCase().includes('vit')) ||
        (college.name.includes('SRM') && log.message.toLowerCase().includes('srm'))
      )
      .map(c => c.name);

    const finalTags = Array.from(new Set([...log.detected_colleges, ...interestTags]));

    // Validate User ID format (must be UUID for Postgres)
    if (log.user_id.startsWith('local-') || log.user_id.startsWith('offline-')) {
      return;
    }

    const { error } = await supabase
      .from('interactions')
      .insert([{
        user_id: log.user_id,
        message: log.message,
        bot_response: log.bot_response,
        detected_colleges: finalTags
      }]);

    if (error) {
       console.error("Supabase Log Error:", JSON.stringify(error, null, 2));
    }
  } catch (error) {
    console.error("Error logging interaction:", error);
  }
};

// --- Admin Features ---

export const fetchLeads = async (): Promise<User[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  
  // RLS Policy: This will only return data if the user is Authenticated (Admin)
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching leads (Auth required):", error.message);
    return [];
  }
  return data as User[] || [];
};

export const fetchInteractions = async (): Promise<any[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];

  // RLS Policy: This will only return data if the user is Authenticated (Admin)
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      *,
      leads (name, phone, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching interactions (Auth required):", error.message);
    return [];
  }
  return data || [];
};