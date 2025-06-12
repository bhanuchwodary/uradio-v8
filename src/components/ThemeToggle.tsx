
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-col items-center gap-1.5 py-3 px-2 w-full transition-all duration-200 ease-out bg-transparent ios-touch-target rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 active:bg-primary-container/20 cursor-pointer">
          <div className="h-5 w-5 hover:scale-105 transition-all duration-200 ease-out relative">
            <Sun className="h-5 w-5 absolute transition-all duration-150 ease-out rotate-0 opacity-100 scale-100 dark:-rotate-90 dark:opacity-0 dark:scale-50" />
            <Moon className="h-5 w-5 absolute transition-all duration-150 ease-out rotate-90 opacity-0 scale-50 dark:rotate-0 dark:opacity-100 dark:scale-100" />
          </div>
          <span className="text-xs transition-all duration-200 ease-out font-medium opacity-90">
            Theme
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-surface-container/98 backdrop-blur-md border-outline-variant/30 elevation-2 rounded-xl mt-2 min-w-[120px]"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className={`hover:bg-primary-container/60 focus:bg-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${theme === "light" ? "bg-primary-container/40 text-on-primary-container" : "text-on-surface"}`}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className={`hover:bg-primary-container/60 focus:bg-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${theme === "dark" ? "bg-primary-container/40 text-on-primary-container" : "text-on-surface"}`}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className={`hover:bg-primary-container/60 focus:bg-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${theme === "system" ? "bg-primary-container/40 text-on-primary-container" : "text-on-surface"}`}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
