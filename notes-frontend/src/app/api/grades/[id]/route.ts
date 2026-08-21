import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getCurrentUser, requireRole } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const token = await getJwtToken();
  const guard = requireRole(user, "ADMIN", "TEACHER");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    // Backend doesn't have a direct delete note endpoint
    // We can correct the note to null or use verrouiller
    // For now, try to correct the note
    const res = await backendFetch(`/notes/${id}/corriger`, token!, {
      method: "PUT",
      body: JSON.stringify({
        nouvelleValeur: 0,
        motifCorrection: "Suppression",
      }),
    });

    if (!res.ok && res.status !== 204) {
      return NextResponse.json({ error: "Erreur suppression" }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  try {
    if (body.value !== undefined) {
      const res = await backendFetch(`/notes/${id}/corriger`, token!, {
        method: "PUT",
        body: JSON.stringify({
          nouvelleValeur: body.value,
          motifCorrection: body.comment || "Modification",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json({ error: err.message || "Erreur" }, { status: res.status });
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

