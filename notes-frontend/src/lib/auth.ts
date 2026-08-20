import { cookies } from "next/headers";
import type { SafeUser } from "@/lib/types";

export const TOKEN_COOKIE = "gn_token";
export const USER_COOKIE = "gn_user";
export const REFRESH_COOKIE = "gn_refresh";

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

export async function getJwtToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

export async function getUserFromCookie(): Promise<SafeUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SafeUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  return getUserFromCookie();
}

/**
 * Build a SafeUser from the backend UtilisateurResponse DTO.
 */
export function buildSafeUser(u: {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif?: boolean;
  specialite?: string;
  grade?: string;
  numeroEtudiant?: string;
  photoUrl?: string;
  filiereNom?: string;
  promotionNom?: string;
  promotionAnnee?: string;
  telephone?: string;
  adresse?: string;
}): SafeUser {
  const roleMap: Record<string, SafeUser["role"]> = {
    ADMIN: "ADMIN",
    ENSEIGNANT: "TEACHER",
    ETUDIANT: "STUDENT",
  };

  return {
    id: u.id,
    email: u.email,
    name: `${u.prenom} ${u.nom}`.trim(),
    role: roleMap[u.role] ?? "STUDENT",
    avatar: null,
    profileImage: u.photoUrl ?? null,
    phone: u.telephone ?? null,
    bio: null,
    createdAt: undefined,
    studentId: u.role === "ETUDIANT" ? u.id : null,
    teacherId: u.role === "ENSEIGNANT" ? u.id : null,
    matricule: u.numeroEtudiant ?? null,
    promotionName: u.promotionNom ?? null,
    promotionId: null,
    department: u.specialite ?? null,
  };
}

// ---------------------------------------------------------------------------
// Role guard
// ---------------------------------------------------------------------------

export function requireRole(
  user: SafeUser | null,
  ...roles: SafeUser["role"][]
) {
  if (!user) {
    return { ok: false as const, error: "Non authentifié", status: 401 };
  }
  if (!roles.includes(user.role)) {
    return {
      ok: false as const,
      error: "Accès refusé : rôle insuffisant",
      status: 403,
    };
  }
  return { ok: true as const, user };
}
