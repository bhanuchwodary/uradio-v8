
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle({ children }: { children: React.ReactNode }) {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-md-sys-color-surface-container/98 backdrop-blur-md border-md-sys-color-outline-variant/30 elevation-2 rounded-xl mt-2 min-w-[120px] z-50"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`hover:bg-md-sys-color-primary-container/60 focus:bg-md-sys-color-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${
            theme === "light" ? "bg-md-sys-color-primary-container/40 text-md-sys-color-on-primary-container" : "text-md-sys-color-on-surface"
          }`}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`hover:bg-md-sys-color-primary-container/60 focus:bg-md-sys-color-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${
            theme === "dark" ? "bg-md-sys-color-primary-container/40 text-md-sys-color-on-primary-container" : "text-md-sys-color-on-surface"
          }`}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("metallic")}
          className={`hover:bg-md-sys-color-primary-container/60 focus:bg-md-sys-color-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${
            theme === "metallic" ? "bg-md-sys-color-primary-container/40 text-md-sys-color-on-primary-container" : "text-md-sys-color-on-surface"
          }`}
        >
          Metallic
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`hover:bg-md-sys-color-primary-container/60 focus:bg-md-sys-color-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${
            theme === "system" ? "bg-md-sys-color-primary-container/40 text-md-sys-color-on-primary-container" : "text-md-sys-color-on-surface"
          }`}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
