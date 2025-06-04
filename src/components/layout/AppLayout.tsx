
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  const navItems = [
    { icon: Music, label: "Playlist", path: "/" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 ios-vh-fix ios-no-bounce relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <main className="flex-grow p-4 pb-32 md:pb-28 overflow-x-hidden max-w-7xl mx-auto w-full ios-smooth-scroll ios-safe-top ios-safe-left ios-safe-right relative z-10">
        <div className="backdrop-blur-sm bg-white/30 dark:bg-black/20 rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-white/10">
          {children}
        </div>
      </main>
      
      {/* Enhanced Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 p-3 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-t border-white/20 dark:border-white/10 z-50 bottom-nav-ios ios-safe-left ios-safe-right">
        <div className="max-w-screen-lg mx-auto bg-white/60 dark:bg-black/60 rounded-2xl p-2 shadow-lg border border-white/30 dark:border-white/20">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="relative flex-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-2 h-auto py-4 px-0 w-full rounded-xl transition-all duration-300 ios-touch-target group",
                    path === item.path 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105 transform" 
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-black/50 hover:scale-105 active:bg-accent/30"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    path === item.path 
                      ? "bg-white/20 shadow-inner" 
                      : "group-hover:bg-white/30 dark:group-hover:bg-black/30"
                  )}>
                    <item.icon className={cn(
                      "transition-all duration-300", 
                      path === item.path ? "h-6 w-6" : "h-5 w-5 group-hover:scale-110"
                    )} />
                  </div>
                  <span className={cn(
                    "text-xs font-semibold transition-all duration-300",
                    path === item.path ? "opacity-100 scale-105" : "opacity-70 group-hover:opacity-100"
                  )}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
