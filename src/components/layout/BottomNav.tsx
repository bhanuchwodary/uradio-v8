
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const navItems = [
  { icon: Music, label: "Playlist", path: "/" },
  { icon: List, label: "Stations", path: "/station-list" },
  { icon: Plus, label: "Add", path: "/add" },
  { icon: Mail, label: "Request", path: "/request-station" }
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 bg-surface-container/98 backdrop-blur-xl border-t border-outline-variant/20 elevation-3 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
      <div className="container mx-auto px-0">
        <div className="flex justify-between items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-1">
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
          <div className="flex-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
