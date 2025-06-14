
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-2 px-3 w-auto transition-all duration-300 ease-out rounded-xl text-on-surface-variant hover:text-on-surface"
        >
          <div className="h-5 w-5 relative overflow-hidden">
            <Sun className="h-full w-full absolute transition-all transform duration-300 ease-in-out rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="h-full w-full absolute transition-all transform duration-300 ease-in-out rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </div>
          <span className="text-[11px] font-medium">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center" 
        className="bg-surface-container/90 backdrop-blur-md border-outline-variant/30 elevation-2 rounded-xl mt-2 min-w-[120px]"
      >
        <DropdownMenuItem onClick={() => setTheme("light")} className="focus:bg-surface-container-high rounded-lg m-1">Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="focus:bg-surface-container-high rounded-lg m-1">Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="focus:bg-surface-container-high rounded-lg m-1">System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
