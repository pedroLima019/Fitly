"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return <p className="text-black">Carregando...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const handleSelectRole = async (userType: "personal" | "aluno") => {
    setLoading(true);
    try {
      await fetch("/api/auth/set-user-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType }),
      });

      if (userType === "personal") {
        router.push("/dashboard/personal");
      } else {
        router.push("/dashboard/aluno");
      }
    } catch (error) {
      console.error("Erro ao selecionar tipo de usuário:", error);
      setLoading(false);
    }
  };

  return (
    <main className="bg-white w-full h-dvh flex flex-col items-center justify-center">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-md">
        <div className="text-center">
          <h1 className="text-black text-3xl font-bold mb-2">
            Bem-vindo, {session?.user?.name}!
          </h1>
          <p className="text-black text-sm">
            Selecione qual tipo de usuário você é:
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSelectRole("personal")}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-2 rounded-xl transition disabled:opacity-50"
          >
            Sou Personal Trainer
          </button>
          <button
            onClick={() => handleSelectRole("aluno")}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded-xl transition disabled:opacity-50"
          >
            Sou Aluno
          </button>
        </div>
      </div>
    </main>
  );
}
