"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Conversation {
  id:        string;
  title:     string;
  updatedAt: Date;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId:      string | null;
  onSelect:      (id: string) => void;
  onNew:         () => void;
  onDelete:      (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <span className="font-semibold text-sm">Conversations</span>
        <button
          onClick={onNew}
          title="New conversation"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* List */}
      <nav className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No conversations yet.
            <br />
            Start one below!
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    activeId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-accent"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                    className="ml-1 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Footer hint */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Powered by Groq · llama-3.3-70b-versatile
        </p>
      </div>
    </aside>
  );
}
