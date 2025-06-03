
import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ghuieymlmxycydzzsmmv.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWlleW1sbXh5Y3lkenpzbW12Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg0NDM0MSwiZXhwIjoyMDY0NDIwMzQxfQ.Hqo5xaOLBT-5iQ5lj3mJUOEANsUPH4Rd92E4RlPjhXo";

// Admin client with service role key - bypasses RLS
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

class AdminAuthService {
  private isAuthenticated = false;
  private readonly ADMIN_PASSWORD = "admin123"; // In production, this should be more secure

  authenticate(password: string): boolean {
    this.isAuthenticated = password === this.ADMIN_PASSWORD;
    if (this.isAuthenticated) {
      sessionStorage.setItem("admin_authenticated", "true");
    }
    return this.isAuthenticated;
  }

  isAdminAuthenticated(): boolean {
    return this.isAuthenticated || sessionStorage.getItem("admin_authenticated") === "true";
  }

  logout(): void {
    this.isAuthenticated = false;
    sessionStorage.removeItem("admin_authenticated");
  }

  getAdminClient() {
    if (!this.isAdminAuthenticated()) {
      throw new Error("Admin authentication required");
    }
    return adminClient;
  }
}

export const adminAuthService = new AdminAuthService();
