
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { icon: Music, label: "Playlist", path: "/" },
  { icon: List, label: "Stations", path: "/station-list" },
  { icon: Plus, label: "Add", path: "/add" },
  { icon: Mail, label: "Request", path: "/request-station" }
];

export const AppBottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-outline-variant/30 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
      <div className="container mx-auto px-2 py-1.5">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-1 flex justify-center">
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3 w-auto transition-all duration-300 ease-out rounded-xl",
                  path === item.path || (item.path === "/" && path === "/playlist")
                    ? "text-on-primary-container bg-primary-container" 
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">
                  {item.label}
                </span>
              </Button>
            </Link>
          ))}
          
          <div className="flex-1 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
