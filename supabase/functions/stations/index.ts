
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Database {
  public: {
    Tables: {
      prebuilt_stations: {
        Row: {
          id: string
          name: string
          url: string
          language: string
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          name: string
          url: string
          language?: string
          is_active?: boolean
          created_by?: string
        }
        Update: {
          name?: string
          url?: string
          language?: string
          is_active?: boolean
        }
      }
      station_analytics: {
        Row: {
          id: string
          station_id: string
          user_session_id: string | null
          play_count: number
          total_play_time: number
          last_played_at: string
          created_at: string
        }
        Insert: {
          station_id: string
          user_session_id?: string
          play_count?: number
          total_play_time?: number
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method } = req
    const url = new URL(req.url)
    const stationId = url.searchParams.get('id')

    switch (method) {
      case 'GET':
        // Get all active stations or specific station
        if (stationId) {
          const { data, error } = await supabaseClient
            .from('prebuilt_stations')
            .select('*')
            .eq('id', stationId)
            .eq('is_active', true)
            .single()

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          const { data, error } = await supabaseClient
            .from('prebuilt_stations')
            .select('*')
            .eq('is_active', true)
            .order('language')
            .order('name')

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        // Create new station (admin only)
        const newStation = await req.json()
        
        const { data: insertData, error: insertError } = await supabaseClient
          .from('prebuilt_stations')
          .insert({
            name: newStation.name,
            url: newStation.url,
            language: newStation.language || 'Unknown',
            created_by: (await supabaseClient.auth.getUser()).data.user?.id
          })
          .select()
          .single()

        if (insertError) {
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify(insertData), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        // Update station (admin only)
        if (!stationId) {
          return new Response(JSON.stringify({ error: 'Station ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        const updateData = await req.json()
        
        const { data: updatedData, error: updateError } = await supabaseClient
          .from('prebuilt_stations')
          .update({
            name: updateData.name,
            url: updateData.url,
            language: updateData.language,
            is_active: updateData.is_active
          })
          .eq('id', stationId)
          .select()
          .single()

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify(updatedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        // Soft delete station (super admin only)
        if (!stationId) {
          return new Response(JSON.stringify({ error: 'Station ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        const { error: deleteError } = await supabaseClient
          .from('prebuilt_stations')
          .update({ is_active: false })
          .eq('id', stationId)

        if (deleteError) {
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
