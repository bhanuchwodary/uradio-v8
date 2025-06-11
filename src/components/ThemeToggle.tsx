
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Sun className="h-5 w-5 absolute transition-all duration-150 ease-out rotate-0 opacity-100 scale-100 dark:-rotate-90 dark:opacity-0 dark:scale-50 text-on-surface-variant" />
      <Moon className="h-5 w-5 absolute transition-all duration-150 ease-out rotate-90 opacity-0 scale-50 dark:rotate-0 dark:opacity-100 dark:scale-100 text-on-surface-variant" />
      <span className="sr-only">Toggle theme</span>
    </div>
  );
}
