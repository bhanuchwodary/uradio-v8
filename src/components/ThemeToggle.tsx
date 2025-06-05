
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
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 material-shadow-1 hover:material-shadow-2 material-transition bg-background/60 hover:bg-background/80 border border-border/20 dark:bg-background/60 dark:hover:bg-background/80 ios-touch-target"
        >
          <Sun className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-accent/20 material-shadow-2">
        <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-secondary focus:bg-secondary material-transition">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-secondary focus:bg-secondary material-transition">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="hover:bg-secondary focus:bg-secondary material-transition">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
