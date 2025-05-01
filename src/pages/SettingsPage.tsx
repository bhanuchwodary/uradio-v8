
import React from "react";
import { Link } from "react-router-dom";
import { Home, Music, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const SettingsPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="w-full max-w-md bg-white/10 rounded-2xl shadow-lg p-8 mt-10 space-y-7 flex flex-col items-center">
        
        {/* Home Button */}
        <Link to="/" className="w-full">
          <Button variant="outline" className="w-full glass bg-white/20 backdrop-blur-sm border-none flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            Home
          </Button>
        </Link>

        {/* Playlist */}
        <Link to="/playlist" className="w-full">
          <Button variant="outline" className="w-full glass bg-white/20 backdrop-blur-sm border-none flex items-center justify-center gap-2">
            <Music className="w-5 h-5" />
            Playlist
          </Button>
        </Link>

        {/* Add Station */}
        <Link to="/add-station" className="w-full">
          <Button variant="outline" className="w-full glass bg-white/20 backdrop-blur-sm border-none flex items-center justify-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add Station
          </Button>
        </Link>

        {/* Theme Toggle */}
        <div className="w-full flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
