import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session) {
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
    // AQUI: Você deverá salvar no seu banco de dados
    // Exemplo com Prisma:
    // await prisma.user.update({
    //   where: { email: session.user?.email },
    //   data: { userType }
    // });

    return NextResponse.json({ success: true, userType }, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar tipo de usuário:", error);
    return NextResponse.json(
      { error: "Erro ao salvar tipo de usuário" },
      { status: 500 },
    );
  }
}
