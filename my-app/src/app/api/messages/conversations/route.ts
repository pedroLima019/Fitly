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
      // ✅ OTIMIZADO: 1 query em vez de 3N queries
      const connectionsWithDetails = await prisma.personalStudent.findMany({
        where: { personalId: session.user.id },
        include: {
          student: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      // Buscar últimas mensagens com agregação (1 query)
      const lastMessages = await prisma.message.findMany({
        where: {
          personalId: session.user.id,
          studentId: { in: connectionsWithDetails.map((c) => c.studentId) },
        },
        select: {
          studentId: true,
          content: true,
          createdAt: true,
          readAt: true,
          senderId: true,
        },
        orderBy: { createdAt: "desc" },
        distinct: ["studentId"],
      });

      const lastMessageMap = new Map(lastMessages.map((m) => [m.studentId, m]));

      // Contar mensagens não lidas (1 query com agregação)
      const unreadCounts = await prisma.message.groupBy({
        by: ["studentId"],
        where: {
          personalId: session.user.id,
          readAt: null,
          senderId: { in: connectionsWithDetails.map((c) => c.studentId) },
        },
        _count: { id: true },
      });

      const unreadMap = new Map(
        unreadCounts.map((u) => [u.studentId, u._count.id]),
      );

      conversations = connectionsWithDetails
        .map((conn) => ({
          id: conn.studentId,
          studentId: conn.studentId,
          studentName: conn.student.name,
          studentImage: conn.student.image,
          lastMessage: lastMessageMap.get(conn.studentId)?.content,
          lastMessageTime: lastMessageMap.get(conn.studentId)?.createdAt,
          unreadCount: unreadMap.get(conn.studentId) || 0,
        }))
        .sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime(),
        );
    } else {
      // Student: listar conversas com personals
      // ✅ OTIMIZADO: 1 query em vez de 3N queries
      const connectionsWithDetails = await prisma.personalStudent.findMany({
        where: { studentId: session.user.id },
        include: {
          personal: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      // Buscar últimas mensagens com agregação (1 query)
      const lastMessages = await prisma.message.findMany({
        where: {
          studentId: session.user.id,
          personalId: { in: connectionsWithDetails.map((c) => c.personalId) },
        },
        select: {
          personalId: true,
          content: true,
          createdAt: true,
          readAt: true,
          senderId: true,
        },
        orderBy: { createdAt: "desc" },
        distinct: ["personalId"],
      });

      const lastMessageMap = new Map(
        lastMessages.map((m) => [m.personalId, m]),
      );

      // Contar mensagens não lidas (1 query com agregação)
      const unreadCounts = await prisma.message.groupBy({
        by: ["personalId"],
        where: {
          studentId: session.user.id,
          readAt: null,
          senderId: { in: connectionsWithDetails.map((c) => c.personalId) },
        },
        _count: { id: true },
      });

      const unreadMap = new Map(
        unreadCounts.map((u) => [u.personalId, u._count.id]),
      );

      conversations = connectionsWithDetails
        .map((conn) => ({
          id: conn.personalId,
          personalId: conn.personalId,
          personalName: conn.personal.name,
          personalImage: conn.personal.image,
          lastMessage: lastMessageMap.get(conn.personalId)?.content,
          lastMessageTime: lastMessageMap.get(conn.personalId)?.createdAt,
          unreadCount: unreadMap.get(conn.personalId) || 0,
        }))
        .sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime(),
        );
    }

    return NextResponse.json(
      { conversations },
      {
        headers: {
          "Cache-Control": "private, max-age=30, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    );
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
