
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
          variant="outline" 
          className="w-full material-shadow-1 hover:material-shadow-2 material-transition bg-secondary/80 border-none flex items-center justify-center gap-2 dark:bg-accent/80"
        >
          <div className="relative w-4 h-4">
            <Sun className="h-[1.2rem] w-[1.2rem] absolute left-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="h-[1.2rem] w-[1.2rem] absolute left-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          <span className="ml-2">Theme</span>
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
