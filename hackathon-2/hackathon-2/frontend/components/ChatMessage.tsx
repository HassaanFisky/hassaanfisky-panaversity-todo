"use client";

import { motion } from "framer-motion";
import { Bot, User, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  toolCalls?: string[];
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const TOOL_LABELS: Record<string, string> = {
  add_task:      "➕ Created task",
  list_tasks:    "📋 Listed tasks",
  complete_task: "✅ Completed task",
  delete_task:   "🗑️  Deleted task",
  update_task:   "✏️  Updated task",
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          isUser
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex max-w-[76%] flex-col gap-1.5",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Tool call pills (assistant only) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.toolCalls.map((tool, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary"
              >
                <Wrench className="h-2.5 w-2.5" />
                {TOOL_LABELS[tool] ?? tool}
              </span>
            ))}
          </div>
        )}

        {/* Text bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-card text-card-foreground"
          )}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}

// Typing indicator
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-3"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
