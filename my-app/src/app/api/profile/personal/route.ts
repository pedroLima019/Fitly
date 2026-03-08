import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("GET /api/profile/personal - Iniciando");

    let session;
    try {
      session = await getServerSession(authOptions);
      console.log("Session obtida com sucesso:", session?.user?.id);
    } catch (sessionError) {
      console.error("❌ Erro ao obter session:", sessionError);
      return NextResponse.json(
        { error: "Erro ao autenticar" },
        { status: 401 },
      );
    }

    if (!session?.user?.id) {
      console.log("⚠️ Sem sessão ou user.id faltando");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    console.log("Buscando user no banco:", session.user.id);
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          userType: true,
          name: true,
          specialties: true,
          location: true,
          bio: true,
          hourlyRate: true,
          pricePerSession: true,
        },
      });
      console.log("User encontrado:", user ? "✓ Sim" : "✗ Não");
    } catch (prismaError) {
      console.error("❌ Erro ao buscar user no Prisma:", prismaError);
      return NextResponse.json(
        { error: "Erro ao buscar usuário" },
        { status: 500 },
      );
    }

    if (!user) {
      console.log("⚠️ User não encontrado no banco");
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    if (user.userType !== "personal") {
      console.log("⚠️ User não é personal, userType:", user.userType);
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    console.log("✓ Retornando perfil com sucesso");
    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error("❌ ERRO INESPERADO no GET /api/profile/personal:");
    console.error(
      "Tipo:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "Mensagem:",
      error instanceof Error ? error.message : String(error),
    );
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    console.log("1. Iniciando PATCH /api/profile/personal");

    const session = await getServerSession(authOptions);
    console.log("2. Session obtida:", session?.user?.id);

    if (!session?.user?.id) {
      console.log("3. Sessão inválida");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    console.log("4. Buscando usuário no banco");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, userType: true },
    });
    console.log("5. Usuário encontrado:", user);

    if (!user || user.userType !== "personal") {
      console.log("6. Usuário não é personal");
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    console.log("7. Fazendo parse do body");
    const body = await req.json().catch((e) => {
      console.error("Erro ao fazer parse do body:", e);
      return null;
    });
    console.log("8. Body recebido:", body);

    if (!body) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const specialties =
      typeof body?.specialties === "string" ? body.specialties.trim() : "";
    const location =
      typeof body?.location === "string" ? body.location.trim() : "";
    const bio = typeof body?.bio === "string" ? body.bio.trim() : "";
    const chargeMode =
      typeof body?.chargeMode === "string" ? body.chargeMode : "hourly";

    let hourlyRate: number | null = null;
    let pricePerSession: number | null = null;

    if (chargeMode === "hourly") {
      hourlyRate =
        typeof body?.hourlyRate === "string"
          ? body.hourlyRate.trim() !== ""
            ? parseFloat(body.hourlyRate)
            : null
          : null;
      pricePerSession = null;
    } else if (chargeMode === "perSession") {
      pricePerSession =
        typeof body?.pricePerSession === "string"
          ? body.pricePerSession.trim() !== ""
            ? parseFloat(body.pricePerSession)
            : null
          : null;
      hourlyRate = null;
    }

    console.log("9. Dados processados:", {
      name,
      specialties,
      location,
      bio,
      chargeMode,
      hourlyRate,
      pricePerSession,
    });

    if (!name) {
      console.log("10. Nome vazio");
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 },
      );
    }

    if (bio.length > 240) {
      console.log("11. Bio muito longa");
      return NextResponse.json(
        { error: "Bio deve ter no máximo 240 caracteres" },
        { status: 400 },
      );
    }

    console.log("12. Atualizando usuário");
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        specialties: specialties || null,
        location: location || null,
        bio: bio || null,
        hourlyRate,
        pricePerSession,
      },
      select: {
        id: true,
        name: true,
        specialties: true,
        location: true,
        bio: true,
        hourlyRate: true,
        pricePerSession: true,
      },
    });
    console.log("13. Usuário atualizado com sucesso:", updated);

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("❌ ERRO COMPLETO no PATCH /api/profile/personal:");
    console.error(
      "Tipo:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error("Mensagem:", error instanceof Error ? error.message : error);
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
