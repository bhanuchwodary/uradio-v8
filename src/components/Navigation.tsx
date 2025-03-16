
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Music, PlusCircle, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Mobile menu
  if (isMobile) {
    return (
      <div className="flex justify-between items-center mb-4">
        <Link to="/">
          <h1 className="text-xl font-bold text-white">
            Streamify Jukebox
          </h1>
        </Link>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/20 backdrop-blur-sm border-none">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/20 backdrop-blur-md border-none">
              <DropdownMenuItem asChild className="focus:bg-white/20">
                <Link to="/" className="w-full flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-white/20">
                <Link to="/playlist" className="w-full flex items-center">
                  <Music className="w-4 h-4 mr-2" />
                  Playlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-white/20">
                <Link to="/add-station" className="w-full flex items-center">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Station
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
  
  // Desktop menu
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center">
        <Link to="/">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
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
