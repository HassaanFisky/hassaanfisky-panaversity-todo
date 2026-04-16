"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { api, type Task, type TaskCreate, type Priority } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskModal } from "@/components/AddTaskModal";
import { FilterBar, type FilterStatus, type SortField } from "@/components/FilterBar";
import { PriorityBadge } from "@/components/PriorityBadge";

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function TaskSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-[72px] animate-pulse rounded-xl border border-border bg-muted"
        />
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ status }: { status: FilterStatus }) {
  const messages: Record<FilterStatus, string> = {
    all:       "No tasks yet. Press N to create your first one.",
    pending:   "All caught up! No pending tasks.",
    completed: "No completed tasks yet.",
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 py-20 text-center"
    >
      <ClipboardList className="h-12 w-12 text-muted-foreground/40" />
      <p className="text-muted-foreground">{messages[status]}</p>
    </motion.div>
  );
}

// ─── Confirm delete dialog ────────────────────────────────────────────────────

function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 8 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4"
      >
        <h3 className="font-semibold text-lg">Delete task?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router  = useRouter();
  const { data: session, isPending } = useSession();

  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTask,     setEditTask]     = useState<Task | null>(null);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortField,    setSortField]    = useState<SortField>("created_at");
  const [search,       setSearch]       = useState("");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isPending && !session) router.replace("/sign-in");
  }, [session, isPending, router]);

  const userId = session?.user?.id;

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await api.tasks.list(userId);
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadTasks();
  }, [userId, loadTasks]);

  // Keyboard shortcut: N = new task
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (
        e.key === "n" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !["INPUT", "TEXTAREA"].includes(tag)
      ) {
        setEditTask(null);
        setModalOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = useCallback(
    async (data: TaskCreate) => {
      if (!userId) return;
      const task = await api.tasks.create(userId, data);
      setTasks((p) => [task, ...p]);
      toast.success("Task created ✅");
    },
    [userId]
  );

  const handleUpdate = useCallback(
    async (data: TaskCreate) => {
      if (!userId || !editTask) return;
      const updated = await api.tasks.update(userId, editTask.id, data);
      setTasks((p) => p.map((t) => (t.id === updated.id ? updated : t)));
      toast.success("Task updated");
    },
    [userId, editTask]
  );

  const handleToggleComplete = useCallback(
    async (id: string, completed: boolean) => {
      if (!userId) return;
      const updated = completed
        ? await api.tasks.complete(userId, id)
        : await api.tasks.uncomplete(userId, id);
      setTasks((p) => p.map((t) => (t.id === updated.id ? updated : t)));
    },
    [userId]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!userId || !deleteId) return;
    await api.tasks.delete(userId, deleteId);
    setTasks((p) => p.filter((t) => t.id !== deleteId));
    setDeleteId(null);
    toast.success("Task deleted");
  }, [userId, deleteId]);

  // ── Derived list ──────────────────────────────────────────────────────────

  const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const visibleTasks = useMemo(() => {
    let list = [...tasks];

    // status filter
    if (filterStatus === "pending")   list = list.filter((t) => !t.completed);
    if (filterStatus === "completed") list = list.filter((t) =>  t.completed);

    // search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // sort
    list.sort((a, b) => {
      if (sortField === "priority") {
        return (
          (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
        );
      }
      if (sortField === "due_date") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [tasks, filterStatus, search, sortField]);

  const stats = useMemo(() => {
    const total     = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending   = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} total · {stats.pending} pending · {stats.completed} done
            </p>
          </div>
          <button
            onClick={() => { setEditTask(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
            title="New task (N)"
          >
            <Plus className="h-4 w-4" />
            New task
            <kbd className="ml-1 hidden rounded bg-primary-foreground/20 px-1 text-[10px] sm:inline">
              N
            </kbd>
          </button>
        </div>

        {/* Stats badges */}
        {stats.total > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {(["high", "medium", "low"] as Priority[]).map((p) => {
              const count = tasks.filter((t) => !t.completed && t.priority === p).length;
              if (!count) return null;
              return (
                <div key={p} className="flex items-center gap-1.5">
                  <PriorityBadge priority={p} />
                  <span className="text-xs text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="mb-5">
          <FilterBar
            status={filterStatus}
            sort={sortField}
            search={search}
            onStatus={setFilterStatus}
            onSort={setSortField}
            onSearch={setSearch}
          />
        </div>

        {/* Task list */}
        {loading ? (
          <TaskSkeleton />
        ) : visibleTasks.length === 0 ? (
          <EmptyState status={filterStatus} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleToggleComplete}
                  onDelete={(id) => setDeleteId(id)}
                  onEditClick={(t) => { setEditTask(t); setModalOpen(true); }}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      {/* Add / Edit modal */}
      <AddTaskModal
        open={modalOpen}
        editTask={editTask}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdate : handleCreate}
      />

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <DeleteConfirm
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
