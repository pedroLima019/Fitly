"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatBox from "@/app/_components/ChatBox";
import Image from "next/image";

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
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedPersonal, setSelectedPersonal] = useState<{
    id: string;
    name: string | null;
    image: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
      console.log("Conversas recebidas:", data);
      if (response.ok) {
        setConversations(data.conversations || []);
      } else {
        console.error("Erro no response:", response.status, data);
      }
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (
    conversationId: string,
    personalId: string,
    personalName: string | null,
    personalImage: string | null,
  ) => {
    setSelectedChat(conversationId);
    setSelectedPersonal({
      id: personalId,
      name: personalName,
      image: personalImage,
    });

    try {
      await fetch("/api/messages/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otherUserId: personalId }),
      });
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Não autenticado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <h1 className="text-lg sm:text-2xl font-bold mb-4 text-center">
        Minhas Conversas
      </h1>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2 lg:gap-4">
        <div className="col-span-1 bg-white rounded-lg border overflow-hidden max-h-96 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Nenhuma conversa iniciada</p>
            </div>
          ) : (
            <div>
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => {
                    handleSelectConversation(
                      convo.id,
                      convo.personalId,
                      convo.personalName,
                      convo.personalImage,
                    );
                  }}
                  className={`w-full text-left p-3 sm:p-4 border-b last:border-b-0 hover:bg-gray-100 lg:hover:bg-gray-50 duration-300 transition ${
                    selectedChat === convo.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 sm:gap-3 justify-center items-center min-w-0">
                      {convo.personalImage ? (
                        <Image
                          src={convo.personalImage}
                          alt={convo.personalName || "Personal"}
                          width={40}
                          height={40}
                          className="rounded-full flex-shrink-0 w-10 h-10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {convo.personalName?.charAt(0).toUpperCase() || "P"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {convo.personalName || "Personal"}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {convo.lastMessage || "Nenhuma mensagem"}
                        </p>
                      </div>
                    </div>
                    {convo.unreadCount > 0 && selectedChat !== convo.id && (
                      <span className="flex items-center justify-center bg-blue-900 text-white text-xs font-bold p-1 sm:p-2 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2">
          {selectedChat && selectedPersonal ? (
            <ChatBox
              otherUserId={selectedPersonal.id}
              otherUserName={selectedPersonal.name || "Personal"}
              otherUserImage={selectedPersonal.image}
              personalId={selectedPersonal.id}
              studentId={session.user.id}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 h-96 sm:h-screen lg:h-auto lg:min-h-96 flex items-center justify-center p-4">
              <p className="text-gray-500 text-center text-sm">
                Selecione uma conversa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
