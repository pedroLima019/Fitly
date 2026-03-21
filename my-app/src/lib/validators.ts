import { z } from "zod";

/**
 * Valida strings com limite de tamanho
 */
export const validateString = (value: unknown, min = 1, max = 500): string => {
  const schema = z
    .string()
    .min(min, `Mínimo ${min} caracteres`)
    .max(max, `Máximo ${max} caracteres`)
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, "Campo não pode ser apenas espaços");

  return schema.parse(value);
};

/**
 * Schemas de validação para Client Requests
 */
export const ClientRequestPostSchema = z.object({
  personalId: z
    .string()
    .min(1, "ID do personal é obrigatório")
    .cuid("ID do personal inválido"),
  objective: z
    .string()
    .min(2, "Objetivo deve ter pelo menos 2 caracteres")
    .max(100, "Objetivo não pode ter mais de 100 caracteres")
    .transform((val) => val.trim()),
  availability: z
    .string()
    .min(2, "Disponibilidade deve ter pelo menos 2 caracteres")
    .max(200, "Disponibilidade não pode ter mais de 200 caracteres")
    .transform((val) => val.trim()),
  message: z
    .string()
    .max(500, "Mensagem não pode ter mais de 500 caracteres")
    .optional()
    .transform((val) => val?.trim() || ""),
});

export const ClientRequestPatchSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z
    .string()
    .max(500, "Motivo não pode ter mais de 500 caracteres")
    .optional(),
});

/**
 * Esquema para resposta de API
 */
export const ApiResponseSchema = z.object({
  error: z.string().optional(),
  request: z.any().optional(),
  requests: z.any().optional(),
  message: z.string().optional(),
});

export type ClientRequestPostData = z.infer<typeof ClientRequestPostSchema>;
export type ClientRequestPatchData = z.infer<typeof ClientRequestPatchSchema>;
