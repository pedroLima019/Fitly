import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const isUnknownFieldError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Unknown field") ||
    message.includes("Unknown argument") ||
    message.includes("does not exist in type")
  );
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          userType: true,
          name: true,
          location: true,
          goal: true,
          trainingLevel: true,
          availability: true,
          workoutPlace: true,
          limitations: true,
        },
      });
    } catch (error) {
      if (!isUnknownFieldError(error)) {
        throw error;
      }

      // Fallback temporário caso o runtime esteja com Prisma Client desatualizado
      const basicUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          userType: true,
          name: true,
          location: true,
        },
      });

      user = basicUser
        ? {
            ...basicUser,
            goal: null,
            trainingLevel: null,
            availability: null,
            workoutPlace: null,
            limitations: null,
          }
        : null;
    }

    if (!user || user.userType !== "student") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error("Erro no GET /api/profile/student:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, userType: true },
    });

    if (!user || user.userType !== "student") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const location =
      typeof body?.location === "string" ? body.location.trim() : "";
    const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
    const trainingLevel =
      typeof body?.trainingLevel === "string" ? body.trainingLevel.trim() : "";
    const availability =
      typeof body?.availability === "string" ? body.availability.trim() : "";
    const workoutPlace =
      typeof body?.workoutPlace === "string" ? body.workoutPlace.trim() : "";
    const limitations =
      typeof body?.limitations === "string" ? body.limitations.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 },
      );
    }

    let updated;
    try {
      updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          location: location || null,
          goal: goal || null,
          trainingLevel: trainingLevel || null,
          availability: availability || null,
          workoutPlace: workoutPlace || null,
          limitations: limitations || null,
        },
        select: {
          id: true,
          name: true,
          location: true,
          goal: true,
          trainingLevel: true,
          availability: true,
          workoutPlace: true,
          limitations: true,
        },
      });
    } catch (error) {
      if (!isUnknownFieldError(error)) {
        throw error;
      }

      // Fallback temporário caso o runtime esteja com Prisma Client desatualizado
      const basicUpdated = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          location: location || null,
        },
        select: {
          id: true,
          name: true,
          location: true,
        },
      });

      updated = {
        ...basicUpdated,
        goal: null,
        trainingLevel: null,
        availability: null,
        workoutPlace: null,
        limitations: null,
      };
    }

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("Erro no PATCH /api/profile/student:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
