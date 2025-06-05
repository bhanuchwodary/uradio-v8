
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
          className="material-shadow-1 hover:material-shadow-2 material-transition bg-radio-accent-light/50 border-none dark:bg-radio-accent-dark/30 hover:bg-radio-accent-light/70 dark:hover:bg-radio-accent-dark/50"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-radio-primary" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-radio-primary" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-radio-border/20 material-shadow-2">
        <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-radio-accent-light/30 focus:bg-radio-accent-light/30 dark:hover:bg-radio-accent-dark/30 dark:focus:bg-radio-accent-dark/30 material-transition">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-radio-accent-light/30 focus:bg-radio-accent-light/30 dark:hover:bg-radio-accent-dark/30 dark:focus:bg-radio-accent-dark/30 material-transition">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="hover:bg-radio-accent-light/30 focus:bg-radio-accent-light/30 dark:hover:bg-radio-accent-dark/30 dark:focus:bg-radio-accent-dark/30 material-transition">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
