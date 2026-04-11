import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { logger } from "@/lib/logger";
import { rateLimitMiddleware } from "@/lib/rate-limit";
import { RequestStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Rate limiting: max 20 cancellations per minute per user
    const rateLimitResult = await rateLimitMiddleware(
      session.user.id,
      20,
      60 * 1000,
    );
    if (rateLimitResult instanceof NextResponse) {
      logger.warn(
        { userId: session.user.id },
        "Rate limit exceeded for cancel requests",
      );
      return rateLimitResult;
    }

    if (!id) {
      logger.warn({ userId: session.user.id }, "Invalid ID provided to cancel");
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const clientRequest = await prisma.clientRequest.findUnique({
      where: { id },
      select: {
        studentId: true,
        status: true,
        personalId: true,
        student: { select: { name: true } },
      },
    });

    if (!clientRequest || clientRequest.status !== RequestStatus.pending) {
      logger.warn(
        {
          requestId: id,
          userId: session.user.id,
          status: clientRequest?.status,
        },
        "Cannot cancel non-pending request",
      );
      return NextResponse.json(
        { error: "Apenas solicitações pendentes podem ser canceladas" },
        { status: 409 },
      );
    }

    if (clientRequest.studentId !== session.user.id) {
      logger.warn(
        {
          requestId: id,
          userId: session.user.id,
          studentId: clientRequest.studentId,
        },
        "Unauthorized cancel attempt",
      );
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
    }

    // Soft delete instead of hard delete for auditability
    await prisma.clientRequest.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send notification to personal
    try {
      // Create notification for the bell icon
      await prisma.notification.create({
        data: {
          userId: clientRequest.personalId,
          title: "Solicitação Cancelada",
          message: `${clientRequest.student?.name || "Um aluno"} cancelou a solicitação.`,
          type: "request_canceled",
          relatedId: id,
          isRead: false,
        },
      });
    } catch (err) {
      logger.warn({ error: err }, "Failed to send cancellation notification");
      // Don't fail the operation if notification fails
    }

    logger.info(
      {
        requestId: id,
        studentId: session.user.id,
        personalId: clientRequest.personalId,
      },
      "Request cancelled successfully",
    );

    return NextResponse.json({
      message: "Solicitação cancelada com sucesso",
    });
  } catch (error) {
    logger.error({ error }, "POST /api/client-requests/[id]/cancel failed");
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json(
      { error: `Erro ao cancelar solicitação: ${message}` },
      { status: 500 },
    );
  }
}
