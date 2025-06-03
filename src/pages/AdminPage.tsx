
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Shield } from "lucide-react";
import AdminPasswordDialog from "@/components/admin/AdminPasswordDialog";
import NewAdminStationsManager from "@/components/admin/NewAdminStationsManager";
import AdminDangerZone from "@/components/admin/AdminDangerZone";
import AdminAuthenticationCard from "@/components/admin/AdminAuthenticationCard";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { adminAuthService } from "@/services/adminAuthService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminPage = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Check for existing authentication
  useEffect(() => {
    const hasAuth = adminAuthService.isAdminAuthenticated();
    console.log("Checking admin authentication:", hasAuth);
    if (hasAuth) {
      console.log("Admin already authenticated, showing admin interface");
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
    } else {
      console.log("Admin not authenticated, showing password dialog");
      setIsPasswordDialogOpen(true);
    }
  }, []);

  const handlePasswordSuccess = () => {
    console.log("Authentication successful, showing admin interface");
    setIsPasswordDialogOpen(false);
    setIsAuthenticated(true);
    toast({
      title: "Authentication Successful",
      description: "Welcome to the admin panel"
    });
  };

  const handleSaveStations = () => {
    console.log("Save stations called - handled by NewAdminStationsManager");
  };

  const handleCancel = () => {
    adminAuthService.logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel"
    });
    navigate("/station-list");
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl px-4 space-y-6 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Admin Controls
          </h1>
        </div>

        {isAuthenticated ? (
          <>
            <NewAdminStationsManager onSave={handleSaveStations} onCancel={handleCancel} />
            <AdminAnalytics />
            <AdminDangerZone isMobile={isMobile} />
          </>
        ) : (
          <AdminAuthenticationCard onAuthenticate={() => setIsPasswordDialogOpen(true)} />
        )}

        <AdminPasswordDialog 
          isOpen={isPasswordDialogOpen} 
          onClose={() => {
            setIsPasswordDialogOpen(false);
            if (!isAuthenticated) {
              navigate("/station-list");
            }
          }} 
          onSuccess={handlePasswordSuccess} 
        />
      </div>
    </AppLayout>
  );
};

export default AdminPage;
