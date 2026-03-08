import Image from "next/image";

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
  onRequestPersonal: (personalId: string) => void;
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
}: PersonalCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-linear-to-r from-[#0F172A] to-[#1a2d4d] p-4 text-white">
        <div className="flex items-center gap-3 mb-1">
          {personal.image ? (
            <Image
              src={personal.image}
              alt={personal.name || "Personal"}
              width={44}
              height={44}
              className="w-11 h-11 rounded-full object-cover border border-white/40"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-sm font-semibold">
              {(personal.name || "P").charAt(0).toUpperCase()}
            </div>
          )}

          <h2 className="text-sm font-semibold">
            {personal.name || "Personal"}
          </h2>
        </div>
        {personal.location ? (
          <p className="text-xs text-zinc-300">📍 {personal.location}</p>
        ) : null}
      </div>

      <div className="p-4 space-y-3">
        {personal.specialties ? (
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
        ) : (
          <p className="text-xs text-zinc-500">Especialidades não informadas</p>
        )}

        {personal.bio ? (
          <p className="text-sm text-zinc-700 line-clamp-3">{personal.bio}</p>
        ) : null}

        <div className="border-t border-zinc-200 pt-3 space-y-1">
          {personal.hourlyRate ? (
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-600">Valor/hora:</span>
              <span className="font-semibold text-[#319F43]">
                {formatPrice(personal.hourlyRate)}
              </span>
            </div>
          ) : null}

          {personal.pricePerSession ? (
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-600">Valor/aula:</span>
              <span className="font-semibold text-[#319F43]">
                {formatPrice(personal.pricePerSession)}
              </span>
            </div>
          ) : null}

          {!personal.hourlyRate && !personal.pricePerSession ? (
            <p className="text-xs text-zinc-500">Preço não informado</p>
          ) : null}
        </div>
      </div>

      <button
        onClick={() => onRequestPersonal(personal.id)}
        disabled={
          personal.requestStatus !== "none" || requestingId === personal.id
        }
        className="m-4 w-[calc(100%-2rem)] px-4 py-2 rounded-md text-xs font-medium bg-[#0F172A] text-white hover:opacity-90 disabled:opacity-70"
      >
        {requestingId === personal.id
          ? "Enviando..."
          : getButtonText(personal.requestStatus)}
      </button>
    </div>
  );
}
