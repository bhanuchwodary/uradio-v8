
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Music, List, Plus, Mail, Sun, Moon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const navItems = [
  { icon: Music, label: "Playlist", path: "/" },
  { icon: List, label: "Stations", path: "/station-list" },
  { icon: Plus, label: "Add", path: "/add" },
  { icon: Mail, label: "Request", path: "/request-station" }
];

const NavItem: React.FC<{ item: typeof navItems[0]; isActive: boolean }> = ({ item, isActive }) => {
  return (
    <Link to={item.path} className="flex-1 text-center group">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 w-full py-1 transition-all duration-300 ease-out ios-touch-target rounded-xl"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-300 ease-in-out h-8 w-16",
            // Standard themes
            !document.documentElement.classList.contains('metallic') && (
              isActive
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant group-hover:bg-on-surface/10"
            ),
            // Metallic theme
            document.documentElement.classList.contains('metallic') && (
              isActive
                ? "metallic-nav-item active"
                : "metallic-nav-item hover:elevation-1"
            )
          )}
        >
          <item.icon className="h-6 w-6" />
        </div>
        <span className={cn(
          "text-xs font-medium",
          isActive ? "text-on-surface font-semibold" : "text-on-surface-variant"
        )}>
          {item.label}
        </span>
      </div>
    </Link>
  );
};

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 p-2 sm:p-3 backdrop-blur-xl border-t elevation-3 z-10 bottom-nav-ios ios-safe-left ios-safe-right",
      // Standard themes
      !document.documentElement.classList.contains('metallic') && 
        "bg-surface-container/98 border-outline-variant/20",
      // Metallic theme
      document.documentElement.classList.contains('metallic') && 
        "metallic-nav border-outline-variant/30"
    )}>
      <div className="container mx-auto px-0">
        <div className="flex justify-around items-start">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} isActive={path === item.path} />
          ))}
          <div className="flex-1 text-center group">
             <ThemeToggle>
              <div className="flex flex-col items-center justify-center gap-1 w-full py-1 transition-all duration-300 ease-out ios-touch-target rounded-xl cursor-pointer">
                <div className={cn(
                  "flex items-center justify-center rounded-full h-8 w-16 transition-all duration-300 ease-in-out",
                  // Standard themes
                  !document.documentElement.classList.contains('metallic') && 
                    "text-on-surface-variant group-hover:bg-on-surface/10",
                  // Metallic theme
                  document.documentElement.classList.contains('metallic') && 
                    "metallic-nav-item hover:elevation-1"
                )}>
                  <div className="relative h-6 w-6">
                    <Sun className="absolute h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </div>
                </div>
                <span className="text-xs font-medium text-on-surface-variant">Theme</span>
              </div>
             </ThemeToggle>
          </div>
        </div>
      </div>
    </nav>
  );
};
