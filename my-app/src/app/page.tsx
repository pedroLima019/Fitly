import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export default function Home() {
  return (
    <main className=" w-full h-dvh  flex flex-col justify-center items-center p-5 ">
      <section className="max-w-xl flex flex-col items-center bg-[#0F172A] p-6 rounded-xl space-y-4 shadow-2xl">
        <Image
          src="/fitly.png"
          alt="Logo da Fitly"
          width={80}
          height={80}
          className="rounded-3xl"
        />

        <h1 className="text-white font-semibold text-2xl text-center">
          Bem-vindo ao Fitly
        </h1>
        <p className="text-center text-white text-xs">
          Fitly é um app feito para personal trainers organizarem sua rotina de
          treinos, aulas e alunos de forma simples e profissional.
        </p>

        <form className="flex flex-col container mx-auto p-4 space-y-5 ">
          <div className="flex flex-col">
            <label className="text-white text-sm font-medium">E-mail</label>
            <input type="text" className="border-b border-white" />
          </div>
          <div className="flex flex-col">
            <label className="text-white text-sm font-medium">Password</label>
            <input type="password" className="border-b border-white" />
          </div>
          <div className="w-full flex justify-between">
            <Link href="/" className="text-zinc-400 text-xs">
              Esqueceu a senha ?
            </Link>
            <Link href="/" className="text-zinc-400 text-xs">
              Criar conta
            </Link>
          </div>
          <div className=" items-center w-full flex flex-col space-y-2 mt-3">
            <button className="bg-white p-1.5 rounded-xl text-sm font-semibold w-2xs">
              Entrar
            </button>
            <button className="bg-white p-1.5 rounded-xl font-semibold text-xs flex justify-center items-center w-2xs">
              <FcGoogle size={20} className="mr-2" />
              Entrar com o Google
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
