import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { StudentWithStats } from "@/lib/types";
import type { BackendUtilisateurResponse } from "@/lib/backend";
import { z } from "zod";

function toStudentWithStats(
  u: BackendUtilisateurResponse,
  avg?: { average: number | null; gradeCount: number } | null
): StudentWithStats {
  const average = avg?.average ?? null;
  const gradeCount = avg?.gradeCount ?? 0;
  let status: "PASS" | "FAIL" | "INCOMPLETE" = "INCOMPLETE";
  if (average !== null) {
    status = average >= 10 ? "PASS" : "FAIL";
  }
  return {
    id: u.id,
    matricule: u.numeroEtudiant || u.id,
    name: `${u.prenom} ${u.nom}`.trim(),
    email: u.email,
    promotionId: "",
    promotionName: u.promotionNom || "—",
    promotionLevel: "",
    promotionField: u.filiereNom || "",
    gradeCount,
    average,
    status,
    birthDate: null,
    phone: (u as any).telephone ?? null,
    address: (u as any).adresse ?? null,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN", "TEACHER");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    // Fetch all students from the backend
    const res = await backendFetch("/utilisateurs/etudiants?size=500", token!);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Erreur backend" },
        { status: res.status }
      );
    }

    const pageData = await res.json();
    const students: BackendUtilisateurResponse[] = pageData.content || pageData;

    // Get averages in parallel across all promotions
    const avgMap = new Map<string, { average: number | null; gradeCount: number }>();

    try {
      const promoRes = await backendFetch("/promotions", token!);
      if (promoRes.ok) {
        const promotions = await promoRes.json();

        // Fetch all semestres in parallel
        const semestreResults = await Promise.allSettled(
          promotions.map((promo: any) =>
            backendFetch(`/semestres?promotionId=${promo.id}`, token!).then(
              (res) => res.ok ? res.json() : []
            )
          )
        );

        // Build list of {promoId, lastSemestre} pairs
        const semestrePairs: Array<{ promoId: string; semId: string }> = [];
        semestreResults.forEach((result, i) => {
          if (result.status === "fulfilled" && Array.isArray(result.value) && result.value.length > 0) {
            const semestres = result.value;
            const lastSem = semestres[semestres.length - 1];
            semestrePairs.push({ promoId: promotions[i].id, semId: lastSem.id });
          }
        });

        // Fetch all classements in parallel
        const classementResults = await Promise.allSettled(
          semestrePairs.map(({ promoId, semId }) =>
            backendFetch(
              `/moyennes/classement/promotion/${promoId}/semestre/${semId}`,
              token!
            ).then((res) => (res.ok ? res.json() : null))
          )
        );

        for (const result of classementResults) {
          if (result.status === "fulfilled" && result.value) {
            for (const m of result.value.classement || []) {
              avgMap.set(m.etudiantId, {
                average: m.moyenne != null ? Number(m.moyenne) : null,
                gradeCount: m.moyennesUE
                  ? m.moyennesUE.reduce(
                      (sum: number, ue: any) =>
                        sum + (ue.notes?.length || 0),
                      0
                    )
                  : 0,
              });
            }
          }
        }
      }
    } catch {
      // Fallback: students without averages
    }

    const rows: StudentWithStats[] = students
      .filter((u) => u.role === "ETUDIANT" && u.actif)
      .map((u) => toStudentWithStats(u, avgMap.get(u.id) ?? null));

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("Students fetch error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des étudiants" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(3, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe ≥ 6 caractères"),
  matricule: z.string().min(3, "Matricule requis"),
  promotionId: z.string().min(1, "Promotion requise"),
  birthDate: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
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

  // Split name into nom/prenom
  const parts = d.name.trim().split(/\s+/);
  const prenom = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];
  const nom = parts.length > 1 ? parts.slice(-1).join(" ") : parts[0];

  try {
    // 1. Create the user with promotionId
    const res = await backendFetch("/utilisateurs", token!, {
      method: "POST",
      body: JSON.stringify({
        nom,
        prenom,
        email: d.email.toLowerCase(),
        motDePasse: d.password,
        role: "ETUDIANT",
        numeroEtudiant: d.matricule,
        promotionId: d.promotionId || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || "Erreur" },
        { status: res.status }
      );
    }

    const created: BackendUtilisateurResponse = await res.json();

    // 2. Enroll the student in the promotion
    if (d.promotionId) {
      try {
        await backendFetch(
          `/promotions/${d.promotionId}/etudiants/${created.id}`,
          token!,
          { method: "POST" }
        );
      } catch {
        // Best effort — student created but not enrolled
      }
    }

    return NextResponse.json(toStudentWithStats(created), { status: 201 });
  } catch (err: any) {
    console.error("Create student error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'étudiant" },
      { status: 500 }
    );
  }
}
