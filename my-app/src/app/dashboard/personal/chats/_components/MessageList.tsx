"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: string;
  personalId: string;
  studentId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isTyping?: boolean;
  isLoading?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  isTyping = false,
  isLoading = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Carregando mensagens...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-sm text-center">
            Inicie uma conversa enviando uma mensagem
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => {
            // Check if should show avatar (hide if multiple consecutive messages from same sender)
            const showAvatar =
              index === 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                isOwn={msg.senderId === currentUserId}
                senderName={msg.sender.name || "Anônimo"}
                senderImage={msg.sender.image}
                timestamp={msg.createdAt}
                isRead={!!msg.readAt}
                showAvatar={showAvatar}
              />
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 p-2 bg-gray-200 rounded-lg w-fit">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
