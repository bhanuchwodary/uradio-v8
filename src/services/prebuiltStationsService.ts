
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
    
    const { data: result, error } = await supabase.functions.invoke('admin-stations', {
      body: { action, ...data },
      headers: {
        'x-admin-password': adminPassword,
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Error in admin manage stations:', error);
      throw new Error(error.message || 'Failed to manage stations');
    }

    console.log('Admin stations function result:', result);
    return result;
  } catch (error) {
    console.error('Error calling admin-stations function:', error);
    throw error;
  }
};
