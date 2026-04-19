"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, ClipboardList, Loader2, Zap, LayoutGrid, Clock, Calendar, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl border border-border-fine bg-bg-surface"
        />
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ status }: { status: FilterStatus }) {
  const messages: Record<FilterStatus, string> = {
    all:       "No tasks yet. Add your first task to get started.",
    pending:   "All done! No pending tasks.",
    completed: "No completed tasks yet.",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-32 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center text-text-muted/40 border border-border-fine shadow-inner">
        <Zap className="h-8 w-8" />
      </div>
      <p className="font-serif italic text-xl text-text-secondary opacity-60">{messages[status]}</p>
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-text-primary/10 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="w-full max-w-sm rounded-3xl border border-border-fine bg-bg-base p-10 shadow-float mx-4"
      >
        <h3 className="font-serif text-2xl font-bold tracking-tight text-text-primary mb-2">Delete Task?</h3>
        <p className="text-sm prose-editorial text-text-secondary opacity-70">
          This task will be permanently deleted.
        </p>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="btn-tactile rounded-xl border border-border-fine px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-bg-surface transition-editorial"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-tactile rounded-xl bg-red-500 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white hover:brightness-110 shadow-lg shadow-red-500/20"
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
      toast.error("Connection issue, please try again.");
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
      toast.success("Task updated.");
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
    toast.success("Task deleted.");
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
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base selection:bg-accent/10">
      <Navbar />

      {/* Atmospheric Ornamentation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-[50vh]">
         <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-accent/5 to-transparent blur-3xl opacity-20" />
         <div className="absolute top-48 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[0.8px] bg-border-fine opacity-50" />
      </div>

      <main className="mx-auto max-w-4xl px-6 py-20 relative z-10">
        {/* Header row */}
        <div className="mb-16 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between border-b border-border-fine pb-16">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-text-primary">My <span className="italic font-normal">Tasks</span></h1>
            <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">
                <div className="flex items-center gap-2">
                    <LayoutGrid size={12} className="opacity-50" />
                    <span>{stats.total} Total</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={12} className="opacity-50" />
                    <span>{stats.pending} To Do</span>
                </div>
                <div className="flex items-center gap-2 text-[#579D84]">
                    <CheckCircle2 size={12} />
                    <span>{stats.completed} Done</span>
                </div>
            </div>
          </div>
          <button
            onClick={() => { setEditTask(null); setModalOpen(true); }}
            className="btn-tactile group flex items-center gap-4 rounded-xl bg-text-primary px-8 py-4 text-[12px] font-bold uppercase tracking-[0.3em] text-white shadow-float hover:brightness-110 transition-editorial"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
            New Task
            <kbd className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] opacity-50">N</kbd>
          </button>
        </div>

        {/* Priority Filter / Status */}
        {stats.total > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-8 border-b border-border-fine pb-8">
            {(["high", "medium", "low"] as Priority[]).map((p) => {
              const count = tasks.filter((t) => !t.completed && t.priority === p).length;
              if (count === 0) return null;
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{p.charAt(0).toUpperCase() + p.slice(1)} Priority</span>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={p} />
                    <span className="text-[11px] font-bold text-text-primary opacity-50">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Console Filters */}
        <div className="mb-10 bg-bg-surface p-2 rounded-2xl border border-border-fine shadow-card">
          <FilterBar
            status={filterStatus}
            sort={sortField}
            search={search}
            onStatus={setFilterStatus}
            onSort={setSortField}
            onSearch={setSearch}
          />
        </div>

        {/* Execution Flow */}
        {loading ? (
          <TaskSkeleton />
        ) : visibleTasks.length === 0 ? (
          <EmptyState status={filterStatus} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
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

        {/* Subtle Branding Footer Enhancement */}
        <div className="mt-40 border-t border-border-fine pt-10 flex flex-col items-center gap-4 opacity-30 group grayscale hover:grayscale-0 transition-editorial">
             <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.5em] text-text-muted">
                <span>Panaversity Infrastructure</span>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>TaskFlow v2</span>
             </div>
        </div>
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
    </div>
  );
}
