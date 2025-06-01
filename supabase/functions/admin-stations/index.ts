
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
  console.log('=== Admin stations function called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
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
    console.log('Admin password provided:', !!adminPassword);
    
    if (!adminPassword || adminPassword !== 'J@b1tw$tr3@w') {
      console.log('Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      console.log('GET request - Fetching all stations');
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

      console.log('Successfully fetched stations:', stations?.length || 0);
      return new Response(JSON.stringify({ stations: stations || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      let requestBody: string;
      try {
        requestBody = await req.text();
        console.log('Raw request body length:', requestBody.length);
        console.log('Raw request body:', requestBody);
      } catch (error) {
        console.error('Error reading request body:', error);
        return new Response(JSON.stringify({ error: 'Failed to read request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!requestBody || requestBody.trim() === '') {
        console.error('Empty request body received');
        return new Response(JSON.stringify({ error: 'Request body is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let body: any;
      try {
        body = JSON.parse(requestBody);
        console.log('Parsed request body:', JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!body || !body.action) {
        console.error('No action specified in request body');
        return new Response(JSON.stringify({ error: 'Action is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Processing action:', body.action);

      switch (body.action) {
        case 'add': {
          const { name, url, language } = body;
          console.log('Adding station:', { name, url, language });
          
          if (!name || !url) {
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
              language: (language || 'Unknown').trim()
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
          return new Response(JSON.stringify({ station: data, success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        case 'update': {
          const { id, name, url, language } = body;
          console.log('Updating station:', { id, name, url, language });
          
          if (!id || !name || !url) {
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
              language: (language || 'Unknown').trim(),
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
          return new Response(JSON.stringify({ station: data, success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        case 'delete': {
          const { id } = body;
          console.log('Deleting station with ID:', id);
          
          if (!id) {
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

        case 'bulk-update': {
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
          if (stations.length > 0) {
            console.log('Inserting new stations');
            const { data, error: insertError } = await supabase
              .from('prebuilt_stations')
              .insert(stations.map((station: Station) => ({
                name: (station.name || '').trim(),
                url: (station.url || '').trim(),
                language: (station.language || 'Unknown').trim()
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
            return new Response(JSON.stringify({ stations: data || [], success: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            console.log('Bulk update successful, no stations to insert');
            return new Response(JSON.stringify({ stations: [], success: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        default:
          console.error('Invalid action specified:', body.action);
          return new Response(JSON.stringify({ error: 'Invalid action specified' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      }
    }

    console.error('Method not allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in admin-stations function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
