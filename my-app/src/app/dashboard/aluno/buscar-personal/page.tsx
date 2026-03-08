"use client";

import Header from "@/app/_components/Header";
import { useEffect, useState } from "react";

type PersonalCard = {
  id: string;
  name: string;
  specialties: string | null;
  location: string | null;
  bio: string | null;
  hourlyRate: number | null;
  pricePerSession: number | null;
  image: string | null;
  requestStatus: "none" | "pending" | "accepted" | "rejected";
};

export default function BuscarPersonal() {
  const [personals, setPersonals] = useState<PersonalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    const loadPersonals = async () => {
      try {
        const response = await fetch("/api/personals", {
          method: "GET",
          credentials: "include",
        });

        const text = await response.text();
        let data;

        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error("Erro ao fazer parse do JSON:", parseError);
          setMessage("Erro ao carregar personals");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          setMessage(data.error || "Erro ao carregar personals");
          setLoading(false);
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
  }, []);

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
        setRequestingId(null);
        return;
      }

      // Atualiza o status do personal no estado local
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

  const formatPrice = (price: number | null) => {
    if (!price) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getButtonText = (status: string) => {
    switch (status) {
      case "pending":
        return "Solicitação pendente";
      case "accepted":
        return "Conectado ✓";
      case "rejected":
        return "Solicitação recusada";
      default:
        return "Solicitar acompanhamento";
    }
  };

  const getButtonClass = (status: string, isLoading: boolean) => {
    const baseClass =
      "w-full px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-70";

    switch (status) {
      case "pending":
        return `${baseClass} bg-yellow-100 text-yellow-700 cursor-not-allowed`;
      case "accepted":
        return `${baseClass} bg-green-100 text-green-700 cursor-not-allowed`;
      case "rejected":
        return `${baseClass} bg-red-100 text-red-700 cursor-not-allowed`;
      default:
        return `${baseClass} bg-[#0F172A] text-white hover:opacity-90 disabled:opacity-70 ${isLoading ? "opacity-70" : ""}`;
    }
  };

  if (loading) {
    return (
      <main className="bg-white min-h-dvh">
        <Header />
        <section className="max-w-6xl mx-auto p-4 md:p-6">
          <p className="text-center text-zinc-600">Carregando personals...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-dvh">
      <Header />

      <section className="max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-xl md:text-3xl font-semibold mb-2">
          Buscar Personal
        </h1>
        <p className="text-zinc-600 mb-6 text-xs ">
          Encontre o personal trainer ideal para você
        </p>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md text-sm">
            {message}
          </div>
        )}

        {personals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600">
              Nenhum personal trainer disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personals.map((personal) => (
              <div
                key={personal.id}
                className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header do Card */}
                <div className="bg-linear-to-r from-[#0F172A] to-[#1a2d4d] p-4 text-white">
                  <h2 className="text-lg font-semibold mb-1">
                    {personal.name || "Personal"}
                  </h2>
                  {personal.location && (
                    <p className="text-xs text-zinc-300">
                      📍 {personal.location}
                    </p>
                  )}
                </div>

                {/* Corpo do Card */}
                <div className="p-4 space-y-3">
                  {/* Especialidades */}
                  {personal.specialties ? (
                    <div>
                      <p className="text-xs font-medium text-zinc-600 mb-2">
                        Especialidades
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {personal.specialties.split(",").map((spec, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                          >
                            {spec.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Especialidades não informadas
                    </p>
                  )}

                  {/* Bio */}
                  {personal.bio && (
                    <div>
                      <p className="text-xs font-medium text-zinc-600 mb-1">
                        Sobre
                      </p>
                      <p className="text-sm text-zinc-700 line-clamp-3">
                        {personal.bio}
                      </p>
                    </div>
                  )}

                  {/* Preços */}
                  <div className="border-t border-zinc-200 pt-3 space-y-1">
                    {personal.hourlyRate && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600">Valor/hora:</span>
                        <span className="font-semibold text-[#319F43]">
                          {formatPrice(personal.hourlyRate)}
                        </span>
                      </div>
                    )}
                    {personal.pricePerSession && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600">Valor/aula:</span>
                        <span className="font-semibold text-[#319F43]">
                          {formatPrice(personal.pricePerSession)}
                        </span>
                      </div>
                    )}
                    {!personal.hourlyRate && !personal.pricePerSession && (
                      <p className="text-xs text-zinc-500">
                        Preço não informado
                      </p>
                    )}
                  </div>
                </div>

                {/* Botão de Ação */}
                <button
                  onClick={() => handleRequestPersonal(personal.id)}
                  disabled={
                    personal.requestStatus !== "none" ||
                    requestingId === personal.id
                  }
                  className={`${getButtonClass(personal.requestStatus, requestingId === personal.id)} m-4`}
                >
                  {requestingId === personal.id
                    ? "Enviando..."
                    : getButtonText(personal.requestStatus)}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
