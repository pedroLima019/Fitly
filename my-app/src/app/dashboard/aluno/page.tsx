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
    <main className="bg-white w-full h-dvh p-4">
      <div className="container mx-auto text-center">
        <h1 className="font-semibold text-xl">Dashboard do Aluno</h1>
        <p className="text-xs font-light">
          Bem-vindo ao fitly {session.user.name}
        </p>
      </div>
    </main>
  );
}
