
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, List, Plus, Settings, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Music, label: "Playlist", path: "/playlist" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add-station" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Main Content */}
      <main className="flex-grow p-4">
        {children}
      </main>
      
      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 p-2 bg-background/80 backdrop-blur-md border-t border-border/50 shadow-lg">
        <div className="max-w-screen-lg mx-auto flex justify-around items-center">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3",
                  path === item.path && "text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
