import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";
import type { TeacherRow } from "@/lib/types";

function toTeacherRow(u: any): TeacherRow {
  return {
    id: u.id,
    matricule: u.numeroEnseignant || "",
    name: `${u.prenom} ${u.nom}`.trim(),
    email: u.email,
    department: u.specialite || "—",
    specialty: u.grade || null,
    phone: (u as any).telephone ?? null,
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

  const parts = (body.name || "").trim().split(/\s+/);
  const prenom = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];
  const nom = parts.length > 1 ? parts.slice(-1).join(" ") : parts[0];

  const updateBody: Record<string, any> = {};
  if (nom) updateBody.nom = nom;
  if (prenom) updateBody.prenom = prenom;
  if (body.email) updateBody.email = body.email;
  if (body.password && body.password !== "") updateBody.motDePasse = body.password;
  if (body.department) updateBody.specialite = body.department;
  if (body.specialty !== undefined) updateBody.grade = body.specialty;
  if (body.phone !== undefined) updateBody.telephone = body.phone;
  if (body.matricule !== undefined) updateBody.numeroEnseignant = body.matricule || null;
  if (body.matiereIds !== undefined) updateBody.matiereIds = body.matiereIds;

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
    return NextResponse.json(toTeacherRow(updated));
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
    const res = await backendFetch(`/utilisateurs/${id}/toggle-actif`, token!, {
      method: "PATCH",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Erreur suppression" }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

