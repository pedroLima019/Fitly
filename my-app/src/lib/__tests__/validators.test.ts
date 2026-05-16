import {
  validateString,
  ClientRequestPostSchema,
  ClientRequestPatchSchema,
} from "../validators";

describe("Validators", () => {
  describe("validateString", () => {
    it("should validate a valid string", () => {
      const result = validateString("Hello World");
      expect(result).toBe("Hello World");
    });

    it("should trim whitespace", () => {
      const result = validateString("  Hello World  ");
      expect(result).toBe("Hello World");
    });

    it("should throw error for empty string", () => {
      expect(() => validateString("")).toThrow();
    });

    it("should throw error if string is only spaces", () => {
      expect(() => validateString("   ")).toThrow();
    });

    it("should throw error if below minimum length", () => {
      expect(() => validateString("a", 5)).toThrow();
    });

    it("should throw error if above maximum length", () => {
      expect(() => validateString("a".repeat(100), 1, 50)).toThrow();
    });

    it("should use default min=1 and max=500", () => {
      const result = validateString("x");
      expect(result).toBe("x");

      expect(() => validateString("x".repeat(501))).toThrow();
    });
  });

  describe("ClientRequestPostSchema", () => {
    const validData = {
      personalId: "cuid123456789012345678901",
      objective: "Treino de força",
      availability: "Seg-Sex 10-12h",
      message: "Olá",
    };

    it("should validate correct data", () => {
      const result = ClientRequestPostSchema.parse(validData);
      expect(result.objective).toBe("Treino de força");
    });

    it("should trim strings", () => {
      const result = ClientRequestPostSchema.parse({
        ...validData,
        objective: "  Treino de força  ",
      });
      expect(result.objective).toBe("Treino de força");
    });

    it("should fail with missing required fields", () => {
      expect(() => {
        ClientRequestPostSchema.parse({
          objective: "Treino",
        });
      }).toThrow();
    });

    it("should fail with invalid personalId", () => {
      expect(() => {
        ClientRequestPostSchema.parse({
          ...validData,
          personalId: "invalid-id",
        });
      }).toThrow();
    });

    it("should fail if objective is too short", () => {
      expect(() => {
        ClientRequestPostSchema.parse({
          ...validData,
          objective: "a",
        });
      }).toThrow();
    });

    it("should fail if objective exceeds max length", () => {
      expect(() => {
        ClientRequestPostSchema.parse({
          ...validData,
          objective: "a".repeat(101),
        });
      }).toThrow();
    });

    it("should allow optional message", () => {
      const { message } = ClientRequestPostSchema.parse(validData);
      expect(message).toBe("Olá");
    });

    it("should default message to empty string if not provided", () => {
      const result = ClientRequestPostSchema.parse({
        personalId: validData.personalId,
        objective: validData.objective,
        availability: validData.availability,
      });
      expect(result.message).toBe("");
    });
  });

  describe("ClientRequestPatchSchema", () => {
    it("should validate approval action", () => {
      const result = ClientRequestPatchSchema.parse({
        action: "approve",
      });
      expect(result.action).toBe("approve");
    });

    it("should validate rejection action", () => {
      const result = ClientRequestPatchSchema.parse({
        action: "reject",
        reason: "Not interested",
      });
      expect(result.action).toBe("reject");
    });

    it("should fail with invalid action", () => {
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

    it("should fail if reason exceeds max length", () => {
      expect(() => {
        ClientRequestPatchSchema.parse({
          action: "reject",
          reason: "a".repeat(501),
        });
      }).toThrow();
    });
  });
});
