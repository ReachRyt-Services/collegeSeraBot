import { createClient } from '@supabase/supabase-js'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // 1. Fetch all leads
        const { data: leads, error: fetchError } = await supabaseClient
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false }) // Latest first

        if (fetchError) throw fetchError

        const leadsByPhone = new Map();
        const stats = {
            total_leads: leads.length,
            duplicates_found: 0,
            leads_merged: 0,
            interactions_moved: 0
        };

        // 2. Group by phone
        for (const lead of leads) {
            if (!lead.phone) continue;
            const phone = lead.phone.trim(); // Normalize?
            if (!leadsByPhone.has(phone)) {
                leadsByPhone.set(phone, []);
            }
            leadsByPhone.get(phone).push(lead);
        }

        // 3. Process duplicates
        for (const [phone, group] of leadsByPhone) {
            if (group.length > 1) {
                stats.duplicates_found += (group.length - 1);

                // Master is the first one (latest created because of sort order)
                // We keep the latest one because it likely has the most recent user preferences
                const master = group[0];
                const duplicates = group.slice(1);

                for (const duplicate of duplicates) {
                    // A. Move interactions to master
                    const { error: moveError, count } = await supabaseClient
                        .from('interactions')
                        .update({ user_id: master.id })
                        .eq('user_id', duplicate.id)
                        .select('id', { count: 'exact' }) // Get count of moved items

                    if (moveError) console.error(`Error moving interactions for ${duplicate.id}:`, moveError);
                    if (count) stats.interactions_moved += count;

                    // B. Delete duplicate lead
                    const { error: deleteError } = await supabaseClient
                        .from('leads')
                        .delete()
                        .eq('id', duplicate.id)

                    if (deleteError) {
                        console.error(`Error deleting duplicate ${duplicate.id}:`, deleteError);
                    } else {
                        stats.leads_merged++;
                    }
                }
            }
        }

        return new Response(
            JSON.stringify({ message: 'Cleanup complete', stats }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
