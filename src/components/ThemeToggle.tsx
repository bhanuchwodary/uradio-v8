
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
        <Button 
          variant="ghost" 
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 elevation-1 hover:elevation-2 transition-all duration-200 ease-out bg-surface-container/80 hover:bg-primary-container/60 border border-outline-variant/30 dark:bg-surface-container-high/80 dark:hover:bg-primary-container/40 ios-touch-target rounded-xl"
        >
          <Sun className="h-5 w-5 sm:h-6 sm:w-6 absolute transition-all duration-200 ease-out opacity-100 scale-100 dark:opacity-0 dark:scale-50 text-on-surface" />
          <Moon className="h-5 w-5 sm:h-6 sm:w-6 absolute transition-all duration-200 ease-out opacity-0 scale-50 dark:opacity-100 dark:scale-100 text-on-surface" />
          <span className="sr-only">Toggle theme</span>
        </Button>
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
