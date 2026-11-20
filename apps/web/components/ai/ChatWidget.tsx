"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import type { ChatTurn } from "@repo/types";
import { ChatMessage } from "./ChatMessage";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your **AURA styling assistant**. Ask me about products, sizing, or what to wear.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [open, messages, loading]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatTurn[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content: typeof data.reply === "string" && data.reply.trim()
            ? data.reply : "Sorry, I couldn't respond right now.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Network error — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        ref={launcherRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        aria-controls="aura-chat-panel"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 sm:bottom-6 sm:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <section
          id="aura-chat-panel"
          aria-labelledby="aura-chat-title"
          onKeyDown={(event) => { if (event.key === "Escape") close(); }}
          className="fixed bottom-24 left-3 right-3 z-50 flex h-[calc(100dvh-7rem)] max-h-[36rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:left-auto sm:right-6 sm:w-[26rem]"
        >
          <div className="flex shrink-0 items-center gap-2 bg-neutral-900 px-4 py-2 text-white">
            <Sparkles className="h-4 w-4" />
            <h2 id="aura-chat-title" className="flex-1 text-base font-semibold">AURA Assistant</h2>
            <button onClick={close} aria-label="Close conversation" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions text" aria-busy={loading} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`min-w-0 max-w-[92%] rounded-2xl px-3 py-2.5 text-base sm:text-sm ${
                    m.role === "user"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-800"
                  }`}
                >
                  {m.role === "assistant" ? <ChatMessage content={m.content} /> : <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.content}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div role="status" className="rounded-2xl bg-neutral-100 px-3 py-2 text-sm text-neutral-600">
                  Finding an answer…
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex shrink-0 items-center gap-2 border-t border-neutral-100 p-3">
            <label htmlFor="aura-chat-input" className="sr-only">Message AURA Assistant</label>
            <input
              id="aura-chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about styling, sizing…"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-full border border-neutral-300 bg-neutral-50 px-4 text-base outline-none placeholder:text-neutral-500 focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
