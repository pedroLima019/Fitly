"use client";

import { useEffect } from "react";
import ButtonForm from "./_components/ButtonForm";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

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
      <main className="bg-white  w-full h-dvh flex flex-col items-center justify-center">
        <p className="text-black">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="bg-white w-full h-dvh flex flex-col items-center justify-center">
      <div className="container mx-auto px-4 py-8 space-y-2">
        <h1 className="text-center text-black text-3xl font-bold">
          Bem-vindo ao Fitly!
        </h1>
        <p className="text-black text-center text-xs">
          O fitly é um aplicativo de gerenciamento de treinos para personal
          trainers e clientes.
        </p>

        <form className="md:w-125 container mx-auto px-4 py-8 space-y-3">
          <div>
            <label className="text-black text-xs font-semibold">Nome:</label>
            <input
              type="text"
              className=" text-black border-b   outline-0 px-2 py-1 w-full mb-2"
              disabled
              required
            />

            <label className="text-black text-xs font-semibold">E-mail:</label>
            <input
              type="text"
              className=" text-black border-b   outline-0 px-2 py-1 w-full mb-2"
              disabled
              required
            />

            <label className="text-black text-xs font-semibold">Senha:</label>
            <input
              type="text"
              className=" text-black border-b  px-2 py-1 w-full mb-2"
              disabled
              required
            />
          </div>
          <ButtonForm text="Entrar" />
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="border border-black   transition-all duration-300 text-black font-semibold p-1 rounded-xl w-full flex items-center justify-center gap-2 hover:bg-zinc-200  hover:border-zinc-200"
          >
            <FcGoogle />
            Entrar com o Google
          </button>
        </form>
      </div>
    </main>
  );
}
