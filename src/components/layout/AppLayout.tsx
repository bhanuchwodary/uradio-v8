
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  const navItems = [
    { icon: Music, label: "Playlist", path: "/" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/80 via-background to-accent/30 dark:from-background dark:via-card dark:to-muted/30 ios-vh-fix ios-no-bounce">
      {/* Header with Theme Toggle */}
      <header className="fixed top-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-b border-border/30 z-20 ios-safe-top ios-safe-left ios-safe-right">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground">Uradio</h1>
          <ThemeToggle />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow p-4 pt-24 pb-28 md:pb-24 overflow-x-hidden max-w-6xl mx-auto w-full ios-smooth-scroll ios-safe-left ios-safe-right">
        {children}
      </main>
      
      {/* Bottom Navigation Bar - iOS Optimized */}
      <nav className="fixed bottom-0 left-0 right-0 p-2 bg-background/95 backdrop-blur-xl border-t border-border/30 material-shadow-3 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
        <div className="max-w-screen-lg mx-auto flex justify-around items-center">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative flex-1">
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-3 px-0 w-full material-transition bg-transparent ios-touch-target",
                  path === item.path 
                    ? "text-primary after:absolute after:bottom-0 after:left-1/4 after:w-1/2 after:h-0.5 after:bg-primary after:rounded-full" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent active:bg-accent/20"
                )}
              >
                <item.icon className={cn(
                  "transition-transform", 
                  path === item.path ? "h-6 w-6 scale-110" : "h-5 w-5"
                )} />
                <span className={cn(
                  "text-xs transition-opacity font-medium",
                  path === item.path ? "opacity-100" : "opacity-80"
                )}>
                  {item.label}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
