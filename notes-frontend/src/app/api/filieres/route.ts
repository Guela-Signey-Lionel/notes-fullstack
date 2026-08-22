import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { BackendFiliereResponse } from "@/lib/backend";
import { z } from "zod";

function toFiliereRow(f: BackendFiliereResponse) {
  return {
    id: f.id,
    name: f.nom,
    code: f.code,
    level: f.niveau,
    duration: f.duree,
    active: f.actif,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN", "TEACHER", "STUDENT");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const res = await backendFetch("/filieres", token!);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Erreur backend" },
        { status: res.status }
      );
    }

    const filieres: BackendFiliereResponse[] = await res.json();
    return NextResponse.json(filieres.map(toFiliereRow));
  } catch (err: any) {
    console.error("Filieres fetch error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des filières" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  code: z.string().min(1, "Code requis"),
  level: z.string().min(1, "Niveau requis"),
  duration: z.coerce.number().int().min(1).max(10),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  try {
    const res = await backendFetch("/filieres", token!, {
      method: "POST",
      body: JSON.stringify({
        nom: d.name,
        code: d.code.toUpperCase().replace(/\s/g, ""),
        niveau: d.level.toUpperCase(),
        duree: d.duration,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Erreur lors de la création de la filière" },
        { status: res.status }
      );
    }

    const created: BackendFiliereResponse = await res.json();
    return NextResponse.json(toFiliereRow(created), { status: 201 });
  } catch (err: any) {
    console.error("Create filiere error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la création de la filière" },
      { status: 500 }
    );
  }
}
