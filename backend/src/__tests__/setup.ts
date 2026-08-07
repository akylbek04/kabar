import { beforeAll } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret-for-tests-only";
  process.env.MONGO_URI = "mongodb://localhost:27017/kabar-test";
  process.env.FRONTEND_ORIGIN = "http://localhost:5173";
});
