"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterStatus   = "all" | "pending" | "completed";
export type SortField      = "created_at" | "due_date" | "priority";

interface FilterBarProps {
  status:    FilterStatus;
  sort:      SortField;
  search:    string;
  onStatus:  (v: FilterStatus) => void;
  onSort:    (v: SortField) => void;
  onSearch:  (v: string) => void;
}

const STATUS_TABS: { label: string; value: FilterStatus }[] = [
  { label: "All",       value: "all"       },
  { label: "Pending",   value: "pending"   },
  { label: "Completed", value: "completed" },
];

export function FilterBar({
  status,
  sort,
  search,
  onStatus,
  onSort,
  onSearch,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex rounded-lg border border-border bg-muted p-1 text-sm">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatus(tab.value)}
            className={cn(
              "rounded-md px-3 py-1 font-medium transition-colors",
              status === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right: search + sort */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tasks…"
            className="h-8 w-44 rounded-lg border border-input bg-background pl-8 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortField)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="created_at">Newest first</option>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    </div>
  );
}
