
import { supabase } from "@/integrations/supabase/client";

export interface PrebuiltStation {
  id?: string;
  name: string;
  url: string;
  language: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all prebuilt stations from Supabase
 */
export const fetchPrebuiltStations = async (): Promise<PrebuiltStation[]> => {
  try {
    const { data, error } = await supabase
      .from('prebuilt_stations')
      .select('*')
      .order('language', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching prebuilt stations:', error);
      throw new Error('Failed to fetch prebuilt stations');
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchPrebuiltStations:', error);
    return [];
  }
};

/**
 * Admin function to manage prebuilt stations via edge function
 */
export const adminManageStations = async (
  action: 'add' | 'update' | 'delete' | 'bulk-update',
  data: any,
  adminPassword: string
) => {
  try {
    console.log('Calling admin-stations function with action:', action);
    console.log('Data to send:', JSON.stringify(data, null, 2));
    
    // Prepare the request body based on action
    let requestBody: any = { action };
    
    switch (action) {
      case 'add':
        requestBody = {
          action: 'add',
          name: data.name,
          url: data.url,
          language: data.language || 'Unknown'
        };
        break;
      case 'update':
        requestBody = {
          action: 'update',
          id: data.id,
          name: data.name,
          url: data.url,
          language: data.language || 'Unknown'
        };
        break;
      case 'delete':
        requestBody = {
          action: 'delete',
          id: data.id
        };
        break;
      case 'bulk-update':
        requestBody = {
          action: 'bulk-update',
          stations: data.stations
        };
        break;
    }
    
    console.log('Final request body:', JSON.stringify(requestBody, null, 2));
    
    const { data: result, error } = await supabase.functions.invoke('admin-stations', {
      body: requestBody,
      headers: {
        'x-admin-password': adminPassword,
        'Content-Type': 'application/json'
      }
    });

    console.log('Supabase function response:', { result, error });

    if (error) {
      console.error('Supabase function error details:', error);
      throw new Error(`Function error: ${error.message || 'Unknown error'}`);
    }

    // Check if the result contains an error
    if (result && result.error) {
      console.error('Function returned error:', result.error);
      throw new Error(result.error);
    }

    console.log('Admin stations function successful result:', result);
    return result;
  } catch (error) {
    console.error('Error in adminManageStations:', error);
    throw error;
  }
};
