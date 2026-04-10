"use client";

import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({
  message = "Nenhuma solicitação encontrada",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Inbox className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );
}
