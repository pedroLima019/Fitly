"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Onboarding() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="text-black">Carregando...</p>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleSelectRole = async (userType: "personal" | "student") => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/set-user-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userType: userType === "student" ? "student" : "personal",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          `Erro ${response.status}: ${data.error || response.statusText}`,
        );
      }

      // Redirecionar direto após sucesso
      if (userType === "personal") {
        window.location.href = "/dashboard/personal";
      } else {
        window.location.href = "/dashboard/aluno";
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
            onClick={() => handleSelectRole("student")}
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
