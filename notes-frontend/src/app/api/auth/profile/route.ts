import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getJwtToken, getUserFromCookie, buildSafeUser, USER_COOKIE } from "@/lib/auth";
import { z } from "zod";

const MAX_PROFILE_IMAGE_BYTES = 500 * 1024;

const profileSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100).optional(),
  phone: z.string().max(30).nullable().optional(),
  bio: z.string().max(500, "Bio trop longue (500 max)").nullable().optional(),
  profileImage: z
    .string()
    .max(MAX_PROFILE_IMAGE_BYTES * 2, "Image trop lourde")
    .nullable()
    .optional(),
});

export async function PATCH(req: Request) {
  const token = await getJwtToken();
  const currentUser = await getUserFromCookie();
  if (!token || !currentUser) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  // Build the backend UpdateUtilisateurRequest
  // Split "prenom nom" back into nom/prenom
  const nameParts = (parsed.data.name || currentUser.name).split(/\s+/);
  const prenom = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
  const nom = nameParts.slice(-1).join(" ") || nameParts[nameParts.length - 1] || "";

  // Handle profile image via photo upload endpoint
  if (parsed.data.profileImage !== undefined) {
    try {
      await backendFetch("/utilisateurs/photo", token, {
        method: "POST",
        body: JSON.stringify({ photo: parsed.data.profileImage }),
      });
    } catch {
      // Best effort
    }
  }

  // Update profile info
  const updateBody: Record<string, any> = {};
  if (parsed.data.name !== undefined) {
    updateBody.nom = nom;
    updateBody.prenom = prenom;
  }
  if (parsed.data.phone !== undefined) {
    updateBody.telephone = parsed.data.phone;
  }

  try {
    const res = await backendFetch("/utilisateurs/profil", token, {
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

    const data = await res.json();
    const safeUser = buildSafeUser({
      ...data,
      photoUrl: parsed.data.profileImage ?? data.photoUrl ?? currentUser.profileImage,
      telephone: parsed.data.phone ?? data.telephone ?? currentUser.phone,
    });

    // Update user cookie
    const res2 = NextResponse.json({ user: safeUser });
    res2.cookies.set(USER_COOKIE, JSON.stringify(safeUser), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res2;
  } catch (err: any) {
    console.error("Profile update error:", err?.message || err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
