"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="bg-[#0F172A] w-full h-dvh flex flex-col items-center justify-center ">
        <p className="text-white">Carregando...</p>
      </main>
    );
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
    <main className="bg-white w-full h-dvh flex flex-col items-center justify-center p-2">
      <div className="container mx-auto px-4 py-8 space-y-2 max-w-md rounded-2xl bg-[#0F172A] flex flex-col justify-center items-center shadow-2xl ">
        <div className="text-center flex flex-col items-center space-y-5 p-1 ">
          <Image
            src="/logoFitly.png"
            width={50}
            height={50}
            alt="Logo Fitly "
          />
          <h1 className="text-white text-xl font-bold mb-5">
            Bem-vindo, {session?.user?.name}!
          </h1>
          <p className="text-white text-sm ">
            Selecione qual tipo de usuário você é:
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleSelectRole("personal")}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold p-2 rounded-xl transition disabled:opacity-50"
          >
            Sou Personal Trainer
          </button>
          <button
            onClick={() => handleSelectRole("student")}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold p-2 rounded-xl transition disabled:opacity-50"
          >
            Sou Aluno
          </button>
        </div>
      </div>
    </main>
  );
}
