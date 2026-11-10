import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASS ?? "kgarden@it";
const SECRET = process.env.AUTH_SECRET ?? "kgarden-it-asset-secret";

export const SESSION_COOKIE = "it_session";

export function sessionToken(): string {
  return createHash("sha256").update(`${ADMIN_USER}:${ADMIN_PASS}:${SECRET}`).digest("hex");
}

export function checkCredentials(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

export async function isLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === sessionToken();
}

export async function requireLogin(): Promise<void> {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }
}
