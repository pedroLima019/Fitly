import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { ClientRequestPostSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { rateLimitMiddleware } from "@/lib/rate-limit";
import { UserType, RequestStatus } from "@prisma/client";

const allowedStatuses = new Set([
  RequestStatus.pending,
  RequestStatus.accepted,
  RequestStatus.rejected,
]);
const allowedTypes = new Set(["received", "sent"]);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      logger.warn({}, "Unauthorized access attempt to client-requests");
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const type = searchParams.get("type") ?? "received";

    logger.info(
      { userId: session.user.id, type, statusParam },
      "Fetching client requests",
    );

    if (!allowedTypes.has(type)) {
      logger.warn({ userId: session.user.id, type }, "Invalid type requested");
      return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }

    // Build status filter - if no status provided, fetch all
    const statusFilter: any = {};
    if (statusParam && allowedStatuses.has(statusParam as RequestStatus)) {
      statusFilter.status = statusParam as RequestStatus;
    } else if (statusParam && statusParam !== "all") {
      logger.warn(
        { userId: session.user.id, statusParam },
        "Invalid status requested",
      );
      return NextResponse.json({ error: "Status invalido" }, { status: 400 });
    }
    // If statusParam is "all" or not provided, don't filter by status

    if (type === "received") {
      const requests = await prisma.clientRequest.findMany({
        where: {
          personalId: session.user.id,
          ...statusFilter,
          deletedAt: null, // Exclude soft-deleted records
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
        take: 50, // Pagination
      });

      logger.info(
        { userId: session.user.id, count: requests.length, type },
        "Retrieved received requests",
      );

      return NextResponse.json({ requests });
    }

    // For type === "sent"
    const requests = await prisma.clientRequest.findMany({
      where: {
        studentId: session.user.id,
        ...statusFilter,
        deletedAt: null, // Exclude soft-deleted records
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
      take: 50, // Pagination
    });

    logger.info(
      { userId: session.user.id, count: requests.length, type },
      "Retrieved sent requests",
    );

    return NextResponse.json({ requests });
  } catch (error) {
    logger.error({ error }, "GET /api/client-requests failed");
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json(
      { error: `Erro ao carregar solicitacoes: ${message}` },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // Rate limiting: max 10 requests per minute per user
    const rateLimitResult = await rateLimitMiddleware(
      session.user.id,
      10,
      60 * 1000,
    );
    if (rateLimitResult instanceof NextResponse) {
      logger.warn(
        { userId: session.user.id },
        "Rate limit exceeded for client request creation",
      );
      return rateLimitResult;
    }

    const body = await req.json().catch(() => ({}));

    // Validate request body with Zod
    const validatedData = ClientRequestPostSchema.parse(body);
    const { personalId, objective, availability, message } = validatedData;

    const finalMessage =
      message || `Objetivo: ${objective} | Disponibilidade: ${availability}`;

    // Verify student exists and has correct userType
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, userType: true },
    });

    if (!student) {
      logger.error({ userId: session.user.id }, "Usuario nao encontrado");
      return NextResponse.json({ error: "Usuario invalido" }, { status: 401 });
    }

    if (student.userType !== UserType.student) {
      logger.warn(
        { userId: session.user.id, userType: student.userType },
        "Non-student tried to create request",
      );
      return NextResponse.json(
        { error: "Apenas alunos podem enviar solicitacoes" },
        { status: 403 },
      );
    }

    // Verify personal exists and has correct userType
    const personal = await prisma.user.findUnique({
      where: { id: personalId },
      select: { id: true, userType: true },
    });

    if (!personal) {
      logger.warn({ personalId }, "Personal nao encontrado");
      return NextResponse.json(
        { error: "Personal nao encontrado" },
        { status: 404 },
      );
    }

    if (personal.userType !== UserType.personal) {
      logger.warn(
        { personalId, userType: personal.userType },
        "Non-personal user targeted",
      );
      return NextResponse.json(
        { error: "Usuario nao e um personal" },
        { status: 400 },
      );
    }

    // Check if already have active connection
    const existingLink = await prisma.personalStudent.findUnique({
      where: {
        studentId_personalId: {
          studentId: session.user.id,
          personalId,
        },
      },
    });

    if (existingLink) {
      logger.info(
        { studentId: session.user.id, personalId },
        "Connection already exists",
      );
      return NextResponse.json(
        { error: "Voce ja tem vinculo com este personal" },
        { status: 409 },
      );
    }

    // Check for pending request
    const existingRequest = await prisma.clientRequest.findFirst({
      where: {
        studentId: session.user.id,
        personalId,
        status: RequestStatus.pending,
        deletedAt: null,
      },
    });

    if (existingRequest) {
      logger.info(
        { studentId: session.user.id, personalId },
        "Pending request already exists",
      );
      return NextResponse.json(
        { error: "Voce ja tem uma solicitacao pendente com este personal" },
        { status: 409 },
      );
    }

    // Upsert: create new or update existing (e.g., if rejected before)
    const request = await prisma.clientRequest.upsert({
      where: {
        studentId_personalId: {
          studentId: session.user.id,
          personalId,
        },
      },
      update: {
        message: finalMessage,
        status: RequestStatus.pending,
        deletedAt: null, // Revert soft delete if it was deleted
        updatedAt: new Date(),
      },
      create: {
        studentId: session.user.id,
        personalId,
        message: finalMessage,
        status: RequestStatus.pending,
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

    logger.info(
      { studentId: session.user.id, personalId, requestId: request.id },
      "Client request created successfully",
    );

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ errors: error.issues }, "Request validation failed");
      return NextResponse.json(
        { error: "Dados invalidos: " + error.issues[0].message },
        { status: 400 },
      );
    }

    logger.error({ error }, "POST /api/client-requests failed");
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json(
      { error: `Erro ao criar solicitacao: ${errorMessage}` },
      { status: 500 },
    );
  }
}
