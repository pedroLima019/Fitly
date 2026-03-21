"use client";

import Header from "@/app/_components/Header";
import { useCepLookup } from "@/hooks/useCepLookup";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SPECIALTY_OPTIONS = [
  "Hipertrofia",
  "Emagrecimento",
  "Funcional",
  "Reabilitação",
  "Mobilidade",
  "Treinamento para idosos",
  "Condicionamento físico",
  "Esportes",
  "Pilates",
  "Cross training",
];

const OTHER_SPECIALTY = "Outros";

const normalizeSpecialty = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

type ProfileForm = {
  name: string;
  specialties: string;
  location: string;
  bio: string;
  hourlyRate: string;
  pricePerSession: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export default function CompletePerfil() {
  const router = useRouter();
  const { update } = useSession();
  const {
    loading: cepLoading,
    error: cepError,
    fetchAddress,
    formatCep,
  } = useCepLookup();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    specialties: "",
    location: "",
    bio: "",
    hourlyRate: "",
    pricePerSession: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brasil",
  });
  const [chargeMode, setChargeMode] = useState<"hourly" | "perSession">(
    "hourly",
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialties, setCustomSpecialties] = useState("");
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
          street: data.profile?.street ?? "",
          number: data.profile?.number ?? "",
          complement: data.profile?.complement ?? "",
          city: data.profile?.city ?? "",
          state: data.profile?.state ?? "",
          zipCode: data.profile?.zipCode ?? "",
          country: data.profile?.country ?? "Brasil",
        };

        setForm(profileData);

        const optionMap = new Map(
          SPECIALTY_OPTIONS.map((option) => [
            normalizeSpecialty(option),
            option,
          ]),
        );
        const incomingSpecialties = (data.profile?.specialties ?? "")
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);

        const matchedOptions: string[] = [];
        const customOptions: string[] = [];

        incomingSpecialties.forEach((item: string) => {
          const matched = optionMap.get(normalizeSpecialty(item));

          if (matched) {
            if (!matchedOptions.includes(matched)) {
              matchedOptions.push(matched);
            }
            return;
          }

          customOptions.push(item);
        });

        if (customOptions.length > 0) {
          matchedOptions.push(OTHER_SPECIALTY);
        }

        setSelectedSpecialties(matchedOptions);
        setCustomSpecialties(customOptions.join(", "));

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

  const handleCepChange = async (cep: string) => {
    const formattedCep = formatCep(cep);
    setForm((prev) => ({ ...prev, zipCode: formattedCep }));

    if (formattedCep.replace(/\D/g, "").length === 8) {
      const address = await fetchAddress(formattedCep);
      if (address) {
        setForm((prev) => ({
          ...prev,
          street: address.street,
          city: address.city,
          state: address.state,
          complement: address.complement || prev.complement,
        }));
      }
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    router.push("/dashboard/personal");
  };

  const handleToggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) => {
      const isSelected = prev.includes(specialty);
      const next = isSelected
        ? prev.filter((item) => item !== specialty)
        : [...prev, specialty];

      if (specialty === OTHER_SPECIALTY && isSelected) {
        setCustomSpecialties("");
      }

      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const hasOtherSelected = selectedSpecialties.includes(OTHER_SPECIALTY);
      const selectedWithoutOther = selectedSpecialties.filter(
        (item) => item !== OTHER_SPECIALTY,
      );
      const customParts = hasOtherSelected
        ? customSpecialties
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
      const specialtiesPayload = [...selectedWithoutOther, ...customParts].join(
        ", ",
      );

      const response = await fetch("/api/profile/personal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          specialties: specialtiesPayload,
          chargeMode,
        }),
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
          <p className="text-white text-xs">{message}</p>
          <button
            onClick={() => router.push("/dashboard/personal")}
            className="mt-4 px-4 py-2 bg-[#319F43] text-white rounded-md text-xs"
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
        <h1 className="text-xs md:text-2xl font-semibold mb-5">
          Completar perfil do personal
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Nome</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded-md p-2 text-xs"
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Especialidades</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border rounded-md">
              {SPECIALTY_OPTIONS.map((specialty) => (
                <label
                  key={specialty}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(specialty)}
                    onChange={() => handleToggleSpecialty(specialty)}
                    className="w-4 h-4"
                  />
                  <span>{specialty}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSpecialties.includes(OTHER_SPECIALTY)}
                  onChange={() => handleToggleSpecialty(OTHER_SPECIALTY)}
                  className="w-4 h-4"
                />
                <span>{OTHER_SPECIALTY}</span>
              </label>
            </div>
            {selectedSpecialties.includes(OTHER_SPECIALTY) ? (
              <input
                value={customSpecialties}
                onChange={(e) => setCustomSpecialties(e.target.value)}
                className="w-full border rounded-md p-2 text-xs"
                placeholder="Especifique outras especialidades (separadas por vírgula)"
              />
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Endereço completo</label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-zinc-600">Rua/Avenida</label>
                <input
                  value={form.street}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, street: e.target.value }))
                  }
                  className="w-full border rounded-md p-2 text-xs"
                  placeholder="Ex: Rua das Flores"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-600">Número</label>
                  <input
                    value={form.number}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, number: e.target.value }))
                    }
                    className="w-full border rounded-md p-2 text-xs"
                    placeholder="Ex: 123"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Complemento</label>
                  <input
                    value={form.complement}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        complement: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md p-2 text-xs"
                    placeholder="Ex: Apt 456"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-600">Cidade</label>
                <input
                  value={form.city}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full border rounded-md p-2 text-xs"
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-600">Estado</label>
                  <select
                    value={form.state}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, state: e.target.value }))
                    }
                    className="w-full border rounded-md p-2 text-xs bg-white"
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-600">CEP</label>
                  <input
                    value={form.zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    disabled={cepLoading}
                    className="w-full border rounded-md p-2 text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ex: 01310-100"
                  />
                  {cepLoading && (
                    <p className="text-xs text-blue-600 mt-1">
                      Buscando endereço...
                    </p>
                  )}
                  {cepError && (
                    <p className="text-xs text-red-600 mt-1">{cepError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Bio curta</label>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full border rounded-md p-2 text-xs min-h-24"
              placeholder="Conte em poucas linhas sobre seu trabalho"
              maxLength={240}
            />
            <p className="text-xs text-zinc-500">{form.bio.length}/240</p>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-xs font-semibold">Como você cobra as aulas?</p>
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
                <span className="text-xs">Por hora</span>
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
                <span className="text-xs">Por aula</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">
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
              className="w-full border rounded-md p-2 text-xs"
              placeholder={
                chargeMode === "hourly" ? "Ex: 100.00" : "Ex: 150.00"
              }
            />
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
              onClick={handleCancel}
              disabled={saving}
              className="w-1/2 bg-red-700 text-white p-2 rounded-md text-xs font-semibold hover:bg-zinc-50 disabled:opacity-70 transition-colors"
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
              <p className="text-xs text-white">{message}</p>

              {messageType === "error" ? (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full p-2 rounded-md text-xs font-semibold text-white transition-colors bg-red-600 hover:bg-red-700"
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
