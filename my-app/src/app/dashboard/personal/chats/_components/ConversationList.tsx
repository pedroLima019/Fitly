"use client";

import Image from "next/image";
import { Search, MessageCircle } from "lucide-react";
import { useState, useMemo } from "react";

interface Conversation {
  id: string;
  studentId: string;
  studentName: string | null;
  studentImage: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedChat: string | null;
  onSelectConversation: (convo: Conversation) => void;
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  selectedChat,
  onSelectConversation,
  isLoading,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    return conversations.filter((convo) =>
      convo.studentName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [conversations, searchQuery]);

  const formatTimeAgo = (date: string | null) => {
    if (!date) return "";
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return messageDate.toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Carregando conversas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b flex-shrink-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
          Mensagens
        </h2>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageCircle size={40} className="text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">
              {conversations.length === 0
                ? "Nenhuma conversa iniciada"
                : "Nenhuma conversa encontrada"}
            </p>
          </div>
        ) : (
          filteredConversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => onSelectConversation(convo)}
              className={`w-full text-left p-3 sm:p-4 border-b transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 ${
                selectedChat === convo.id
                  ? "bg-blue-50 border-l-4 border-l-blue-900"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {convo.studentImage ? (
                  <Image
                    src={convo.studentImage}
                    alt={convo.studentName || "Aluno"}
                    width={48}
                    height={48}
                    className="rounded-full w-12 h-12 flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {convo.studentName?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {convo.studentName || "Aluno"}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTimeAgo(convo.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {convo.lastMessage || "Nenhuma mensagem"}
                  </p>
                </div>

                {/* Unread Badge */}
                {convo.unreadCount > 0 && selectedChat !== convo.id && (
                  <div className="flex items-center justify-center bg-blue-900 text-white text-xs font-bold rounded-full w-6 h-6 flex-shrink-0">
                    {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
