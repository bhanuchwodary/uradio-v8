
import React from "react";
import { CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Upload } from "lucide-react";

interface AdminStationsHeaderProps {
  onAddStation: () => void;
  onToggleImport: () => void;
  showImport: boolean;
  isMobile: boolean;
}

const AdminStationsHeader: React.FC<AdminStationsHeaderProps> = ({ 
  onAddStation, 
  onToggleImport, 
  showImport, 
  isMobile 
}) => {
  return (
    <CardHeader className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admin Station Manager
        </CardTitle>
        <CardDescription>
          Add, edit or remove prebuilt radio stations
        </CardDescription>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onAddStation} 
          size={isMobile ? "sm" : "default"} 
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Station
        </Button>
        <Button 
          onClick={onToggleImport} 
          size={isMobile ? "sm" : "default"} 
          variant="outline"
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4" /> {showImport ? 'Hide Import' : 'Bulk Import'}
        </Button>
      </div>
    </CardHeader>
  );
};

export default AdminStationsHeader;
