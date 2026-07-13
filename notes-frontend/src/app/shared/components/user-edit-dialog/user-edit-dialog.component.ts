import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <div class="dialog-icon">
          <mat-icon>edit</mat-icon>
        </div>
        <h2 mat-dialog-title>Modifier le profil</h2>
        <p class="dialog-subtitle">{{data.user.prenom}} {{data.user.nom}} — <span class="badge" [class]="roleCss(data.user.role)">{{roleLabel(data.user.role)}}</span></p>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="form-grid cols-2">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="prenom">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Nouveau mot de passe</mat-label>
            <input matInput formControlName="motDePasse" type="password" placeholder="Laisser vide pour ne pas changer">
            <mat-hint>Min. 8 caractères. Laissez vide pour conserver l'actuel.</mat-hint>
          </mat-form-field>
          @if (data.user.role === 'ETUDIANT') {
            <mat-form-field appearance="outline">
              <mat-label>N° Étudiant</mat-label>
              <input matInput formControlName="numeroEtudiant">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="telephone">
            </mat-form-field>
            <mat-form-field appearance="outline" class="col-span-2">
              <mat-label>Adresse</mat-label>
              <textarea matInput formControlName="adresse" rows="2"></textarea>
            </mat-form-field>
          }
          @if (data.user.role === 'ENSEIGNANT') {
            <mat-form-field appearance="outline">
              <mat-label>Spécialité</mat-label>
              <input matInput formControlName="specialite">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Grade</mat-label>
              <input matInput formControlName="grade" placeholder="Docteur, Professeur...">
            </mat-form-field>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="dialogRef.close(false)" [disabled]="saving()">Annuler</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="form.invalid || saving()">
          @if (saving()) {
            <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner>
          }
          <mat-icon>save</mat-icon> Enregistrer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper { padding:8px; min-width:480px; }
    .dialog-header { text-align:center; margin-bottom:16px; }
    .dialog-icon { margin-bottom:8px; mat-icon { font-size:42px; width:42px; height:42px; color:#3B82F6; background:#EFF6FF; border-radius:12px; padding:8px; } }
    h2 { margin:0 0 4px; font-size:20px; font-weight:700; }
    .dialog-subtitle { margin:0; font-size:13px; color:#64748B; display:flex; align-items:center; justify-content:center; gap:6px; }
    form { margin-top:8px; }
    mat-dialog-actions { padding:16px 0 0 !important; gap:8px; }
    .cols-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .col-span-2 { grid-column: span 2; }
  `]
})
export class UserEditDialogComponent {
  form!: FormGroup;
  saving = signal(false);

  constructor(
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: Utilisateur },
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nom:            [this.data.user.nom, Validators.required],
      prenom:         [this.data.user.prenom, Validators.required],
      email:          [this.data.user.email, [Validators.required, Validators.email]],
      motDePasse:     [''],
      specialite:     [this.data.user.specialite ?? ''],
      grade:          [this.data.user.grade ?? ''],
      numeroEtudiant: [this.data.user.numeroEtudiant ?? ''],
      telephone:      [(this.data.user as any).telephone ?? ''],
      adresse:        [(this.data.user as any).adresse ?? ''],
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const payload: any = {};
    const f = this.form.value;

    if (f.nom !== this.data.user.nom) payload.nom = f.nom;
    if (f.prenom !== this.data.user.prenom) payload.prenom = f.prenom;
    if (f.email !== this.data.user.email) payload.email = f.email;
    if (f.motDePasse && f.motDePasse.length >= 8) payload.motDePasse = f.motDePasse;

    if (this.data.user.role === 'ETUDIANT') {
      if (f.numeroEtudiant !== this.data.user.numeroEtudiant) payload.numeroEtudiant = f.numeroEtudiant;
      if (f.telephone) payload.telephone = f.telephone;
      if (f.adresse) payload.adresse = f.adresse;
    }
    if (this.data.user.role === 'ENSEIGNANT') {
      if (f.specialite !== this.data.user.specialite) payload.specialite = f.specialite;
      if (f.grade !== this.data.user.grade) payload.grade = f.grade;
    }

    this.dialogRef.close(payload);
  }

  roleCss  = (r: string) => ({ ADMIN:'admin', ENSEIGNANT:'enseignant', ETUDIANT:'etudiant' }[r] ?? '');
  roleLabel= (r: string) => ({ ADMIN:'Administrateur', ENSEIGNANT:'Enseignant', ETUDIANT:'Étudiant' }[r] ?? r);
}
