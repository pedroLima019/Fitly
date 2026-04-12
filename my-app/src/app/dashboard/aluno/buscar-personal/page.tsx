"use client";

import Header from "@/app/_components/Header";
import PersonalCard, {
  type PersonalCardData,
} from "@/app/dashboard/aluno/_components/PersonalCard";
import SuccessModal from "@/app/dashboard/aluno/_components/SuccessModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PersonalSearchInput from "../_components/PersonalSearchInput";

export default function BuscarPersonal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [personals, setPersonals] = useState<PersonalCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (message && message.includes("sucesso")) {
      setShowModal(true);
    }
  }, [message]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadPersonals = async () => {
      try {
        const response = await fetch("/api/personals", {
          method: "GET",
          credentials: "include",
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
          setMessage(data.error || "Erro ao carregar personals");
          return;
        }

        setPersonals(data.personals || []);
      } catch (error) {
        console.error("Erro ao carregar personals:", error);
        setMessage("Erro ao carregar personals");
      } finally {
        setLoading(false);
      }
    };

    loadPersonals();
  }, [status]);

  const handleRequestPersonal = async (
    personalId: string,
    data: { objective: string; availability: string },
  ) => {
    setRequestingId(personalId);

    try {
      const response = await fetch("/api/client-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          personalId,
          objective: data.objective,
          availability: data.availability,
          message: `${data.objective} - Disponível: ${data.availability}`,
        }),
      });

      const text = await response.text();
      let data_;

      try {
        data_ = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        console.error("Resposta recebida:", text);
        setMessage("Erro ao processar resposta do servidor");
        return;
      }

      if (!response.ok) {
        setMessage(data_.error || "Erro ao enviar solicitação");
        return;
      }

      setPersonals((prev) =>
        prev.map((p) =>
          p.id === personalId ? { ...p, requestStatus: "pending" } : p,
        ),
      );

      setMessage("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      setMessage(
        "Erro ao enviar solicitação: " +
          (error instanceof Error ? error.message : "Desconhecido"),
      );
    } finally {
      setRequestingId(null);
    }
  };

  const handleCancelRequest = async (personalId: string) => {
    try {
      const personal = personals.find((p) => p.id === personalId);
      if (!personal) return;

      const response = await fetch("/api/client-requests", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      const requests = data.requests || [];
      const request = requests.find(
        (r: { personalId: string }) => r.personalId === personalId,
      );

      if (!request) {
        setMessage("Solicitação não encontrada");
        return;
      }

      const cancelResponse = await fetch(
        `/api/client-requests/${request.id}/cancel`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json();
        setMessage(errorData.error || "Erro ao cancelar solicitação");
        return;
      }

      setPersonals((prev) =>
        prev.map((p) =>
          p.id === personalId ? { ...p, requestStatus: "none" } : p,
        ),
      );
      setMessage("Solicitação cancelada com sucesso!");
    } catch (error) {
      console.error("Erro ao cancelar solicitação:", error);
      setMessage("Erro ao cancelar solicitação");
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
    <main className="bg-white min-h-dvh  md:pb-0">
      <Header />

      <section className="max-w-6xl mx-auto p-2 md:p-6">
        <h1 className="text-lg text-center md:text-3xl font-semibold mb-1 ">
          Encontre um Personal
        </h1>
        <p className="text-zinc-600 text-center mb-2 text-xs">
          Explore nossos profissionais disponíveis
        </p>

        <PersonalSearchInput value={search} onChange={setSearch} />

        <SuccessModal
          message={message}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setMessage("");
          }}
        />

        {loading ? (
          <p className="text-center text-zinc-600">Carregando personals...</p>
        ) : personals.length === 0 ? (
          <p className="text-center text-zinc-600 py-12 text-sm">
            Nenhum personal encontrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personals.map((personal) => (
              <PersonalCard
                key={personal.id}
                personal={personal}
                requestingId={requestingId}
                onRequestPersonal={handleRequestPersonal}
                onCancelRequest={handleCancelRequest}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
