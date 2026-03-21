import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter
// Em produção, use Redis
const store = new Map<string, RateLimitEntry>();

/**
 * Rate limiter middleware
 * @param userId - Chave para rate limit (geralmente user ID)
 * @param limit - Número máximo de requisições
 * @param windowMs - Janela de tempo em ms
 */
export function rateLimit(
  userId: string,
  limit: number = 100,
  windowMs: number = 60 * 1000, // 1 minuto
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(userId);

  // Se não existe ou já expirou, criar nova entrada
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(userId, newEntry);
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  // Incrementar contador
  entry.count++;
  const remaining = Math.max(0, limit - entry.count);

  if (entry.count > limit) {
    const resetIn = entry.resetTime - now;
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining, resetIn: entry.resetTime - now };
}

/**
 * Middleware para aplicar rate limiting em endpoints
 */
export function rateLimitMiddleware(
  userId: string,
  limit: number = 100,
  windowMs?: number,
): { allowed: true; remaining: number; resetIn: number } | NextResponse {
  const result = rateLimit(userId, limit, windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente mais tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(result.resetIn / 1000).toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(
            Date.now() + result.resetIn,
          ).toISOString(),
        },
      },
    );
  }

  return {
    allowed: true,
    remaining: result.remaining,
    resetIn: result.resetIn,
  };
}

// Limpar cache periodicamente (a cada 5 min, remover entradas expiradas)
if (typeof globalThis !== "undefined" && !globalThis._rateLimitInterval) {
  globalThis._rateLimitInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, value] of store.entries()) {
        if (now > value.resetTime) {
          store.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );
}

declare global {
  var _rateLimitInterval: NodeJS.Timeout | undefined;
}
