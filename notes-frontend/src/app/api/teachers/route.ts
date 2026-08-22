import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { TeacherRow } from "@/lib/types";
import type { BackendUtilisateurResponse } from "@/lib/backend";
import { z } from "zod";

function toTeacherRow(u: BackendUtilisateurResponse, courseCount = 0): TeacherRow {
  return {
    id: u.id,
    matricule: u.numeroEnseignant || "",
    name: `${u.prenom} ${u.nom}`.trim(),
    email: u.email,
    department: u.specialite || "—",
    specialty: u.grade || null,
    phone: (u as any).telephone ?? null,
    courseCount,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const res = await backendFetch("/utilisateurs/enseignants", token!);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Erreur backend" },
        { status: res.status }
      );
    }

    const teachers: BackendUtilisateurResponse[] = await res.json();

    // Get course counts by fetching all matieres grouped by enseignant
    let courseCountMap = new Map<string, number>();
    try {
      // Fetch all promotions to get semestres, then UEs, then matieres
      // Use parallel fetch for performance
      const promoRes = await backendFetch("/promotions", token!);
      if (promoRes.ok) {
        const promotions = await promoRes.json();

        const semestreResults = await Promise.allSettled(
          promotions.map((promo: any) =>
            backendFetch(`/semestres?promotionId=${promo.id}`, token!).then(
              (res) => (res.ok ? res.json() : [])
            )
          )
        );

        const allSemestreIds: string[] = [];
        semestreResults.forEach((result) => {
          if (result.status === "fulfilled" && Array.isArray(result.value)) {
            for (const sem of result.value) {
              allSemestreIds.push(sem.id);
            }
          }
        });

        const ueResults = await Promise.allSettled(
          allSemestreIds.map((semId) =>
            backendFetch(`/ue?semestreId=${semId}`, token!).then(
              (res) => (res.ok ? res.json() : [])
            )
          )
        );

        // Extract all matieres from UEs
        for (const result of ueResults) {
          if (result.status === "fulfilled" && Array.isArray(result.value)) {
            for (const ue of result.value) {
              for (const m of ue.matieres || []) {
                if (m.enseignantId) {
                  courseCountMap.set(
                    m.enseignantId,
                    (courseCountMap.get(m.enseignantId) || 0) + 1
                  );
                }
              }
            }
          }
        }
      }
    } catch {
      // Fallback: teachers without course counts
    }

    const rows: TeacherRow[] = teachers
      .filter((u) => u.role === "ENSEIGNANT" && u.actif)
      .map((u) => toTeacherRow(u, courseCountMap.get(u.id) || 0));

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("Teachers fetch error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des enseignants" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(3, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe ≥ 6 caractères"),
  matricule: z.string().optional().nullable(),
  department: z.string().min(2, "Département requis"),
  specialty: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  matiereIds: z.array(z.string()).optional().nullable(),
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
        role: "ENSEIGNANT",
        numeroEnseignant: d.matricule || null,
        specialite: d.department,
        grade: d.specialty,
        matiereIds: d.matiereIds || [],
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
    return NextResponse.json(toTeacherRow(created), { status: 201 });
  } catch (err: any) {
    console.error("Create teacher error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'enseignant" },
      { status: 500 }
    );
  }
}
