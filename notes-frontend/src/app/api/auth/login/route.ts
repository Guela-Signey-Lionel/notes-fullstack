import { NextResponse } from "next/server";
import { backendPublicFetch } from "@/lib/backend";
import { buildSafeUser, TOKEN_COOKIE, USER_COOKIE, REFRESH_COOKIE } from "@/lib/auth";
import type { BackendAuthResponse } from "@/lib/backend";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  try {
    const res = await backendPublicFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, motDePasse: password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || errData.error || "Email ou mot de passe incorrect" },
        { status: res.status }
      );
    }

    const data: BackendAuthResponse = await res.json();
    const safeUser = buildSafeUser(data.utilisateur);

    const cookieMaxAge = 7 * 24 * 60 * 60; // 7 days
    const res2 = NextResponse.json({ user: safeUser });

    res2.cookies.set(TOKEN_COOKIE, data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: cookieMaxAge,
    });
    res2.cookies.set(REFRESH_COOKIE, data.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: cookieMaxAge,
    });
    res2.cookies.set(USER_COOKIE, JSON.stringify(safeUser), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: cookieMaxAge,
    });

    return res2;
  } catch (err: any) {
    console.error("Login error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur de connexion au serveur" },
      { status: 502 }
    );
  }
}
