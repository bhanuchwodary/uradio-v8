
import React, { useState } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Shared state for controlling volume and random between header/player
  const [randomMode, setRandomMode] = useState(false);
  const [volume, setVolume] = useState(0.7);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce">
      <AppHeader randomMode={randomMode} setRandomMode={setRandomMode} volume={volume} setVolume={setVolume} />
      <main
        className={cn(
          "flex-grow px-3 pb-32 md:pb-28 overflow-x-hidden container mx-auto w-full ios-smooth-scroll ios-safe-left ios-safe-right",
          "pt-24"
        )}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
