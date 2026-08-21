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

    // Try to get averages from promotions/classement
    const avgMap = new Map<string, { average: number | null; gradeCount: number }>();

    try {
      // Get promotions to find semestres
      const promoRes = await backendFetch("/promotions", token!);
      if (promoRes.ok) {
        const promotions = await promoRes.json();
        for (const promo of promotions) {
          try {
            const semRes = await backendFetch(
              `/semestres?promotionId=${promo.id}`,
              token!
            );
            if (!semRes.ok) continue;
            const semestres = await semRes.json();
            // Use the last semestre for averages
            const lastSem = semestres[semestres.length - 1];
            if (!lastSem) continue;

            const classRes = await backendFetch(
              `/moyennes/classement/promotion/${promo.id}/semestre/${lastSem.id}`,
              token!
            );
            if (!classRes.ok) continue;
            const classement = await classRes.json();
            for (const m of classement.classement || []) {
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
          } catch {
            continue;
          }
        }
      }
    } catch {
      // Fallback: students without averages
    }

    const rows: StudentWithStats[] = students
      .filter((u) => u.role === "ETUDIANT")
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
    const res = await backendFetch("/utilisateurs", token!, {
      method: "POST",
      body: JSON.stringify({
        nom,
        prenom,
        email: d.email.toLowerCase(),
        motDePasse: d.password,
        role: "ETUDIANT",
        numeroEtudiant: d.matricule,
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
    return NextResponse.json(toStudentWithStats(created), { status: 201 });
  } catch (err: any) {
    console.error("Create student error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'étudiant" },
      { status: 500 }
    );
  }
}

