"use client";

import Header from "@/app/_components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { RequestStatus } from "@prisma/client";
import { StudentRequestCard } from "./_components/StudentRequestCard";
import { StudentRequestFilters } from "./_components/StudentRequestFilters";
import { StudentRequestStats } from "./_components/StudentRequestStats";
import { EmptyState } from "./_components/EmptyState";
import { LoadingState } from "./_components/LoadingState";
import { AlertCircle, CheckCircle } from "lucide-react";

type StudentRequest = {
  id: string;
  personal: {
    id: string;
    name: string;
    image: string | null;
  };
  message: string;
  status: RequestStatus;
  createdAt: string;
};

type MessageType = "success" | "error" | "info";

interface Message {
  text: string;
  type: MessageType;
}

export default function MinhasSolicitacoes() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State Management
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"all" | RequestStatus>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Authentication Check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Load Requests
  useEffect(() => {
    if (status !== "authenticated") return;

    const loadRequests = async () => {
      try {
        const response = await fetch("/api/client-requests?type=sent", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage({
            text: data.error || "Erro ao carregar solicitações",
            type: "error",
          });
          return;
        }

        setRequests(data.requests || []);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        setMessage({
          text: "Erro ao carregar solicitações",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [status]);

  // Filter and Search Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const statusMatch =
        selectedStatus === "all" || request.status === selectedStatus;
      const searchMatch = request.personal.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [requests, selectedStatus, searchQuery]);

  // Calculate Stats
  const stats = useMemo(() => {
    return {
      pending: requests.filter((request) => request.status === "pending")
        .length,
      accepted: requests.filter((request) => request.status === "accepted")
        .length,
      rejected: requests.filter((request) => request.status === "rejected")
        .length,
    };
  }, [requests]);

  // Handle Cancel Request
  const handleCancelRequest = async (requestId: string) => {
    setProcessingId(requestId);

    try {
      const response = await fetch(`/api/client-requests/${requestId}/cancel`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          text: data.error || "Erro ao cancelar solicitação",
          type: "error",
        });
        return;
      }

      setRequests((prev) => prev.filter((request) => request.id !== requestId));

      setMessage({
        text: "Solicitação cancelada com sucesso!",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      setMessage({
        text: "Erro ao cancelar solicitação",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Loading State
  if (status === "loading" || !session) {
    return (
      <main className="bg-[#0F172A] w-full h-dvh flex flex-col items-center justify-center">
        <p className="text-white">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <Header />

      <section className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-10">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl text-center font-bold text-gray-900 mb-2">
            Minhas Solicitações
          </h1>
          <p className="text-gray-600 text-center text-xs">
            Acompanhe o status das suas solicitações para personals
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-emerald-50 border border-[#00D97E]"
                : message.type === "error"
                  ? "bg-red-50 border border-red-300"
                  : "bg-blue-50 border border-[#0052CC]"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle
                className={`flex-shrink-0 ${
                  message.type === "success"
                    ? "text-[#00D97E]"
                    : message.type === "error"
                      ? "text-red-700"
                      : "text-[#0052CC]"
                }`}
                size={20}
              />
            ) : (
              <AlertCircle
                className={`flex-shrink-0 ${
                  message.type === "error" ? "text-red-700" : "text-[#0052CC]"
                }`}
                size={20}
              />
            )}
            <span
              className={`text-sm font-medium ${
                message.type === "success"
                  ? "text-[#00A65D]"
                  : message.type === "error"
                    ? "text-red-700"
                    : "text-[#0052CC]"
              }`}
            >
              {message.text}
            </span>
          </div>
        )}

        {/* Stats */}
        <StudentRequestStats {...stats} />

        {/* Filters */}
        <StudentRequestFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : filteredRequests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <StudentRequestCard
                key={request.id}
                {...request}
                onCancel={handleCancelRequest}
                isProcessing={processingId === request.id}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
