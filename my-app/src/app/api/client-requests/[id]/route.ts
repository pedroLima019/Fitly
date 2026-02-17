import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { action } = await req.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const clientRequest = await prisma.clientRequest.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
      personal: { select: { id: true, name: true } },
    },
  });

  if (!clientRequest) {
    return NextResponse.json(
      { error: "Solicitação não encontrada" },
      { status: 404 },
    );
  }

  if (clientRequest.personalId !== session.user.id) {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  if (clientRequest.status !== "pending") {
    return NextResponse.json(
      { error: `Solicitação já foi ${clientRequest.status}` },
      { status: 409 },
    );
  }

  try {
    if (action === "approve") {
      const existingLink = await prisma.personalStudent.findUnique({
        where: {
          studentId_personalId: {
            studentId: clientRequest.studentId,
            personalId: clientRequest.personalId,
          },
        },
      });

      if (existingLink) {
        return NextResponse.json(
          { error: "Vínculo já existe" },
          { status: 409 },
        );
      }

      await Promise.all([
        prisma.clientRequest.update({
          where: { id },
          data: { status: "accepted" },
        }),
        prisma.personalStudent.create({
          data: {
            studentId: clientRequest.studentId,
            personalId: clientRequest.personalId,
          },
        }),
      ]);

      return NextResponse.json(
        {
          message: "Solicitação aprovada",
          status: "accepted",
          student: clientRequest.student,
        },
        { status: 200 },
      );
    } else {
      await prisma.clientRequest.update({
        where: { id },
        data: { status: "rejected" },
      });

      return NextResponse.json(
        {
          message: "Solicitação rejeitada",
          status: "rejected",
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 },
    );
  }
}
