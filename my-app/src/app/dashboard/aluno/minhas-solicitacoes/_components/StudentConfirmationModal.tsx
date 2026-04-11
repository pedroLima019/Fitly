"use client";

import Image from "next/image";
import { CheckCircle, XCircle, X } from "lucide-react";

interface StudentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "approved" | "rejected" | "canceled";
  personalName: string;
  personalImage: string | null;
  message: string;
}

export function StudentConfirmationModal({
  isOpen,
  onClose,
  type,
  personalName,
  personalImage,
  message,
}: StudentConfirmationModalProps) {
  if (!isOpen) return null;

  const config = {
    approved: {
      title: "Solicitação Aprovada! 🎉",
      icon: CheckCircle,
      bgColor: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      description:
        "O personal aceitou sua solicitação! Você pode começar a conversar agora.",
    },
    rejected: {
      title: "Solicitação Rejeitada",
      icon: XCircle,
      bgColor: "bg-red-50 border-red-200",
      iconColor: "text-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
      description: "O personal rejeitou sua solicitação.",
    },
    canceled: {
      title: "Solicitação Cancelada",
      icon: XCircle,
      bgColor: "bg-gray-50 border-gray-200",
      iconColor: "text-gray-600",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
      description: "A solicitação foi cancelada.",
    },
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 ${current.bgColor} overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`mt-1 ${current.iconColor}`}>
              <Icon size={32} className="flex-shrink-0" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {current.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {current.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Personal Info */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={personalImage || "/default-avatar.png"}
                alt={personalName}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">Personal Trainer</p>
              <p className="font-semibold text-gray-900 truncate">
                {personalName}
              </p>
            </div>
          </div>

          {/* Rejection Reason */}
          {message && type === "rejected" && (
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-2">
                Motivo da Rejeição
              </p>
              <p className="text-sm text-gray-700 line-clamp-3">{message}</p>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 text-white font-semibold rounded-lg transition ${current.buttonColor}`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
