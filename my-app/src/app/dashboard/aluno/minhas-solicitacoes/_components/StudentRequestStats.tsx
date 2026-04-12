"use client";

import { TrendingUp, Clock, X } from "lucide-react";

interface StudentRequestStatsProps {
  pending: number;
  accepted: number;
  rejected: number;
}

export function StudentRequestStats({
  pending,
  accepted,
  rejected,
}: StudentRequestStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 mb-3">
      <div className="bg-gradient-to-br from-[#0052CC] to-[#003DA0] rounded-lg p-4 shadow-md">
        <p className="text-xs text-center text-white font-medium mb-1 opacity-90">
          Pendentes
        </p>
        <p className="text-3xl text-center font-bold text-white">{pending}</p>
      </div>

      <div className="bg-gradient-to-br from-[#00D97E] to-[#00A65D] rounded-lg p-4 shadow-md">
        <p className="text-xs text-center text-white font-medium mb-1 opacity-90">
          Aceitas
        </p>
        <p className="text-3xl text-center font-bold text-white">{accepted}</p>
      </div>

      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 shadow-md">
        <p className="text-xs text-center text-white font-medium mb-1 opacity-90">
          Rejeitadas
        </p>
        <p className="text-3xl text-center font-bold text-white">{rejected}</p>
      </div>
    </div>
  );
}
