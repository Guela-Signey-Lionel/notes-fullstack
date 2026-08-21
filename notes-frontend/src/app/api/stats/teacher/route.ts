import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { TeacherStats } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  if (!user || !token) {
    return NextResponse.json({
      courseCount: 0, studentCount: 0, overallAverage: 0, passingRate: 0,
      gradeCount: 0, courseAverages: [],
      mentionDistribution: { excellent: 0, good: 0, fairlyGood: 0, passable: 0, insufficient: 0 },
    } as TeacherStats);
  }
  const guard = requireRole(user, "TEACHER", "ADMIN");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  // For admin (no teacherId), return empty placeholder
  if (guard.user.role === "ADMIN" || !guard.user.teacherId) {
    return NextResponse.json({
      courseCount: 0,
      studentCount: 0,
      overallAverage: 0,
      passingRate: 0,
      gradeCount: 0,
      courseAverages: [],
      mentionDistribution: {
        excellent: 0,
        good: 0,
        fairlyGood: 0,
        passable: 0,
        insufficient: 0,
      },
    } as TeacherStats);
  }

  try {
    // Get the teacher's matieres
    const matieresRes = await backendFetch(
      `/matieres?enseignantId=${guard.user.teacherId}`,
      token!
    );

    if (!matieresRes.ok) {
      return NextResponse.json({
        courseCount: 0,
        studentCount: 0,
        overallAverage: 0,
        passingRate: 0,
        gradeCount: 0,
        courseAverages: [],
        mentionDistribution: {
          excellent: 0,
          good: 0,
          fairlyGood: 0,
          passable: 0,
          insufficient: 0,
        },
      } as TeacherStats);
    }

    const matieres = await matieresRes.json();
    const courseAverages: TeacherStats["courseAverages"] = [];
    let totalGrades = 0;
    let totalPassing = 0;
    let totalSum = 0;
    const mentionDist = {
      excellent: 0,
      good: 0,
      fairlyGood: 0,
      passable: 0,
      insufficient: 0,
    };

    for (const m of matieres) {
      try {
        const statsRes = await backendFetch(
          `/moyennes/stats/matiere/${m.id}`,
          token!
        );
        if (statsRes.ok) {
          const s = await statsRes.json();
          const avg = s.moyenne || 0;
          const passRate = s.tauxReussite || 0;
          const dist = s.distributionMentions || {};

          courseAverages.push({
            id: m.id,
            code: m.code,
            name: m.intitule,
            semester: "",
            coefficient: Number(m.coefficient),
            promotionName: "",
            average: avg,
            studentCount: s.totalEtudiants || 0,
            passingRate: passRate,
          });

          const studentCount = s.totalEtudiants || 0;
          totalGrades += studentCount;
          totalPassing += Math.round((passRate / 100) * studentCount);
          totalSum += avg * studentCount;

          mentionDist.excellent += dist["TRES_BIEN"] || dist["Tres Bien"] || 0;
          mentionDist.good += dist["BIEN"] || dist["Bien"] || 0;
          mentionDist.fairlyGood += dist["ASSEZ_BIEN"] || dist["Assez Bien"] || 0;
          mentionDist.passable += dist["PASSABLE"] || dist["Passable"] || 0;
          mentionDist.insufficient += dist["AJOURNE"] || dist["Insuffisant"] || 0;
        }
      } catch {
        // Skip failed matieres
      }
    }

    const result: TeacherStats = {
      courseCount: matieres.length,
      studentCount: totalGrades,
      overallAverage: totalGrades > 0 ? Math.round((totalSum / totalGrades) * 100) / 100 : 0,
      passingRate: totalGrades > 0 ? Math.round((totalPassing / totalGrades) * 1000) / 10 : 0,
      gradeCount: totalGrades,
      courseAverages,
      mentionDistribution: mentionDist,
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Teacher stats error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}

