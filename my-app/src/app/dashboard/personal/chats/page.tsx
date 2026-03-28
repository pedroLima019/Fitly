"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";

interface Conversation {
  id: string;
  studentId: string;
  studentName: string | null;
  studentImage: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
}

export default function PersonalChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{
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

      // Atualizar conversas a cada 5 segundos (polling)
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Minhas Conversas
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Lista de Conversas */}
        <div className="col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
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
                    setSelectedChat(convo.id);
                    setSelectedStudent({
                      id: convo.studentId,
                      name: convo.studentName,
                    });
                  }}
                  className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-gray-50 transition ${
                    selectedChat === convo.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {convo.studentName || "Aluno"}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {convo.lastMessage || "Nenhuma mensagem"}
                      </p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="ml-2 inline-block bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="col-span-2">
          {selectedChat && selectedStudent ? (
            <ChatBox
              otherUserId={selectedStudent.id}
              otherUserName={selectedStudent.name || "Aluno"}
              personalId={session.user.id}
              studentId={selectedStudent.id}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 h-96 flex items-center justify-center">
              <p className="text-gray-500">
                Selecione uma conversa para começar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
