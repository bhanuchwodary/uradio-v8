
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-password',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface Station {
  id?: string;
  name: string;
  url: string;
  language: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin stations function called:', req.method, req.url);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authentication check
    const adminPassword = req.headers.get('x-admin-password');
    console.log('Admin password received:', !!adminPassword);
    
    if (!adminPassword || adminPassword !== 'J@b1tw$tr3@w') {
      console.log('Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      console.log('Fetching all stations');
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

    if (req.method === 'POST') {
      let body;
      try {
        const requestText = await req.text();
        console.log('Raw request body received:', requestText);
        
        if (!requestText || requestText.trim() === '') {
          console.error('Empty request body received');
          return new Response(JSON.stringify({ error: 'Request body is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        body = JSON.parse(requestText);
        console.log('Parsed request body:', body);
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!body.action) {
        console.error('No action specified in request body');
        return new Response(JSON.stringify({ error: 'Action is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Processing action:', body.action);

      if (body.action === 'add') {
        const { name, url, language } = body as Station;
        console.log('Adding station:', { name, url, language });
        
        if (!name || !url) {
          console.error('Missing required fields for add operation');
          return new Response(JSON.stringify({ error: 'Name and URL are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const { data, error } = await supabase
          .from('prebuilt_stations')
          .insert({ 
            name: name.trim(), 
            url: url.trim(), 
            language: language?.trim() || 'Unknown' 
          })
          .select()
          .single();

        if (error) {
          console.error('Database error adding station:', error);
          return new Response(JSON.stringify({ 
            error: error.code === '23505' ? 'Station URL already exists' : 'Failed to add station'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Station added successfully:', data);
        return new Response(JSON.stringify({ station: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (body.action === 'update') {
        const { id, name, url, language } = body as Station;
        console.log('Updating station:', { id, name, url, language });
        
        if (!id || !name || !url) {
          console.error('Missing required fields for update operation');
          return new Response(JSON.stringify({ error: 'ID, name and URL are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const { data, error } = await supabase
          .from('prebuilt_stations')
          .update({ 
            name: name.trim(), 
            url: url.trim(), 
            language: language?.trim() || 'Unknown', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Database error updating station:', error);
          return new Response(JSON.stringify({ 
            error: error.code === '23505' ? 'Station URL already exists' : 'Failed to update station'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Station updated successfully:', data);
        return new Response(JSON.stringify({ station: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (body.action === 'delete') {
        const { id } = body;
        console.log('Deleting station with ID:', id);
        
        if (!id) {
          console.error('Missing ID for delete operation');
          return new Response(JSON.stringify({ error: 'Station ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const { error } = await supabase
          .from('prebuilt_stations')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Database error deleting station:', error);
          return new Response(JSON.stringify({ error: 'Failed to delete station' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Station deleted successfully');
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (body.action === 'bulk-update') {
        const { stations } = body;
        console.log('Bulk updating stations, count:', stations?.length);
        
        if (!Array.isArray(stations)) {
          return new Response(JSON.stringify({ error: 'Stations array is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Delete all existing stations
        console.log('Deleting existing stations');
        const { error: deleteError } = await supabase
          .from('prebuilt_stations')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) {
          console.error('Error deleting existing stations:', deleteError);
          return new Response(JSON.stringify({ error: 'Failed to clear existing stations' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Insert new stations
        console.log('Inserting new stations');
        const { data, error: insertError } = await supabase
          .from('prebuilt_stations')
          .insert(stations.map((station: Station) => ({
            name: station.name?.trim() || '',
            url: station.url?.trim() || '',
            language: station.language?.trim() || 'Unknown'
          })))
          .select();

        if (insertError) {
          console.error('Error inserting new stations:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to insert new stations' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Bulk update successful, inserted:', data?.length);
        return new Response(JSON.stringify({ stations: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid action specified' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in admin-stations function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
