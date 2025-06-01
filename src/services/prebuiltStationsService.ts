
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
    console.log('Request data:', JSON.stringify(data));
    
    const requestBody = { action, ...data };
    console.log('Full request body:', JSON.stringify(requestBody));
    
    const { data: result, error } = await supabase.functions.invoke('admin-stations', {
      body: requestBody,
      headers: {
        'x-admin-password': adminPassword,
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to manage stations');
    }

    // Check if the result contains an error
    if (result && result.error) {
      console.error('Function returned error:', result.error);
      throw new Error(result.error);
    }

    console.log('Admin stations function result:', result);
    return result;
  } catch (error) {
    console.error('Error calling admin-stations function:', error);
    throw error;
  }
};
