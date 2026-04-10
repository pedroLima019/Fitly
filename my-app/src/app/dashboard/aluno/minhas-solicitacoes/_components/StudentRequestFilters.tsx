"use client";

import { Search } from "lucide-react";
import { RequestStatus } from "@prisma/client";

interface StudentRequestFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: "all" | RequestStatus;
  onStatusChange: (status: "all" | RequestStatus) => void;
}

export function StudentRequestFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: StudentRequestFiltersProps) {
  const statusOptions = [
    { value: "all" as const, label: "Todas" },
    { value: "pending" as const, label: "Pendentes" },
    { value: "accepted" as const, label: "Aceitas" },
    { value: "rejected" as const, label: "Rejeitadas" },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por nome do personal..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] placeholder:text-xs"
        />
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              selectedStatus === option.value
                ? "bg-[#0052CC] text-white shadow-md hover:bg-[#003DA0]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
