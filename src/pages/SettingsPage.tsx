
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="container mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        
        <Card className="bg-background/50 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline"
              className="w-full justify-start bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate("/playlist")}
            >
              Playlist
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate("/station-list")}
            >
              Station List
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate("/add-station")}
            >
              Add Station
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Streamify Jukebox v1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              A modern radio streaming application
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
