
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Station {
  id?: string;
  name: string;
  url: string;
  language: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { method } = req;
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Simple authentication check - in production, you'd want proper JWT validation
    const authHeader = req.headers.get('authorization');
    const adminPassword = req.headers.get('x-admin-password');
    
    if (!adminPassword || adminPassword !== 'J@b1tw$tr3@w') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'GET') {
      // Get all prebuilt stations
      const { data: stations, error } = await supabase
        .from('prebuilt_stations')
        .select('*')
        .order('language', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching stations:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch stations' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ stations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST') {
      const body = await req.json();

      if (action === 'add') {
        const { name, url, language } = body as Station;
        
        const { data, error } = await supabase
          .from('prebuilt_stations')
          .insert({ name, url, language })
          .select()
          .single();

        if (error) {
          console.error('Error adding station:', error);
          return new Response(JSON.stringify({ error: 'Failed to add station. URL may already exist.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ station: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'update') {
        const { id, name, url, language } = body as Station;
        
        const { data, error } = await supabase
          .from('prebuilt_stations')
          .update({ name, url, language, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating station:', error);
          return new Response(JSON.stringify({ error: 'Failed to update station' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ station: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'bulk-update') {
        const { stations } = body;
        
        // Delete all existing stations and insert new ones
        const { error: deleteError } = await supabase
          .from('prebuilt_stations')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) {
          console.error('Error deleting stations:', deleteError);
          return new Response(JSON.stringify({ error: 'Failed to clear existing stations' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Insert new stations
        const { data, error: insertError } = await supabase
          .from('prebuilt_stations')
          .insert(stations.map((station: Station) => ({
            name: station.name,
            url: station.url,
            language: station.language
          })))
          .select();

        if (insertError) {
          console.error('Error inserting stations:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to update stations' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ stations: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (method === 'DELETE') {
      const body = await req.json();
      const { id } = body;
      
      const { error } = await supabase
        .from('prebuilt_stations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting station:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete station' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-stations function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
