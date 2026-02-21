"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { IoMdSettings } from "react-icons/io";

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="w-full flex justify-between items-center p-2">
      <div className="flex space-x-3 p-1 ">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
        ) : (
          <div>{session?.user?.name?.charAt(0).toUpperCase()}</div>
        )}
        <div className="flex flex-col justify-center">
          <span className="font-semibold text-sm">{session?.user?.name}</span>
          <Link
            href="/"
            className="text-xs hover:text-[#3BF37B] cursor-pointer"
          >
            Editar Perfil
          </Link>
        </div>
      </div>
      <div>
        <Link href="/dashboard/settings" />
        <IoMdSettings size={24} className="text-[#0F172A]" />
      </div>
    </header>
  );
}
