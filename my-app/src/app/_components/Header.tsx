"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { IoMdSettings } from "react-icons/io";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="w-full flex justify-between items-center p-2 ">
      <div className="flex space-x-3 p-1">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col justify-center">
          <span className="font-semibold text-sm">{session?.user?.name}</span>
          <Link
            href="/dashboard/perfil"
            className="text-xs hover:text-[#3BF37B] cursor-pointer"
          >
            Editar Perfil
          </Link>
        </div>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IoMdSettings size={24} className="text-[#0F172A] cursor-pointer" />
          </button>
        </SheetTrigger>

        <SheetContent className="p-1 bg-white border-0 shadow-2xl">
          <SheetHeader>
            <SheetTitle className="text-black">Configurações</SheetTitle>
            <SheetDescription className="text-xs font-normal text-black">
              Gerencie suas preferências e conta
            </SheetDescription>
          </SheetHeader>

          <div className=" space-y-3 p-2">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-black">Perfil</h3>
              <Link
                href="/dashboard/perfil"
                className="text-black text-xs font-normal"
              >
                Editar informações pessoais
              </Link>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-black">
                Preferências
              </h3>
              <div className="space-y-3">
                <button className="text-xs text-black hover:text-gray-900 block w-full text-left font-normal">
                  Notificações
                </button>
                <button className="text-xs text-black hover:text-gray-900 block w-full text-left font-normal">
                  Tema
                </button>
              </div>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-black">Conta</h3>
              <button className="text-xs text-black hover:text-gray-900 block w-full text-left font-normal">
                Alterar senha
              </button>
            </div>
            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white flex items-center justify-center p-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
              >
                Sair da conta
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
