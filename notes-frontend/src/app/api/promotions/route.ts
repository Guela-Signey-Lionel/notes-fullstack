import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { PromotionRow } from "@/lib/types";
import type { BackendPromotionResponse } from "@/lib/backend";
import { z } from "zod";

function toPromotionRow(p: BackendPromotionResponse): PromotionRow {
  return {
    id: p.id,
    name: p.nom,
    level: p.filiere?.niveau || "",
    field: p.filiere?.nom || "",
    academicYear: p.anneeAcademique,
    studentCount: p.nbEtudiants || 0,
    courseCount: 0,
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
    const res = await backendFetch("/promotions", token!);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Erreur backend" },
        { status: res.status }
      );
    }

    const promotions: BackendPromotionResponse[] = await res.json();
    return NextResponse.json(promotions.map(toPromotionRow));
  } catch (err: any) {
    console.error("Promotions fetch error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des promotions" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(3, "Nom requis"),
  level: z.enum(["L1", "L2", "L3", "M1", "M2"]),
  field: z.string().min(2, "Filière requise"),
  academicYear: z.string().min(5, "Année requise"),
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
    // First, find or create the filiere
    const filieresRes = await backendFetch("/filieres", token!);
    let filiereId = "";
    if (filieresRes.ok) {
      const filieres = await filieresRes.json();
      const existing = filieres.find(
        (f: any) => f.nom.toLowerCase() === d.field.toLowerCase()
      );
      if (existing) {
        filiereId = existing.id;
      }
    }

    if (!filiereId) {
      // Create filiere
      const createFiliereRes = await backendFetch("/filieres", token!, {
        method: "POST",
        body: JSON.stringify({
          nom: d.field,
          code: d.field.substring(0, 10).toUpperCase().replace(/\s/g, ""),
          niveau: d.level === "L1" || d.level === "L2" || d.level === "L3" ? "LICENCE" : "MASTER",
          duree: d.level.startsWith("L") ? 3 : 2,
        }),
      });
      if (createFiliereRes.ok) {
        const filiere = await createFiliereRes.json();
        filiereId = filiere.id;
      } else {
        return NextResponse.json(
          { error: "Erreur lors de la création de la filière" },
          { status: 500 }
        );
      }
    }

    // Create promotion
    const res = await backendFetch("/promotions", token!, {
      method: "POST",
      body: JSON.stringify({
        nom: d.name,
        anneeAcademique: d.academicYear,
        filiereId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || "Erreur" },
        { status: res.status }
      );
    }

    const created: BackendPromotionResponse = await res.json();
    return NextResponse.json(toPromotionRow(created), { status: 201 });
  } catch (err: any) {
    console.error("Create promotion error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la création de la promotion" },
      { status: 500 }
    );
  }
}
