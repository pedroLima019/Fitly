"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return <p className="text-white">Carregando...</p>;
  }

  return (
    <main className="bg-white  w-full h-dvh p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-black text-3xl font-bold">Dashboard - Aluno</h1>
          <button
            onClick={() => signOut()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sair
          </button>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 text-white">
          <p className="mb-4">Bem-vindo, {session.user?.name}!</p>
          <p>Email: {session.user?.email}</p>
        </div>
      </div>
    </main>
  );
}
