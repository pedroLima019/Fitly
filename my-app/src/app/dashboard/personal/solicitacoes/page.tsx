"use client";

import Header from "@/app/_components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { RequestStatus } from "@prisma/client";
import { RequestCard } from "./_components/RequestCard";
import { RequestDetailModal } from "./_components/RequestDetailModal";
import { ConfirmationModal } from "./_components/ConfirmationModal";
import { RequestFilters } from "./_components/RequestFilters";
import { RequestStats } from "./_components/RequestStats";
import { EmptyState } from "./_components/EmptyState";
import { LoadingState } from "./_components/LoadingState";
import { AlertCircle, CheckCircle } from "lucide-react";

type ClientRequest = {
  id: string;
  student: {
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

export default function SolicitacoesPessoal() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State Management
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"all" | RequestStatus>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    isOpen: boolean;
    type: "approved" | "rejected" | "canceled";
    studentName: string;
    studentImage: string | null;
    message: string;
  }>({
    isOpen: false,
    type: "approved",
    studentName: "",
    studentImage: null,
    message: "",
  });

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
        const response = await fetch("/api/client-requests?type=received", {
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
      const searchMatch = request.student.name
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

  // Handle Approve
  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    const currentRequest = requests.find((r) => r.id === requestId);

    try {
      const response = await fetch(`/api/client-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          text: data.error || "Erro ao aprovar solicitação",
          type: "error",
        });
        return;
      }

      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: "accepted" as RequestStatus }
            : request,
        ),
      );

      // Show confirmation modal
      setConfirmationData({
        isOpen: true,
        type: "approved",
        studentName: currentRequest?.student.name || "",
        studentImage: currentRequest?.student.image || null,
        message: "",
      });

      // Close detail modal
      handleCloseDetails();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      setMessage({
        text: "Erro ao aprovar solicitação",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Open Details
  const handleOpenDetails = (request: ClientRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  // Handle Close Details
  const handleCloseDetails = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedRequest(null), 300);
  };

  // Handle Reject
  const handleReject = async (requestId: string, reason: string) => {
    setProcessingId(requestId);
    const currentRequest = requests.find((r) => r.id === requestId);
    const wasPreviouslyAccepted = currentRequest?.status === "accepted";

    try {
      const response = await fetch(`/api/client-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "reject",
          reason: reason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          text: data.error || "Erro ao rejeitar solicitação",
          type: "error",
        });
        return;
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "rejected" as RequestStatus }
            : r,
        ),
      );

      // Send notification to student
      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            recipientId: currentRequest?.student.id,
            content: wasPreviouslyAccepted
              ? `${currentRequest?.student.name}, o personal desfez a aceitação da sua solicitação.`
              : `Sua solicitação foi rejeitada${reason ? `: ${reason}` : ""}`,
            type: "system",
          }),
        });
      } catch (err) {
        console.error("Erro ao enviar notificação:", err);
      }

      // Show confirmation modal
      setConfirmationData({
        isOpen: true,
        type: wasPreviouslyAccepted ? "canceled" : "rejected",
        studentName: currentRequest?.student.name || "",
        studentImage: currentRequest?.student.image || null,
        message: reason,
      });

      // Close detail modal
      handleCloseDetails();
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      setMessage({
        text: "Erro ao rejeitar solicitação",
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
        <div className="mb-5">
          <h1 className="text-2xl text-center font-bold text-gray-900 mb-2">
            Solicitações
          </h1>
          <p className="text-gray-600 text-xs text-center">
            Gerencie as solicitações de alunos que desejam trabalhar com você
          </p>
        </div>

        {/* Stats */}
        {!loading && <RequestStats {...stats} />}

        {/* Filters */}
        {!loading && (
          <RequestFilters
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            message={
              requests.length === 0
                ? "Nenhuma solicitação recebida ainda"
                : searchQuery
                  ? "Nenhuma solicitação encontrada com esse criério"
                  : "Nenhuma solicitação neste status"
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                {...request}
                onApprove={handleApprove}
                onReject={handleReject}
                onOpenDetails={() => handleOpenDetails(request)}
                isProcessing={processingId === request.id}
              />
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <RequestDetailModal
            request={selectedRequest}
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={processingId === selectedRequest.id}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationData.isOpen}
          onClose={() =>
            setConfirmationData({ ...confirmationData, isOpen: false })
          }
          type={confirmationData.type}
          studentName={confirmationData.studentName}
          studentImage={confirmationData.studentImage}
          message={confirmationData.message}
        />
      </section>
    </main>
  );
}
