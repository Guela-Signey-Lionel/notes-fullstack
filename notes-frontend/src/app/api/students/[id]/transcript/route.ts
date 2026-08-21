import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";

// GET /api/students/[id]/transcript?semester=S1|all
export async function GET(
  req: Request,
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

  const url = new URL(req.url);
  const semester = url.searchParams.get("semester") || "all";

  try {
    // Find a semestre to use for the export
    const promosRes = await backendFetch("/promotions", token!);
    if (!promosRes.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer les promotions" },
        { status: 500 }
      );
    }

    const promos = await promosRes.json();
    for (const promo of promos) {
      const semRes = await backendFetch(
        `/semestres?promotionId=${promo.id}`,
        token!
      );
      if (!semRes.ok) continue;
      const semestres = await semRes.json();
      if (!semestres || semestres.length === 0) continue;

      const targetSem =
        semester === "all"
          ? semestres[0]
          : semestres.find(
              (s: any) =>
                s.numero === (semester === "S1" ? 1 : 2)
            ) || semestres[0];

      if (targetSem) {
        const pdfRes = await backendFetch(
          `/export/releve/${id}/semestre/${targetSem.id}`,
          token!
        );
        if (pdfRes.ok) {
          const pdfBuffer = await pdfRes.arrayBuffer();
          return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="releve-${id}-${semester}.pdf"`,
            },
          });
        }
      }
    }

    return NextResponse.json(
      { error: "Aucun semestre trouvé pour la génération du PDF" },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("Transcript error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}

