"use client";

import { motion } from "framer-motion";
import { User, Wrench, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoIcon } from "./Logo";

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
  add_task:      "➕ Initialized task",
  list_tasks:    "📋 Queried registry",
  complete_task: "✅ Logic validated",
  delete_task:   "🗑️  Node terminated",
  update_task:   "✏️  Parameters updated",
};

/**
 * RenderContent: Architectural renderer for H2 assistant responses.
 */
function RenderContent({ content, role }: { content: string, role: "user" | "assistant" }) {
  if (role === 'user') return <p className="font-sans font-bold text-xs tracking-wide leading-relaxed m-0">{content}</p>;

  const lines = content.split('\n');
  
  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        const isHeading = line.trim().match(/^([A-Z][a-z]+(\s[A-Z][a-z]+)*):/);
        
        if (isHeading) {
          return (
            <div key={i} className="mt-6 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent border-b border-accent/20 pb-1 block w-fit">
                {line}
              </span>
            </div>
          );
        }

        if (line.trim().startsWith('•') || line.trim().match(/^\d+\./)) {
           return (
             <p key={i} className="font-serif italic text-sm text-muted-foreground leading-relaxed pl-4 border-l border-border py-1 my-2">
               {line}
             </p>
           );
        }

        return (
          <p key={i} className="font-serif text-[15px] text-foreground leading-relaxed opacity-90 m-0">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* High-Fidelity Avatar */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-float transition-all",
          isUser
            ? "border-primary/20 bg-primary/5 text-primary"
            : "border-accent/20 bg-bg-surface backdrop-blur-md"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <LogoIcon className="scale-90 -translate-x-[1px] -translate-y-[1px] opacity-90" />
        )}
      </div>

      {/* Bubble Composition */}
      <div
        className={cn(
          "flex max-w-[82%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Architectural Tool Indicators */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {message.toolCalls.map((tool, i) => (
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={i}
                className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-accent"
              >
                <Activity className="h-3 w-3 animate-pulse" />
                {TOOL_LABELS[tool] ?? tool}
              </motion.span>
            ))}
          </div>
        )}

        {/* The Response Bubble */}
        <div
          className={cn(
            "rounded-[1.5rem] px-6 py-4 shadow-sm transition-editorial",
            isUser
              ? "rounded-tr-none bg-primary text-primary-foreground shadow-float"
              : "rounded-tl-none border border-border bg-card text-card-foreground hover:shadow-md"
          )}
        >
          <RenderContent role={message.role} content={message.content} />
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center gap-3 px-2 opacity-50">
           {!isUser && <Activity size={10} className="text-accent animate-pulse" />}
           <span className="text-[9px] font-bold uppercase tracking-[0.4em]">
             {isUser ? "Scholar Payload" : "Mission Agent"}
           </span>
           <span className="text-[9px] font-bold text-muted-foreground opacity-40">•</span>
           <span className="text-[9px] font-bold text-muted-foreground lowercase">
             {message.timestamp.toLocaleTimeString([], {
               hour: "2-digit",
               minute: "2-digit",
             })}
           </span>
        </div>
      </div>
    </motion.div>
  );
}

// Systemic Typing Indicator
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-bg-surface shadow-float">
        <LogoIcon className="scale-90 opacity-80" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-[1.5rem] rounded-tl-none border border-border bg-card px-6 py-5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-1.5 w-1.5 rounded-full bg-accent"
              animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            />
          ))}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent px-4 animate-pulse">Analyzing Node</span>
      </div>
    </motion.div>
  );
}
