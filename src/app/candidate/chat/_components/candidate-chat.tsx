"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SessionUser } from "@/modules/auth/types";
import type {
  ConversationItem,
  ConversationMessageItem,
} from "../actions";
import { EmptyState } from "@/modules/workspace/EmptyState";

type Props = {
  session: SessionUser;
  conversations: ConversationItem[];
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Get a display label for a conversation participant */
function getConversationLabel(conv: ConversationItem): string {
  // Prefer staff name, then company name, then store, then fallback
  if (conv.staff_name) return conv.staff_name;
  if (conv.company_name) return conv.company_name;
  if (conv.store_name) return conv.store_name;
  return `Conversation #${conv.chat_uuid.slice(0, 8)}`;
}

/** Loading skeleton for the message view */
function MessageViewSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 p-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`h-16 rounded-lg ${
              i % 2 === 0 ? "w-2/3" : "w-1/2"
            } animate-pulse ${
              i % 2 === 0 ? "bg-coral/20" : "bg-border"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

/** Empty state for the selected conversation */
function EmptyConversation() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <EmptyState
        variant="empty"
        message="No messages yet"
        hint="Messages from employers and staff will appear here. Send a message to start the conversation."
      />
    </div>
  );
}

export function CandidateChatClient({ session, conversations }: Props) {
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ConversationMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Message input state
  const [inputText, setInputText] = useState("");

  // Refs for auto-scroll and polling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Scroll to the bottom of the message list */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const loadMessages = useCallback(async (conv: ConversationItem) => {
    setLoadingMessages(true);
    setError(null);

    try {
      const { getConversationMessages } = await import("../actions");
      const result = await getConversationMessages({
        chatUuid: conv.chat_uuid,
        limit: 100,
      });
      setMessages(result.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const selectConversation = useCallback(async (conv: ConversationItem) => {
    setSelectedConv(conv);
    setInputText("");
    await loadMessages(conv);

    // Start polling for new messages every 15 seconds
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    pollIntervalRef.current = setInterval(async () => {
      try {
        const { getConversationMessages } = await import("../actions");
        const result = await getConversationMessages({
          chatUuid: conv.chat_uuid,
          limit: 100,
        });
        setMessages((prev) => {
          // Only update if there are new messages
          if (result.messages.length !== prev.length) {
            return result.messages;
          }
          return prev;
        });
      } catch {
        // Silent fail on poll
      }
    }, 15000);
  }, [loadMessages]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  /** Send a new message */
  const sendMessage = useCallback(async () => {
    if (!selectedConv || !inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const { sendConversationMessage } = await import("../actions");
      const result = await sendConversationMessage({
        chatUuid: selectedConv.chat_uuid,
        message: text,
      });

      // Optimistically add the sent message to the list
      setMessages((prev) => [result.message, ...prev]);
    } catch (e) {
      console.error("Failed to send message:", e);
      // Restore the text on failure
      setInputText(text);
    } finally {
      setSending(false);
    }
  }, [selectedConv, inputText, sending]);

  /** Handle Enter key to send (Shift+Enter for newline) */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="flex flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Conversation list — Slack-style left sidebar */}
      <div className="w-[260px] shrink-0 overflow-y-auto bg-background border-r border-border">
        {/* Sidebar header */}
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Conversations
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {conversations.length} total
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState
              variant="empty"
              message="No conversations"
              hint="When employers or staff reach out, conversations will appear here."
            />
          </div>
        ) : (
          <ul className="py-1">
            {conversations.map((conv) => {
              const isActive = selectedConv?.chat_uuid === conv.chat_uuid;
              const label = getConversationLabel(conv);
              return (
                <li key={conv.chat_uuid} className="px-1">
                  <button
                    type="button"
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                      isActive
                        ? "bg-coral-light border-l-2 border-coral"
                        : "hover:bg-border border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm truncate ${
                          isActive ? "font-semibold text-foreground" : "font-medium text-foreground"
                        }`}
                      >
                        {label}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDate(conv.created_at)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {conv.company_name ? (
                        <>
                          {conv.store_name ? (
                            <>{conv.company_name} · {conv.store_name}</>
                          ) : (
                            <>{conv.company_name}</>
                          )}
                        </>
                      ) : (
                        <>Store #{conv.store_id}</>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Message view — right panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card">
        {!selectedConv ? (
          /* Initial state — no conversation selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-xs">
              <div className="text-3xl mb-3" aria-hidden="true">💬</div>
              <p className="text-sm font-medium text-foreground">
                Select a conversation
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Choose a conversation from the sidebar to view messages.
              </p>
            </div>
          </div>
        ) : loadingMessages ? (
          <MessageViewSkeleton />
        ) : error ? (
          /* Error state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-xs">
              <div className="text-3xl mb-3" aria-hidden="true">⚠️</div>
              <p className="text-sm font-semibold text-destructive">
                Failed to load messages
              </p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <button
                type="button"
                onClick={() => selectedConv && selectConversation(selectedConv)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-coral px-3 py-1.5 text-xs font-semibold text-white hover:bg-coral-hover transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="px-4 py-3 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {getConversationLabel(selectedConv).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {getConversationLabel(selectedConv)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConv.company_name ?? `Company #${selectedConv.company_id}`}
                    {selectedConv.store_name ? ` · ${selectedConv.store_name}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Message list (reversed display — newest at bottom) */}
            {messages.length === 0 ? (
              <EmptyConversation />
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {[...messages].reverse().map((msg) => {
                  const isFromCandidate = msg.from === "candidate";
                  return (
                    <div
                      key={msg.chat_message_uuid}
                      className={`flex ${isFromCandidate ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-3 ${
                          isFromCandidate
                            ? "bg-coral text-white rounded-br-sm"
                            : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {msg.message}
                        </p>
                        <div
                          className={`flex items-center justify-end gap-1.5 mt-1.5 ${
                            isFromCandidate ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-[11px]">
                            {formatFullDate(msg.created_at)}
                            {isFromCandidate ? " · You" : ""}
                          </span>
                          {/* Read status indicator for sent messages */}
                          {isFromCandidate && (
                            <span className="text-[11px]" title={msg.status ? "Read" : "Sent"}>
                              {msg.status ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Message input bar */}
            <div className="shrink-0 border-t border-border bg-card px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
                  disabled={sending}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!inputText.trim() || sending}
                  className="inline-flex items-center justify-center rounded-lg bg-coral px-4 py-2.5 text-sm font-semibold text-white hover:bg-coral-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {sending ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
