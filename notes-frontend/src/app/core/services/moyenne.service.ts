import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MoyenneResponse, ClassementResponse, StatsResponse, ClassementAnnuelResponse } from '../models';
@Injectable({ providedIn: 'root' })
export class MoyenneService {
  private A = `${environment.apiUrl}/moyennes`;
  constructor(private h: HttpClient) {}
  getMoyenne(etudiantId: string, semestreId: string): Observable<MoyenneResponse> { return this.h.get<MoyenneResponse>(`${this.A}/etudiant/${etudiantId}/semestre/${semestreId}`); }
  getClassement(promotionId: string, semestreId: string): Observable<ClassementResponse> { return this.h.get<ClassementResponse>(`${this.A}/classement/promotion/${promotionId}/semestre/${semestreId}`); }
  getClassementAnnuel(promotionId: string, semestre1Id: string, semestre2Id: string): Observable<ClassementAnnuelResponse> { return this.h.get<ClassementAnnuelResponse>(`${this.A}/classement/promotion/${promotionId}/annuel?semestre1Id=${semestre1Id}&semestre2Id=${semestre2Id}`); }
  getHistorique(etudiantId: string): Observable<MoyenneResponse[]> { return this.h.get<MoyenneResponse[]>(`${this.A}/etudiant/${etudiantId}/historique`); }
  getStatsMatiere(matiereId: string): Observable<StatsResponse> { return this.h.get<StatsResponse>(`${this.A}/stats/matiere/${matiereId}`); }
}
