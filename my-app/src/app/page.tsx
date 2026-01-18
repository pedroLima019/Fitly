import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export default function Home() {
  return (
    <main className=" w-full h-dvh  flex flex-col justify-center items-center p-6 ">
      <section className="max-w-xl container mx-auto flex flex-col items-center bg-[#0F172A] p-3 rounded-xl space-y-3 shadow-2xl ">
        <Image
          src="/fitly.png"
          alt="Logo da Fitly"
          width={60}
          height={60}
          className="rounded-xl"
        />

        <h1 className="text-white font-semibold text-2xl text-center md:text-4xl ">
          Bem-vindo ao Fitly
        </h1>
        <p className="text-center text-white text-xs font-thin md:text-sm ">
          Fitly é um app feito para personal trainers organizarem sua rotina de
          treinos, aulas e alunos de forma simples e profissional.
        </p>

        <form className="flex flex-col container mx-auto p-5 space-y-5">
          <div className="flex flex-col">
            <label className="text-white text-sm font-medium">E-mail</label>
            <input type="text" className="border-b border-white outline-0" />
          </div>
          <div className="flex flex-col">
            <label className="text-white text-sm font-medium">Password</label>
            <input
              type="password"
              className="border-b border-white outline-0"
            />
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
            <button className="bg-white p-1.5 rounded-xl text-sm font-semibold container">
              Entrar
            </button>
            <button className="bg-white p-1.5 rounded-xl font-semibold text-xs flex justify-center items-center container">
              <FcGoogle size={20} className="mr-2" />
              Entrar com o Google
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
