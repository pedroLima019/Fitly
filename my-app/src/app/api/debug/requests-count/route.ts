import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check total requests in database
    const totalRequests = await prisma.clientRequest.count();

    // Check requests sent by this user
    const sentRequests = await prisma.clientRequest.count({
      where: {
        studentId: userId,
      },
    });

    // Check requests received by this user
    const receivedRequests = await prisma.clientRequest.count({
      where: {
        personalId: userId,
      },
    });

    // Get sample of all requests to debug
    const sampleRequests = await prisma.clientRequest.findMany({
      take: 5,
      select: {
        id: true,
        studentId: true,
        personalId: true,
        status: true,
        createdAt: true,
      },
    });

    logger.info(
      {
        userId,
        totalRequests,
        sentRequests,
        receivedRequests,
        sampleRequests,
      },
      "Debug info for requests",
    );

    return NextResponse.json({
      userId,
      totalRequests,
      sentRequests,
      receivedRequests,
      sampleRequests,
    });
  } catch (error) {
    logger.error({ error }, "Debug requests count failed");
    return NextResponse.json(
      { error: "Erro ao contar solicitacoes" },
      { status: 500 },
    );
  }
}
