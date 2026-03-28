"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";

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
  personalId: string;
  studentId: string;
}

export default function ChatBox({
  otherUserId,
  otherUserName,
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

  // Buscar histórico ao montar
  useEffect(() => {
    const fetchMessages = async () => {
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

    fetchMessages();
  }, [otherUserId]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Marcar como lido quando abrir chat
  useEffect(() => {
    if (isConnected && messages.length > 0) {
      markAsRead(personalId, studentId);
    }
  }, [isConnected, messages, personalId, studentId, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !session?.user?.id) return;

    try {
      // Enviar via API
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

        // Enviar via Socket.io também
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

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Parar digitação após 2 segundos sem digitar
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
    <div className="flex flex-col h-96 bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                <div className="flex flex-col items-center">
                  {msg.sender.image ? (
                    <img
                      src={msg.sender.image}
                      alt={msg.sender.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                      {msg.sender.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              )}
              <div
                className={`max-w-xs ${
                  msg.senderId === session?.user?.id ? "flex-row-reverse" : ""
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-1 ${
                    msg.senderId === session?.user?.id
                      ? "text-right text-blue-600"
                      : "text-left text-gray-700"
                  }`}
                >
                  {msg.sender.name || "Anônimo"}
                </p>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.senderId === session?.user?.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
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
                </div>
              </div>
            </div>
          ))
        )}

        {/* Indicador de digitação */}
        {isTyping && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
