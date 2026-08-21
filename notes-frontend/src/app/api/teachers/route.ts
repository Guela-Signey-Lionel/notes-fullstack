import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { TeacherRow } from "@/lib/types";
import type { BackendUtilisateurResponse } from "@/lib/backend";
import { z } from "zod";

function toTeacherRow(u: BackendUtilisateurResponse, courseCount = 0): TeacherRow {
  return {
    id: u.id,
    matricule: u.numeroEtudiant || u.id,
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

    // Try to get course counts
    let courseCountMap = new Map<string, number>();
    try {
      const semRes = await backendFetch("/semestres?promotionId=" + "placeholder", token!);
      // Get all matieres to count courses per enseignant
      const matieresRes = await backendFetch("/matieres?enseignantId=", token!);
      if (matieresRes.ok) {
        const matieres = await matieresRes.json();
        for (const m of matieres) {
          if (m.enseignantId) {
            courseCountMap.set(
              m.enseignantId,
              (courseCountMap.get(m.enseignantId) || 0) + 1
            );
          }
        }
      }
    } catch {
      // Fallback
    }

    const rows: TeacherRow[] = teachers
      .filter((u) => u.role === "ENSEIGNANT")
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
  matricule: z.string().min(3, "Matricule requis"),
  department: z.string().min(2, "Département requis"),
  specialty: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
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
        specialite: d.department,
        grade: d.specialty,
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

