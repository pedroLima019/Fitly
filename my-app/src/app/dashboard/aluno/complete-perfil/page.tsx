"use client";

import Header from "@/app/_components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StudentProfileForm = {
  name: string;
  location: string;
  goal: string;
  trainingLevel: string;
  availability: string;
  workoutPlace: string;
  limitations: string;
};

export default function CompletePerfilAluno() {
  const router = useRouter();
  const { update } = useSession();
  const [form, setForm] = useState<StudentProfileForm>({
    name: "",
    location: "",
    goal: "",
    trainingLevel: "",
    availability: "",
    workoutPlace: "",
    limitations: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [showModal, setShowModal] = useState(false);
  const [availabilityStart, setAvailabilityStart] = useState("");
  const [availabilityEnd, setAvailabilityEnd] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile/student", {
          method: "GET",
          credentials: "include",
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
          setMessage(data.error || "Erro ao carregar perfil");
          setMessageType("error");
          setShowModal(true);
          return;
        }

        setForm({
          name: data.profile?.name ?? "",
          location: data.profile?.location ?? "",
          goal: data.profile?.goal ?? "",
          trainingLevel: data.profile?.trainingLevel ?? "",
          availability: data.profile?.availability ?? "",
          workoutPlace: data.profile?.workoutPlace ?? "",
          limitations: data.profile?.limitations ?? "",
        });

        const availabilityText = data.profile?.availability ?? "";
        const rangeMatch = availabilityText.match(
          /(\d{2}:\d{2}).*?(\d{2}:\d{2})/,
        );

        if (rangeMatch) {
          setAvailabilityStart(rangeMatch[1]);
          setAvailabilityEnd(rangeMatch[2]);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil do aluno:", error);
        setMessage("Erro ao carregar perfil");
        setMessageType("error");
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!showModal || messageType !== "success") return;

    const timeoutId = setTimeout(() => {
      router.push("/dashboard/aluno");
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [showModal, messageType, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formattedAvailability =
        availabilityStart && availabilityEnd
          ? `Das ${availabilityStart} às ${availabilityEnd}`
          : availabilityStart
            ? `Das ${availabilityStart}`
            : availabilityEnd
              ? `Até ${availabilityEnd}`
              : "";

      const response = await fetch("/api/profile/student", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          availability: formattedAvailability,
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setMessage(data.error || "Erro ao salvar perfil");
        setMessageType("error");
        setShowModal(true);
        return;
      }

      await update();
      setMessage("Perfil atualizado com sucesso!");
      setMessageType("success");
      setShowModal(true);
    } catch (error) {
      console.error("Erro ao salvar perfil do aluno:", error);
      setMessage("Erro ao salvar perfil");
      setMessageType("error");
      setShowModal(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-[#0F172A] w-full h-dvh flex flex-col items-center justify-center">
        <p className="text-white">Carregando perfil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <Header />

      <section className="max-w-xl mx-auto p-4 md:p-6">
        <h1 className="text-xs md:text-2xl font-semibold mb-5">
          Editar perfil do aluno
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Nome</label>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full border rounded-md p-2 text-xs"
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Localização</label>
            <input
              value={form.location}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, location: event.target.value }))
              }
              className="w-full border rounded-md p-2 text-xs"
              placeholder="Cidade / Bairro"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Objetivo principal</label>
            <select
              value={form.goal}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, goal: event.target.value }))
              }
              className="w-full border rounded-md p-2 text-xs bg-white"
            >
              <option value="">Selecione</option>
              <option value="emagrecimento">Emagrecimento</option>
              <option value="hipertrofia">Hipertrofia</option>
              <option value="condicionamento">Condicionamento físico</option>
              <option value="saude">Saúde e bem-estar</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Nível de treino</label>
            <select
              value={form.trainingLevel}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  trainingLevel: event.target.value,
                }))
              }
              className="w-full border rounded-md p-2 text-xs bg-white"
            >
              <option value="">Selecione</option>
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Disponibilidade</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600">Das</span>
              <input
                type="time"
                value={availabilityStart}
                onChange={(event) => setAvailabilityStart(event.target.value)}
                className="w-full border rounded-md p-2 text-xs"
              />
              <span className="text-xs text-zinc-600">às</span>
              <input
                type="time"
                value={availabilityEnd}
                onChange={(event) => setAvailabilityEnd(event.target.value)}
                className="w-full border rounded-md p-2 text-xs"
              />
            </div>
            {availabilityStart || availabilityEnd ? (
              <p className="text-xs text-zinc-500">
                {availabilityStart && availabilityEnd
                  ? `Das ${availabilityStart} às ${availabilityEnd}`
                  : availabilityStart
                    ? `Das ${availabilityStart}`
                    : `Até ${availabilityEnd}`}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">
              Local de treino preferido
            </label>
            <select
              value={form.workoutPlace}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  workoutPlace: event.target.value,
                }))
              }
              className="w-full border rounded-md p-2 text-xs bg-white"
            >
              <option value="">Selecione</option>
              <option value="academia">Academia</option>
              <option value="casa">Casa</option>
              <option value="ar_livre">Ar livre</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">
              Restrições ou lesões (opcional)
            </label>
            <textarea
              value={form.limitations}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  limitations: event.target.value,
                }))
              }
              className="w-full border rounded-md p-2 text-xs min-h-20"
              placeholder="Ex: Dor no joelho, evitar agachamento profundo"
              maxLength={240}
            />
            <p className="text-xs text-zinc-500">
              {form.limitations.length}/240
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#319F43] text-white p-2 w-1/2 rounded-md text-xs font-semibold hover:opacity-90 disabled:opacity-70 transition-opacity"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/aluno")}
              disabled={saving}
              className="w-1/2 bg-red-700 text-white p-2 rounded-md text-xs font-semibold hover:bg-red-800 disabled:opacity-70 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>

      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#0F172A] rounded-lg shadow-xl p-6 max-w-sm mx-4 animate-in fade-in zoom-in duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  messageType === "success" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {messageType === "success" ? (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white">
                {messageType === "success" ? "Sucesso!" : "Erro"}
              </h3>
              <p className="text-sm text-white">{message}</p>
              {messageType === "error" ? (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full p-2 rounded-md text-sm font-medium text-white transition-colors bg-red-600 hover:bg-red-700"
                >
                  Fechar
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
