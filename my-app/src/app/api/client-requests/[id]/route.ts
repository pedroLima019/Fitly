import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ClientRequestPatchSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { rateLimitMiddleware } from "@/lib/rate-limit";
import { RequestStatus, UserType } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Rate limiting: max 50 requests per minute per user
    const rateLimitResult = rateLimitMiddleware(session.user.id, 50, 60 * 1000);
    if (rateLimitResult instanceof NextResponse) {
      logger.warn({ userId: session.user.id }, "Rate limit exceeded for PATCH requests");
      return rateLimitResult;
    }

    if (!id) {
      logger.warn({ userId: session.user.id }, "Invalid ID provided to PATCH");
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    // Validate request body
    const validatedData = ClientRequestPatchSchema.parse(body);
    const { action, reason } = validatedData;

    const clientRequest = await prisma.clientRequest.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, userType: true } },
        personal: { select: { id: true, name: true, userType: true } },
      },
    });

    if (!clientRequest || clientRequest.deletedAt) {
      logger.warn({ requestId: id, userId: session.user.id }, "Request not found or soft-deleted");
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 },
      );
    }

    // Verify authorization: only personal can approve/reject
    if (clientRequest.personalId !== session.user.id) {
      logger.warn(
        { requestId: id, userId: session.user.id, personalId: clientRequest.personalId },
        "Unauthorized PATCH attempt",
      );
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
    }

    // Verify user is actually a personal
    if (clientRequest.personal.userType !== UserType.personal) {
      logger.error({ userId: session.user.id }, "User is not a personal");
      return NextResponse.json({ error: "Usuario nao e um personal" }, { status: 403 });
    }

    if (clientRequest.status !== RequestStatus.pending) {
      logger.info(
        { requestId: id, currentStatus: clientRequest.status },
        "Cannot modify non-pending request",
      );
      return NextResponse.json(
        { error: `Solicitação já foi ${clientRequest.status}` },
        { status: 409 },
      );
    }

    if (action === "approve") {
      // Check if connection already exists
      const existingLink = await prisma.personalStudent.findUnique({
        where: {
          studentId_personalId: {
            studentId: clientRequest.studentId,
            personalId: clientRequest.personalId,
          },
        },
      });

      if (existingLink) {
        logger.warn(
          { studentId: clientRequest.studentId, personalId: clientRequest.personalId },
          "Connection already exists",
        );
        return NextResponse.json(
          { error: "Vínculo já existe" },
          { status: 409 },
        );
      }

      // Update request and create connection atomically
      await Promise.all([
        prisma.clientRequest.update({
          where: { id },
          data: { 
            status: RequestStatus.accepted,
            updatedAt: new Date(),
          },
        }),
        prisma.personalStudent.create({
          data: {
            studentId: clientRequest.studentId,
            personalId: clientRequest.personalId,
          },
        }),
      ]);

      logger.info(
        { requestId: id, studentId: clientRequest.studentId, personalId: clientRequest.personalId },
        "Request approved and connection created",
      );

      return NextResponse.json(
        {
          message: "Solicitação aprovada",
          status: RequestStatus.accepted,
          student: clientRequest.student,
        },
        { status: 200 },
      );
    } else if (action === "reject") {
      // Validate rejection reason length
      const rejectionReason = reason ? String(reason).trim() : "";
      if (rejectionReason.length > 500) {
        return NextResponse.json(
          { error: "Motivo muito longo (máximo 500 caracteres)" },
          { status: 400 },
        );
      }

      const rejectionMessage = rejectionReason
        ? `REJECTED: ${rejectionReason}`
        : "REJECTED";

      await prisma.clientRequest.update({
        where: { id },
        data: {
          status: RequestStatus.rejected,
          message: `${clientRequest.message}\n${rejectionMessage}`,
          updatedAt: new Date(),
        },
      });

      logger.info(
        { requestId: id, studentId: clientRequest.studentId, personalId: clientRequest.personalId },
        "Request rejected",
      );

      return NextResponse.json(
        {
          message: "Solicitação rejeitada",
          status: RequestStatus.rejected,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ errors: error.errors }, "PATCH validation failed");
      return NextResponse.json(
        { error: "Dados inválidos: " + error.errors[0].message },
        { status: 400 },
      );
    }

    logger.error({ error }, "PATCH /api/client-requests/[id] failed");
    const message = error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json(
      { error: `Erro ao processar solicitação: ${message}` },
      { status: 500 },
    );
  }
}
