"use client";

import Image from "next/image";
import { useState } from "react";
import { RequestStatus } from "@prisma/client";
import { Trash2 } from "lucide-react";

interface StudentRequestCardProps {
  id: string;
  personal: {
    id: string;
    name: string;
    image: string | null;
  };
  message: string;
  status: RequestStatus;
  createdAt: string;
  onCancel: (id: string) => void;
  onOpenDetails: () => void;
  isProcessing: boolean;
}

export function StudentRequestCard({
  id,
  personal,
  message,
  status,
  createdAt,
  onCancel,
  onOpenDetails,
  isProcessing,
}: StudentRequestCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const statusColor = {
    pending: "border-[#0052CC] bg-blue-50",
    accepted: "border-[#00D97E] bg-emerald-50",
    rejected: "border-red-300 bg-red-50",
  };

  const statusBadgeColor = {
    pending: "bg-blue-100 text-[#0052CC]",
    accepted: "bg-emerald-100 text-[#00A65D]",
    rejected: "bg-red-100 text-red-700",
  };

  const statusLabel = {
    pending: "Pendente",
    accepted: "Aceito",
    rejected: "Rejeitado",
  };

  const formattedDate = new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleCancelConfirm = () => {
    onCancel(id);
    setShowCancelModal(false);
  };

  return (
    <>
      <div
        onClick={onOpenDetails}
        className={`border-l-4 rounded-lg p-3 md:p-4 transition-all cursor-pointer hover:shadow-md ${statusColor[status as keyof typeof statusColor]}`}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          {/* Personal Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={personal.image || "/default-avatar.png"}
                alt={personal.name}
                fill
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-xs md:text-sm truncate">
                  {personal.name}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${statusBadgeColor[status as keyof typeof statusBadgeColor]}`}
                >
                  {statusLabel[status as keyof typeof statusLabel]}
                </span>
              </div>

              <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2">
                {message}
              </p>

              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>

          {/* Action Buttons - Only for pending */}
          {status === "pending" && (
            <div className="w-full md:w-auto md:flex-shrink-0">
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isProcessing}
                className="w-full md:w-auto px-3 md:px-3 py-1.5 bg-red-600 text-white text-xs md:text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center md:justify-start gap-2"
              >
                <Trash2 size={16} />
                {isProcessing ? "..." : "Cancelar"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h2 className="text-lg text-xs font-semibold text-gray-900 mb-4">
                Cancelar solicitação
              </h2>

              <p className="text-sm text-gray-600 mb-6">
                Tem certeza que deseja cancelar a solicitação para{" "}
                <strong>{personal.name}</strong>? Esta ação não pode ser
                desfeita.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Não, manter
                </button>

                <button
                  onClick={handleCancelConfirm}
                  disabled={isProcessing}
                  className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isProcessing ? "..." : "Sim, cancelar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
