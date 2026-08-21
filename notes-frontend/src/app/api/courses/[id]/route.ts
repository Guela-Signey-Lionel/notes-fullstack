import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";

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

  try {
    // Update the matiere
    const updateBody: Record<string, any> = {};
    if (body.code) updateBody.code = body.code;
    if (body.name) updateBody.intitule = body.name;
    if (body.coefficient !== undefined) updateBody.coefficient = body.coefficient;
    if (body.teacherId !== undefined) updateBody.enseignantId = body.teacherId || null;

    const res = await backendFetch(`/matieres/${id}`, token!, {
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

    return NextResponse.json({ ok: true });
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
    const res = await backendFetch(`/matieres/${id}`, token!, {
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


