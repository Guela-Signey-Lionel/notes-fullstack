import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { CourseRow } from "@/lib/types";
import type {
  BackendMatiereResponse,
  BackendUEResponse,
  BackendSemestreResponse,
  BackendPromotionResponse,
} from "@/lib/backend";
import { z } from "zod";

/**
 * The backend has a hierarchical model: Promotion → Semestre → UE → Matiere
 * The frontend expects a flat CourseRow. We fetch everything in parallel
 * to avoid the N+1 sequential call problem.
 */
async function fetchAllCourses(token: string): Promise<CourseRow[]> {
  // 1. Get all promotions in parallel with semestres for each
  const promoRes = await backendFetch("/promotions", token);
  if (!promoRes.ok) return [];
  const promotions: BackendPromotionResponse[] = await promoRes.json();

  // 2. Fetch all semestres for all promotions in parallel
  const semestreResults = await Promise.allSettled(
    promotions.map((promo) =>
      backendFetch(`/semestres?promotionId=${promo.id}`, token).then(
        (res) => res.ok ? res.json() as Promise<BackendSemestreResponse[]> : []
      )
    )
  );

  // Collect all semestres with their promotion context
  const semestreEntries: Array<{
    sem: BackendSemestreResponse;
    promo: BackendPromotionResponse;
  }> = [];
  semestreResults.forEach((result, i) => {
    if (result.status === "fulfilled") {
      for (const sem of result.value) {
        semestreEntries.push({ sem, promo: promotions[i] });
      }
    }
  });

  // 3. Fetch all UEs for all semestres in parallel
  const ueResults = await Promise.allSettled(
    semestreEntries.map(({ sem }) =>
      backendFetch(`/ue?semestreId=${sem.id}`, token).then(
        (res) => res.ok ? res.json() as Promise<BackendUEResponse[]> : []
      )
    )
  );

  // 4. Flatten UE → Matiere into CourseRow
  const courses: CourseRow[] = [];
  ueResults.forEach((result, i) => {
    if (result.status === "fulfilled") {
      const { sem, promo } = semestreEntries[i];
      for (const ue of result.value) {
        const matieres = ue.matieres || [];
        for (const m of matieres) {
          courses.push({
            id: m.id,
            code: m.code,
            name: m.intitule,
            description: null,
            coefficient: Number(m.coefficient),
            credits: ue.creditsEcts,
            semester: `S${sem.numero}`,
            academicYear: sem.anneeAcademique,
            promotionId: promo.id,
            promotionName: promo.nom,
            teacherId: m.enseignantId || null,
            teacherName: m.enseignantNom || null,
            gradeCount: 0,
          });
        }
      }
    }
  });

  return courses;
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN", "TEACHER", "STUDENT");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    let courses = await fetchAllCourses(token!);

    // Teachers only see their own courses
    if (user!.role === "TEACHER" && user!.teacherId) {
      courses = courses.filter((c) => c.teacherId === user!.teacherId);
    }

    return NextResponse.json(courses);
  } catch (err: any) {
    console.error("Courses fetch error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des matières" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  code: z.string().min(2, "Code requis"),
  name: z.string().min(3, "Nom requis"),
  description: z.string().optional().nullable(),
  coefficient: z.coerce.number().min(0.5).max(10),
  credits: z.coerce.number().int().min(1).max(12),
  semester: z.enum(["S1", "S2"]),
  academicYear: z.string().min(5, "Année requise"),
  promotionId: z.string().min(1),
  teacherId: z.string().optional().nullable(),
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
    // Find or create the appropriate semestre
    const semRes = await backendFetch(
      `/semestres?promotionId=${d.promotionId}`,
      token!
    );
    if (!semRes.ok) throw new Error("Cannot fetch semestres");
    const semestres = await semRes.json();
    const semNum = d.semester === "S1" ? 1 : 2;
    let semestre = semestres.find((s: any) => s.numero === semNum);

    if (!semestre) {
      // Create the semestre
      const createSemRes = await backendFetch("/semestres", token!, {
        method: "POST",
        body: JSON.stringify({
          numero: semNum,
          anneeAcademique: d.academicYear,
          promotionId: d.promotionId,
        }),
      });
      if (!createSemRes.ok) throw new Error("Cannot create semestre");
      semestre = await createSemRes.json();
    }

    // Create UE
    const ueRes = await backendFetch("/ue", token!, {
      method: "POST",
      body: JSON.stringify({
        code: d.code.substring(0, 50),
        intitule: d.name,
        creditsEcts: d.credits,
        semestreId: semestre.id,
      }),
    });
    if (!ueRes.ok) {
      const err = await ueRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Erreur création UE" },
        { status: ueRes.status }
      );
    }
    const ue = await ueRes.json();

    // Create Matiere
    const matRes = await backendFetch("/matieres", token!, {
      method: "POST",
      body: JSON.stringify({
        code: d.code,
        intitule: d.name,
        coefficient: d.coefficient,
        ueId: ue.id,
        enseignantId: d.teacherId || null,
      }),
    });

    if (!matRes.ok) {
      const err = await matRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Erreur création matière" },
        { status: matRes.status }
      );
    }

    const matiere: BackendMatiereResponse = await matRes.json();
    const course: CourseRow = {
      id: matiere.id,
      code: matiere.code,
      name: matiere.intitule,
      description: d.description ?? null,
      coefficient: Number(matiere.coefficient),
      credits: d.credits,
      semester: d.semester,
      academicYear: d.academicYear,
      promotionId: d.promotionId,
      promotionName: "",
      teacherId: matiere.enseignantId || null,
      teacherName: matiere.enseignantNom || null,
      gradeCount: 0,
    };

    return NextResponse.json(course, { status: 201 });
  } catch (err: any) {
    console.error("Create course error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la création de la matière" },
      { status: 500 }
    );
  }
}
