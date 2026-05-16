import { cn } from "../utils";

describe("Utils", () => {
  describe("cn function", () => {
    it("should merge simple classes", () => {
      const result = cn("px-2", "py-1");
      expect(result).toBe("px-2 py-1");
    });

    it("should handle conditional classes", () => {
      const result = cn("px-2", true && "bg-red-500", false && "bg-blue-500");
      expect(result).toBe("px-2 bg-red-500");
    });

    it("should resolve tailwind conflicts", () => {
      const result = cn("px-2 px-4");
      expect(result).toBe("px-4");
    });

    it("should handle objects with conditional classes", () => {
      const result = cn({
        "px-2": true,
        "bg-red-500": true,
        "text-white": false,
      });
      expect(result).toContain("px-2");
      expect(result).toContain("bg-red-500");
      expect(result).not.toContain("text-white");
    });

    it("should handle arrays", () => {
      const result = cn(["px-2", "py-1"], "bg-red-500");
      expect(result).toContain("px-2");
      expect(result).toContain("py-1");
      expect(result).toContain("bg-red-500");
    });

    it("should ignore falsy values", () => {
      const result = cn("px-2", null, undefined, false, "bg-red-500");
      expect(result).toBe("px-2 bg-red-500");
    });

    it("should handle complex nested structures", () => {
      const isActive = true;
      const result = cn(
        "base-class",
        {
          "active-class": isActive,
          "inactive-class": !isActive,
        },
        "final-class",
      );
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
      expect(result).not.toContain("inactive-class");
      expect(result).toContain("final-class");
    });

    it("should resolve tailwind conflicts with objects", () => {
      const result = cn("px-2", {
        "px-4": true,
      });
      expect(result).toBe("px-4");
    });
  });
});
