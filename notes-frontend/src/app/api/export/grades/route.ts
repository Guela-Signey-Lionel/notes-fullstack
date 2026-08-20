import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";

// GET /api/export/grades
export async function GET(req: Request) {
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    // Try to use backend's Excel export
    const promosRes = await backendFetch("/promotions", token!);
    if (promosRes.ok) {
      const promos = await promosRes.json();
      for (const promo of promos) {
        const semRes = await backendFetch(
          `/semestres?promotionId=${promo.id}`,
          token!
        );
        if (!semRes.ok) continue;
        const semestres = await semRes.json();
        if (semestres.length === 0) continue;

        const lastSem = semestres[semestres.length - 1];
        const excelRes = await backendFetch(
          `/export/notes/matiere/${lastSem.id}/excel`,
          token!
        );
        if (excelRes.ok) {
          const buffer = await excelRes.arrayBuffer();
          const stamp = new Date().toISOString().slice(0, 10);
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type":
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "Content-Disposition": `attachment; filename="export-notes-${stamp}.xlsx"`,
            },
          });
        }
      }
    }

    // Fallback: return empty Excel
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Notes");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(buf as any, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="export-notes-${stamp}.xlsx"`,
      },
    });
  } catch (err: any) {
    console.error("Export error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}
