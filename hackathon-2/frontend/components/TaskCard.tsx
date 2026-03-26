"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  CalendarDays, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2
} from "lucide-react";
import { Task, updateTask, deleteTask } from "@/lib/api";
import { PriorityBadge } from "./PriorityBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MotionDiv, fadeUp } from "./motion";

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Mapping backend field 'completed' to our UI 'is_completed' if necessary
  const isCompleted = task.is_completed ?? (task as any).completed;

  async function toggleComplete() {
    try {
      setIsUpdating(true);
      await updateTask(task.id, { is_completed: !isCompleted });
      onUpdate();
      toast.success(isCompleted ? "Task reactivated" : "Task completed");
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      setIsUpdating(true);
      await deleteTask(task.id);
      onUpdate();
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <MotionDiv
      variants={fadeUp}
      className={cn(
        "group relative rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] hover:border-[var(--border-muted)] hover:-translate-y-[1px] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={toggleComplete}
          disabled={isUpdating}
          className={cn(
            "mt-1 flex-shrink-0 rounded-full transition-colors",
            isCompleted 
              ? "text-[var(--success)]" 
              : "text-[var(--text-muted)] hover:text-[var(--accent)]"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 fill-[var(--success)]/10" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "text-[15px] font-semibold text-[var(--text-primary)] transition-all",
              isCompleted && "line-through text-[var(--text-muted)]"
            )}>
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
          </div>
          
          {task.description && (
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.05em]">
            {task.due_date && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(new Date(task.due_date), "MMM d, yyyy")}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {task.updated_at ? format(new Date(task.updated_at), "h:mm a") : "Recently"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </MotionDiv>
  );
}
