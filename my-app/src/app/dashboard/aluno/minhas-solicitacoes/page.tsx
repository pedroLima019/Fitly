"use client";

import Header from "@/app/_components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { RequestStatus } from "@prisma/client";
import { StudentRequestCard } from "./_components/StudentRequestCard";
import { StudentRequestDetailModal } from "./_components/StudentRequestDetailModal";
import { StudentConfirmationModal } from "./_components/StudentConfirmationModal";
import { StudentRequestFilters } from "./_components/StudentRequestFilters";
import { StudentRequestStats } from "./_components/StudentRequestStats";
import { EmptyState } from "./_components/EmptyState";
import { LoadingState } from "./_components/LoadingState";
import { ErrorModal } from "./_components/ErrorModal";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"all" | RequestStatus>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    isOpen: boolean;
    type: "approved" | "rejected" | "canceled";
    personalName: string;
    personalImage: string | null;
    message: string;
  }>({
    isOpen: false,
    type: "approved",
    personalName: "",
    personalImage: null,
    message: "",
  });

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message && message.type !== "error") {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle error messages - show in modal
  const handleError = (errorText: string) => {
    setErrorMessage(errorText);
    setIsErrorModalOpen(true);
  };

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
        // Load all requests without status filter
        const response = await fetch(
          "/api/client-requests?type=sent&status=all",
          {
            method: "GET",
            credentials: "include",
          },
        );

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);

        if (!response.ok) {
          console.error("API error:", data.error);
          handleError(data.error || "Erro ao carregar solicitações");
          return;
        }

        console.log("Requests loaded:", data.requests);
        setRequests(data.requests || []);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        handleError("Erro ao carregar solicitações");
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

  // Handle Open Details
  const handleOpenDetails = (request: StudentRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  // Handle Close Details
  const handleCloseDetails = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedRequest(null), 300);
  };

  // Handle Cancel Request
  const handleCancelRequest = async (requestId: string) => {
    setProcessingId(requestId);
    const currentRequest = requests.find((r) => r.id === requestId);

    try {
      const response = await fetch(`/api/client-requests/${requestId}/cancel`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        handleError(data.error || "Erro ao cancelar solicitação");
        return;
      }

      setRequests((prev) => prev.filter((request) => request.id !== requestId));

      // Send notification to personal trainer
      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            recipientId: currentRequest?.personal.id,
            content: `Um aluno cancelou a solicitação de ${currentRequest?.personal.name}.`,
            type: "system",
          }),
        });
      } catch (err) {
        console.error("Erro ao enviar notificação:", err);
      }

      // Show confirmation modal
      setConfirmationData({
        isOpen: true,
        type: "canceled",
        personalName: currentRequest?.personal.name || "",
        personalImage: currentRequest?.personal.image || null,
        message: "",
      });

      // Close detail modal
      handleCloseDetails();
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      handleError("Erro ao cancelar solicitação");
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
                onOpenDetails={() => handleOpenDetails(request)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <StudentRequestDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetails}
          request={selectedRequest}
          onCancel={handleCancelRequest}
          isProcessing={processingId === selectedRequest.id}
        />
      )}

      {/* Confirmation Modal */}
      <StudentConfirmationModal
        isOpen={confirmationData.isOpen}
        onClose={() =>
          setConfirmationData({ ...confirmationData, isOpen: false })
        }
        type={confirmationData.type}
        personalName={confirmationData.personalName}
        personalImage={confirmationData.personalImage}
        message={confirmationData.message}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage || ""}
      />
    </main>
  );
}
