import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const personals = await prisma.user.findMany({
      where: {
        userType: "personal",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ personals });
  } catch (error) {
    console.error("Erro ao listar personals:", error);
    return NextResponse.json(
      { error: "Erro ao listar personals" },
      { status: 500 },
    );
  }
}
