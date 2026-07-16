import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Matiere, Utilisateur } from '../../../core/models';

export interface MatiereDialogData {
  matiere?: Matiere;
  ueId: string;
  ueIntitule: string;
  enseignants: Utilisateur[];
}

@Component({
  selector: 'app-matiere-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <div class="dialog-icon">
          <i class="fas fa-book" style="font-size:42px;width:42px;height:42px;color:#8B5CF6;background:#EDE9FE;border-radius:12px;padding:8px;"></i>
        </div>
        <h2 mat-dialog-title>{{isEdit() ? 'Modifier la matière' : 'Ajouter une matière'}}</h2>
        <p class="dialog-subtitle">
          @if (isEdit()) {
            <span class="badge bien">{{data.matiere!.code}}</span>
          }
          UE : <strong>{{data.ueIntitule}}</strong>
        </p>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="form-grid cols-2">
          <mat-form-field appearance="outline">
            <mat-label>Code matière</mat-label>
            <input matInput formControlName="code" placeholder="INF442, MATH201...">
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Code requis</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Intitulé</mat-label>
            <input matInput formControlName="intitule" placeholder="Programmation Web...">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Coefficient</mat-label>
            <input matInput type="number" step="0.5" min="0.5" max="10" formControlName="coefficient">
            <mat-hint>Valeur entre 0.5 et 10</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Volume horaire</mat-label>
            <input matInput type="number" formControlName="volumeHoraire" placeholder="Facultatif">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Enseignant responsable</mat-label>
            <mat-select formControlName="enseignantId">
              <mat-option [value]="null">— Non assigné —</mat-option>
              @for (e of data.enseignants; track e.id) {
                <mat-option [value]="e.id">{{e.prenom}} {{e.nom}} @if(e.grade){ ({{e.grade}})}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="dialogRef.close(false)" [disabled]="saving()">Annuler</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="form.invalid || saving()">
          @if (saving()) {
            <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner>
          }
          <i class="fas fa-save"></i> {{isEdit() ? 'Modifier' : 'Créer'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper { padding:8px; min-width:500px; }
    .dialog-header { text-align:center; margin-bottom:16px; }
    .dialog-icon { margin-bottom:8px; }
    h2 { margin:0 0 4px; font-size:20px; font-weight:700; }
    .dialog-subtitle { margin:0; font-size:13px; color:#64748B; display:flex; align-items:center; justify-content:center; gap:6px; }
    form { margin-top:8px; }
    mat-dialog-actions { padding:16px 0 0 !important; gap:8px; }
    .cols-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .col-span-2 { grid-column: span 2; }
  `]
})
export class MatiereEditDialogComponent {
  form: FormGroup;
  saving = signal(false);

  isEdit = () => !!this.data.matiere;

  constructor(
    public dialogRef: MatDialogRef<MatiereEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MatiereDialogData,
    private fb: FormBuilder
  ) {
    const m = this.data.matiere;
    this.form = this.fb.group({
      code:           [m?.code ?? '', Validators.required],
      intitule:       [m?.intitule ?? '', Validators.required],
      coefficient:    [m?.coefficient ?? 1, [Validators.required, Validators.min(0.5), Validators.max(10)]],
      volumeHoraire:  [m?.volumeHoraire ?? ''],
      enseignantId:   [m?.enseignantId ?? null],
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const payload: any = {
      code: v.code,
      intitule: v.intitule,
      coefficient: Number(v.coefficient),
      ueId: this.data.ueId,
    };
    if (v.volumeHoraire) payload.volumeHoraire = Number(v.volumeHoraire);
    if (v.enseignantId) payload.enseignantId = v.enseignantId;
    this.dialogRef.close(payload);
  }
}
