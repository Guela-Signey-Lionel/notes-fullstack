import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ExportService {
  private A = `${environment.apiUrl}/export`;
  constructor(private h: HttpClient) {}
  releve(etudiantId: string, semestreId: string): Observable<Blob> { return this.h.get(`${this.A}/releve/${etudiantId}/semestre/${semestreId}`,{responseType:'blob'}); }
  classementExcel(promotionId: string, semestreId: string): Observable<Blob> { return this.h.get(`${this.A}/classement/promotion/${promotionId}/semestre/${semestreId}/excel`,{responseType:'blob'}); }
  notesMatiere(matiereId: string): Observable<Blob> { return this.h.get(`${this.A}/notes/matiere/${matiereId}/excel`,{responseType:'blob'}); }
  download(blob: Blob, filename: string): void { const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }
}
