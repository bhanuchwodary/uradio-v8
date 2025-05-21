
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, List, Plus, Settings, Music, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

interface EnhancedAppLayoutProps {
  children: React.ReactNode;
}

export const EnhancedAppLayout: React.FC<EnhancedAppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: ThumbsUp, label: "Favorites", path: "/playlist" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background/80 via-background to-accent/10 dark:from-background/90 dark:via-background dark:to-accent/5 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-background/60 border-b border-border/30 material-shadow-1">
        <div className="container max-w-5xl mx-auto flex justify-between items-center py-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/90 text-white p-1.5 rounded-lg material-shadow-1">
              <Music className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">Streamify</span>
          </Link>
          
          <ThemeToggle />
        </div>
      </header>
      
      {/* Main Content */}
      <motion.main 
        className="flex-grow p-4 pb-20 overflow-x-hidden container max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      
      {/* Bottom Navigation Bar - Material Design Style */}
      <nav className="fixed bottom-0 left-0 right-0 p-2 bg-background/90 backdrop-blur-lg border-t border-border/30 material-shadow-3 z-10 safe-area-inset-bottom">
        <div className="max-w-screen-lg mx-auto flex justify-around items-center">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative flex-1">
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-0 w-full material-transition bg-transparent",
                  path === item.path 
                    ? "text-primary after:absolute after:bottom-0 after:left-1/4 after:w-1/2 after:h-1 after:bg-primary after:rounded-full" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={cn(
                    "transition-transform", 
                    path === item.path ? "h-5 w-5 scale-110" : "h-5 w-5"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-xs transition-opacity",
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
