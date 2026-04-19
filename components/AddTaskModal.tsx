"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskCreate, Priority } from "@/lib/api";

interface AddTaskModalProps {
  open:       boolean;
  editTask?:  Task | null;
  onClose:    () => void;
  onSubmit:   (data: TaskCreate) => Promise<void>;
}

const PRIORITIES: Priority[] = ["low", "medium", "high"];

const defaultForm = (): TaskCreate => ({
  title:       "",
  description: "",
  priority:    "medium",
  tags:        [],
  due_date:    null,
  completed:   false,
});

export function AddTaskModal({
  open,
  editTask,
  onClose,
  onSubmit,
}: AddTaskModalProps) {
  const [form,    setForm]    = useState<TaskCreate>(defaultForm());
  const [tagsRaw, setTagsRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setForm({
        title:       editTask.title,
        description: editTask.description ?? "",
        priority:    editTask.priority as Priority,
        tags:        editTask.tags ?? [],
        due_date:    editTask.due_date,
        completed:   editTask.completed,
      });
      setTagsRaw((editTask.tags ?? []).join(", "));
    } else {
      setForm(defaultForm());
      setTagsRaw("");
    }
  }, [editTask, open]);

  // Focus title on open
  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 80);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await onSubmit({ ...form, title: form.title.trim(), tags });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-semibold text-lg">
                {editTask ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="What needs to be done?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Optional details…"
                />
              </div>

              {/* Priority + Due date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                        className={cn(
                          "flex-1 rounded-lg border py-1.5 text-xs font-medium capitalize transition-colors",
                          form.priority === p
                            ? p === "high"
                              ? "border-red-400    bg-red-100    text-red-700    dark:bg-red-900/30   dark:text-red-400"
                              : p === "medium"
                              ? "border-yellow-400 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "border-green-400  bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400"
                            : "border-border text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Due date</label>
                  <input
                    type="date"
                    value={
                      form.due_date
                        ? new Date(form.due_date).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        due_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Tags
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (comma-separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="work, urgent, review"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.title.trim()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editTask ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
