import { createClient } from '@supabase/supabase-js'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
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

        const { name, phone, email, location, program, preferred_college, preferred_course } = await req.json()

        if (!phone) {
            return new Response(
                JSON.stringify({ error: 'Phone number is required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Check if lead exists by phone
        const { data: existingLeads, error: searchError } = await supabaseClient
            .from('leads')
            .select('*')
            .eq('phone', phone)
            .limit(1)

        if (searchError) {
            throw searchError
        }

        let result;
        const leadData = {
            name,
            phone,
            email,
            location,
            program,
            preferred_college,
            preferred_course,
            // Update timestamp if updating
            // created_at is usually immutable, but we might want a 'updated_at' column in future.
            // For now, we just update the fields.
        }

        if (existingLeads && existingLeads.length > 0) {
            // Update existing lead
            const { data, error } = await supabaseClient
                .from('leads')
                .update(leadData)
                .eq('id', existingLeads[0].id)
                .select()
                .single()

            if (error) throw error
            result = data
        } else {
            // Insert new lead
            const { data, error } = await supabaseClient
                .from('leads')
                .insert([leadData])
                .select()
                .single()

            if (error) throw error
            result = data
        }

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
