
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, List, Plus, ListMusic } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => path === route;

  return (
    <nav className="flex justify-between items-center w-full mb-5 px-1 md:px-2">
      <div className="flex items-center gap-1.5">
        <Link to="/">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none transition-all ${isActive('/') ? 'text-primary' : ''}`}
          >
            <ListMusic className="h-[1.15rem] w-[1.15rem]" />
            <span className="sr-only">Playlist</span>
          </Button>
        </Link>
        <Link to="/station-list">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none transition-all ${isActive('/station-list') ? 'text-primary' : ''}`}
          >
            <List className="h-[1.15rem] w-[1.15rem]" />
            <span className="sr-only">Station List</span>
          </Button>
        </Link>
        <Link to="/add">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none transition-all ${isActive('/add') ? 'text-primary' : ''}`}
          >
            <Plus className="h-[1.15rem] w-[1.15rem]" />
            <span className="sr-only">Add Station</span>
          </Button>
        </Link>
      </div>
      <Link to="/settings">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-none transition-all ${isActive('/settings') ? 'text-primary' : ''}`}
        >
          <Settings className="h-[1.15rem] w-[1.15rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </Link>
    </nav>
  );
};

export default Navigation;
