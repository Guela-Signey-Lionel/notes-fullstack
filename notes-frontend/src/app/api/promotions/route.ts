import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { PromotionRow } from "@/lib/types";
import type { BackendPromotionResponse } from "@/lib/backend";
import { z } from "zod";

function toPromotionRow(p: BackendPromotionResponse, courseCount: number = 0): PromotionRow {
  return {
    id: p.id,
    name: p.nom,
    level: p.filiere?.niveau || "",
    field: p.filiere?.nom || "",
    academicYear: p.anneeAcademique,
    studentCount: p.nbEtudiants || 0,
    courseCount,
  };
}

/** Count matières for a promotion by fetching its semestres → UEs → matières */
async function countMatieres(promoId: string, token: string): Promise<number> {
  try {
    const semRes = await backendFetch(`/semestres?promotionId=${promoId}`, token);
    if (!semRes.ok) return 0;
    const semestres: { id: string }[] = await semRes.json();
    if (semestres.length === 0) return 0;

    const ueResults = await Promise.allSettled(
      semestres.map((s) =>
        backendFetch(`/ue?semestreId=${s.id}`, token).then((r) => (r.ok ? r.json() : []))
      )
    );

    let total = 0;
    for (const result of ueResults) {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        for (const ue of result.value) {
          total += ue.matieres?.length ?? 0;
        }
      }
    }
    return total;
  } catch {
    return 0;
  }
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

    // Fetch matiere counts in parallel for all promotions
    const counts = await Promise.allSettled(
      promotions.map((p) => countMatieres(p.id, token!))
    );

    return NextResponse.json(
      promotions.map((p, i) => {
        const courseCount = counts[i].status === "fulfilled" ? counts[i].value : 0;
        return toPromotionRow(p, courseCount);
      })
    );
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
      const niveauMap: Record<string, string> = {
        L1: "LICENCE",
        L2: "LICENCE",
        L3: "LICENCE",
        M1: "MASTER",
        M2: "MASTER",
      };
      const dureeMap: Record<string, number> = {
        L1: 3,
        L2: 3,
        L3: 3,
        M1: 2,
        M2: 2,
      };

      const createFiliereRes = await backendFetch("/filieres", token!, {
        method: "POST",
        body: JSON.stringify({
          nom: d.field,
          code: d.field
            .substring(0, 10)
            .toUpperCase()
            .replace(/\s/g, ""),
          niveau: niveauMap[d.level] || "LICENCE",
          duree: dureeMap[d.level] || 3,
        }),
      });
      if (createFiliereRes.ok) {
        const filiere = await createFiliereRes.json();
        filiereId = filiere.id;
      } else {
        const err = await createFiliereRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: err.message || "Erreur lors de la création de la filière" },
          { status: createFiliereRes.status }
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
