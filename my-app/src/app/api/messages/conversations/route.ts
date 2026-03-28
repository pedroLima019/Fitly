import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { UserType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });
    console.log("Current user:", currentUser);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const isUserPersonal = currentUser.userType === UserType.personal;
    console.log("Is user personal:", isUserPersonal);

    let conversations: any[] = [];

    if (isUserPersonal) {
      // Personal: listar conversas com alunos (baseado em PersonalStudent)
      console.log("Buscando conversas para personal:", session.user.id);
      const connections = await prisma.personalStudent.findMany({
        where: {
          personalId: session.user.id,
        },
        select: {
          studentId: true,
        },
      });
      console.log("Connections found:", connections.length);

      const studentIds = connections.map((c) => c.studentId);

      if (studentIds.length > 0) {
        // Buscar detalhes dos alunos e última mensagem
        const results = await Promise.all(
          studentIds.map(async (studentId) => {
            const student = await prisma.user.findUnique({
              where: { id: studentId },
              select: { id: true, name: true, image: true },
            });

            const lastMessage = await prisma.message.findFirst({
              where: {
                personalId: session.user.id,
                studentId: studentId,
              },
              orderBy: { createdAt: "desc" },
              select: {
                content: true,
                createdAt: true,
                readAt: true,
                senderId: true,
              },
            });

            const unreadCount = await prisma.message.count({
              where: {
                personalId: session.user.id,
                studentId: studentId,
                readAt: null,
                senderId: studentId, // Mensagens de alunos não lidas pelo personal
              },
            });

            return {
              id: studentId,
              studentId: studentId,
              studentName: student?.name,
              studentImage: student?.image,
              lastMessage: lastMessage?.content,
              lastMessageTime: lastMessage?.createdAt,
              unreadCount,
            };
          }),
        );

        conversations = results.sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime(),
        );
      }
    } else {
      // Student: listar conversas com personals (baseado em PersonalStudent)
      console.log("Buscando conversas para student:", session.user.id);
      const connections = await prisma.personalStudent.findMany({
        where: {
          studentId: session.user.id,
        },
        select: {
          personalId: true,
        },
      });
      console.log("Connections found:", connections.length);

      const personalIds = connections.map((c) => c.personalId);

      if (personalIds.length > 0) {
        // Buscar detalhes dos personals e última mensagem
        const results = await Promise.all(
          personalIds.map(async (personalId) => {
            const personal = await prisma.user.findUnique({
              where: { id: personalId },
              select: { id: true, name: true, image: true },
            });

            const lastMessage = await prisma.message.findFirst({
              where: {
                personalId: personalId,
                studentId: session.user.id,
              },
              orderBy: { createdAt: "desc" },
              select: {
                content: true,
                createdAt: true,
                readAt: true,
                senderId: true,
              },
            });

            const unreadCount = await prisma.message.count({
              where: {
                personalId: personalId,
                studentId: session.user.id,
                readAt: null,
                senderId: personalId, // Mensagens de personals não lidas pelo student
              },
            });

            return {
              id: personalId,
              personalId: personalId,
              personalName: personal?.name,
              personalImage: personal?.image,
              lastMessage: lastMessage?.content,
              lastMessageTime: lastMessage?.createdAt,
              unreadCount,
            };
          }),
        );

        conversations = results.sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime(),
        );
      }
    }

    console.log("Final conversations count:", conversations.length);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Detalhes do erro:", errorMessage);
    return NextResponse.json(
      { error: `Erro ao buscar conversas: ${errorMessage}` },
      { status: 500 },
    );
  }
}
