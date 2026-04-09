"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import Image from "next/image";

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

interface ChatBoxProps {
  otherUserId: string;
  otherUserName: string;
  otherUserImage: string | null;
  personalId: string;
  studentId: string;
}

export default function ChatBox({
  otherUserId,
  otherUserName,
  otherUserImage,
  personalId,
  studentId,
}: ChatBoxProps) {
  const { data: session } = useSession();
  const { isConnected, sendMessage, markAsRead, setTyping } = useSocket(
    session?.user?.id,
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    // ✅ OTIMIZADO: Fetch inicial apenas UMA VEZ (em vez de polling a cada 2s)
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

  // ✅ OTIMIZADO: Usar Socket.io para receber mensagens em tempo real
  useEffect(() => {
    if (!isConnected) return;

    // Listener para novas mensagens
    // @ts-ignore
    window.socket?.on("message:receive", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      // @ts-ignore
      window.socket?.off("message:receive");
    };
  }, [isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Carregando mensagens...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 sm:h-screen lg:h-auto lg:min-h-96 bg-white rounded-lg border">
      <div className="p-3 sm:p-4 border-b flex items-center justify-between flex-shrink-0 bg-gray-50">
        <div className="flex items-center gap-2 sm:gap-3">
          {otherUserImage ? (
            <Image
              src={otherUserImage}
              alt={otherUserName}
              width={44}
              height={44}
              className="rounded-full w-11 h-11 sm:w-12 sm:h-12"
            />
          ) : (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-900 flex items-center justify-center text-white text-base sm:text-lg font-bold">
              {otherUserName?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">
              {otherUserName}
            </h3>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-5 flex-1">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            Nenhuma mensagem ainda
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${
                msg.senderId === session?.user?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {msg.senderId !== session?.user?.id && (
                <div className="flex flex-col items-center flex-shrink-0">
                  {msg.sender.image ? (
                    <Image
                      src={msg.sender.image}
                      alt={msg.sender.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full w-8 h-8"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                      {msg.sender.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              )}
              <div
                className={`max-w-xs sm:max-w-sm ${
                  msg.senderId === session?.user?.id ? "flex-row-reverse" : ""
                }`}
              >
                <p
                  className={`text-xs sm:text-sm font-semibold mb-1 ${
                    msg.senderId === session?.user?.id
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {msg.sender.name || "Anônimo"}
                </p>
                <div
                  className={`px-3 sm:px-4 py-2 rounded-lg ${
                    msg.senderId === session?.user?.id
                      ? "bg-blue-900 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p
                      className={`text-xs ${
                        msg.senderId === session?.user?.id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {msg.senderId === session?.user?.id && (
                      <span
                        className={`text-xs font-bold ${
                          msg.readAt ? "text-blue-300" : "text-gray-400"
                        }`}
                      >
                        {msg.readAt ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-1.5 p-2 sm:p-3">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 border-t flex gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-3 py-2 border rounded-lg text-xs sm:text-sm"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 sm:px-4 bg-blue-900 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
