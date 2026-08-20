import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken } from "@/lib/auth";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(6, "Le nouveau mot de passe doit faire au moins 6 caractères"),
});

export async function POST(req: Request) {
  const token = await getJwtToken();
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  try {
    const res = await backendFetch("/utilisateurs/profil", token, {
      method: "PUT",
      body: JSON.stringify({ motDePasse: parsed.data.newPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || "Erreur lors du changement de mot de passe" },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Password change error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}
