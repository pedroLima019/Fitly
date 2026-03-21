import { useState } from "react";
import Image from "next/image";
import RequestModal from "./RequestModal";

export type PersonalCardData = {
  id: string;
  name: string;
  specialties: string | null;
  location: string | null;
  bio: string | null;
  hourlyRate: number | null;
  pricePerSession: number | null;
  image: string | null;
  trainings: { name: string }[];
  requestStatus: "none" | "pending" | "accepted" | "rejected";
};

type PersonalCardProps = {
  personal: PersonalCardData;
  requestingId: string | null;
  onRequestPersonal: (
    personalId: string,
    data: { objective: string; availability: string },
  ) => void;
  onCancelRequest?: (requestId: string) => void;
};

const formatPrice = (price: number | null) => {
  if (!price) return "Não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

const getButtonText = (status: PersonalCardData["requestStatus"]) => {
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

export default function PersonalCard({
  personal,
  requestingId,
  onRequestPersonal,
  onCancelRequest,
}: PersonalCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleRequestClick = () => {
    setShowModal(true);
  };

  const handleRequestSubmit = async (data: {
    objective: string;
    availability: string;
  }) => {
    await onRequestPersonal(personal.id, data);
    setShowModal(false);
  };

  const handleCancelRequest = async () => {
    if (
      !onCancelRequest ||
      confirm("Tem certeza que quer cancelar a solicitação?")
    ) {
      setIsCanceling(true);
      try {
        await onCancelRequest?.(personal.id);
      } finally {
        setIsCanceling(false);
      }
    }
  };

  return (
    <div className="bg-[#0F172A] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="px-3 pt-3 pb-4 text-white">
        <div className="flex items-center gap-2">
          {personal.image ? (
            <Image
              src={personal.image}
              alt={personal.name || "Personal"}
              width={44}
              height={44}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold">
              {(personal.name || "P").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">
              {personal.name || "Personal"}
            </h2>
            {personal.location ? (
              <p className="text-xs text-white font-light">
                {personal.location}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-3 pt-1 pb-5 space-y-2.5">
        {personal.specialties ? (
          <div className="flex flex-wrap gap-1">
            {personal.specialties.split(",").map((spec, idx) => (
              <span
                key={idx}
                className="bg-white text-black text-[10px] p-1 rounded-sm font-medium"
              >
                {spec.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white">Especialidades não informadas</p>
        )}

        {personal.bio ? (
          <p className="text-[10px] text-white line-clamp-3">{personal.bio}</p>
        ) : null}

        <div className="border-t border-white pt-2 space-y-1">
          {personal.hourlyRate ? (
            <div className="flex justify-between items-center text-xs">
              <span className="text-white ">Valor/hora:</span>
              <span className="font-semibold text-[#319F43]">
                {formatPrice(personal.hourlyRate)}
              </span>
            </div>
          ) : null}

          {personal.pricePerSession ? (
            <div className="flex justify-between items-center text-xs">
              <span className="text-white">Valor/aula:</span>
              <span className="font-semibold text-[#319F43]">
                {formatPrice(personal.pricePerSession)}
              </span>
            </div>
          ) : null}

          {!personal.hourlyRate && !personal.pricePerSession ? (
            <p className="text-xs text-white">Preço não informado</p>
          ) : null}
        </div>
      </div>

      <div className="mx-3 mb-3 mt-1 space-y-2 flex-col flex">
        {personal.requestStatus === "pending" && (
          <button
            onClick={handleCancelRequest}
            disabled={isCanceling}
            className="w-full p-2 rounded-md text-xs font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-70"
          >
            {isCanceling ? "Cancelando..." : "Cancelar solicitação"}
          </button>
        )}

        <button
          onClick={handleRequestClick}
          disabled={
            (personal.requestStatus !== "none" &&
              personal.requestStatus !== "rejected") ||
            requestingId === personal.id
          }
          className={`w-full p-2 rounded-md text-xs font-medium ${
            personal.requestStatus === "none"
              ? "text-black bg-white hover:opacity-90"
              : personal.requestStatus === "pending"
                ? "text-yellow-800 bg-yellow-50 cursor-default"
                : personal.requestStatus === "accepted"
                  ? "text-white bg-[#319F43] cursor-default"
                  : personal.requestStatus === "rejected"
                    ? "text-gray-600 bg-gray-100 hover:opacity-90"
                    : "text-black bg-white"
          }`}
        >
          {requestingId === personal.id
            ? "Enviando..."
            : getButtonText(personal.requestStatus)}
        </button>
      </div>

      <RequestModal
        personalName={personal.name || "Personal"}
        isOpen={showModal}
        isLoading={requestingId === personal.id}
        onClose={() => setShowModal(false)}
        onSubmit={handleRequestSubmit}
      />
    </div>
  );
}
