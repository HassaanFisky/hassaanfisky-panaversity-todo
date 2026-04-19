import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/api";

const styles: Record<Priority, string> = {
  high:   "bg-red-100    text-red-700    dark:bg-red-900/30   dark:text-red-400   border-red-200   dark:border-red-800",
  medium: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  low:    "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400  border-green-200  dark:border-green-800",
};

const icons: Record<Priority, string> = {
  high:   "🔴",
  medium: "🟠",
  low:    "🟢",
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[priority],
        className
      )}
    >
      {icons[priority]} {priority}
    </span>
  );
}
