
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Database {
  public: {
    Tables: {
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
        Update: {
          play_count?: number
          total_play_time?: number
          last_played_at?: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
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

    switch (method) {
      case 'POST':
        // Track station play
        const { station_id, user_session_id, play_time } = await req.json()

        // Check if analytics record exists for this station and session
        const { data: existing } = await supabaseClient
          .from('station_analytics')
          .select('*')
          .eq('station_id', station_id)
          .eq('user_session_id', user_session_id || 'anonymous')
          .single()

        if (existing) {
          // Update existing record
          const { error } = await supabaseClient
            .from('station_analytics')
            .update({
              play_count: existing.play_count + 1,
              total_play_time: existing.total_play_time + (play_time || 0),
              last_played_at: new Date().toISOString()
            })
            .eq('id', existing.id)

          if (error) {
            console.error('Update analytics error:', error)
          }
        } else {
          // Create new record
          const { error } = await supabaseClient
            .from('station_analytics')
            .insert({
              station_id,
              user_session_id: user_session_id || 'anonymous',
              play_count: 1,
              total_play_time: play_time || 0
            })

          if (error) {
            console.error('Insert analytics error:', error)
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'GET':
        // Get analytics data (admin only)
        const { data, error } = await supabaseClient
          .from('station_analytics')
          .select(`
            *,
            prebuilt_stations:station_id (
              name,
              language
            )
          `)
          .order('total_play_time', { ascending: false })

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
