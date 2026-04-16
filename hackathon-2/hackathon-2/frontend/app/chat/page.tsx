"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Send, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import {
  ChatMessage,
  TypingIndicator,
  type Message,
} from "@/components/ChatMessage";
import { ChatSidebar, type Conversation } from "@/components/ChatSidebar";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const STORE_KEY = "todo_chat_conversations";

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Array<{ id: string; title: string; updatedAt: string }>).map(
      (c) => ({ ...c, updatedAt: new Date(c.updatedAt) })
    );
  } catch { return []; }
}

function saveConversations(convs: Conversation[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(STORE_KEY, JSON.stringify(convs));
}

const MSG_KEY = (id: string) => `todo_chat_msgs_${id}`;

function loadMessages(id: string): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MSG_KEY(id));
    if (!raw) return [];
    return (
      JSON.parse(raw) as Array<{
        id: string; role: "user" | "assistant"; content: string;
        toolCalls?: string[]; timestamp: string;
      }>
    ).map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch { return []; }
}

function saveMessages(id: string, msgs: Message[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(MSG_KEY(id), JSON.stringify(msgs));
}

export default function ChatPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId,      setActiveId]      = useState<string | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isPending && !session) router.replace("/sign-in");
  }, [session, isPending, router]);

  useEffect(() => {
    const convs = loadConversations();
    setConversations(convs);
    if (convs.length > 0) {
      setActiveId(convs[0].id);
      setMessages(loadMessages(convs[0].id));
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const createConversation = useCallback(() => {
    const id = uuid();
    const conv: Conversation = { id, title: "New conversation", updatedAt: new Date() };
    setConversations((prev) => {
      const updated = [conv, ...prev];
      saveConversations(updated);
      return updated;
    });
    setActiveId(id);
    setMessages([]);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
    setMessages(loadMessages(id));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    localStorage.removeItem(MSG_KEY(id));
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConversations(updated);
      if (id === activeId) {
        if (updated.length > 0) {
          setActiveId(updated[0].id);
          setMessages(loadMessages(updated[0].id));
        } else {
          setActiveId(null);
          setMessages([]);
        }
      }
      return updated;
    });
  }, [activeId]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || !session?.user?.id) return;

    let convId = activeId;
    if (!convId) {
      convId = uuid();
      const conv: Conversation = {
        id:        convId,
        title:     text.length > 40 ? text.slice(0, 40) + "…" : text,
        updatedAt: new Date(),
      };
      setConversations((prev) => {
        const updated = [conv, ...prev];
        saveConversations(updated);
        return updated;
      });
      setActiveId(convId);
    }

    const userMsg: Message = { id: uuid(), role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      saveMessages(convId!, updated);
      return updated;
    });

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === convId && c.title === "New conversation"
          ? { ...c, title: text.length > 40 ? text.slice(0, 40) + "…" : text, updatedAt: new Date() }
          : c
      );
      saveConversations(updated);
      return updated;
    });

    setInput("");
    setSending(true);

    try {
      const token = await (authClient as unknown as { token: () => Promise<string | null> }).token();

      const res = await fetch(`${BASE}/api/${session.user.id}/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(typeof err.detail === "string" ? err.detail : "Request failed");
      }

      const data = await res.json() as { reply: string; tool_calls_made: string[] };

      const assistantMsg: Message = {
        id:        uuid(),
        role:      "assistant",
        content:   data.reply,
        toolCalls: data.tool_calls_made,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        saveMessages(convId!, updated);
        return updated;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, sending, session, activeId]);

  const clearHistory = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const token = await (authClient as unknown as { token: () => Promise<string | null> }).token();
      await fetch(`${BASE}/api/${session.user.id}/chat/history`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (activeId) { setMessages([]); saveMessages(activeId, []); }
      toast.success("History cleared");
    } catch { toast.error("Failed to clear history"); }
  }, [session, activeId]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); sendMessage(); }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SUGGESTIONS = [
    "Add a high-priority task: Deploy to Koyeb",
    "Show me all pending tasks",
    "List my high priority tasks",
    "Delete all completed tasks",
  ];

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={createConversation}
          onDelete={deleteConversation}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex h-12 items-center justify-between border-b border-border px-4 shrink-0">
            <span className="text-sm font-medium text-muted-foreground truncate max-w-xs">
              {activeId
                ? (conversations.find((c) => c.id === activeId)?.title ?? "Chat")
                : "Start a conversation"}
            </span>
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 && !sending ? (
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
                  <p className="font-semibold">AI Task Assistant</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    I can add, list, complete, or delete your tasks. Just ask!
                  </p>
                  <div className="mt-4 space-y-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="block w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        "{s}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-5">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {sending && <TypingIndicator key="typing" />}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border bg-background px-4 py-3 shrink-0">
            <div className="mx-auto flex max-w-2xl items-end gap-3">
              <div className="relative flex-1 rounded-xl border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message AI… (Ctrl+Enter to send)"
                  className="block w-full resize-none rounded-xl bg-transparent px-4 py-3 pr-12 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
                  style={{ maxHeight: "140px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {sending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send     className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="mt-1 text-center text-[10px] text-muted-foreground">
              Ctrl+Enter to send · Groq llama-3.3-70b-versatile
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
