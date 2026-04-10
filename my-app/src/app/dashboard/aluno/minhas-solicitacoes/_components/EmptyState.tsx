"use client";

import { Inbox } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-16">
      <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-2">
        Nenhuma solicitação
      </h3>
      <p className="text-gray-500 max-w-md mx-auto text-xs">
        Você ainda não enviou nenhuma solicitação para personals. Comece
        buscando um personal qualificado!
      </p>
    </div>
  );
}
