
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const { theme } = useTheme();
  
  // Determine which logo to use based on theme
  const getLogoSrc = () => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    return currentTheme === "light" 
      ? "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png" 
      : "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
  };
  
  const navItems = [
    { icon: Music, label: "Playlist", path: "/" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce">
      {/* Enhanced Header with Material Design 3 principles */}
      <header className="fixed top-0 left-0 right-0 p-3 sm:p-4 bg-surface-container/95 backdrop-blur-xl border-b border-outline-variant/20 z-20 ios-safe-top ios-safe-left ios-safe-right elevation-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          {/* Enhanced Logo with smooth transitions */}
          <div className="flex items-center">
            <img 
              src={getLogoSrc()}
              alt="Uradio Logo" 
              className="h-14 w-auto sm:h-16 md:h-18 lg:h-20 object-contain transition-all duration-300 ease-out hover:scale-105"
            />
          </div>
          
          {/* Enhanced Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>
      
      {/* Enhanced Main Content with better spacing */}
      <main className="flex-grow p-3 sm:p-4 pt-24 sm:pt-28 pb-32 md:pb-28 overflow-x-hidden max-w-7xl mx-auto w-full ios-smooth-scroll ios-safe-left ios-safe-right px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Enhanced Bottom Navigation with Material Design 3 */}
      <nav className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 bg-surface-container/98 backdrop-blur-xl border-t border-outline-variant/20 elevation-3 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
        <div className="max-w-screen-lg mx-auto flex justify-around items-center">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative flex-1">
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-1.5 h-auto py-3 px-2 w-full transition-all duration-200 ease-out bg-transparent ios-touch-target rounded-xl",
                  path === item.path 
                    ? "text-primary bg-primary-container/40 after:absolute after:bottom-1 after:left-1/4 after:w-1/2 after:h-1 after:bg-primary after:rounded-full after:shadow-sm" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 active:bg-primary-container/20"
                )}
              >
                <item.icon className={cn(
                  "transition-all duration-200 ease-out", 
                  path === item.path ? "h-6 w-6 scale-110" : "h-5 w-5 hover:scale-105"
                )} />
                <span className={cn(
                  "text-xs transition-all duration-200 ease-out font-medium",
                  path === item.path ? "opacity-100 font-semibold" : "opacity-90"
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
