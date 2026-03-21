"use client";

import { useState } from "react";

const OBJECTIVES = [
  "Hipertrofia",
  "Emagrecimento",
  "Condicionamento físico",
  "Reabilitação",
  "Preparação para competição",
  "Manutenção de forma",
  "Ganho de força",
  "Flexibilidade e mobilidade",
];

type RequestModalProps = {
  personalName: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: { objective: string; availability: string }) => void;
};

export default function RequestModal({
  personalName,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: RequestModalProps) {
  const [objective, setObjective] = useState("");
  const [availability, setAvailability] = useState("");

  const handleSubmit = () => {
    if (!objective.trim() || !availability.trim()) {
      alert("Preencha todos os campos");
      return;
    }
    onSubmit({ objective, availability });
    setObjective("");
    setAvailability("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Solicitar acompanhamento com <br />
          <span className="text-[#319F43]">{personalName}</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Qual é seu objetivo?
            </label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-xs"
              disabled={isLoading}
            >
              <option value="">Selecione um objetivo</option>
              {OBJECTIVES.map((obj) => (
                <option key={obj} value={obj}>
                  {obj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Sua disponibilidade
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Ex: Seg-Sex, tarde"
              className="w-full border border-gray-300 rounded-md p-2 text-xs"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 p-2 rounded-md text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 p-2 rounded-md text-xs font-medium text-white bg-[#319F43] hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Enviando..." : "Solicitar"}
          </button>
        </div>
      </div>
    </div>
  );
}
