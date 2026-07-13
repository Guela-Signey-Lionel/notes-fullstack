import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Note, SaisieNoteRequest, BatchNotesRequest, CorrectionNoteRequest, CsvImportResponse } from '../models';
@Injectable({ providedIn: 'root' })
export class NoteService {
  private A = `${environment.apiUrl}/notes`;
  constructor(private h: HttpClient) {}
  saisir(req: SaisieNoteRequest): Observable<Note> { return this.h.post<Note>(this.A,req); }
  batch(req: BatchNotesRequest): Observable<Note[]> { return this.h.post<Note[]>(`${this.A}/batch`,req); }
  corriger(id: string, req: CorrectionNoteRequest): Observable<Note> { return this.h.put<Note>(`${this.A}/${id}/corriger`,req); }
  verrouiller(matiereId: string): Observable<void> { return this.h.patch<void>(`${this.A}/matieres/${matiereId}/verrouiller`,{}); }
  deverrouiller(matiereId: string): Observable<void> { return this.h.patch<void>(`${this.A}/matieres/${matiereId}/deverrouiller`,{}); }
  byEtudiantSemestre(etudiantId: string, semestreId: string): Observable<Note[]> { return this.h.get<Note[]>(`${this.A}/etudiant/${etudiantId}/semestre/${semestreId}`); }
  byMatiere(matiereId: string): Observable<Note[]> { return this.h.get<Note[]>(`${this.A}/matiere/${matiereId}`); }
  importCSV(file: File, matiereId: string): Observable<CsvImportResponse> {
    const form = new FormData(); form.append('file',file); form.append('matiereId',matiereId);
    return this.h.post<CsvImportResponse>(`${this.A}/import/csv`,form);
  }
}
