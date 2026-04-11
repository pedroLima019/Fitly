"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/_components/Header";
import { ConversationList } from "./_components/ConversationList";
import ChatWindow from "./_components/ChatWindow";

interface Conversation {
  id: string;
  personalId: string;
  personalName: string | null;
  personalImage: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
}

export default function StudentChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChatMobile, setShowChatMobile] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchConversations();
      const interval = setInterval(() => {
        fetchConversations();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [status, session?.user?.id, router]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedChat(conversation);
    setShowChatMobile(true);

    try {
      await fetch("/api/messages/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otherUserId: conversation.personalId }),
      });
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Não autenticado</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="w-full h-vh flex flex-col lg:flex-row p-2 gap-1">
        <div
          className={`
          w-full lg:w-80 bg-white border-r
          ${showChatMobile ? "hidden lg:flex lg:flex-col" : "flex flex-col"}
        `}
        >
          <ConversationList
            conversations={conversations}
            selectedChat={selectedChat?.id || null}
            onSelectConversation={handleSelectConversation}
            isLoading={loading}
          />
        </div>

        {/* Main Chat Area */}
        <div
          className={`
          flex-1 bg-white
          ${showChatMobile ? "flex flex-col" : "hidden lg:flex lg:flex-col"}
        `}
        >
          {selectedChat ? (
            <ChatWindow
              otherUserId={selectedChat.personalId}
              otherUserName={selectedChat.personalName || "Personal"}
              otherUserImage={selectedChat.personalImage}
              personalId={selectedChat.personalId}
              studentId={session.user.id}
              onBackClick={() => setShowChatMobile(false)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">
                  Selecione uma conversa
                </p>
                <p className="text-gray-400 text-sm">
                  Clique em uma conversa para começar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
