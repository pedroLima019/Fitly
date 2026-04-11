"use client";

import Image from "next/image";
import { useState } from "react";
import { RequestStatus } from "@prisma/client";
import { X, Check, XCircle } from "lucide-react";

interface RequestDetailModalProps {
  request: {
    id: string;
    student: {
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
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isProcessing: boolean;
}

export function RequestDetailModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isProcessing,
}: RequestDetailModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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

  const handleRejectSubmit = () => {
    if (request.status === "accepted") {
      // For undoing acceptance, no reason needed
      onReject(request.id, "");
      setShowRejectForm(false);
      onClose();
    } else if (rejectReason.trim()) {
      // For rejection, reason is optional but we check it exists
      onReject(request.id, rejectReason);
      setRejectReason("");
      setShowRejectForm(false);
      onClose();
    }
  };

  const handleApprove = () => {
    onApprove(request.id);
    // Don't close modal here - let the parent component close it
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center lg:items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl  shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${statusColor[request.status as keyof typeof statusColor]} border-2`}
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
        <div className="p-4 sm:p-6 space-y-2">
          {/* Student Info */}
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={request.student.image || "/default-avatar.png"}
                alt={request.student.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-xl font-bold text-gray-900">
                {request.student.name}
              </h3>
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-2 ${statusBadgeColor[request.status as keyof typeof statusBadgeColor]}`}
              >
                {statusLabel[request.status as keyof typeof statusLabel]}
              </span>
              <p className="text-sm text-gray-500 mt-2">{formattedDate}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Mensagem da Solicitação
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-700 text-xs sm:text-base leading-relaxed whitespace-pre-wrap">
              {request.message}
            </div>
          </div>

          {/* Actions */}
          {!showRejectForm && request.status === "pending" && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#00D97E] text-white font-semibold rounded-lg hover:bg-[#00A65D] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Check size={20} />
                {isProcessing ? "Processando..." : "Aceitar"}
              </button>

              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <XCircle size={20} />
                {isProcessing ? "Processando..." : "Rejeitar"}
              </button>
            </div>
          )}

          {/* Cancel Button for Accepted Requests */}
          {!showRejectForm && request.status === "accepted" && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isProcessing ? "Cancelando..." : "Desfazer Aceitação"}
              </button>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && request.status === "pending" && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-gray-900">
                Motivo da rejeição
              </h4>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Digite o motivo da rejeição (opcional)..."
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                rows={4}
              />

              <p className="text-xs text-gray-500">
                {rejectReason.length}/500 caracteres
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleRejectSubmit}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isProcessing ? "..." : "Confirmar Rejeição"}
                </button>
              </div>
            </div>
          )}

          {/* Cancel Confirmation for Accepted */}
          {showRejectForm && request.status === "accepted" && (
            <div className="space-y-4 pt-4 border-t bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900">
                Desfazer aceitação?
              </h4>

              <p className="text-sm text-gray-700">
                Tem a certeza de que deseja desfazer a aceitação desta
                solicitação de <strong>{request.student.name}</strong>? Isso
                encerrará o relacionamento profissional.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Manter
                </button>

                <button
                  onClick={handleRejectSubmit}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isProcessing ? "..." : "Confirmar Desfazer"}
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {request.status !== "pending" && (
            <div
              className={`p-4 rounded-lg text-xs font-medium ${
                request.status === "accepted"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {request.status === "accepted"
                ? "✓ Solicitação aceita"
                : "✗ Solicitação rejeitada"}
            </div>
          )}
        </div>

        {/* Footer */}
        {request.status === "pending" && (
          <div className="border-t p-4 sm:p-6 bg-gray-50 sticky bottom-0">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
