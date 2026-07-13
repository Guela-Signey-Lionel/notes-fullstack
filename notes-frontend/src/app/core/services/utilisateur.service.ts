import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur, PageResponse } from '../models';
@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private A = `${environment.apiUrl}/utilisateurs`;
  constructor(private h: HttpClient) {}
  getEtudiants(page=0, size=20, search?: string): Observable<PageResponse<Utilisateur>> {
    let p = new HttpParams().set('page',page).set('size',size);
    if (search) p=p.set('search',search);
    return this.h.get<PageResponse<Utilisateur>>(`${this.A}/etudiants`,{params:p});
  }
  getEnseignants(): Observable<Utilisateur[]> { return this.h.get<Utilisateur[]>(`${this.A}/enseignants`); }
  getAll(role?: string): Observable<Utilisateur[]> { return this.h.get<Utilisateur[]>(this.A, {params: role ? {role} : {}}); }
  create(d: any): Observable<Utilisateur> { return this.h.post<Utilisateur>(this.A,d); }
  toggleActif(id: string): Observable<void> { return this.h.patch<void>(`${this.A}/${id}/toggle-actif`,{}); }
  uploadPhoto(photo: string): Observable<Utilisateur> { return this.h.post<Utilisateur>(`${this.A}/photo`, { photo }); }
  importCSV(file: File, promotionId: string): Observable<void> {
    const form = new FormData(); form.append('file',file); form.append('promotionId',promotionId);
    return this.h.post<void>(`${this.A}/etudiants/import-csv`,form);
  }
}
