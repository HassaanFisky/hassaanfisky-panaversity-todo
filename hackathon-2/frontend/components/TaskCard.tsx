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
  Tag,
} from "lucide-react";
import { type Task } from "@/lib/api";
import { PriorityBadge } from "./PriorityBadge";
import { cn } from "@/lib/utils";
import { MotionDiv, fadeUp } from "./motion";

export interface TaskCardProps {
  task: Task;
  onComplete:  (id: string, completed: boolean) => void;
  onDelete:    (id: string) => void;
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

  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  return (
    <MotionDiv
      variants={fadeUp}
      layout
      className={cn(
        "group relative rounded-2xl border border-border-fine bg-bg-surface p-6 shadow-card hover:shadow-float hover:-translate-y-[2px] transition-editorial overflow-hidden",
        task.completed && "opacity-55"
      )}
    >
      {/* Priority accent line at top */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px] transition-opacity",
          task.priority === "high"   && "bg-red-400/70 opacity-100",
          task.priority === "medium" && "bg-accent/60 opacity-100",
          task.priority === "low"    && "bg-[#579D84]/60 opacity-100",
          task.completed             && "opacity-20"
        )}
      />

      <div className="flex items-start justify-between gap-4">
        {/* Completion toggle */}
        <button
          onClick={toggleComplete}
          disabled={busy}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "mt-0.5 flex-shrink-0 transition-all duration-300",
            task.completed ? "text-[#579D84]" : "text-border-fine hover:text-accent"
          )}
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h3
              className={cn(
                "text-[15px] font-bold text-text-primary tracking-tight transition-all",
                task.completed && "line-through text-text-muted"
              )}
            >
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2 font-medium">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {task.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full border border-border-fine bg-bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-text-muted"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] pt-1">
            {task.due_date && (
              <div
                className={cn(
                  "flex items-center gap-1.5",
                  isOverdue ? "text-red-400" : "text-text-muted"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {isOverdue && <span className="text-red-400 mr-0.5">!</span>}
                {format(new Date(task.due_date), "MMM d, yyyy")}
              </div>
            )}
            {task.updated_at && (
              <div className="flex items-center gap-1.5 text-text-muted">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(task.updated_at), "h:mm a")}
              </div>
            )}
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-editorial shrink-0">
          <button
            onClick={() => onEditClick(task)}
            aria-label="Edit task"
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-border-fine transition-editorial"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-editorial"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </MotionDiv>
  );
}
