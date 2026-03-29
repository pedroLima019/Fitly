import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { UserType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId é obrigatório" },
        { status: 400 },
      );
    }

    // Determinar papéis
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const isCurrentUserPersonal = currentUser.userType === UserType.personal;
    const personalId = isCurrentUserPersonal ? session.user.id : otherUserId;
    const studentId = isCurrentUserPersonal ? otherUserId : session.user.id;

    // Marcar todas as mensagens como lidas para este usuário
    await prisma.message.updateMany({
      where: {
        personalId,
        studentId,
        senderId: otherUserId, // Apenas mensagens do outro usuário
        readAt: null, // Apenas as não lidas
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao marcar como lido:", error);
    return NextResponse.json(
      { error: "Erro ao marcar como lido" },
      { status: 500 },
    );
  }
}
