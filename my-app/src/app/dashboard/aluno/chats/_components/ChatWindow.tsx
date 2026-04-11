"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

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

interface ChatWindowProps {
  otherUserId: string;
  otherUserName: string;
  otherUserImage: string | null;
  personalId: string;
  studentId: string;
  onBackClick?: () => void;
}

export default function ChatWindow({
  otherUserId,
  otherUserName,
  otherUserImage,
  personalId,
  studentId,
  onBackClick,
}: ChatWindowProps) {
  const { data: session } = useSession();
  const { isConnected, sendMessage, markAsRead, setTyping } = useSocket(
    session?.user?.id,
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialFetchDone = useRef(false);

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessagesOnce = async () => {
      try {
        const response = await fetch(
          `/api/messages?otherUserId=${otherUserId}`,
          { credentials: "include" },
        );
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialFetchDone.current) {
      fetchMessagesOnce();
      initialFetchDone.current = true;
    }
  }, [otherUserId]);

  // WebSocket: receive new messages
  useEffect(() => {
    if (!isConnected) return;

    // @ts-ignore
    window.socket?.on("message:receive", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      // @ts-ignore
      window.socket?.off("message:receive");
    };
  }, [isConnected]);

  // Mark messages as read
  useEffect(() => {
    if (isConnected && messages.length > 0) {
      markAsRead(personalId, studentId);
    }
  }, [isConnected, messages, personalId, studentId, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !session?.user?.id) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          otherUserId: otherUserId,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        sendMessage(personalId, studentId, newMessage, session.user.id);
        setNewMessage("");
        setIsTyping(false);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!isTyping) {
      setIsTyping(true);
      setTyping(personalId, studentId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(personalId, studentId, false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border overflow-hidden">
      <ChatHeader
        otherUserName={otherUserName}
        otherUserImage={otherUserImage}
        isOnline
        onBack={onBackClick}
        showBackButton={false}
      />

      <MessageList
        messages={messages}
        currentUserId={session?.user?.id || ""}
        isTyping={isTyping}
        isLoading={loading}
      />

      <MessageInput
        value={newMessage}
        onChange={handleTyping}
        onSubmit={handleSendMessage}
      />
    </div>
  );
}
