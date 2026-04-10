"use client";

interface RequestStatsProps {
  pending: number;
  accepted: number;
  rejected: number;
}

export function RequestStats({
  pending,
  accepted,
  rejected,
}: RequestStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 mb-6">
      <div className="bg-gradient-to-br from-[#0052CC] to-[#003DA0] rounded-lg p-4 shadow-md">
        <p className="text-xs text-white text-center font-medium mb-1 opacity-90">
          Pendentes
        </p>
        <p className="text-3xl font-bold text-white text-center">{pending}</p>
      </div>

      <div className="bg-gradient-to-br  from-[#00D97E] to-[#00A65D] rounded-lg p-4 shadow-md">
        <p className="text-xs text-white text-center font-medium mb-1 opacity-90">
          Aceitas
        </p>
        <p className="text-3xl font-bold text-white text-center">{accepted}</p>
      </div>

      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 shadow-md">
        <p className="text-xs text-white text-center font-medium mb-1 opacity-90">
          Rejeitadas
        </p>
        <p className="text-3xl font-bold text-white text-center">{rejected}</p>
      </div>
    </div>
  );
}
