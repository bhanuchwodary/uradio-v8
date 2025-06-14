
import React from "react";
import { cn } from "@/lib/utils";
import AppHeader from "./AppHeader";
import { AppBottomNav } from "./AppBottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface ios-vh-fix ios-no-bounce">
      <AppHeader />
      
      {/* Main Content - Updated with consistent padding from screen edges */}
      <main className={cn(
        "flex-grow px-4 pb-28 pt-20 w-full max-w-none ios-smooth-scroll",
        "ios-safe-left ios-safe-right"
      )}>
        {children}
      </main>
      
      <AppBottomNav />
    </div>
  );
};
