"use client";

import { useState, useCallback } from "react";
import type { SessionUser } from "@/modules/auth/types";
import type {
  ConversationItem,
  ConversationMessageItem,
} from "./actions";

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
      const { getConversationMessages } = await import("./actions");
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

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Conversation list — left panel */}
      <div className="w-80 border-r shrink-0 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No conversations yet
          </div>
        ) : (
          <ul className="divide-y">
            {conversations.map((conv) => {
              const isActive = selectedConv?.chat_uuid === conv.chat_uuid;
              return (
                <li key={conv.chat_uuid}>
                  <button
                    type="button"
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-accent ${
                      isActive ? "bg-accent font-medium" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate font-medium">
                        Conversation
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(conv.created_at)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Company #{conv.company_id}
                      {conv.staff_id ? ` · Staff #${conv.staff_id}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Message view — right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Select a conversation to view messages
            </p>
          </div>
        ) : loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No messages in this conversation</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {messages.map((msg) => {
              const isFromCandidate = msg.from === "candidate";
              return (
                <div
                  key={msg.chat_message_uuid}
                  className={`flex ${isFromCandidate ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      isFromCandidate
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isFromCandidate
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatFullDate(msg.created_at)}
                      {msg.message_index && ` · #${msg.message_index}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
