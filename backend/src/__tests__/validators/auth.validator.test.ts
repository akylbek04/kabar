import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  passwordSchema,
} from "../../validators/auth.validator";

describe("passwordSchema", () => {
  it("rejects passwords shorter than 8 characters", () => {
    const result = passwordSchema.safeParse("short");
    expect(result.success).toBe(false);
  });

  it("accepts passwords with 8+ characters", () => {
    const result = passwordSchema.safeParse("longpassword");
    expect(result.success).toBe(true);
  });

  it("rejects empty passwords", () => {
    const result = passwordSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates a correct registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "securepassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      email: "not-an-email",
      password: "securepassword",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "test@example.com",
      password: "securepassword",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("validates a correct login payload", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "securepassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects login with short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "abc",
    });
    expect(result.success).toBe(false);
  });
});
