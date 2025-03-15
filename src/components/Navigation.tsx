
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Music, PlusCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navigation = () => {
  const location = useLocation();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <Link to="/">
          <h1 className="text-3xl font-bold text-white mr-6">
            Streamify Jukebox
          </h1>
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        <Link to="/">
          <Button 
            variant={location.pathname === "/" ? "default" : "outline"} 
            size="sm"
            className="bg-white/20 backdrop-blur-sm border-none"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
        <Link to="/playlist">
          <Button 
            variant={location.pathname === "/playlist" ? "default" : "outline"} 
            size="sm"
            className="bg-white/20 backdrop-blur-sm border-none"
          >
            <Music className="w-4 h-4 mr-2" />
            Playlist
          </Button>
        </Link>
        <Link to="/add-station">
          <Button 
            variant={location.pathname === "/add-station" ? "default" : "outline"} 
            size="sm"
            className="bg-white/20 backdrop-blur-sm border-none"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Station
          </Button>
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navigation;
