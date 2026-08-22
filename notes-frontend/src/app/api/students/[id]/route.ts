import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole, buildSafeUser } from "@/lib/auth";
import type { StudentTranscript } from "@/lib/types";
import type { BackendUtilisateurResponse } from "@/lib/backend";

// GET /api/students/[id] — full transcript DTO
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN", "TEACHER", "STUDENT");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  // Students can only view their own transcript
  if (user!.role === "STUDENT" && user!.studentId !== id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    // Get student info
    const studentRes = await backendFetch(`/utilisateurs/${id}`, token!);
    if (!studentRes.ok) {
      return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });
    }
    const studentData: BackendUtilisateurResponse = await studentRes.json();

    // Try to get moyenne historique
    let semesters: StudentTranscript["semesters"] = [];
    let overallAverage: number | null = null;
    let totalCredits = 0;
    let validatedCredits = 0;

    try {
      const histRes = await backendFetch(
        `/moyennes/etudiant/${id}/historique`,
        token!
      );
      if (histRes.ok) {
        const historique = await histRes.json();
        for (const moy of historique) {
          const courses = (moy.moyennesUE || [])
            .flatMap((ue: any) =>
              (ue.notes || []).map((n: any) => ({
                id: n.matiereId,
                code: n.matiereCode,
                name: n.matiereIntitule,
                coefficient: Number(n.coefficient),
                credits: 0,
                value: Number(n.notefinale),
                comment: null,
                mention:
                  Number(n.notefinale) >= 16
                    ? "Très Bien"
                    : Number(n.notefinale) >= 14
                    ? "Bien"
                    : Number(n.notefinale) >= 12
                    ? "Assez Bien"
                    : Number(n.notefinale) >= 10
                    ? "Passable"
                    : "Insuffisant",
                teacherName: null,
              }))
            );
          semesters.push({
            semester: `S${moy.semestreNumero}`,
            courses,
            average: moy.moyenne != null ? Number(moy.moyenne) : null,
            totalCredits: courses.length * 3,
            validatedCredits: moy.valide ? courses.length * 3 : 0,
          });
          totalCredits += courses.length * 3;
          if (moy.valide) validatedCredits += courses.length * 3;
        }
        if (historique.length > 0) {
          const last = historique[historique.length - 1];
          overallAverage = last.moyenne != null ? Number(last.moyenne) : null;
        }
      }
    } catch {
      // No historique available
    }

    const mention =
      overallAverage === null
        ? "N/A"
        : overallAverage >= 16
        ? "Très Bien"
        : overallAverage >= 14
        ? "Bien"
        : overallAverage >= 12
        ? "Assez Bien"
        : overallAverage >= 10
        ? "Passable"
        : "Insuffisant";

    const transcript: StudentTranscript = {
      student: {
        id: studentData.id,
        matricule: studentData.numeroEtudiant || studentData.id,
        name: `${studentData.prenom} ${studentData.nom}`.trim(),
        email: studentData.email,
        birthDate: null,
        phone: (studentData as any).telephone ?? null,
        address: (studentData as any).adresse ?? null,
      },
      promotion: {
        id: "",
        name: studentData.promotionNom || "—",
        level: "",
        field: studentData.filiereNom || "",
        academicYear: studentData.promotionAnnee || "",
      },
      semesters,
      overallAverage,
      totalCredits,
      validatedCredits,
      mention,
    };

    return NextResponse.json(transcript);
  } catch (err: any) {
    console.error("Student detail error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}

// PATCH /api/students/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parts = (body.name || "").trim().split(/\s+/);
  const prenom = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];
  const nom = parts.length > 1 ? parts.slice(-1).join(" ") : parts[0];

  const updateBody: Record<string, any> = {};
  if (nom) updateBody.nom = nom;
  if (prenom) updateBody.prenom = prenom;
  if (body.email) updateBody.email = body.email;
  if (body.password && body.password !== "") updateBody.motDePasse = body.password;
  if (body.matricule) updateBody.numeroEtudiant = body.matricule;
  if (body.phone) updateBody.telephone = body.phone;
  if (body.address) updateBody.adresse = body.address;

  try {
    const res = await backendFetch(`/utilisateurs/${id}`, token!, {
      method: "PUT",
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || "Erreur" },
        { status: res.status }
      );
    }

    const updated = await res.json();
    return NextResponse.json(buildSafeUser(updated));
  } catch (err: any) {
    console.error("Update student error:", err?.message || err);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE /api/students/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const res = await backendFetch(`/utilisateurs/${id}/toggle-actif`, token!, {
      method: "PATCH",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Erreur suppression" }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

