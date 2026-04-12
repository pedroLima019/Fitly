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
    <main className="bg-white w-full min-h-dvh pb-20 md:pb-0">
      <Header />

      <div className="max-w-6xl mx-auto p-2 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
          <div
            onClick={() => router.push("/dashboard/personal/chats")}
            className="p-4 bg-green-700 rounded-lg  cursor-pointer hover:shadow-lg transition hover:bg-green-600 "
          >
            <h2 className="text-sm font-bold text-white mb-1">
              Minhas Conversas
            </h2>
            <p className="text-white text-xs">
              Chat com seus alunos e acompanhe o relacionamento
            </p>
          </div>

          <div
            onClick={() => router.push("/dashboard/personal/solicitacoes")}
            className="p-4 bg-[#0F172A] rounded-lg  cursor-pointer hover:shadow-lg hover:bg-[#212637] transition"
          >
            <h2 className="text-sm font-bold text-white mb-1">
              Solicitações recebidas
            </h2>
            <p className="text-white text-xs">
              Gerencie suas solicitações de alunos
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
