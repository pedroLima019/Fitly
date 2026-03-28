"use client";

import Header from "@/app/_components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PersonalDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <main className="bg-[#0F172A] w-full h-dvh flex flex-col items-center justify-center ">
        <p className="text-white">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="bg-white w-full min-h-dvh">
      <Header />

      {/* Navigation Cards */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Bem-vindo, {session?.user?.name || "Personal"}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conversas */}
          <div
            onClick={() => router.push("/dashboard/personal/chats")}
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition"
          >
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Minhas Conversas
            </h2>
            <p className="text-gray-700">
              Chat com seus alunos e acompanhe o relacionamento
            </p>
          </div>

          {/* Solicitações */}
          <div
            onClick={() => router.push("/dashboard/personal/solicitacoes")}
            className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 cursor-pointer hover:shadow-lg transition"
          >
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Solicitações
            </h2>
            <p className="text-gray-700">
              Gerencie suas solicitações de alunos
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
