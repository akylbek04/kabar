import jwt from "jsonwebtoken";
import { Response } from "express";
import { Env } from "../config/env.config";

type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;
type Cookie = {
  res: Response;
  userId: string;
};

const parseTimeToMs = (time: string): number => {
  const match = time.match(/^(\d+)(s|m|h|d|w|y)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // fallback 7d
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] ?? 86400000);
};

export const setJwtAuthCookie = ({ res, userId }: Cookie) => {
  const expiresIn = (Env.JWT_EXPIRES_IN || "7d") as Time;
  const token = jwt.sign({ userId }, Env.JWT_SECRET, {
    audience: ["user"],
    expiresIn,
  });

  return res.cookie("accessToken", token, {
    maxAge: parseTimeToMs(expiresIn),
    httpOnly: true,
    secure: Env.NODE_ENV === "production",
    sameSite: Env.NODE_ENV === "production" ? "strict" : "lax",
  });
};

export const clearJwtAuthCookie = (res: Response) =>
  res.clearCookie("accessToken", { path: "/" });
