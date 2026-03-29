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
  ) => {
    setSelectedChat(conversationId);
    setSelectedPersonal({
      id: personalId,
      name: personalName,
    });

    // Marcar mensagens como lidas
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
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 text-center">Minhas Conversas</h1>

      <div className="flex flex-col gap-2">
        <div className=" bg-white rounded-lg border overflow-hidden max-h-20 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>Nenhuma conversa iniciada</p>
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
                    );
                  }}
                  className="w-full text-left p-4 border-b last:border-b-0 hover:bg-gray-300 duration-300 transition"
                >
                  <div className="flex items-center justify-between ">
                    <div className="flex gap-3 justify-center items-center">
                      {convo.personalImage ? (
                        <Image
                          src={convo.personalImage}
                          alt={convo.personalName || "Personal"}
                          width={30}
                          height={30}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold">
                          {convo.personalName?.charAt(0).toUpperCase() || "P"}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {convo.personalName || "Personal"}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {convo.lastMessage || "Nenhuma mensagem"}
                        </p>
                      </div>
                    </div>
                    {convo.unreadCount > 0 && selectedChat !== convo.id && (
                      <span className="flex items-center justify-center bg-green-700 text-white text-xs font-bold p-2 rounded-full w-6 h-6">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2">
          {selectedChat && selectedPersonal ? (
            <ChatBox
              otherUserId={selectedPersonal.id}
              otherUserName={selectedPersonal.name || "Personal"}
              personalId={selectedPersonal.id}
              studentId={session.user.id}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 h-96 flex items-center justify-center">
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
