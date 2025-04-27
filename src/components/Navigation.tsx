
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Settings, List, Plus, ListMusic } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <nav className="flex justify-between items-center w-full mb-5 px-1 md:px-2">
      <div className="flex items-center gap-2">
        <Link to="/">
          <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none">
            <Home className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
        <Link to="/playlist">
          <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none">
            <ListMusic className="h-6 w-6" />
            <span className="sr-only">Playlist</span>
          </Button>
        </Link>
        <Link to="/station-list">
          <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none">
            <List className="h-6 w-6" />
            <span className="sr-only">Station List</span>
          </Button>
        </Link>
        <Link to="/add-station">
          <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Station</span>
          </Button>
        </Link>
      </div>
      <Link to="/settings">
        <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none">
          <Settings className="h-6 w-6" />
          <span className="sr-only">Settings</span>
        </Button>
      </Link>
    </nav>
  );
};

export default Navigation;
