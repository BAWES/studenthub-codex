"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/modules/auth/types";
import type {
  ConversationItem,
  ConversationMessageItem,
} from "../actions";
import { MessageSquare, RefreshCw } from "lucide-react";

type Props = {
  session: SessionUser;
  conversations: ConversationItem[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function getConversationLabel(conv: ConversationItem): string {
  if (conv.company_id) return `Company #${conv.company_id}`;
  if (conv.staff_id) return `Staff #${conv.staff_id}`;
  return "Conversation";
}

function getConversationMeta(conv: ConversationItem): string {
  const parts: string[] = [];
  if (conv.company_id) parts.push(`Company #${conv.company_id}`);
  if (conv.staff_id) parts.push(`Staff #${conv.staff_id}`);
  return parts.join(" · ");
}

// ---------------------------------------------------------------------------
// Skeleton shimmer
// ---------------------------------------------------------------------------

function ChatSkeleton() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left skeleton */}
      <div className="w-[260px] shrink-0 bg-[#f4f2ef] border-r border-[#e8e6e3] overflow-y-auto">
        <div className="p-3 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-white/60 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
      {/* Right skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              i % 2 === 0 ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "h-12 w-48 rounded-xl animate-pulse",
                i % 2 === 0
                  ? "bg-[var(--sh-coral)]/30"
                  : "bg-[#e8e6e3]",
              )}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CandidateChatClient({ session, conversations }: Props) {
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ConversationMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectConversation = useCallback(async (conv: ConversationItem) => {
    setSelectedConv(conv);
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

  const retryLoad = useCallback(() => {
    if (selectedConv) selectConversation(selectedConv);
  }, [selectedConv, selectConversation]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Conversation list — Slack-style left panel ── */}
      <aside className="w-[260px] shrink-0 bg-[#f4f2ef] border-r border-[#e8e6e3] overflow-y-auto flex flex-col">
        {/* Section header */}
        <div className="px-3 pt-3 pb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6e6b66]">
            Conversations
          </span>
          <span className="text-[10px] text-[#a09d98] font-medium">
            {conversations.length}
          </span>
        </div>

        {conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
            <MessageSquare size={28} className="text-[#a09d98] mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-[#6e6b66] font-medium">
              No conversations yet
            </p>
            <p className="text-[11px] text-[#a09d98] mt-1">
              Messages from employers will appear here
            </p>
          </div>
        ) : (
          <ul className="px-2 py-1.5 space-y-0.5">
            {conversations.map((conv) => {
              const isActive = selectedConv?.chat_uuid === conv.chat_uuid;
              return (
                <li key={conv.chat_uuid}>
                  <button
                    type="button"
                    onClick={() => selectConversation(conv)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150",
                      "hover:bg-[#e8e6e3]",
                      isActive &&
                        "bg-[var(--sh-coral-light)] shadow-[inset_3px_0_0_0_var(--sh-coral)]",
                      !isActive && "bg-transparent",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-[13px] truncate",
                          isActive
                            ? "font-semibold text-[var(--sh-coral)]"
                            : "font-medium text-[#1d1c1a]",
                        )}
                      >
                        {getConversationLabel(conv)}
                      </span>
                      <span className="text-[10px] text-[#a09d98] shrink-0">
                        {formatDate(conv.created_at)}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#a09d98] block mt-0.5 truncate">
                      {getConversationMeta(conv)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* ── Message view — right panel ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {!selectedConv ? (
          /* ── No conversation selected ── */
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageSquare
              size={40}
              className="text-[#e8e6e3] mb-4"
              strokeWidth={1}
            />
            <p className="text-[15px] text-[#a09d98] font-medium">
              Select a conversation
            </p>
            <p className="text-[13px] text-[#c4c2bd] mt-1">
              Choose a conversation from the left to view messages
            </p>
          </div>
        ) : loadingMessages ? (
          /* ── Loading state ── */
          <ChatSkeleton />
        ) : error ? (
          /* ── Error state ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-14 h-14 rounded-full bg-[#fef1ef] flex items-center justify-center mb-4">
              <RefreshCw size={24} className="text-[var(--sh-coral)]" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] text-[#1d1c1a] font-medium">
              Failed to load messages
            </p>
            <p className="text-[13px] text-[#6e6b66] mt-1 mb-4 text-center max-w-xs">
              {error}
            </p>
            <button
              type="button"
              onClick={retryLoad}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[var(--sh-coral)] hover:bg-[var(--sh-coral-hover)] transition-colors"
            >
              <RefreshCw size={14} strokeWidth={2} />
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          /* ── Empty conversation ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <MessageSquare size={32} className="text-[#e8e6e3] mb-3" strokeWidth={1} />
            <p className="text-[15px] text-[#6e6b66] font-medium">
              No messages
            </p>
            <p className="text-[13px] text-[#a09d98] mt-1 text-center">
              This conversation has no messages yet
            </p>
          </div>
        ) : (
          /* ── Messages list ── */
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            {messages.map((msg) => {
              const isFromCandidate = msg.from === "candidate";
              return (
                <div
                  key={msg.chat_message_uuid}
                  className={cn(
                    "flex",
                    isFromCandidate ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                      isFromCandidate
                        ? "bg-[var(--sh-coral)] text-white rounded-br-md"
                        : "bg-[#f4f2ef] text-[#1d1c1a] rounded-bl-md",
                    )}
                  >
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] mt-1.5",
                        isFromCandidate
                          ? "text-white/70"
                          : "text-[#a09d98]",
                      )}
                    >
                      {formatFullDate(msg.created_at)}
                      {msg.message_index ? ` · #${msg.message_index}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
