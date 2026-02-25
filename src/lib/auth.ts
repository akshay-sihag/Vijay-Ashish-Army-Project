import { cookies } from "next/headers";
import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-in-production";
const COOKIE_NAME = "avm_session";

export interface SessionPayload {
  role: "admin" | "user";
  userId?: string;
  name?: string;
  superAdmin?: boolean;
}

function sign(payload: SessionPayload): string {
  const data = JSON.stringify(payload);
  const base64Data = Buffer.from(data).toString("base64");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(base64Data)
    .digest("hex");
  return `${base64Data}.${signature}`;
}

function verify(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [base64Data, signature] = parts;
  if (!base64Data || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(base64Data)
    .digest("hex");

  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(base64Data, "base64").toString());
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = sign(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashToVerify = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashToVerify));
}
