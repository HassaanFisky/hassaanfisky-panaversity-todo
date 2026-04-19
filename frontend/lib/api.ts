/**
 * Typed API client for the Hackathon II FastAPI backend.
 * Every call injects the Better Auth JWT from the browser session.
 */

import { authClient } from "./auth-client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  tags: string[] | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
}

export interface TaskUpdate extends Partial<TaskCreate> {}

export interface TaskFilter {
  completed?: boolean;
  priority?: Priority;
  search?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function _getToken(): Promise<string> {
  // Better Auth jwt plugin exposes token() on the client
  const token = await (authClient as unknown as { token: () => Promise<string | null> }).token();
  if (!token) throw new Error("Not authenticated");
  return token;
}

async function _request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await _getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail)
    );
  }
  return data as T;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {
  tasks: {
    list(userId: string, filters?: TaskFilter): Promise<Task[]> {
      const params = new URLSearchParams();
      if (filters?.completed !== undefined)
        params.set("completed", String(filters.completed));
      if (filters?.priority) params.set("priority", filters.priority);
      if (filters?.search)   params.set("search",   filters.search);
      const qs = params.toString() ? `?${params}` : "";
      return _request<Task[]>(`/api/${userId}/tasks${qs}`);
    },

    get(userId: string, taskId: string): Promise<Task> {
      return _request<Task>(`/api/${userId}/tasks/${taskId}`);
    },

    create(userId: string, body: TaskCreate): Promise<Task> {
      return _request<Task>(`/api/${userId}/tasks`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    update(userId: string, taskId: string, body: TaskUpdate): Promise<Task> {
      return _request<Task>(`/api/${userId}/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    },

    complete(userId: string, taskId: string): Promise<Task> {
      return _request<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
        method: "PATCH",
      });
    },

    uncomplete(userId: string, taskId: string): Promise<Task> {
      return _request<Task>(`/api/${userId}/tasks/${taskId}/uncomplete`, {
        method: "PATCH",
      });
    },

    delete(userId: string, taskId: string): Promise<void> {
      return _request<void>(`/api/${userId}/tasks/${taskId}`, {
        method: "DELETE",
      });
    },
  },
};
