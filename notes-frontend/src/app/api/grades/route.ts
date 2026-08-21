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

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN", "TEACHER");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const courseId = url.searchParams.get("courseId");
  const semester = url.searchParams.get("semester");
  const academicYear = url.searchParams.get("academicYear");

  try {
    let notes: BackendNoteResponse[] = [];

    if (courseId) {
      // Get notes for a specific matiere
      const res = await backendFetch(`/notes/matiere/${courseId}`, token!);
      if (res.ok) {
        notes = await res.json();
      }
    } else if (studentId) {
      // Get notes for a specific student - need semestreId
      // Get all notes by fetching from promotions
      const promosRes = await backendFetch("/promotions", token!);
      if (promosRes.ok) {
        const promos = await promosRes.json();
        for (const promo of promos) {
          const semRes = await backendFetch(`/semestres?promotionId=${promo.id}`, token!);
          if (!semRes.ok) continue;
          const semestres = await semRes.json();
          for (const sem of semestres) {
            const noteRes = await backendFetch(
              `/notes/etudiant/${studentId}/semestre/${sem.id}`,
              token!
            );
            if (noteRes.ok) {
              const semNotes = await noteRes.json();
              notes.push(...semNotes);
            }
          }
        }
      }
    }

    // Filter by studentId if specified (for the courseId case)
    if (studentId && courseId) {
      notes = notes.filter((n) => n.etudiantId === studentId);
    }

    return NextResponse.json(notes.map(toGradeRow));
  } catch (err: any) {
    console.error("Grades fetch error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN", "TEACHER");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { studentId, courseId, value, comment } = body;

  try {
    const res = await backendFetch("/notes", token!, {
      method: "POST",
      body: JSON.stringify({
        etudiantId: studentId,
        matiereId: courseId,
        valeur: value,
        typeNote: "UNIQUE",
        statut: "PRESENT",
        commentaire: comment || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || "Erreur" },
        { status: res.status }
      );
    }

    const note: BackendNoteResponse = await res.json();
    return NextResponse.json(toGradeRow(note), { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

