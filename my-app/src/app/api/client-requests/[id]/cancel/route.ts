import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const clientRequest = await prisma.clientRequest.findUnique({
    where: { id },
    select: { studentId: true, status: true },
  });

  if (!clientRequest) {
    return NextResponse.json(
      { error: "Solicitação não encontrada" },
      { status: 404 },
    );
  }

  if (clientRequest.studentId !== session.user.id) {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  if (clientRequest.status !== "pending") {
    return NextResponse.json(
      { error: "Apenas solicitações pendentes podem ser canceladas" },
      { status: 409 },
    );
  }

  await prisma.clientRequest.delete({
    where: { id },
  });

  return NextResponse.json({
    message: "Solicitação cancelada com sucesso",
  });
}
