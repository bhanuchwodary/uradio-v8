
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface AdminAuthenticationCardProps {
  onAuthenticate: () => void;
}

const AdminAuthenticationCard: React.FC<AdminAuthenticationCardProps> = ({ onAuthenticate }) => {
  return (
    <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
      <CardHeader>
        <CardTitle className="text-center">Authentication Required</CardTitle>
        <CardDescription className="text-center">
          You need admin access to manage prebuilt stations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button 
          onClick={onAuthenticate} 
          className="flex items-center gap-1"
        >
          <Shield className="h-4 w-4" /> Authenticate
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminAuthenticationCard;
