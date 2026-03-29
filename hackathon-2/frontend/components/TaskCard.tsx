// e:/panaversity/hackathon-2-todo/hackathon-2/frontend/components/TaskCard.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import { type Task } from "@/lib/api";
import { PriorityBadge } from "./PriorityBadge";
import { cn } from "@/lib/utils";
import { MotionDiv, fadeUp } from "./motion";

export interface TaskCardProps {
  task: Task;
  onComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEditClick: (task: Task) => void;
}

export function TaskCard({ task, onComplete, onDelete, onEditClick }: TaskCardProps) {
  const [busy, setBusy] = useState(false);

  async function toggleComplete() {
    if (busy) return;
    setBusy(true);
    try {
      onComplete(task.id, !task.completed);
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    onDelete(task.id);
  }

  return (
    <MotionDiv
      variants={fadeUp}
      layout
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={toggleComplete}
          disabled={busy}
          className={cn(
            "mt-1 flex-shrink-0 rounded-full transition-colors",
            task.completed
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          )}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 fill-primary/10" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                "text-[15px] font-semibold text-foreground transition-all",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em]">
            {task.due_date && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(new Date(task.due_date), "MMM d, yyyy")}
              </div>
            )}
            {task.updated_at && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(task.updated_at), "h:mm a")}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEditClick(task)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </MotionDiv>
  );
}
