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

  const handleRequestPersonal = async (personalId: string) => {
    setRequestingId(personalId);

    try {
      const response = await fetch("/api/client-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          personalId,
          message: "Gostaria de trabalhar com você",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Erro ao enviar solicitação");
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
      setMessage("Erro ao enviar solicitação");
    } finally {
      setRequestingId(null);
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

      <section className="max-w-6xl mx-auto p-3 md:p-6">
        <PersonalSearchInput value={search} onChange={setSearch} />
        {message ? (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md text-sm">
            {message}
          </div>
        ) : null}

        {loadingPersonals ? (
          <p className="text-center text-zinc-600">Encontrando personais...</p>
        ) : filteredPersonals.length === 0 ? (
          <p className="text-center text-zinc-600 py-12">
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
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
