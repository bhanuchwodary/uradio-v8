
import React, { useState, useEffect } from "react";
import { EnhancedAppLayout } from "@/components/layout/EnhancedAppLayout";
import { Shield } from "lucide-react";
import AdminPasswordDialog from "@/components/admin/AdminPasswordDialog";
import AdminStationsManager from "@/components/admin/AdminStationsManager";
import EnhancedAdminDangerZone from "@/components/admin/EnhancedAdminDangerZone";
import EnhancedAdminAuthenticationCard from "@/components/admin/EnhancedAdminAuthenticationCard";
import { savePrebuiltStations } from "@/utils/prebuiltStationsManager";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

const AdminPage = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Skip the authentication step if coming from StationListPage with successful auth
  useEffect(() => {
    const hasAuth = sessionStorage.getItem("admin_authenticated");
    if (hasAuth === "true") {
      console.log("Admin already authenticated, skipping password dialog");
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
    }
  }, []);

  const handlePasswordSuccess = () => {
    console.log("Authentication successful, showing admin interface");
    setIsPasswordDialogOpen(false);
    setIsAuthenticated(true);
    // Save authentication state to session storage
    sessionStorage.setItem("admin_authenticated", "true");
  };

  const handleSaveStations = (stations: any[]) => {
    // Validate stations before saving
    if (!Array.isArray(stations) || stations.length === 0) {
      toast({
        title: "Error",
        description: "Invalid stations data. Cannot save empty stations list.",
        variant: "destructive"
      });
      return;
    }
    
    if (savePrebuiltStations(stations, true)) {
      toast({
        title: "Changes saved",
        description: "Prebuilt stations have been updated successfully"
      });
      // savePrebuiltStations will handle the redirect
    } else {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    navigate("/station-list");
  };

  return (
    <EnhancedAppLayout>
      <div className="space-y-6">
        <motion.div 
          className="flex items-center justify-between mb-6 flex-wrap gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Admin Controls</h1>
          </div>
        </motion.div>

        {isAuthenticated ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AdminStationsManager onSave={handleSaveStations} onCancel={handleCancel} />
            <EnhancedAdminDangerZone isMobile={isMobile} />
          </motion.div>
        ) : (
          <EnhancedAdminAuthenticationCard onAuthenticate={() => setIsPasswordDialogOpen(true)} />
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
    </EnhancedAppLayout>
  );
};

export default AdminPage;
