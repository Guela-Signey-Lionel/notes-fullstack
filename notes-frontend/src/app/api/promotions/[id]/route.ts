import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { PromotionRow } from "@/lib/types";

function toPromotionRow(p: any): PromotionRow {
  return {
    id: p.id,
    name: p.nom,
    level: p.filiere?.niveau || "",
    field: p.filiere?.nom || "",
    academicYear: p.anneeAcademique,
    studentCount: p.nbEtudiants || 0,
    courseCount: 0,
  };
}

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

  const updateBody: Record<string, any> = {};
  if (body.name) updateBody.nom = body.name;
  if (body.academicYear) updateBody.anneeAcademique = body.academicYear;

  try {
    const res = await backendFetch(`/promotions/${id}`, token!, {
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
    return NextResponse.json(toPromotionRow(updated));
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

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
    const res = await backendFetch(`/promotions/${id}`, token!, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) {
      return NextResponse.json({ error: "Erreur suppression" }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

