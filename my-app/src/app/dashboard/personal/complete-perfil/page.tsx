"use client";

import Header from "@/app/_components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProfileForm = {
  name: string;
  specialties: string;
  location: string;
  bio: string;
  hourlyRate: string;
  pricePerSession: string;
};

export default function CompletePerfil() {
  const router = useRouter();
  const { update } = useSession();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    specialties: "",
    location: "",
    bio: "",
    hourlyRate: "",
    pricePerSession: "",
  });
  const [chargeMode, setChargeMode] = useState<"hourly" | "perSession">(
    "hourly",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile/personal", {
          method: "GET",
          credentials: "include",
        });

        const text = await response.text();
        let data;

        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error("Erro ao fazer parse do JSON:", parseError);
          console.error("Resposta recebida:", text);
          setMessage("Erro ao carregar perfil");
          setMessageType("error");
          setShowModal(true);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          console.error(
            "Erro ao carregar perfil - Status:",
            response.status,
            "Mensagem:",
            data.error,
          );
          setMessage(data.error || "Erro ao carregar perfil");
          setMessageType("error");
          setHasError(true);
          setShowModal(true);
          setLoading(false);
          return;
        }

        const profileData = {
          name: data.profile?.name ?? "",
          specialties: data.profile?.specialties ?? "",
          location: data.profile?.location ?? "",
          bio: data.profile?.bio ?? "",
          hourlyRate: data.profile?.hourlyRate?.toString() ?? "",
          pricePerSession: data.profile?.pricePerSession?.toString() ?? "",
        };

        setForm(profileData);

        if (data.profile?.hourlyRate) {
          setChargeMode("hourly");
        } else if (data.profile?.pricePerSession) {
          setChargeMode("perSession");
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setMessage("Erro ao carregar perfil. Tente novamente.");
        setMessageType("error");
        setHasError(true);
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
      router.push("/dashboard/personal");
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [showModal, messageType, router]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setShowModal(false);
    router.push("/dashboard/personal");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile/personal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, chargeMode }),
      });

      // Verifica se a resposta tem conteúdo antes de fazer parse
      const text = await response.text();
      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        console.error("Resposta recebida:", text);
        setMessage("Erro ao processar resposta do servidor");
        setMessageType("error");
        setShowModal(true);
        setSaving(false);
        return;
      }

      if (!response.ok) {
        setMessage(data.error || "Erro ao salvar perfil");
        setMessageType("error");
        setShowModal(true);
        setSaving(false);
        return;
      }

      await update();

      setMessage("Perfil atualizado com sucesso!");
      setMessageType("success");
      setShowModal(true);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setMessage("Erro ao salvar perfil. Tente novamente.");
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

  if (hasError) {
    return (
      <main className="bg-[#0F172A] w-full h-dvh flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-semibold">Erro ao carregar perfil</p>
          <p className="text-white text-sm">{message}</p>
          <button
            onClick={() => router.push("/dashboard/personal")}
            className="mt-4 px-4 py-2 bg-[#319F43] text-white rounded-md text-sm"
          >
            Voltar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <Header />

      <section className="max-w-2xl mx-auto p-4 md:p-6">
        <h1 className="text-sm md:text-2xl font-semibold mb-5">
          Completar perfil do personal
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Especialidades</label>
            <input
              value={form.specialties}
              onChange={(e) => handleChange("specialties", e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Ex: Hipertrofia, Emagrecimento"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Localização</label>
            <input
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Cidade / Bairro"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Bio curta</label>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full border rounded-md p-2 text-sm min-h-24"
              placeholder="Conte em poucas linhas sobre seu trabalho"
              maxLength={240}
            />
            <p className="text-xs text-zinc-500">{form.bio.length}/240</p>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium">Como você cobra as aulas?</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="chargeMode"
                  value="hourly"
                  checked={chargeMode === "hourly"}
                  onChange={(e) =>
                    setChargeMode(e.target.value as "hourly" | "perSession")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Por hora</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="chargeMode"
                  value="perSession"
                  checked={chargeMode === "perSession"}
                  onChange={(e) =>
                    setChargeMode(e.target.value as "hourly" | "perSession")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Por aula</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Valor {chargeMode === "hourly" ? "por hora" : "por aula"} (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={
                chargeMode === "hourly" ? form.hourlyRate : form.pricePerSession
              }
              onChange={(e) => {
                if (chargeMode === "hourly") {
                  handleChange("hourlyRate", e.target.value);
                } else {
                  handleChange("pricePerSession", e.target.value);
                }
              }}
              className="w-full border rounded-md p-2 text-sm"
              placeholder={
                chargeMode === "hourly" ? "Ex: 100.00" : "Ex: 150.00"
              }
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#319F43] text-white p-2 w-1/2 rounded-md text-xs font-medium hover:opacity-90 disabled:opacity-70 transition-opacity"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="w-1/2 bg-red-700 text-white p-2 rounded-md text-xs font-medium hover:bg-zinc-50 disabled:opacity-70 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>

      {/* Modal de Mensagem */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#0F172A] rounded-lg shadow-xl p-6 max-w-sm mx-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              {/* Ícone */}
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

              {/* Título */}
              <h3 className="text-lg font-semibold text-white">
                {messageType === "success" ? "Sucesso!" : "Erro"}
              </h3>

              {/* Mensagem */}
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
      )}
    </main>
  );
}
