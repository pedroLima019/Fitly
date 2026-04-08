import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for development
const inMemoryStore = new Map<string, RateLimitEntry>();

// Redis client for production
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  }

  return redisClient;
}

/**
 * Rate limiter middleware - Uses Redis in production, in-memory in development
 * @param userId - Chave para rate limit (geralmente user ID)
 * @param limit - Número máximo de requisições
 * @param windowMs - Janela de tempo em ms
 */
export async function rateLimit(
  userId: string,
  limit: number = 100,
  windowMs: number = 60 * 1000, // 1 minuto
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const redisClient = getRedisClient();
  const now = Date.now();
  const windowSec = Math.ceil(windowMs / 1000);

  if (redisClient) {
    // Redis implementation - recommended for production
    const key = `rate-limit:${userId}`;

    try {
      const current = await redisClient.incr(key);

      if (current === 1) {
        // First request in window, set expiry
        await redisClient.expire(key, windowSec);
      }

      const ttl = await redisClient.ttl(key);
      const resetIn = ttl > 0 ? ttl * 1000 : windowMs;

      if (current > limit) {
        return { allowed: false, remaining: 0, resetIn };
      }

      return {
        allowed: true,
        remaining: Math.max(0, limit - current),
        resetIn,
      };
    } catch (error) {
      console.error("Redis rate limit error:", error);
      // Fallback to in-memory if Redis fails
      return rateLimitInMemory(userId, limit, windowMs, now);
    }
  }

  // In-memory implementation for development
  return rateLimitInMemory(userId, limit, windowMs, now);
}

/**
 * In-memory rate limiter (fallback for development)
 */
function rateLimitInMemory(
  userId: string,
  limit: number,
  windowMs: number,
  now: number,
): { allowed: boolean; remaining: number; resetIn: number } {
  const entry = inMemoryStore.get(userId);

  // Se não existe ou já expirou, criar nova entrada
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    inMemoryStore.set(userId, newEntry);
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
export async function rateLimitMiddleware(
  userId: string,
  limit: number = 100,
  windowMs?: number,
): Promise<
  { allowed: true; remaining: number; resetIn: number } | NextResponse
> {
  const result = await rateLimit(userId, limit, windowMs);

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

// Limpar cache periodicamente em memória (a cada 5 min)
if (typeof globalThis !== "undefined" && !globalThis._rateLimitInterval) {
  globalThis._rateLimitInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, value] of inMemoryStore.entries()) {
        if (now > value.resetTime) {
          inMemoryStore.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );
}

declare global {
  var _rateLimitInterval: NodeJS.Timeout | undefined;
}
