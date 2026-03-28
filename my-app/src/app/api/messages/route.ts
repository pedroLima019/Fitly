import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId é obrigatório" },
        { status: 400 },
      );
    }

    // Determinar quem é personal e quem é student
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

    // Buscar histórico de mensagens
    const messages = await prisma.message.findMany({
      where: {
        personalId,
        studentId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100, // Últimas 100 mensagens
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json(
      { error: "Erro ao buscar mensagens" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { otherUserId, content } = body;

    if (!otherUserId || !content) {
      return NextResponse.json(
        { error: "otherUserId e content são obrigatórios" },
        { status: 400 },
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Mensagem não pode estar vazia" },
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

    // Verificar se existe relação (PersonalStudent conectado)
    const connection = await prisma.personalStudent.findUnique({
      where: {
        studentId_personalId: {
          studentId,
          personalId,
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Sem permissão para mensagear com este usuário" },
        { status: 403 },
      );
    }

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        personalId,
        studentId,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    return NextResponse.json(
      { error: "Erro ao criar mensagem" },
      { status: 500 },
    );
  }
}
