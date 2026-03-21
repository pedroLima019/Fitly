import { z } from "zod";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Safely parse JSON response
 */
export async function parseJsonResponse<T>(response: Response, schema?: z.ZodSchema<T>): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new ApiError(
      response.status,
      `Resposta vazia do servidor (${response.status})`,
    );
  }

  try {
    const data = JSON.parse(text);
    if (schema) {
      return schema.parse(data);
    }
    return data as T;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      const msg = firstError?.message || "Erro na validação";
      throw new ApiError(
        response.status,
        `Resposta inválida do servidor: ${msg}`,
      );
    }
    throw new ApiError(
      response.status,
      `Erro ao decodificar resposta JSON: ${error instanceof Error ? error.message : "Desconhecido"}`,
    );
  }
}

/**
 * Standard API response format
 */
export const ApiResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type ApiResponse<T = unknown> = {
  error?: string;
  message?: string;
  data?: T;
};
