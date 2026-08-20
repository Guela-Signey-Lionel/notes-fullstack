import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { StudentTranscript } from "@/lib/types";

// GET /api/grades/student/[id] — full transcript DTO for one student
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
  if (user!.role === "STUDENT" && user!.studentId !== id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    // Get student info
    const studentRes = await backendFetch(`/utilisateurs/${id}`, token!);
    if (!studentRes.ok) {
      return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });
    }
    const studentData = await studentRes.json();

    // Get historique des moyennes
    let semesters: StudentTranscript["semesters"] = [];
    let overallAverage: number | null = null;
    let totalCredits = 0;
    let validatedCredits = 0;

    try {
      const histRes = await backendFetch(`/moyennes/etudiant/${id}/historique`, token!);
      if (histRes.ok) {
        const historique = await histRes.json();
        for (const moy of historique) {
          const courses = (moy.moyennesUE || []).flatMap((ue: any) =>
            (ue.notes || []).map((n: any) => ({
              id: n.matiereId,
              code: n.matiereCode,
              name: n.matiereIntitule,
              coefficient: Number(n.coefficient),
              credits: ue.creditsEcts || 3,
              value: Number(n.notefinale),
              comment: null,
              mention:
                Number(n.notefinale) >= 16 ? "Très Bien" :
                Number(n.notefinale) >= 14 ? "Bien" :
                Number(n.notefinale) >= 12 ? "Assez Bien" :
                Number(n.notefinale) >= 10 ? "Passable" : "Insuffisant",
              teacherName: null,
            }))
          );
          semesters.push({
            semester: `S${moy.semestreNumero}`,
            courses,
            average: moy.moyenne != null ? Number(moy.moyenne) : null,
            totalCredits: courses.reduce((s: number, c: any) => s + c.credits, 0),
            validatedCredits: moy.valide ? courses.reduce((s: number, c: any) => s + c.credits, 0) : 0,
          });
          totalCredits += courses.reduce((s: number, c: any) => s + c.credits, 0);
          if (moy.valide) validatedCredits += courses.reduce((s: number, c: any) => s + c.credits, 0);
        }
        if (historique.length > 0) {
          const last = historique[historique.length - 1];
          overallAverage = last.moyenne != null ? Number(last.moyenne) : null;
        }
      }
    } catch {
      // No historique
    }

    const mention =
      overallAverage === null ? "N/A" :
      overallAverage >= 16 ? "Très Bien" :
      overallAverage >= 14 ? "Bien" :
      overallAverage >= 12 ? "Assez Bien" :
      overallAverage >= 10 ? "Passable" : "Insuffisant";

    const transcript: StudentTranscript = {
      student: {
        id: studentData.id,
        matricule: studentData.numeroEtudiant || studentData.id,
        name: `${studentData.prenom} ${studentData.nom}`.trim(),
        email: studentData.email,
        birthDate: null,
        phone: studentData.telephone ?? null,
        address: studentData.adresse ?? null,
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
    console.error("Student transcript error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du relevé" },
      { status: 500 }
    );
  }
}
