import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Filiere, Promotion, Semestre, UE, Matiere } from '../models';
@Injectable({ providedIn: 'root' })
export class ReferentielService {
  private A = environment.apiUrl;
  constructor(private h: HttpClient) {}
  getFilieres(): Observable<Filiere[]> { return this.h.get<Filiere[]>(`${this.A}/filieres`); }
  createFiliere(d: any): Observable<Filiere> { return this.h.post<Filiere>(`${this.A}/filieres`, d); }
  getPromotions(filiereId?: string): Observable<Promotion[]> { const p = filiereId ? new HttpParams().set('filiereId',filiereId):{};return this.h.get<Promotion[]>(`${this.A}/promotions`,{params:p}); }
  createPromotion(d: any): Observable<Promotion> { return this.h.post<Promotion>(`${this.A}/promotions`,d); }
  getSemestres(promotionId: string): Observable<Semestre[]> { return this.h.get<Semestre[]>(`${this.A}/semestres`,{params:{promotionId}}); }
  createSemestre(d: any): Observable<Semestre> { return this.h.post<Semestre>(`${this.A}/semestres`,d); }
  cloturerSemestre(id: string): Observable<Semestre> { return this.h.patch<Semestre>(`${this.A}/semestres/${id}/cloturer`,{}); }
  rouvrirSemestre(id: string): Observable<Semestre> { return this.h.patch<Semestre>(`${this.A}/semestres/${id}/rouvrir`,{}); }
  getUEs(semestreId: string): Observable<UE[]> { return this.h.get<UE[]>(`${this.A}/ue`,{params:{semestreId}}); }
  createUE(d: any): Observable<UE> { return this.h.post<UE>(`${this.A}/ue`,d); }
  getMatieres(semestreId?: string, enseignantId?: string): Observable<Matiere[]> {
    let p = new HttpParams();
    if (semestreId) p=p.set('semestreId',semestreId);
    if (enseignantId) p=p.set('enseignantId',enseignantId);
    return this.h.get<Matiere[]>(`${this.A}/matieres`,{params:p});
  }
  createMatiere(d: any): Observable<Matiere> { return this.h.post<Matiere>(`${this.A}/matieres`,d); }
  updateMatiere(id: string, d: any): Observable<Matiere> { return this.h.put<Matiere>(`${this.A}/matieres/${id}`,d); }
  inscrireEtudiant(promotionId: string, etudiantId: string): Observable<void> { return this.h.post<void>(`${this.A}/promotions/${promotionId}/etudiants/${etudiantId}`,{}); }
}
