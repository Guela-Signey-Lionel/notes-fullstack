// ── Enums ──────────────────────────────────────────────────────────────────
export type RoleUtilisateur = 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
export type StatutSemestre  = 'OUVERT' | 'CLOTURE';
export type TypeNote        = 'CC' | 'EXAMEN' | 'UNIQUE';
export type MentionEnum     = 'AJOURNE' | 'PASSABLE' | 'ASSEZ_BIEN' | 'BIEN' | 'TRES_BIEN';
export type NiveauFiliere   = 'LICENCE' | 'MASTER' | 'DOCTORAT';
export type StatutNoteEnum  = 'PRESENT' | 'ABSENT' | 'DISPENSE';

// ── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest { email: string; motDePasse: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; utilisateur: Utilisateur; }

// ── Utilisateur ─────────────────────────────────────────────────────────────
export interface Utilisateur {
  id: string; nom: string; prenom: string; email: string;
  role: RoleUtilisateur; actif: boolean;
  specialite?: string; grade?: string; numeroEtudiant?: string;
  telephone?: string; adresse?: string;
  photoUrl?: string;
}

// ── Classement annuel ───────────────────────────────────────────────────────
export interface MoyenneAnnuelle {
  etudiantId: string;
  etudiantNom: string;
  numeroEtudiant: string;
  moyenneS1?: number;
  moyenneS2?: number;
  moyenneAnnuelle?: number;
  mention?: MentionEnum;
  rang?: number;
  creditsObtenus: number;
  valide: boolean;
}
export interface ClassementAnnuelResponse {
  totalEtudiants: number;
  anneeAcademique: string;
  promotionNom: string;
  semestre1Info: string;
  semestre2Info: string;
  classement: MoyenneAnnuelle[];
}

// ── Référentiel ─────────────────────────────────────────────────────────────
export interface Filiere { id: string; nom: string; code: string; niveau: NiveauFiliere; duree: number; actif: boolean; }
export interface Promotion { id: string; nom: string; anneeAcademique: string; filiere: Filiere; actif: boolean; nbEtudiants: number; }
export interface Semestre { id: string; numero: number; anneeAcademique: string; dateDebut?: string; dateFin?: string; statut: StatutSemestre; promotionId: string; promotionNom: string; }
export interface UE { id: string; code: string; intitule: string; creditsEcts: number; semestreId: string; matieres: Matiere[]; }
export interface Matiere { id: string; code: string; intitule: string; coefficient: number; volumeHoraire?: number; ueId: string; ueIntitule: string; enseignantId?: string; enseignantNom?: string; }

// ── Notes ───────────────────────────────────────────────────────────────────
export interface Note { id: string; etudiantId: string; etudiantNom: string; numeroEtudiant: string; matiereId: string; matiereIntitule: string; valeur: number; typeNote: TypeNote; statut: StatutNoteEnum; commentaire?: string; verrouille: boolean; dateSaisie: string; dateModification: string; }
export interface SaisieNoteRequest { etudiantId: string; matiereId: string; valeur: number; typeNote: TypeNote; statut: StatutNoteEnum; commentaire?: string; }
export interface BatchNotesRequest { matiereId: string; notes: SaisieNoteRequest[]; }
export interface CorrectionNoteRequest { nouvelleValeur: number; motifCorrection: string; }

// ── Moyennes ────────────────────────────────────────────────────────────────
export interface NoteDetail { matiereId: string; matiereCode: string; matiereIntitule: string; coefficient: number; noteCC?: number; noteExamen?: number; notefinale?: number; }
export interface MoyenneUE { ueId: string; ueCode: string; ueIntitule: string; creditsEcts: number; moyenneUE?: number; validee: boolean; notes: NoteDetail[]; }
export interface MoyenneResponse { etudiantId: string; etudiantNom: string; numeroEtudiant: string; semestreId: string; semestreNumero: number; moyenne?: number; mention?: MentionEnum; rang?: number; creditsObtenus: number; valide: boolean; moyennesUE?: MoyenneUE[]; }
export interface ClassementResponse { totalEtudiants: number; semestreNom: string; promotionNom: string; classement: MoyenneResponse[]; }
export interface StatsResponse { intitule: string; totalEtudiants: number; moyenne: number; min: number; max: number; ecartType: number; tauxReussite: number; distributionMentions: Record<string, number>; distributionParTranche: Record<string, number>; }

// ── Pagination ───────────────────────────────────────────────────────────────
export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; last: boolean; }

// ── Import CSV ───────────────────────────────────────────────────────────────
export interface CsvImportResponse { totalLignes: number; importees: number; erreurs: number; rapportErreurs: string[]; }
