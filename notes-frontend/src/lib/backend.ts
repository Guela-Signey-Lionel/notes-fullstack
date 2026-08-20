const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8081";
const API_PREFIX = "/api/v1";

/**
 * Make an authenticated request to the Spring Boot backend.
 */
export async function backendFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BACKEND_URL}${API_PREFIX}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };
  // Only set Content-Type if not already set (e.g. for FormData)
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...options, headers });
}

/**
 * Make an unauthenticated request to the Spring Boot backend.
 */
export async function backendPublicFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BACKEND_URL}${API_PREFIX}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  return fetch(url, { ...options, headers });
}

// ---------------------------------------------------------------------------
// Role mapping: Backend ↔ Frontend
// ---------------------------------------------------------------------------
export type BackendRole = "ADMIN" | "ENSEIGNANT" | "ETUDIANT";
export type FrontendRole = "ADMIN" | "TEACHER" | "STUDENT";

export function toFrontendRole(role: BackendRole): FrontendRole {
  switch (role) {
    case "ADMIN":
      return "ADMIN";
    case "ENSEIGNANT":
      return "TEACHER";
    case "ETUDIANT":
      return "STUDENT";
    default:
      return "STUDENT";
  }
}

export function toBackendRole(role: FrontendRole): BackendRole {
  switch (role) {
    case "ADMIN":
      return "ADMIN";
    case "TEACHER":
      return "ENSEIGNANT";
    case "STUDENT":
      return "ETUDIANT";
    default:
      return "ETUDIANT";
  }
}

// ---------------------------------------------------------------------------
// Backend DTO types
// ---------------------------------------------------------------------------
export interface BackendUtilisateurResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: BackendRole;
  actif: boolean;
  specialite?: string;
  grade?: string;
  numeroEtudiant?: string;
  photoUrl?: string;
  filiereNom?: string;
  promotionNom?: string;
  promotionAnnee?: string;
  telephone?: string;
  adresse?: string;
}

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  utilisateur: BackendUtilisateurResponse;
}

export interface BackendMatiereResponse {
  id: string;
  code: string;
  intitule: string;
  coefficient: number;
  volumeHoraire?: number;
  ueId: string;
  ueIntitule?: string;
  enseignantId?: string;
  enseignantNom?: string;
}

export interface BackendNoteResponse {
  id: string;
  etudiantId: string;
  etudiantNom: string;
  numeroEtudiant: string;
  matiereId: string;
  matiereIntitule: string;
  valeur: number;
  typeNote: string;
  statut: string;
  commentaire?: string;
  verrouille: boolean;
  dateSaisie?: string;
  dateModification?: string;
}

export interface BackendPromotionResponse {
  id: string;
  nom: string;
  anneeAcademique: string;
  filiere: {
    id: string;
    nom: string;
    code: string;
    niveau: string;
    duree: number;
    actif: boolean;
  };
  actif: boolean;
  nbEtudiants: number;
}

export interface BackendSemestreResponse {
  id: string;
  numero: number;
  anneeAcademique: string;
  dateDebut?: string;
  dateFin?: string;
  statut: string;
  promotionId: string;
  promotionNom: string;
}

export interface BackendUEResponse {
  id: string;
  code: string;
  intitule: string;
  creditsEcts: number;
  semestreId: string;
  matieres?: BackendMatiereResponse[];
}

export interface BackendMoyenneResponse {
  etudiantId: string;
  etudiantNom: string;
  numeroEtudiant: string;
  semestreId: string;
  semestreNumero: number;
  moyenne: number;
  mention: string;
  rang?: number;
  creditsObtenus: number;
  valide: boolean;
  moyennesUE?: Array<{
    ueId: string;
    ueCode: string;
    ueIntitule: string;
    creditsEcts: number;
    moyenneUE: number;
    validee: boolean;
    notes?: Array<{
      matiereId: string;
      matiereCode: string;
      matiereIntitule: string;
      coefficient: number;
      noteCC?: number;
      noteExamen?: number;
      notefinale: number;
    }>;
  }>;
}

export interface BackendClassementResponse {
  totalEtudiants: number;
  semestreNom: string;
  promotionNom: string;
  classement: BackendMoyenneResponse[];
}

export interface BackendFiliereResponse {
  id: string;
  nom: string;
  code: string;
  niveau: string;
  duree: number;
  actif: boolean;
}
