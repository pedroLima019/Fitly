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

      <div className="px-3 pt-1 pb-5 space-y-3">
        {personal.specialties ? (
          <div className="flex flex-wrap gap-1.5">
            {personal.specialties.split(",").map((spec, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-700 text-xs p-1 rounded-md"
              >
                {spec.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white">Especialidades não informadas</p>
        )}

        {personal.bio ? (
          <p className="text-xs text-white line-clamp-3">{personal.bio}</p>
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

      <button
        onClick={() => onRequestPersonal(personal.id)}
        disabled={
          personal.requestStatus !== "none" || requestingId === personal.id
        }
        className="mx-3 mb-3 mt-1 w-[calc(100%-1.5rem)] p-2 rounded-md text-xs font-medium text-black hover:opacity-90 bg-white"
      >
        {requestingId === personal.id
          ? "Enviando..."
          : getButtonText(personal.requestStatus)}
      </button>
    </div>
  );
}
