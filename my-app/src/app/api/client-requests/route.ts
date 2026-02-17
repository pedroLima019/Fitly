import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

const allowedStatuses = new Set(["pending", "accepted", "rejected"]);
const allowedTypes = new Set(["received", "sent"]);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";
  const type = searchParams.get("type") ?? "received";

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Status invalido" }, { status: 400 });
  }

  if (!allowedTypes.has(type)) {
    return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
  }

  if (type === "received") {
    const requests = await prisma.clientRequest.findMany({
      where: {
        personalId: session.user.id,
        status,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            userType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  }

  const requests = await prisma.clientRequest.findMany({
    where: {
      studentId: session.user.id,
      status,
    },
    include: {
      personal: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          userType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const personalId = body?.personalId as string | undefined;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const objective =
    typeof body?.objective === "string" ? body.objective.trim() : "";
  const availability =
    typeof body?.availability === "string" ? body.availability.trim() : "";

  const finalMessage =
    message ||
    [
      objective ? `Objetivo: ${objective}` : "",
      availability ? `Disponibilidade: ${availability}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

  if (!personalId) {
    return NextResponse.json(
      { error: "Personal obrigatorio" },
      { status: 400 },
    );
  }

  if (!finalMessage) {
    return NextResponse.json(
      { error: "Mensagem obrigatoria" },
      { status: 400 },
    );
  }

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, userType: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Usuario invalido" }, { status: 401 });
  }

  if (student.userType && student.userType !== "student") {
    return NextResponse.json({ error: "Apenas aluno" }, { status: 403 });
  }

  const personal = await prisma.user.findUnique({
    where: { id: personalId },
    select: { id: true, userType: true },
  });

  if (!personal) {
    return NextResponse.json(
      { error: "Personal nao encontrado" },
      { status: 404 },
    );
  }

  if (personal.userType && personal.userType !== "personal") {
    return NextResponse.json({ error: "Personal invalido" }, { status: 400 });
  }

  const existingLink = await prisma.personalStudent.findUnique({
    where: {
      studentId_personalId: {
        studentId: session.user.id,
        personalId,
      },
    },
  });

  if (existingLink) {
    return NextResponse.json({ error: "Vinculo ja existe" }, { status: 409 });
  }

  const existingRequest = await prisma.clientRequest.findFirst({
    where: {
      studentId: session.user.id,
      personalId,
      status: "pending",
    },
  });

  if (existingRequest) {
    return NextResponse.json(
      { error: "Solicitacao pendente ja existe" },
      { status: 409 },
    );
  }

  const request = await prisma.clientRequest.create({
    data: {
      studentId: session.user.id,
      personalId,
      message: finalMessage,
      status: "pending",
    },
    include: {
      personal: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          userType: true,
        },
      },
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
