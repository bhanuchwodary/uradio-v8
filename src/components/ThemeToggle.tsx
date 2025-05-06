
import { Moon, Sun, Laptop } from "lucide-react";
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
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full transition-all flex items-center justify-center gap-2 border shadow",
            theme === "dark" ? "bg-background/50 border-white/10" : 
            theme === "light" ? "bg-white/60 border-white/30" :
            "bg-white/30 border-white/20"
          )}
        >
          <div className="relative w-4 h-4">
            <Sun className="h-[1.2rem] w-[1.2rem] absolute left-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="h-[1.2rem] w-[1.2rem] absolute left-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
            <Laptop className={cn(
              "h-[1.2rem] w-[1.2rem] absolute left-0 transition-all",
              theme === "system" ? "rotate-0 scale-100 text-primary" : "rotate-90 scale-0"
            )} />
          </div>
          <span className="ml-2 font-medium">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "border shadow-lg animate-in fade-in-80 zoom-in-95",
          theme === "dark" ? "bg-background/70 backdrop-blur-md border-white/10" : 
                             "bg-white/70 backdrop-blur-md border-white/20"
        )}
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/10",
            theme === "light" && "text-primary font-medium"
          )}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/10",
            theme === "dark" && "text-primary font-medium"
          )}
        >
          <Moon className="h-4 w-4 text-blue-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/10",
            theme === "system" && "text-primary font-medium"
          )}
        >
          <Laptop className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
