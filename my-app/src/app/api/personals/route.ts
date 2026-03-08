import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const studentId = session?.user?.id;

    const personals = await prisma.user.findMany({
      where: {
        userType: "personal",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        specialties: true,
        location: true,
        bio: true,
        hourlyRate: true,
        pricePerSession: true,
        trainings: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Se o usuário está logado como aluno, trazer status das solicitações
    let requestsMap: Record<string, string> = {};
    if (studentId) {
      const requests = await prisma.clientRequest.findMany({
        where: { studentId },
        select: { personalId: true, status: true },
      });
      requestsMap = Object.fromEntries(
        requests.map((r) => [r.personalId, r.status]),
      );
    }

    const enrichedPersonals = personals.map((p) => ({
      ...p,
      requestStatus: requestsMap[p.id] || "none",
    }));

    return NextResponse.json({ personals: enrichedPersonals });
  } catch (error) {
    console.error("Erro ao listar personals:", error);
    return NextResponse.json(
      { error: "Erro ao listar personals" },
      { status: 500 },
    );
  }
}
