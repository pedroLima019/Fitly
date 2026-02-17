import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { userType } = await req.json();

  if (!["personal", "student"].includes(userType)) {
    return NextResponse.json(
      { error: "Tipo de usuário inválido" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { userType },
    });

    return NextResponse.json(
      { success: true, userType: user.userType },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao salvar tipo de usuário:", error);
    return NextResponse.json(
      { error: "Erro ao salvar tipo de usuário" },
      { status: 500 },
    );
  }
}
