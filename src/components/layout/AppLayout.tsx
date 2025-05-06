
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, List, Plus, Settings, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Music, label: "Playlist", path: "/playlist" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add-station" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <div className={cn(
      "min-h-screen flex flex-col relative",
      isDark 
        ? "bg-gradient-to-br from-background to-background/95" 
        : "bg-gradient-to-br from-background to-background/90"
    )}>
      {/* Main Content */}
      <main className="flex-grow p-4 pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation Bar */}
      <nav className={cn(
        "fixed bottom-0 w-full p-2 shadow-lg border-t z-10",
        isDark
          ? "dark-glass border-white/5 bg-background/80" 
          : "light-glass border-white/20 bg-white/70"
      )}>
        <div className="max-w-screen-lg mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = path === item.path;
            
            return (
              <Link key={item.path} to={item.path} className="relative">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all",
                    isActive
                      ? "text-primary" 
                      : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "text-primary animate-pulse-glow"
                  )} />
                  <span className={cn(
                    "text-xs transition-all",
                    isActive ? "font-medium" : "font-normal"
                  )}>
                    {item.label}
                  </span>
                </Button>
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
