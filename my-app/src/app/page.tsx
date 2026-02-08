"use client";

import { useEffect } from "react";
import ButtonForm from "./_components/ButtonForm";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.userType) {
      if (session.user.userType === "personal") {
        router.push("/dashboard/personal");
      } else if (session.user.userType === "aluno") {
        router.push("/dashboard/aluno");
      }
    } else if (status === "authenticated" && !session?.user?.userType) {
      router.push("/onboarding");
    }
  }, [session, status, router]);

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/onboarding" });
  };

  if (status === "loading") {
    return (
      <main className="bg-zinc-700 w-full h-dvh flex flex-col items-center justify-center">
        <p className="text-white">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="bg-zinc-700 w-full h-dvh flex flex-col items-center justify-center">
      <div className="container mx-auto px-4 py-8 space-y-2">
        <h1 className="text-center text-white text-3xl font-bold">
          Bem-vindo ao Fitly!
        </h1>
        <p className="text-white text-center text-xs">
          O fitly é um aplicativo de gerenciamento de treinos para personal
          trainers e clientes.
        </p>

        <form className="container mx-auto px-4 py-8 space-y-3">
          <div>
            <label className="text-white text-xs">Nome:</label>
            <input
              type="text"
              className="border text-white rounded px-2 py-1 w-full mb-2"
              disabled
            />

            <label className="text-white text-xs">E-mail:</label>
            <input
              type="text"
              className="border text-white rounded px-2 py-1 w-full mb-2"
              disabled
            />

            <label className="text-white text-xs">Senha:</label>
            <input
              type="text"
              className="border text-white rounded px-2 py-1 w-full mb-2"
              disabled
            />
          </div>
          <ButtonForm text="Logar" />
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Entrar com o Google
          </button>
        </form>
      </div>
    </main>
  );
}
