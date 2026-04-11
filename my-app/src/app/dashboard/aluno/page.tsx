"use client";

import Header from "@/app/_components/Header";
import PersonalCard, {
  type PersonalCardData,
} from "./_components/PersonalCard";
import PersonalSearchInput from "./_components/PersonalSearchInput";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [personals, setPersonals] = useState<PersonalCardData[]>([]);
  const [loadingPersonals, setLoadingPersonals] = useState(true);
  const [message, setMessage] = useState("");
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

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
        setLoadingPersonals(false);
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

  const filteredPersonals = personals.filter((personal) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const name = (personal.name || "").toLowerCase();
    const specialties = (personal.specialties || "").toLowerCase();
    const trainings = (personal.trainings || [])
      .map((training) => training.name.toLowerCase())
      .join(" ");

    return (
      name.includes(query) ||
      specialties.includes(query) ||
      trainings.includes(query)
    );
  });

  if (status === "loading" || !session) {
    return (
      <main className="bg-[#0F172A] w-full h-dvh flex flex-col items-center justify-center ">
        <p className="text-white">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-dvh">
      <Header />

      <section className="max-w-6xl mx-auto p-2 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-4">
          <div
            onClick={() => router.push("/dashboard/aluno/chats")}
            className="p-4 bg-green-700 from-blue-50 to-blue-100 rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-sm font-bold text-white mb-1">
              Minhas Conversas
            </h2>
            <p className="text-white text-xs">
              Chat com seus personals trainers
            </p>
          </div>

          <div
            onClick={() => router.push("/dashboard/aluno/minhas-solicitacoes")}
            className="p-4 bg-[#0F172A] rounded-lg  cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-sm font-bold text-white mb-1">
              Minhas Solicitações
            </h2>
            <p className="text-white text-xs">
              Acompanhe o status de suas solicitações
            </p>
          </div>
        </div>

        <PersonalSearchInput value={search} onChange={setSearch} />
        {message ? (
          <div className="mb-4 p-3 bg-blue-100 text-green-600 rounded-md text-sm">
            {message}
          </div>
        ) : null}

        {loadingPersonals ? (
          <p className="text-center text-zinc-600">Encontrando personais...</p>
        ) : filteredPersonals.length === 0 ? (
          <p className="text-center text-zinc-600 py-12 text-sm">
            Nenhum personal encontrado para essa pesquisa.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPersonals.map((personal) => (
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
