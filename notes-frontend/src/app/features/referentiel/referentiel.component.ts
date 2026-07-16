import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ReferentielService } from '../../core/services/referentiel.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { Filiere, Promotion, Semestre, UE, Matiere, Utilisateur } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatiereEditDialogComponent, MatiereDialogData } from '../../shared/components/matiere-edit-dialog/matiere-edit-dialog.component';

@Component({
  selector: 'app-referentiel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatExpansionModule,
            MatProgressSpinnerModule, MatTooltipModule, MatChipsModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <div><h1>Référentiel académique</h1><p>Gestion des filières, promotions, semestres, UE et matières</p></div>
      </div>

      <!-- 4 colonnes navigables -->
      <div class="ref-grid">

        <!-- COL 1 : Filières -->
        <div class="ref-col">
          <div class="ref-col-header">
            <h3>Filières</h3>
            <button mat-icon-button (click)="showFiliereForm.set(!showFiliereForm())" matTooltip="Ajouter">
              <i class="fas fa-plus" style="font-size:16px"></i>
            </button>
          </div>
          @if (showFiliereForm()) {
            <form [formGroup]="filiereForm" (ngSubmit)="createFiliere()" class="mini-form">
              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom">
              </mat-form-field>
              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Code</mat-label>
                <input matInput formControlName="code" placeholder="GI, GL...">
              </mat-form-field>
              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Niveau</mat-label>
                <mat-select formControlName="niveau">
                  <mat-option value="LICENCE">Licence</mat-option>
                  <mat-option value="MASTER">Master</mat-option>
                  <mat-option value="DOCTORAT">Doctorat</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Durée (ans)</mat-label>
                <input matInput type="number" formControlName="duree">
              </mat-form-field>
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button mat-button type="button" (click)="showFiliereForm.set(false)">Annuler</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="filiereForm.invalid||filiereEditId()!==null">{{filiereEditId() ? 'Modifier' : 'Créer'}}</button>
              </div>
            </form>
          }
          <div class="ref-list">
            @for (f of filieres(); track f.id) {
              <div class="ref-item" [class.selected]="selectedFiliere()?.id === f.id" (click)="selectFiliere(f)">
                <div class="ref-item-icon">📚</div>
                <div class="ref-item-info">
                  <strong>{{f.code}}</strong>
                  <span>{{f.nom}}</span>
                  <span class="badge" [class]="f.niveau === 'LICENCE' ? 'active' : 'bien'" style="font-size:10px">{{f.niveau}}</span>
                </div>
                <div class="ref-item-actions">
                  <button mat-icon-button style="width:22px;height:22px" matTooltip="Modifier" (click)="$event.stopPropagation(); editFiliere(f)">
                    <i class="fas fa-pen" style="font-size:11px;color:var(--primary-light)"></i>
                  </button>
                  <button mat-icon-button style="width:22px;height:22px" matTooltip="Supprimer" (click)="$event.stopPropagation(); deleteFiliere(f)">
                    <i class="fas fa-trash-can" style="font-size:11px;color:var(--danger)"></i>
                  </button>
                </div>
                <i class="fas fa-chevron-right chevron"></i>
              </div>
            } @empty { <div class="ref-empty">Aucune filière</div> }
          </div>
        </div>

        <!-- COL 2 : Promotions -->
        <div class="ref-col">
          <div class="ref-col-header">
            <h3>Promotions @if (selectedFiliere()) { <span class="badge active" style="font-size:10px">{{selectedFiliere()!.code}}</span> }</h3>
            <button mat-icon-button (click)="showPromoForm.set(!showPromoForm())" [disabled]="!selectedFiliere()" matTooltip="Ajouter">
              <i class="fas fa-plus" style="font-size:16px"></i>
            </button>
          </div>
          @if (showPromoForm()) {
            <form [formGroup]="promoForm" (ngSubmit)="createPromotion()" class="mini-form">
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Nom</mat-label><input matInput formControlName="nom"></mat-form-field>
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Année académique</mat-label><input matInput formControlName="anneeAcademique" placeholder="2024-2025"></mat-form-field>
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button mat-button type="button" (click)="showPromoForm.set(false)">Annuler</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="promoForm.invalid">{{promoEditId() ? 'Modifier' : 'Créer'}}</button>
              </div>
            </form>
          }
          <div class="ref-list">
            @for (p of promotions(); track p.id) {
              <div class="ref-item" [class.selected]="selectedPromo()?.id === p.id" (click)="selectPromo(p)">
                <div class="ref-item-icon">🏫</div>
                <div class="ref-item-info">
                  <strong>{{p.nom}}</strong>
                  <span>{{p.anneeAcademique}}</span>
                  <span style="font-size:11px;color:var(--muted)">{{p.nbEtudiants}} étudiant(s)</span>
                </div>
                <div class="ref-item-actions">
                  <button mat-icon-button style="width:22px;height:22px" matTooltip="Modifier" (click)="$event.stopPropagation(); editPromotion(p)">
                    <i class="fas fa-pen" style="font-size:11px;color:var(--primary-light)"></i>
                  </button>
                  <button mat-icon-button style="width:22px;height:22px" matTooltip="Supprimer" (click)="$event.stopPropagation(); deletePromotion(p)">
                    <i class="fas fa-trash-can" style="font-size:11px;color:var(--danger)"></i>
                  </button>
                </div>
                <i class="fas fa-chevron-right chevron"></i>
              </div>
            } @empty { <div class="ref-empty">{{selectedFiliere() ? 'Aucune promotion' : 'Sélectionner une filière'}}</div> }
          </div>
        </div>

        <!-- COL 3 : Semestres -->
        <div class="ref-col">
          <div class="ref-col-header">
            <h3>Semestres @if (selectedPromo()) { <span class="badge active" style="font-size:10px">{{selectedPromo()!.nom}}</span> }</h3>
            <button mat-icon-button (click)="showSemForm.set(!showSemForm())" [disabled]="!selectedPromo()" matTooltip="Ajouter">
              <i class="fas fa-plus" style="font-size:16px"></i>
            </button>
          </div>
          @if (showSemForm()) {
            <form [formGroup]="semForm" (ngSubmit)="createSemestre()" class="mini-form">
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Numéro</mat-label><input matInput type="number" formControlName="numero"></mat-form-field>
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Année académique</mat-label><input matInput formControlName="anneeAcademique" placeholder="2024-2025"></mat-form-field>
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button mat-button type="button" (click)="showSemForm.set(false)">Annuler</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="semForm.invalid">{{semEditId() ? 'Modifier' : 'Créer'}}</button>
              </div>
            </form>
          }
          <div class="ref-list">
            @for (s of semestres(); track s.id) {
              <div class="ref-item" [class.selected]="selectedSem()?.id === s.id" (click)="selectSem(s)">
                <div class="ref-item-icon">📅</div>
                <div class="ref-item-info">
                  <strong>Semestre {{s.numero}}</strong>
                  <span>{{s.anneeAcademique}}</span>
                  <span class="badge" [class]="s.statut === 'OUVERT' ? 'ouvert' : 'cloture'" style="font-size:10px">{{s.statut}}</span>
                </div>
                <div class="ref-item-actions">
                  <button mat-icon-button style="width:22px;height:22px" matTooltip="Modifier" (click)="$event.stopPropagation(); editSemestre(s)">
                    <i class="fas fa-pen" style="font-size:11px;color:var(--primary-light)"></i>
                  </button>
                  <button mat-icon-button style="width:22px;height:22px" [matTooltip]="s.statut === 'OUVERT' ? 'Clôturer' : 'Rouvrir'"
                          (click)="$event.stopPropagation(); toggleSemestre(s)">
                    <i class="fas" [class.fa-lock]="s.statut === 'OUVERT'" [class.fa-lock-open]="s.statut !== 'OUVERT'" style="font-size:11px;color:#F59E0B"></i>
                  </button>
                  <button mat-icon-button style="width:22px;height:22px" matTooltip="Supprimer" (click)="$event.stopPropagation(); deleteSemestre(s)">
                    <i class="fas fa-trash-can" style="font-size:11px;color:var(--danger)"></i>
                  </button>
                </div>
              </div>
            } @empty { <div class="ref-empty">{{selectedPromo() ? 'Aucun semestre' : 'Sélectionner une promotion'}}</div> }
          </div>
        </div>

        <!-- COL 4 : UE + Matières -->
        <div class="ref-col">
          <div class="ref-col-header">
            <h3>UE & Matières @if (selectedSem()) { <span class="badge active" style="font-size:10px">S{{selectedSem()!.numero}}</span> }</h3>
            <button mat-icon-button (click)="showUEForm.set(!showUEForm())" [disabled]="!selectedSem()" matTooltip="Ajouter UE">
              <i class="fas fa-plus" style="font-size:16px"></i>
            </button>
          </div>
          @if (showUEForm()) {
            <form [formGroup]="ueForm" (ngSubmit)="createUE()" class="mini-form">
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Code UE</mat-label><input matInput formControlName="code"></mat-form-field>
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Intitulé</mat-label><input matInput formControlName="intitule"></mat-form-field>
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Crédits ECTS</mat-label><input matInput type="number" formControlName="creditsEcts"></mat-form-field>
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button mat-button type="button" (click)="showUEForm.set(false)">Annuler</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="ueForm.invalid">{{ueEditId() ? 'Modifier' : 'Créer'}}</button>
              </div>
            </form>
          }
          <div class="ref-list">
            @for (ue of ues(); track ue.id) {
              <div>
                <div class="ue-header-ref" (click)="toggleUE(ue.id)">
                  <span class="ue-code-chip">{{ue.code}}</span>
                  <span class="ue-title-ref">{{ue.intitule}}</span>
                  <span style="font-size:11px;color:var(--muted)">{{ue.creditsEcts}} ECTS</span>
                  <div class="ref-item-actions" style="margin-left:auto;display:flex;gap:2px">
                    <button mat-icon-button style="width:22px;height:22px" matTooltip="Modifier UE"
                            (click)="$event.stopPropagation(); editUE(ue)">
                      <i class="fas fa-pen" style="font-size:11px;color:var(--primary-light)"></i>
                    </button>
                    <button mat-icon-button style="width:22px;height:22px" matTooltip="Supprimer UE"
                            (click)="$event.stopPropagation(); deleteUE(ue)">
                      <i class="fas fa-trash-can" style="font-size:11px;color:var(--danger)"></i>
                    </button>
                    <button mat-icon-button style="width:22px;height:22px" matTooltip="Ajouter matière"
                            (click)="$event.stopPropagation(); openMatiereForm(ue.id)">
                      <i class="fas fa-plus" style="font-size:11px;color:#10B981"></i>
                    </button>
                  </div>
                </div>
                @if (openUE() === ue.id) {
                  @for (m of ue.matieres; track m.id) {
                    <div class="matiere-item">
                      <div style="flex:1">
                        <div style="font-weight:600;font-size:12px">{{m.code}} — {{m.intitule}}</div>
                        <div style="font-size:11px;color:var(--muted)">Coeff {{m.coefficient}} · {{m.enseignantNom ?? 'Non assigné'}}</div>
                      </div>
                      <div style="display:flex;gap:4px">
                        <button mat-icon-button style="width:20px;height:20px" matTooltip="Modifier matière"
                                (click)="$event.stopPropagation(); editMatiere(ue.id, m)">
                          <i class="fas fa-pen" style="font-size:10px;color:var(--primary-light)"></i>
                        </button>
                        <button mat-icon-button style="width:20px;height:20px" matTooltip="Supprimer matière"
                                (click)="$event.stopPropagation(); deleteMatiere(m)">
                          <i class="fas fa-trash-can" style="font-size:10px;color:var(--danger)"></i>
                        </button>
                      </div>
                    </div>
                  }
                }
              </div>
            } @empty { <div class="ref-empty">{{selectedSem() ? 'Aucune UE' : 'Sélectionner un semestre'}}</div> }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ref-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0; border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow); background:white; min-height:500px; }
    .ref-col { border-right:1px solid var(--border); &:last-child { border-right:none; } display:flex; flex-direction:column; }
    .ref-col-header { padding:14px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background:var(--bg);
      h3 { font-size:14px; font-weight:600; display:flex; align-items:center; gap:6px; } }
    .ref-list { flex:1; overflow-y:auto; }
    .ref-item { display:flex; align-items:center; gap:10px; padding:11px 14px; cursor:pointer; border-bottom:1px solid var(--border); transition:.12s;
      &:hover { background:#F1F5F9; } &.selected { background:var(--primary-pale); border-left:3px solid var(--primary-light); } }
    .ref-item-icon { font-size:20px; flex-shrink:0; }
    .ref-item-info { flex:1; display:flex; flex-direction:column; gap:2px; strong { font-size:13px; } span { font-size:11px; color:var(--muted); } }
    .ref-item-actions { display:flex; align-items:center; gap:1px; flex-shrink:0; }
    .chevron { font-size:12px; color:var(--muted); }
    .ref-empty { padding:24px; text-align:center; color:var(--muted); font-size:13px; font-style:italic; }
    .mini-form { padding:12px; background:#F8FAFC; border-bottom:1px solid var(--border); display:flex; flex-direction:column; gap:8px; }
    .ue-header-ref { display:flex; align-items:center; gap:8px; padding:10px 14px; border-bottom:1px solid var(--border); cursor:pointer; background:var(--bg); &:hover { background:#EFF6FF; } }
    .ue-code-chip { background:var(--primary); color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; }
    .ue-title-ref { flex:1; font-weight:600; font-size:12px; }
    .matiere-item { padding:8px 14px 8px 24px; border-bottom:1px solid var(--border); background:white; display:flex; align-items:center; gap:8px; &:hover { background:#F8FAFC; } }
    @media(max-width:1100px) { .ref-grid { grid-template-columns:1fr 1fr; .ref-col:nth-child(2) { border-right:none; } .ref-col:nth-child(3) { border-top:1px solid var(--border); } } }
    @media(max-width:700px) { .ref-grid { grid-template-columns:1fr; .ref-col { border-right:none; border-bottom:1px solid var(--border); } } }
  `]
})
export class ReferentielComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private refSvc  = inject(ReferentielService);
  private userSvc = inject(UtilisateurService);
  private snack   = inject(MatSnackBar);
  private dialog  = inject(MatDialog);

  filieres    = signal<Filiere[]>([]);
  promotions  = signal<Promotion[]>([]);
  semestres   = signal<Semestre[]>([]);
  ues         = signal<UE[]>([]);
  enseignants = signal<Utilisateur[]>([]);

  selectedFiliere = signal<Filiere | null>(null);
  selectedPromo   = signal<Promotion | null>(null);
  selectedSem     = signal<Semestre | null>(null);
  openUE          = signal<string | null>(null);

  showFiliereForm = signal(false);
  showPromoForm   = signal(false);
  showSemForm     = signal(false);
  showUEForm      = signal(false);

  // Edit IDs — quand non null, le formulaire est en mode édition
  filiereEditId  = signal<string | null>(null);
  promoEditId    = signal<string | null>(null);
  semEditId      = signal<string | null>(null);
  ueEditId       = signal<string | null>(null);
  filiereForm = this.fb.group({ nom: ['', Validators.required], code: ['', Validators.required], niveau: ['LICENCE', Validators.required], duree: [3, Validators.required] });
  promoForm   = this.fb.group({ nom: ['', Validators.required], anneeAcademique: ['', Validators.required] });
  semForm     = this.fb.group({ numero: [1, Validators.required], anneeAcademique: ['', Validators.required] });
  ueForm      = this.fb.group({ code: ['', Validators.required], intitule: ['', Validators.required], creditsEcts: [3, Validators.required] });

  ngOnInit(): void {
    this.refSvc.getFilieres().subscribe(f => this.filieres.set(f));
    this.userSvc.getEnseignants().subscribe(e => this.enseignants.set(e));
  }

  selectFiliere(f: Filiere): void { this.selectedFiliere.set(f); this.selectedPromo.set(null); this.selectedSem.set(null); this.promotions.set([]); this.semestres.set([]); this.ues.set([]); this.refSvc.getPromotions(f.id).subscribe(p => this.promotions.set(p)); }
  selectPromo(p: Promotion): void { this.selectedPromo.set(p); this.selectedSem.set(null); this.semestres.set([]); this.ues.set([]); this.refSvc.getSemestres(p.id).subscribe(s => this.semestres.set(s)); }
  selectSem(s: Semestre): void { this.selectedSem.set(s); this.ues.set([]); this.refSvc.getUEs(s.id).subscribe(u => this.ues.set(u)); }
  toggleUE(id: string): void { this.openUE.update(v => v === id ? null : id); }

  openMatiereForm(ueId: string): void {
    const ue = this.ues().find(u => u.id === ueId);
    if (!ue) return;
    const dialogRef = this.dialog.open(MatiereEditDialogComponent, {
      width: '540px',
      data: { ueId, ueIntitule: ue.intitule, enseignants: this.enseignants() } as MatiereDialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.refSvc.createMatiere({ ...result, ueId }).subscribe({ next: m => {
        this.ues.update(ues => ues.map(u => u.id === ueId ? { ...u, matieres: [...u.matieres, m] } : u));
        this.snack.open('Matière créée', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    });
  }

  toggleSemestre(s: Semestre): void {
    const obs = s.statut === 'OUVERT' ? this.refSvc.cloturerSemestre(s.id) : this.refSvc.rouvrirSemestre(s.id);
    obs.subscribe({ next: updated => { this.semestres.update(list => list.map(x => x.id === updated.id ? updated : x)); this.snack.open(`Semestre ${updated.statut === 'OUVERT' ? 'rouvert' : 'clôturé'}`, 'OK', { duration: 2000, panelClass: 'success-snack' }); } });
  }

  // ── CRUD Filières ─────────────────────────────────────────────────────
  createFiliere(): void {
    if (this.filiereForm.invalid) return;
    const editId = this.filiereEditId();
    if (editId) {
      this.refSvc.updateFiliere(editId, this.filiereForm.value).subscribe({ next: f => {
        this.filieres.update(l => l.map(x => x.id === editId ? f : x));
        this.resetFiliereForm();
        this.snack.open('Filière modifiée', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    } else {
      this.refSvc.createFiliere(this.filiereForm.value).subscribe({ next: f => {
        this.filieres.update(l => [...l, f]);
        this.resetFiliereForm();
        this.snack.open('Filière créée', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    }
  }

  editFiliere(f: Filiere): void {
    this.filiereEditId.set(f.id);
    this.filiereForm.patchValue({ nom: f.nom, code: f.code, niveau: f.niveau, duree: f.duree });
    this.showFiliereForm.set(true);
  }

  deleteFiliere(f: Filiere): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { width:'380px', data: { titre:'Supprimer la filière', message:`Êtes-vous sûr de vouloir supprimer « ${f.nom} » ?`, btnConfirmer:'Supprimer' } });
    ref.afterClosed().subscribe(ok => { if (ok) this.refSvc.deleteFiliere(f.id).subscribe({ next: () => {
      this.filieres.update(l => l.filter(x => x.id !== f.id));
      if (this.selectedFiliere()?.id === f.id) { this.selectedFiliere.set(null); this.promotions.set([]); this.semestres.set([]); this.ues.set([]); }
      this.snack.open('Filière supprimée', 'OK', { duration: 2000 });
    }}); });
  }

  private resetFiliereForm(): void {
    this.filiereForm.reset({ niveau:'LICENCE', duree:3 });
    this.showFiliereForm.set(false);
    this.filiereEditId.set(null);
  }

  // ── CRUD Promotions ───────────────────────────────────────────────────
  createPromotion(): void {
    if (this.promoForm.invalid || !this.selectedFiliere()) return;
    const data = { ...this.promoForm.value, filiereId: this.selectedFiliere()!.id };
    const editId = this.promoEditId();
    if (editId) {
      this.refSvc.updatePromotion(editId, data).subscribe({ next: p => {
        this.promotions.update(l => l.map(x => x.id === editId ? p : x));
        this.resetPromoForm();
        this.snack.open('Promotion modifiée', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    } else {
      this.refSvc.createPromotion(data).subscribe({ next: p => {
        this.promotions.update(l => [...l, p]);
        this.resetPromoForm();
        this.snack.open('Promotion créée', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    }
  }

  editPromotion(p: Promotion): void {
    this.promoEditId.set(p.id);
    this.promoForm.patchValue({ nom: p.nom, anneeAcademique: p.anneeAcademique });
    this.showPromoForm.set(true);
  }

  deletePromotion(p: Promotion): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { width:'380px', data: { titre:'Supprimer la promotion', message:`Supprimer « ${p.nom} » (${p.anneeAcademique}) ?`, btnConfirmer:'Supprimer' } });
    ref.afterClosed().subscribe(ok => { if (ok) this.refSvc.deletePromotion(p.id).subscribe({ next: () => {
      this.promotions.update(l => l.filter(x => x.id !== p.id));
      if (this.selectedPromo()?.id === p.id) { this.selectedPromo.set(null); this.semestres.set([]); this.ues.set([]); }
      this.snack.open('Promotion supprimée', 'OK', { duration: 2000 });
    }}); });
  }

  private resetPromoForm(): void {
    this.promoForm.reset();
    this.showPromoForm.set(false);
    this.promoEditId.set(null);
  }

  // ── CRUD Semestres ────────────────────────────────────────────────────
  createSemestre(): void {
    if (this.semForm.invalid || !this.selectedPromo()) return;
    const data = { ...this.semForm.value, promotionId: this.selectedPromo()!.id };
    const editId = this.semEditId();
    if (editId) {
      this.refSvc.updateSemestre(editId, data).subscribe({ next: s => {
        this.semestres.update(l => l.map(x => x.id === editId ? s : x));
        this.resetSemForm();
        this.snack.open('Semestre modifié', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    } else {
      this.refSvc.createSemestre(data).subscribe({ next: s => {
        this.semestres.update(l => [...l, s]);
        this.resetSemForm();
        this.snack.open('Semestre créé', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    }
  }

  editSemestre(s: Semestre): void {
    this.semEditId.set(s.id);
    this.semForm.patchValue({ numero: s.numero, anneeAcademique: s.anneeAcademique });
    this.showSemForm.set(true);
  }

  deleteSemestre(s: Semestre): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { width:'380px', data: { titre:'Supprimer le semestre', message:`Supprimer le semestre ${s.numero} (${s.anneeAcademique}) ?`, btnConfirmer:'Supprimer' } });
    ref.afterClosed().subscribe(ok => { if (ok) this.refSvc.deleteSemestre(s.id).subscribe({ next: () => {
      this.semestres.update(l => l.filter(x => x.id !== s.id));
      if (this.selectedSem()?.id === s.id) { this.selectedSem.set(null); this.ues.set([]); }
      this.snack.open('Semestre supprimé', 'OK', { duration: 2000 });
    }}); });
  }

  private resetSemForm(): void {
    this.semForm.reset();
    this.showSemForm.set(false);
    this.semEditId.set(null);
  }

  // ── CRUD UE ──────────────────────────────────────────────────────────
  createUE(): void {
    if (this.ueForm.invalid || !this.selectedSem()) return;
    const data = { ...this.ueForm.value, semestreId: this.selectedSem()!.id };
    const editId = this.ueEditId();
    if (editId) {
      this.refSvc.updateUE(editId, data).subscribe({ next: ue => {
        this.ues.update(l => l.map(x => x.id === editId ? { ...ue, matieres: x.matieres } : x));
        this.resetUEForm();
        this.snack.open('UE modifiée', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    } else {
      this.refSvc.createUE(data).subscribe({ next: ue => {
        this.ues.update(l => [...l, { ...ue, matieres: [] }]);
        this.resetUEForm();
        this.snack.open('UE créée', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    }
  }

  editUE(ue: UE): void {
    this.ueEditId.set(ue.id);
    this.ueForm.patchValue({ code: ue.code, intitule: ue.intitule, creditsEcts: ue.creditsEcts });
    this.showUEForm.set(true);
  }

  deleteUE(ue: UE): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { width:'380px', data: { titre:"Supprimer l'UE", message:`Supprimer « ${ue.code} — ${ue.intitule} » ?`, btnConfirmer:'Supprimer' } });
    ref.afterClosed().subscribe(ok => { if (ok) this.refSvc.deleteUE(ue.id).subscribe({ next: () => {
      this.ues.update(l => l.filter(x => x.id !== ue.id));
      this.snack.open('UE supprimée', 'OK', { duration: 2000 });
    }}); });
  }

  private resetUEForm(): void {
    this.ueForm.reset({ creditsEcts: 3 });
    this.showUEForm.set(false);
    this.ueEditId.set(null);
  }

  // ── CRUD Matières (via modale) ──────────────────────────────────────
  editMatiere(ueId: string, m: Matiere): void {
    const ue = this.ues().find(u => u.id === ueId);
    if (!ue) return;
    const dialogRef = this.dialog.open(MatiereEditDialogComponent, {
      width: '540px',
      data: { matiere: m, ueId, ueIntitule: ue.intitule, enseignants: this.enseignants() } as MatiereDialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.refSvc.updateMatiere(m.id, result).subscribe({ next: updated => {
        this.ues.update(ues => ues.map(ue => ue.id === ueId ? { ...ue, matieres: ue.matieres.map(x => x.id === m.id ? updated : x) } : ue));
        this.snack.open('Matière modifiée', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
    });
  }

  deleteMatiere(m: Matiere): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { width:'380px', data: { titre:'Supprimer la matière', message:`Supprimer « ${m.code} — ${m.intitule} » ?`, btnConfirmer:'Supprimer' } });
    ref.afterClosed().subscribe(ok => { if (ok) this.refSvc.deleteMatiere(m.id).subscribe({ next: () => {
      this.ues.update(ues => ues.map(ue => ({ ...ue, matieres: ue.matieres.filter(x => x.id !== m.id) })));
      this.snack.open('Matière supprimée', 'OK', { duration: 2000 });
    }}); });
  }
}
