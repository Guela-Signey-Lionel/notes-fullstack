import { cookies } from "next/headers";
import type { SafeUser } from "@/lib/types";

export const TOKEN_COOKIE = "gn_token";
export const USER_COOKIE = "gn_user";
export const REFRESH_COOKIE = "gn_refresh";

// ---------------------------------------------------------------------------
// Role mapping (backend → frontend)
// ---------------------------------------------------------------------------
const ROLE_MAP: Record<string, SafeUser["role"]> = {
  ADMIN: "ADMIN",
  ENSEIGNANT: "TEACHER",
  ETUDIANT: "STUDENT",
};

// ---------------------------------------------------------------------------
// Decode a JWT payload WITHOUT verifying the signature
// Used as fallback when the gn_user cookie is missing or corrupted.
// ---------------------------------------------------------------------------
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // base64url decode
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

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

/**
 * Read the user from cookies. Primary: gn_user cookie (JSON).
 * Fallback: decode the JWT access token to reconstruct a minimal user object.
 */
export async function getUserFromCookie(): Promise<SafeUser | null> {
  const store = await cookies();

  // ── Primary: gn_user cookie ──────────────────────────────────────────
  const raw = store.get(USER_COOKIE)?.value;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SafeUser;
      // Basic sanity check – role must be valid
      if (parsed && parsed.role && parsed.email) {
        return parsed;
      }
    } catch {
      // JSON parse failed – fall through to JWT fallback
    }
  }

  // ── Fallback: decode JWT from gn_token ───────────────────────────────
  const jwt = store.get(TOKEN_COOKIE)?.value;
  if (jwt) {
    const claims = decodeJwtPayload(jwt);
    if (claims) {
      const email = (claims["sub"] as string) || "";
      const role = (claims["role"] as string) || "";
      const name = (claims["nom"] as string) || email;
      if (email && role) {
        return {
          id: email,
          email,
          name,
          role: ROLE_MAP[role] ?? "STUDENT",
          avatar: null,
          profileImage: null,
          phone: null,
          bio: null,
          // These are optional – leave undefined so they're omitted from JSON
        };
      }
    }
  }

  return null;
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
  numeroEnseignant?: string;
  photoUrl?: string;
  filiereNom?: string;
  promotionNom?: string;
  promotionAnnee?: string;
  telephone?: string;
  adresse?: string;
}): SafeUser {
  return {
    id: u.id,
    email: u.email,
    name: `${u.prenom} ${u.nom}`.trim(),
    role: ROLE_MAP[u.role] ?? "STUDENT",
    avatar: null,
    profileImage: u.photoUrl ?? null,
    phone: u.telephone ?? null,
    bio: null,
    createdAt: undefined,
    studentId: u.role === "ETUDIANT" ? u.id : null,
    teacherId: u.role === "ENSEIGNANT" ? u.id : null,
    matricule: u.role === "ENSEIGNANT"
      ? (u.numeroEnseignant ?? null)
      : (u.numeroEtudiant ?? null),
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
