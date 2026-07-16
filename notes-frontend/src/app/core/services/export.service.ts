import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private A = `${environment.apiUrl}/export`;
  constructor(private h: HttpClient) {}

  // ── Exports existants (améliorés) ──────────────────────────────────────
  /** Relevé de notes PDF pour un étudiant sur un semestre */
  releve(etudiantId: string, semestreId: string): Observable<Blob> {
    return this.h.get(`${this.A}/releve/${etudiantId}/semestre/${semestreId}`, { responseType: 'blob' });
  }

  /** Classement Excel pour une promotion / semestre */
  classementExcel(promotionId: string, semestreId: string): Observable<Blob> {
    return this.h.get(`${this.A}/classement/promotion/${promotionId}/semestre/${semestreId}/excel`, { responseType: 'blob' });
  }

  /** Notes d'une matière en Excel */
  notesMatiere(matiereId: string): Observable<Blob> {
    return this.h.get(`${this.A}/notes/matiere/${matiereId}/excel`, { responseType: 'blob' });
  }

  // ── Nouveaux exports avancés ───────────────────────────────────────────

  /** Statistiques globales Excel (étudiants par filière, promotion, taux) */
  statsGlobalesExcel(): Observable<Blob> {
    return this.h.get(`${this.A}/stats/globales/excel`, { responseType: 'blob' });
  }

  /** Relevé annuel PDF (S1 + S2 combinés) */
  releveAnnuel(etudiantId: string, semestre1Id: string, semestre2Id: string): Observable<Blob> {
    return this.h.get(`${this.A}/releve/${etudiantId}/annuel/${semestre1Id}/${semestre2Id}`, { responseType: 'blob' });
  }

  /** Export de tous les relevés d'une promotion (batch PDF) */
  relevesPromotion(promotionId: string, semestreId: string): Observable<Blob> {
    return this.h.get(`${this.A}/releves/promotion/${promotionId}/semestre/${semestreId}`, { responseType: 'blob' });
  }

  /** Statistiques d'une matière en PDF */
  statsMatierePdf(matiereId: string): Observable<Blob> {
    return this.h.get(`${this.A}/matiere/${matiereId}/stats/pdf`, { responseType: 'blob' });
  }

  // ── Utilitaire de téléchargement ───────────────────────────────────────
  download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  /** Téléchargement multiple (zip) si supporté par le backend */
  downloadMultiple(blobs: Blob[], filenames: string[]): void {
    blobs.forEach((blob, i) => this.download(blob, filenames[i]));
  }
}
