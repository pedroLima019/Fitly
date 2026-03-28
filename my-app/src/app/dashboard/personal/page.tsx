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
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-black text-center">
          Bem-vindo, <br /> {session?.user?.name || "Personal"}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => router.push("/dashboard/personal/chats")}
            className="p-6 bg-green-700 rounded-lg  cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-white mb-2">
              Minhas Conversas
            </h2>
            <p className="text-gray-300">
              Chat com seus alunos e acompanhe o relacionamento
            </p>
          </div>

          <div
            onClick={() => router.push("/dashboard/personal/solicitacoes")}
            className="p-6 bg-[#0F172A] rounded-lg  cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-white mb-2">
              Solicitações recebidas
            </h2>
            <p className="text-gray-300">
              Gerencie suas solicitações de alunos
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
