import { NextResponse } from "next/server";
import { backendFetch, backendPublicFetch } from "@/lib/backend";
import { getJwtToken, TOKEN_COOKIE, USER_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

export async function POST() {
  const token = await getJwtToken();

  // Try to call backend logout (best-effort)
  if (token) {
    try {
      await backendFetch("/auth/logout", token, { method: "POST" });
    } catch {
      // Ignore errors – we still clear local cookies
    }
  }

  const res = NextResponse.json({ ok: true });
  const clear = (name: string) =>
    res.cookies.set(name, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });

  clear(TOKEN_COOKIE);
  clear(USER_COOKIE);
  clear(REFRESH_COOKIE);
  return res;
}
