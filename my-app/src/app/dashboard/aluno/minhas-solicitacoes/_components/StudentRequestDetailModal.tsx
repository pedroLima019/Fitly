"use client";

import Image from "next/image";
import { useState } from "react";
import { RequestStatus } from "@prisma/client";
import { X } from "lucide-react";

interface StudentRequestDetailModalProps {
  request: {
    id: string;
    personal: {
      id: string;
      name: string;
      image: string | null;
    };
    message: string;
    status: RequestStatus;
    createdAt: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onCancel: (id: string) => void;
  isProcessing: boolean;
}

export function StudentRequestDetailModal({
  request,
  isOpen,
  onClose,
  onCancel,
  isProcessing,
}: StudentRequestDetailModalProps) {
  const [showCancelForm, setShowCancelForm] = useState(false);

  if (!isOpen) return null;

  const statusColor = {
    pending: "bg-blue-50 border-blue-200",
    accepted: "bg-emerald-50 border-emerald-200",
    rejected: "bg-red-50 border-red-200",
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

  const statusDescriptionMap = {
    accepted:
      "✓ This trainer has accepted your request and you can now chat with them!",
    rejected: "✗ The trainer has rejected your request.",
    pending: "Your request is waiting for the trainer to respond.",
  };

  const formattedDate = new Date(request.createdAt).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const handleCancelConfirm = () => {
    onCancel(request.id);
    setShowCancelForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center lg:items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${statusColor[request.status as keyof typeof statusColor]} border-2`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-sm sm:text-2xl font-bold text-gray-900">
            Detalhes da Solicitação
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3">
          {/* Personal Info */}
          <div className="flex items-start gap-2">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={request.personal.image || "/default-avatar.png"}
                alt={request.personal.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 ">
              <h3 className="text-lg sm:text-xl font-bold text-sm text-gray-900">
                {request.personal.name}
              </h3>
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-2 ${statusBadgeColor[request.status as keyof typeof statusBadgeColor]}`}
              >
                {statusLabel[request.status as keyof typeof statusLabel]}
              </span>
              <p className="text-xs text-gray-500 mt-2">{formattedDate}</p>
            </div>
          </div>

          {/* Status Message */}
          <div
            className={`p-4 rounded-lg text-xs font-medium ${
              request.status === "accepted"
                ? "bg-emerald-100 text-emerald-800"
                : request.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {
              statusDescriptionMap[
                request.status as keyof typeof statusDescriptionMap
              ]
            }
          </div>

          {/* Message */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Sua Mensagem
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-700 text-xs sm:text-base leading-relaxed whitespace-pre-wrap">
              {request.message}
            </div>
          </div>

          {/* Actions */}
          {!showCancelForm && request.status !== "rejected" && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCancelForm(true)}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isProcessing ? "Cancelando..." : "Cancelar Solicitação"}
              </button>
            </div>
          )}

          {/* Cancel Confirmation */}
          {showCancelForm && request.status !== "rejected" && (
            <div className="space-y-2 pt-4 border-t bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 text-sm">
                Cancelar solicitação?
              </h4>

              <p className="text-xs text-gray-700">
                Tem a certeza de que deseja cancelar sua solicitação para{" "}
                <strong>{request.personal.name}</strong>? Você poderá enviar
                outra solicitação no futuro.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Manter
                </button>

                <button
                  onClick={handleCancelConfirm}
                  disabled={isProcessing}
                  className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isProcessing ? "..." : "Cancelar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
