import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { GradeRow } from "@/lib/types";
import type { BackendNoteResponse } from "@/lib/backend";

function toGradeRow(n: BackendNoteResponse): GradeRow {
  const mentionFor = (v: number) => {
    if (v >= 16) return "Très Bien";
    if (v >= 14) return "Bien";
    if (v >= 12) return "Assez Bien";
    if (v >= 10) return "Passable";
    return "Insuffisant";
  };
  return {
    id: n.id,
    value: Number(n.valeur),
    comment: n.commentaire || null,
    studentId: n.etudiantId,
    studentName: n.etudiantNom,
    studentMatricule: n.numeroEtudiant,
    courseId: n.matiereId,
    courseCode: "",
    courseName: n.matiereIntitule,
    coefficient: 1,
    semester: "",
    academicYear: "",
    mention: mentionFor(Number(n.valeur)),
    teacherName: null,
  };
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN", "TEACHER");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { items } = body as { items: any[] };
  if (!items || items.length === 0) {
    return NextResponse.json({ saved: 0 });
  }

  // Send each grade individually since backend doesn't have a bulk endpoint matching our format
  const saved: GradeRow[] = [];
  for (const it of items) {
    try {
      const res = await backendFetch("/notes", token!, {
        method: "POST",
        body: JSON.stringify({
          etudiantId: it.studentId,
          matiereId: it.courseId,
          valeur: it.value,
          typeNote: "UNIQUE",
          statut: "PRESENT",
          commentaire: it.comment || null,
        }),
      });
      if (res.ok) {
        const note: BackendNoteResponse = await res.json();
        saved.push(toGradeRow(note));
      }
    } catch {
      // Skip failed items
    }
  }

  return NextResponse.json({ saved: saved.length, grades: saved });
}
