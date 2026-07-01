import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Response } from "express";
import type { User } from "../types.js";
import { query } from "./db.js";
import { findUserByEmail, findUserById } from "./userStore.js";

const refreshCookieName = "refreshToken";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const hashToken = (token: string) =>
  crypto.createHmac("sha256", requiredEnv("REFRESH_TOKEN_SECRET")).update(token).digest("hex");

export function signAccessToken(user: User) {
  const options: SignOptions = { expiresIn: (process.env.ACCESS_TOKEN_TTL ?? "15m") as SignOptions["expiresIn"] };
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, requiredEnv("JWT_SECRET"), options);
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return user;
}

export async function createRefreshSession(res: Response, user: User) {
  const token = crypto.randomBytes(48).toString("base64url");
  const csrfToken = crypto.randomBytes(24).toString("base64url");
  const days = Number(process.env.REFRESH_TOKEN_DAYS ?? 30);
  await query(
    "INSERT INTO refresh_tokens (user_id, token_hash, csrf_token, expires_at) VALUES ($1,$2,$3,now()+($4 || ' days')::interval)",
    [user.id, hashToken(token), csrfToken, days]
  );
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: (process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none") ?? "lax",
    maxAge: days * 24 * 60 * 60 * 1000,
    path: "/api/auth"
  });
  return { accessToken: signAccessToken(user), csrfToken };
}

export async function refreshSession(token: string | undefined, csrfToken: string | undefined) {
  if (!token || !csrfToken) return null;
  const result = await query<{ user_id: string; csrf_token: string }>(
    "SELECT * FROM refresh_tokens WHERE token_hash=$1 AND csrf_token=$2 AND revoked_at IS NULL AND expires_at > now()",
    [hashToken(token), csrfToken]
  );
  const session = result.rows[0];
  if (!session) return null;
  const user = await findUserById(session.user_id);
  if (!user) return null;
  return { user, accessToken: signAccessToken(user), csrfToken: session.csrf_token };
}

export async function revokeRefreshToken(token: string | undefined) {
  if (!token) return;
  await query("UPDATE refresh_tokens SET revoked_at=now() WHERE token_hash=$1", [hashToken(token)]);
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(refreshCookieName, { path: "/api/auth" });
}
