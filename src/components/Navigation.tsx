
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Music, ListMusic, Plus, Home, FileAudio } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isActive = (path: string) => location.pathname === path;

  if (isMobile) {
    return (
      <div className="flex justify-between items-center w-full mb-4">
        <Link to="/">
          <div className="flex items-center">
            <Music className="mr-2 h-6 w-6" />
            <span className="font-bold text-lg">Streamify</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Music className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/playlist" className="w-full">
                  <ListMusic className="mr-2 h-4 w-4" />
                  <span>Playlist</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/add-station" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Add Station</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/local-files" className="w-full">
                  <FileAudio className="mr-2 h-4 w-4" />
                  <span>Local Files</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center w-full mb-4">
      <div className="flex items-center">
        <Link to="/">
          <div className="flex items-center mr-6">
            <Music className="mr-2 h-6 w-6" />
            <span className="font-bold text-lg">Streamify</span>
          </div>
        </Link>
        <div className="flex gap-2">
          <Link to="/">
            <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
          </Link>
          <Link to="/playlist">
            <Button variant={isActive("/playlist") ? "default" : "ghost"} size="sm">
              <ListMusic className="h-4 w-4 mr-1" />
              Playlist
            </Button>
          </Link>
          <Link to="/add-station">
            <Button variant={isActive("/add-station") ? "default" : "ghost"} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Station
            </Button>
          </Link>
          <Link to="/local-files">
            <Button variant={isActive("/local-files") ? "default" : "ghost"} size="sm">
              <FileAudio className="h-4 w-4 mr-1" />
              Local Files
            </Button>
          </Link>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
};

export default Navigation;
