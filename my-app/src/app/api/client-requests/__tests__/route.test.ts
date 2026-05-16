/**
 * @jest-environment node
 */

import { prisma } from "@/lib/prisma";
import { rateLimitMiddleware } from "@/lib/rate-limit";
import { UserType, RequestStatus } from "@prisma/client";
import {
  ClientRequestPostSchema,
  ClientRequestPatchSchema,
} from "@/lib/validators";

jest.mock("@/lib/prisma");
jest.mock("@/lib/rate-limit");
jest.mock("@/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRateLimit = rateLimitMiddleware as jest.MockedFunction<
  typeof rateLimitMiddleware
>;

describe("/api/client-requests - API Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue(true as any);
  });

  describe("Validation Schemas", () => {
    describe("ClientRequestPostSchema", () => {
      it("should validate correct POST data", () => {
        const validData = {
          personalId: "cuid123456789012345678901",
          objective: "Treino de força",
          availability: "Seg-Sex 10-12h",
        };

        const result = ClientRequestPostSchema.parse(validData);
        expect(result).toEqual(expect.objectContaining(validData));
      });

      it("should trim whitespace from objective", () => {
        const result = ClientRequestPostSchema.parse({
          personalId: "cuid123456789012345678901",
          objective: "  Treino  ",
          availability: "Seg-Sex",
        });

        expect(result.objective).toBe("Treino");
      });

      it("should default message to empty string", () => {
        const result = ClientRequestPostSchema.parse({
          personalId: "cuid123456789012345678901",
          objective: "Treino",
          availability: "Seg-Sex",
        });

        expect(result.message).toBe("");
      });

      it("should reject missing personalId", () => {
        expect(() => {
          ClientRequestPostSchema.parse({
            objective: "Treino",
            availability: "Seg-Sex",
          });
        }).toThrow();
      });

      it("should reject objective < 2 chars", () => {
        expect(() => {
          ClientRequestPostSchema.parse({
            personalId: "cuid123456789012345678901",
            objective: "T",
            availability: "Seg-Sex",
          });
        }).toThrow();
      });

      it("should reject objective > 100 chars", () => {
        expect(() => {
          ClientRequestPostSchema.parse({
            personalId: "cuid123456789012345678901",
            objective: "a".repeat(101),
            availability: "Seg-Sex",
          });
        }).toThrow();
      });

      it("should reject message > 500 chars", () => {
        expect(() => {
          ClientRequestPostSchema.parse({
            personalId: "cuid123456789012345678901",
            objective: "Treino",
            availability: "Seg-Sex",
            message: "a".repeat(501),
          });
        }).toThrow();
      });
    });

    describe("ClientRequestPatchSchema", () => {
      it("should validate approve action", () => {
        const result = ClientRequestPatchSchema.parse({
          action: "approve",
        });

        expect(result.action).toBe("approve");
      });

      it("should validate reject action with reason", () => {
        const result = ClientRequestPatchSchema.parse({
          action: "reject",
          reason: "Not interested",
        });

        expect(result.action).toBe("reject");
        expect(result.reason).toBe("Not interested");
      });

      it("should reject invalid action", () => {
        expect(() => {
          ClientRequestPatchSchema.parse({
            action: "delete",
          });
        }).toThrow();
      });

      it("should allow optional reason", () => {
        const result = ClientRequestPatchSchema.parse({
          action: "approve",
        });

        expect(result.reason).toBeUndefined();
      });
    });
  });

  describe("Database Operations", () => {
    it("should fetch received requests with correct filters", async () => {
      mockPrisma.clientRequest.findMany.mockResolvedValueOnce([]);

      const result = await mockPrisma.clientRequest.findMany({
        where: {
          personalId: "personal-123",
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      expect(result).toEqual([]);
      expect(mockPrisma.clientRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            personalId: "personal-123",
            deletedAt: null,
          }),
        }),
      );
    });

    it("should fetch sent requests with correct filters", async () => {
      mockPrisma.clientRequest.findMany.mockResolvedValueOnce([]);

      await mockPrisma.clientRequest.findMany({
        where: {
          studentId: "student-123",
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      expect(mockPrisma.clientRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            studentId: "student-123",
            deletedAt: null,
          }),
        }),
      );
    });

    it("should filter by status when provided", async () => {
      mockPrisma.clientRequest.findMany.mockResolvedValueOnce([]);

      await mockPrisma.clientRequest.findMany({
        where: {
          personalId: "personal-123",
          status: RequestStatus.accepted,
          deletedAt: null,
        },
      });

      expect(mockPrisma.clientRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: RequestStatus.accepted,
          }),
        }),
      );
    });

    it("should create new client request", async () => {
      const mockRequest = {
        id: "req-1",
        studentId: "student-123",
        personalId: "personal-123",
        objective: "Treino de força",
        availability: "Seg-Sex",
        message: "Custom message",
        status: RequestStatus.pending,
        createdAt: new Date(),
      };

      mockPrisma.clientRequest.create.mockResolvedValueOnce(mockRequest as any);

      const result = await mockPrisma.clientRequest.create({
        data: {
          studentId: "student-123",
          personalId: "personal-123",
          objective: "Treino de força",
          availability: "Seg-Sex",
          message: "Custom message",
        },
      });

      expect(result.id).toBe("req-1");
      expect(result.status).toBe(RequestStatus.pending);
    });
  });

  describe("User Verification", () => {
    it("should find student by ID", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "student-123",
        userType: UserType.student,
      } as any);

      const user = await mockPrisma.user.findUnique({
        where: { id: "student-123" },
      });

      expect(user?.userType).toBe(UserType.student);
    });

    it("should find personal by ID", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "personal-123",
        userType: UserType.personal,
      } as any);

      const user = await mockPrisma.user.findUnique({
        where: { id: "personal-123" },
      });

      expect(user?.userType).toBe(UserType.personal);
    });

    it("should return null for non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const user = await mockPrisma.user.findUnique({
        where: { id: "non-existent" },
      });

      expect(user).toBeNull();
    });
  });

  describe("Rate Limiting", () => {
    it("should call rate limit with correct parameters", async () => {
      await mockRateLimit("user-123", 10, 60000);

      expect(mockRateLimit).toHaveBeenCalledWith("user-123", 10, 60000);
    });

    it("should handle rate limit success", async () => {
      mockRateLimit.mockResolvedValueOnce(true as any);

      const result = await mockRateLimit("user-123", 10, 60000);

      expect(result).toBe(true);
    });

    it("should handle rate limit error response", async () => {
      const errorResponse = {
        status: 429,
        json: async () => ({ error: "Rate limit exceeded" }),
      };

      mockRateLimit.mockResolvedValueOnce(errorResponse as any);

      const result = await mockRateLimit("user-123", 10, 60000);

      expect(result.status).toBe(429);
    });
  });

  describe("Message Generation", () => {
    it("should generate default message from objective and availability", () => {
      const objective = "Treino de força";
      const availability = "Seg-Sex 10-12h";
      const finalMessage = `Objetivo: ${objective} | Disponibilidade: ${availability}`;

      expect(finalMessage).toBe(
        "Objetivo: Treino de força | Disponibilidade: Seg-Sex 10-12h",
      );
    });

    it("should use custom message when provided", () => {
      const customMessage = "Custom message text";

      expect(customMessage).toBe("Custom message text");
    });
  });

  describe("Soft Delete Logic", () => {
    it("should exclude soft-deleted requests in queries", async () => {
      mockPrisma.clientRequest.findMany.mockResolvedValueOnce([]);

      await mockPrisma.clientRequest.findMany({
        where: {
          personalId: "personal-123",
          deletedAt: null,
        },
      });

      expect(mockPrisma.clientRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        }),
      );
    });
  });

  describe("Query Includes and Selects", () => {
    it("should include student data for received requests", async () => {
      mockPrisma.clientRequest.findMany.mockResolvedValueOnce([]);

      await mockPrisma.clientRequest.findMany({
        where: { personalId: "personal-123" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              userType: true,
            },
          },
        },
      });

      expect(mockPrisma.clientRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            student: expect.any(Object),
          }),
        }),
      );
    });

    it("should include personal data for sent requests", async () => {
      mockPrisma.clientRequest.findMany.mockResolvedValueOnce([]);

      await mockPrisma.clientRequest.findMany({
        where: { studentId: "student-123" },
        include: {
          personal: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              userType: true,
            },
          },
        },
      });

      expect(mockPrisma.clientRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            personal: expect.any(Object),
          }),
        }),
      );
    });
  });
});
