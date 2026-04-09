"use client";

import Header from "@/app/_components/Header";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ClientRequest = {
  id: string;
  student: {
    id: string;
    name: string;
    image: string | null;
  };
  message: string;
  status: string;
  createdAt: string;
};

export default function SolicitacoesPessoal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadRequests = async () => {
      try {
        const response = await fetch(
          "/api/client-requests?type=received&status=pending",
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Erro ao carregar solicitações");
          return;
        }

        setRequests(data.requests || []);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        setMessage("Erro ao carregar solicitações");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [status]);

  const handleApproveRequest = async (requestId: string) => {
    setApprovingId(requestId);

    try {
      const response = await fetch(`/api/client-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Erro ao aprovar solicitação");
        return;
      }

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setMessage("Solicitação aprovada!");
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      setMessage("Erro ao aprovar solicitação");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setRejectingId(requestId);

    try {
      const reason = rejectReason[requestId] || "Não há motivo especificado";

      const response = await fetch(`/api/client-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "reject",
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Erro ao rejeitar solicitação");
        return;
      }

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setMessage("Solicitação rejeitada!");
      setRejectReason((prev) => {
        const newReason = { ...prev };
        delete newReason[requestId];
        return newReason;
      });
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      setMessage("Erro ao rejeitar solicitação");
    } finally {
      setRejectingId(null);
    }
  };

  if (status === "loading" || !session) {
    return (
      <main className="bg-[#0F172A] w-full h-dvh flex flex-col items-center justify-center">
        <p className="text-white">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <Header />

      <section className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-xl font-semibold  text-center mb-6">
          Solicitações de alunos
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md text-sm">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-center text-zinc-600">
            Carregando solicitações...
          </p>
        ) : requests.length === 0 ? (
          <p className="text-center text-zinc-600 py-12 text-sm">
            Nenhuma solicitação pendente.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-[#0F172A] text-white rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {request.student.image ? (
                        <Image
                          src={request.student.image}
                          alt={request.student.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {request.student.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">
                        {request.student.name}
                      </h3>
                      <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                        {request.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(request.createdAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <div className="space-y-2 mb-3">
                    <label className="block text-xs font-semibold">
                      Motivo da recusa (opcional)
                    </label>
                    <textarea
                      value={rejectReason[request.id] || ""}
                      onChange={(e) =>
                        setRejectReason((prev) => ({
                          ...prev,
                          [request.id]: e.target.value,
                        }))
                      }
                      placeholder="Deixe um feedback para o aluno (opcional)"
                      className="w-full border border-gray-700 bg-gray-900 text-white rounded p-2 text-xs"
                      maxLength={200}
                      disabled={
                        approvingId === request.id || rejectingId === request.id
                      }
                    />
                    <p className="text-xs text-gray-500">
                      {(rejectReason[request.id] || "").length}/200
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={
                        rejectingId === request.id || approvingId === request.id
                      }
                      className="flex-1 p-2 rounded text-xs font-medium text-white bg-[#319F43] hover:bg-green-700 disabled:opacity-50"
                    >
                      {approvingId === request.id ? "Aprovando..." : "Aprovar"}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={
                        rejectingId === request.id || approvingId === request.id
                      }
                      className="flex-1 p-2 rounded text-xs font-medium text-white bg-red-700 hover:bg-red-800 disabled:opacity-50"
                    >
                      {rejectingId === request.id
                        ? "Rejeitando..."
                        : "Rejeitar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
