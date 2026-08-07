import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getEnv } from "../../utils/get-env";

describe("getEnv", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns the env variable value when set", () => {
    process.env.TEST_VAR = "hello";
    expect(getEnv("TEST_VAR")).toBe("hello");
  });

  it("returns the default value when env variable is not set", () => {
    delete process.env.TEST_DEFAULT;
    expect(getEnv("TEST_DEFAULT", "fallback")).toBe("fallback");
  });

  it("throws when env variable is missing and no default provided", () => {
    delete process.env.MISSING_VAR;
    expect(() => getEnv("MISSING_VAR")).toThrow("Missing env variable: MISSING_VAR");
  });

  it("prefers env variable over default value", () => {
    process.env.OVERRIDDEN = "from-env";
    expect(getEnv("OVERRIDDEN", "from-default")).toBe("from-env");
  });
});
