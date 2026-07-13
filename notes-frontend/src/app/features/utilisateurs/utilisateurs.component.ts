import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { ReferentielService } from '../../core/services/referentiel.service';
import { Utilisateur, Filiere, Promotion } from '../../core/models';
import { UserEditDialogComponent } from '../../shared/components/user-edit-dialog/user-edit-dialog.component';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule,
            MatTooltipModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <div><h1>Gestion des utilisateurs</h1><p>Comptes enseignants, étudiants et administrateurs</p></div>
        <button mat-raised-button color="primary" (click)="showForm.set(!showForm())">
          <mat-icon>{{showForm() ? 'close' : 'person_add'}}</mat-icon>
          {{showForm() ? 'Fermer' : 'Nouveau compte'}}
        </button>
      </div>

      @if (showForm()) {
        <div class="card" style="margin-bottom:24px">
          <div class="card-header"><h2>Créer un compte</h2></div>
          <form [formGroup]="form" (ngSubmit)="onCreate()" class="form-grid cols-3">
            <mat-form-field appearance="outline"><mat-label>Nom</mat-label><input matInput formControlName="nom"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Prénom</mat-label><input matInput formControlName="prenom"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Mot de passe</mat-label><input matInput formControlName="motDePasse" type="password"></mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Rôle</mat-label>
              <mat-select formControlName="role">
                <mat-option value="ETUDIANT">Étudiant</mat-option>
                <mat-option value="ENSEIGNANT">Enseignant</mat-option>
                <mat-option value="ADMIN">Administrateur</mat-option>
              </mat-select>
            </mat-form-field>
            @if (form.get('role')?.value === 'ETUDIANT') {
              <mat-form-field appearance="outline"><mat-label>N° Étudiant</mat-label><input matInput formControlName="numeroEtudiant"></mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Filière</mat-label>
                <mat-select formControlName="filiereId" (selectionChange)="onFiliereChange($event.value)">
                  <mat-option value="">-- Sélectionner --</mat-option>
                  @for (f of filieres(); track f.id) {
                    <mat-option [value]="f.id">{{f.nom}} ({{f.code}})</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Promotion</mat-label>
                <mat-select formControlName="promotionId">
                  <mat-option value="">-- Sélectionner --</mat-option>
                  @for (p of promotions(); track p.id) {
                    <mat-option [value]="p.id">{{p.nom}} — {{p.anneeAcademique}}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
            @if (form.get('role')?.value === 'ENSEIGNANT') {
              <mat-form-field appearance="outline"><mat-label>Spécialité</mat-label><input matInput formControlName="specialite"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Grade</mat-label><input matInput formControlName="grade" placeholder="Docteur, Professeur..."></mat-form-field>
            }
            <div class="form-actions col-span-2" style="grid-column:1/-1">
              <button mat-button type="button" (click)="showForm.set(false)">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner> }
                <mat-icon>save</mat-icon> Créer
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Tabs rôle -->
      <div class="role-tabs">
        @for (tab of tabs; track tab.role) {
          <button [class.active]="activeTab() === tab.role" (click)="switchTab(tab.role)">
            <span>{{tab.icon}}</span> {{tab.label}}
            <span class="tab-count">{{tab.role === activeTab() ? utilisateurs().length : ''}}</span>
          </button>
        }
      </div>

      <div class="table-container">
        @if (loading()) { <div class="loading-center"><mat-spinner /></div> }
        <table mat-table [dataSource]="utilisateurs()" style="width:100%">

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
            <td mat-cell *matCellDef="let u">
              <div style="display:flex;align-items:center;gap:10px">
                <div class="u-avatar">{{u.prenom?.[0]}}{{u.nom?.[0]}}</div>
                <div>
                  <div style="font-weight:600;font-size:13px">{{u.prenom}} {{u.nom}}</div>
                  <div style="font-size:11px;color:var(--muted)">{{u.email}}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rôle</th>
            <td mat-cell *matCellDef="let u">
              <span class="badge" [class]="roleCss(u.role)">{{roleLabel(u.role)}}</span>
            </td>
          </ng-container>

          <!-- Colonnes spécifiques selon l'onglet actif -->
          @if (activeTab() === 'ETUDIANT') {
            <ng-container matColumnDef="numeroEtudiant">
              <th mat-header-cell *matHeaderCellDef>N° Étudiant</th>
              <td mat-cell *matCellDef="let u">
                <code style="font-size:11px;background:var(--primary-pale);padding:2px 6px;border-radius:4px">{{u.numeroEtudiant}}</code>
              </td>
            </ng-container>
            <ng-container matColumnDef="filiere">
              <th mat-header-cell *matHeaderCellDef>Filière</th>
              <td mat-cell *matCellDef="let u">
                @if (u.filiereNom) {
                  <span style="font-size:12px;font-weight:500;color:var(--text)">{{u.filiereNom}}</span>
                } @else {
                  <span style="font-size:11px;color:var(--muted);font-style:italic">Non assignée</span>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="promotion">
              <th mat-header-cell *matHeaderCellDef>Promotion</th>
              <td mat-cell *matCellDef="let u">
                @if (u.promotionNom && u.promotionAnnee) {
                  <span style="font-size:12px;color:var(--text)">{{u.promotionNom}} — {{u.promotionAnnee}}</span>
                } @else {
                  <span style="font-size:11px;color:var(--muted);font-style:italic">Non inscrit</span>
                }
              </td>
            </ng-container>
          } @else {
            <ng-container matColumnDef="detail">
              <th mat-header-cell *matHeaderCellDef>Détail</th>
              <td mat-cell *matCellDef="let u">
                @if (u.specialite) { <span style="font-size:12px;color:var(--muted)">{{u.specialite}}</span> }
                @if (u.grade) { <span style="font-size:11px;color:var(--muted);margin-left:6px">· {{u.grade}}</span> }
              </td>
            </ng-container>
          }

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let u">
              <span class="badge" [class]="u.actif ? 'active' : 'inactive'">{{u.actif ? 'Actif' : 'Inactif'}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let u">
              <button mat-icon-button color="primary" matTooltip="Modifier" (click)="editUser(u)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [color]="u.actif ? 'warn' : 'primary'"
                      [matTooltip]="u.actif ? 'Désactiver' : 'Activer'"
                      (click)="toggle(u)">
                <mat-icon>{{u.actif ? 'person_off' : 'person'}}</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols()"></tr>
          <tr mat-row *matRowDef="let row; columns: cols();"></tr>
          <tr *matNoDataRow>
            <td [attr.colspan]="cols().length">
              <div class="empty-state"><span class="empty-icon">👤</span><h3>Aucun utilisateur</h3></div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .u-avatar { width:34px; height:34px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0; }
    .role-tabs { display:flex; margin-bottom:16px; background:white; border-radius:var(--radius); border:1px solid var(--border); overflow:hidden; box-shadow:var(--shadow);
      button { flex:1; padding:11px; border:none; background:none; cursor:pointer; font-size:13px; font-weight:500; color:var(--muted); border-right:1px solid var(--border); display:flex; align-items:center; justify-content:center; gap:6px; transition:.15s;
        &:last-child { border-right:none; } &:hover { background:var(--bg); } &.active { background:var(--primary); color:white; } }
      .tab-count { font-size:11px; background:rgba(255,255,255,.25); padding:1px 6px; border-radius:10px; min-width:16px; text-align:center; } }
  `]
})
export class UtilisateursComponent implements OnInit {
  private svc   = inject(UtilisateurService);
  private refSvc = inject(ReferentielService);
  private fb    = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  utilisateurs = signal<Utilisateur[]>([]);
  loading      = signal(false);
  saving       = signal(false);
  showForm     = signal(false);
  activeTab    = signal<string>('ENSEIGNANT');
  cols         = computed(() => {
    if (this.activeTab() === 'ETUDIANT') return ['nom','role','numeroEtudiant','filiere','promotion','statut','actions'];
    return ['nom','role','detail','statut','actions'];
  });

  filieres    = signal<Filiere[]>([]);
  promotions  = signal<Promotion[]>([]);
  selectedFiliereId = signal('');

  tabs = [
    { role: 'ENSEIGNANT', label: 'Enseignants', icon: '👨‍🏫' },
    { role: 'ETUDIANT',   label: 'Étudiants',   icon: '🎓' },
    { role: 'ADMIN',      label: 'Admins',       icon: '⚙️' },
  ];

  form = this.fb.group({
    nom:            ['', Validators.required],
    prenom:         ['', Validators.required],
    email:          ['', [Validators.required, Validators.email]],
    motDePasse:     ['', [Validators.required, Validators.minLength(8)]],
    role:           ['ENSEIGNANT', Validators.required],
    specialite:     [''],
    grade:          [''],
    numeroEtudiant: [''],
    filiereId:      [''],
    promotionId:    [''],
  });

  ngOnInit(): void {
    this.load();
    this.refSvc.getFilieres().subscribe(f => this.filieres.set(f));
  }

  onFiliereChange(filiereId: string): void {
    this.selectedFiliereId.set(filiereId);
    this.form.get('promotionId')?.setValue('');
    if (filiereId) {
      this.refSvc.getPromotions(filiereId).subscribe(p => this.promotions.set(p));
    } else {
      this.promotions.set([]);
    }
  }

  switchTab(role: string): void { this.activeTab.set(role); this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll(this.activeTab()).subscribe({
      next: u => { this.utilisateurs.set(u); this.loading.set(false); }
    });
  }

  onCreate(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const payload = { ...this.form.value };
    // Ne pas envoyer les champs vides pour les étudiants
    if (payload.role === 'ETUDIANT') {
      if (!payload.filiereId) delete payload.filiereId;
      if (!payload.promotionId) delete payload.promotionId;
    } else {
      delete payload.filiereId;
      delete payload.promotionId;
      delete payload.numeroEtudiant;
    }

    this.svc.create(payload).subscribe({
      next: () => {
        this.snack.open('Compte créé avec succès', 'OK', { duration: 3000, panelClass: 'success-snack' });
        this.showForm.set(false);
        this.form.reset({ role: 'ENSEIGNANT' });
        this.promotions.set([]);
        this.selectedFiliereId.set('');
        this.load();
        this.saving.set(false);
      },
      error: e => {
        this.snack.open(e.error?.message || 'Erreur création', 'OK', { duration: 3000, panelClass: 'error-snack' });
        this.saving.set(false);
      }
    });
  }

  editUser(u: Utilisateur): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '520px',
      data: { user: u }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.svc.updateByAdmin(u.id, result).subscribe({
        next: updated => {
          this.snack.open('Compte mis à jour avec succès', 'OK', { duration: 3000, panelClass: 'success-snack' });
          this.load();
        },
        error: err => {
          this.snack.open(err.error?.message || 'Erreur lors de la mise à jour', 'OK', { duration: 3000, panelClass: 'error-snack' });
        }
      });
    });
  }

  toggle(u: Utilisateur): void {
    this.svc.toggleActif(u.id).subscribe({
      next: () => {
        this.snack.open(u.actif ? 'Compte désactivé' : 'Compte activé', 'OK', { duration: 2000, panelClass: 'success-snack' });
        this.load();
      }
    });
  }

  roleCss  = (r: string) => ({ ADMIN:'admin', ENSEIGNANT:'enseignant', ETUDIANT:'etudiant' }[r] ?? '');
  roleLabel= (r: string) => ({ ADMIN:'Admin', ENSEIGNANT:'Enseignant', ETUDIANT:'Étudiant' }[r] ?? r);
}
