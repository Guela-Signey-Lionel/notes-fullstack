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
import { ReferentielService } from '../../core/services/referentiel.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { Filiere, Promotion, Semestre, UE, Matiere, Utilisateur } from '../../core/models';

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
              <mat-icon>add</mat-icon>
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
                <button mat-raised-button color="primary" type="submit" [disabled]="filiereForm.invalid">Créer</button>
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
                <mat-icon class="chevron">chevron_right</mat-icon>
              </div>
            } @empty { <div class="ref-empty">Aucune filière</div> }
          </div>
        </div>

        <!-- COL 2 : Promotions -->
        <div class="ref-col">
          <div class="ref-col-header">
            <h3>Promotions @if (selectedFiliere()) { <span class="badge active" style="font-size:10px">{{selectedFiliere()!.code}}</span> }</h3>
            <button mat-icon-button (click)="showPromoForm.set(!showPromoForm())" [disabled]="!selectedFiliere()" matTooltip="Ajouter">
              <mat-icon>add</mat-icon>
            </button>
          </div>
          @if (showPromoForm()) {
            <form [formGroup]="promoForm" (ngSubmit)="createPromotion()" class="mini-form">
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Nom</mat-label><input matInput formControlName="nom"></mat-form-field>
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Année académique</mat-label><input matInput formControlName="anneeAcademique" placeholder="2024-2025"></mat-form-field>
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button mat-button type="button" (click)="showPromoForm.set(false)">Annuler</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="promoForm.invalid">Créer</button>
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
                <mat-icon class="chevron">chevron_right</mat-icon>
              </div>
            } @empty { <div class="ref-empty">{{selectedFiliere() ? 'Aucune promotion' : 'Sélectionner une filière'}}</div> }
          </div>
        </div>

        <!-- COL 3 : Semestres -->
        <div class="ref-col">
          <div class="ref-col-header">
            <h3>Semestres @if (selectedPromo()) { <span class="badge active" style="font-size:10px">{{selectedPromo()!.nom}}</span> }</h3>
            <button mat-icon-button (click)="showSemForm.set(!showSemForm())" [disabled]="!selectedPromo()" matTooltip="Ajouter">
              <mat-icon>add</mat-icon>
            </button>
          </div>
          @if (showSemForm()) {
            <form [formGroup]="semForm" (ngSubmit)="createSemestre()" class="mini-form">
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Numéro</mat-label><input matInput type="number" formControlName="numero"></mat-form-field>
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Année académique</mat-label><input matInput formControlName="anneeAcademique" placeholder="2024-2025"></mat-form-field>
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button mat-button type="button" (click)="showSemForm.set(false)">Annuler</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="semForm.invalid">Créer</button>
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
                <div style="display:flex;flex-direction:column;gap:2px">
                  <button mat-icon-button style="width:24px;height:24px" [matTooltip]="s.statut === 'OUVERT' ? 'Clôturer' : 'Rouvrir'"
                          (click)="$event.stopPropagation(); toggleSemestre(s)">
                    <mat-icon style="font-size:16px">{{s.statut === 'OUVERT' ? 'lock' : 'lock_open'}}</mat-icon>
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
              <mat-icon>add</mat-icon>
            </button>
          </div>
          @if (showUEForm()) {
            <form [formGroup]="ueForm" (ngSubmit)="createUE()" class="mini-form">
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Code UE</mat-label><input matInput formControlName="code"></mat-form-field>
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Intitulé</mat-label><input matInput formControlName="intitule"></mat-form-field>
              <mat-form-field appearance="outline" style="width:100%"><mat-label>Crédits ECTS</mat-label><input matInput type="number" formControlName="creditsEcts"></mat-form-field>
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button mat-button type="button" (click)="showUEForm.set(false)">Annuler</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="ueForm.invalid">Créer</button>
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
                  <button mat-icon-button style="width:24px;height:24px" matTooltip="Ajouter matière"
                          (click)="$event.stopPropagation(); openMatiereForm(ue.id)">
                    <mat-icon style="font-size:16px">add</mat-icon>
                  </button>
                </div>
                @if (openUE() === ue.id) {
                  @if (matiereFormUE() === ue.id) {
                    <form [formGroup]="matiereForm" (ngSubmit)="createMatiere(ue.id)" class="mini-form" style="margin:4px 0 8px 0">
                      <mat-form-field appearance="outline" style="width:100%"><mat-label>Code</mat-label><input matInput formControlName="code"></mat-form-field>
                      <mat-form-field appearance="outline" style="width:100%"><mat-label>Intitulé</mat-label><input matInput formControlName="intitule"></mat-form-field>
                      <mat-form-field appearance="outline" style="width:100%"><mat-label>Coefficient</mat-label><input matInput type="number" step="0.5" formControlName="coefficient"></mat-form-field>
                      <mat-form-field appearance="outline" style="width:100%"><mat-label>Enseignant</mat-label>
                        <mat-select formControlName="enseignantId">
                          @for (e of enseignants(); track e.id) { <mat-option [value]="e.id">{{e.prenom}} {{e.nom}}</mat-option> }
                        </mat-select>
                      </mat-form-field>
                      <div style="display:flex;gap:6px;justify-content:flex-end">
                        <button mat-button type="button" (click)="matiereFormUE.set(null)">Annuler</button>
                        <button mat-raised-button color="primary" type="submit" [disabled]="matiereForm.invalid">Créer</button>
                      </div>
                    </form>
                  }
                  @for (m of ue.matieres; track m.id) {
                    <div class="matiere-item">
                      <div>
                        <div style="font-weight:600;font-size:12px">{{m.code}} — {{m.intitule}}</div>
                        <div style="font-size:11px;color:var(--muted)">Coeff {{m.coefficient}} · {{m.enseignantNom ?? 'Non assigné'}}</div>
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
    .chevron { font-size:16px; color:var(--muted); }
    .ref-empty { padding:24px; text-align:center; color:var(--muted); font-size:13px; font-style:italic; }
    .mini-form { padding:12px; background:#F8FAFC; border-bottom:1px solid var(--border); display:flex; flex-direction:column; gap:8px; }
    .ue-header-ref { display:flex; align-items:center; gap:8px; padding:10px 14px; border-bottom:1px solid var(--border); cursor:pointer; background:var(--bg); &:hover { background:#EFF6FF; } }
    .ue-code-chip { background:var(--primary); color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; }
    .ue-title-ref { flex:1; font-weight:600; font-size:12px; }
    .matiere-item { padding:8px 14px 8px 24px; border-bottom:1px solid var(--border); background:white; &:hover { background:#F8FAFC; } }
    @media(max-width:1100px) { .ref-grid { grid-template-columns:1fr 1fr; .ref-col:nth-child(2) { border-right:none; } .ref-col:nth-child(3) { border-top:1px solid var(--border); } } }
    @media(max-width:700px) { .ref-grid { grid-template-columns:1fr; .ref-col { border-right:none; border-bottom:1px solid var(--border); } } }
  `]
})
export class ReferentielComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private refSvc  = inject(ReferentielService);
  private userSvc = inject(UtilisateurService);
  private snack   = inject(MatSnackBar);

  filieres    = signal<Filiere[]>([]);
  promotions  = signal<Promotion[]>([]);
  semestres   = signal<Semestre[]>([]);
  ues         = signal<UE[]>([]);
  enseignants = signal<Utilisateur[]>([]);

  selectedFiliere = signal<Filiere | null>(null);
  selectedPromo   = signal<Promotion | null>(null);
  selectedSem     = signal<Semestre | null>(null);
  openUE          = signal<string | null>(null);
  matiereFormUE   = signal<string | null>(null);

  showFiliereForm = signal(false);
  showPromoForm   = signal(false);
  showSemForm     = signal(false);
  showUEForm      = signal(false);

  filiereForm = this.fb.group({ nom: ['', Validators.required], code: ['', Validators.required], niveau: ['LICENCE', Validators.required], duree: [3, Validators.required] });
  promoForm   = this.fb.group({ nom: ['', Validators.required], anneeAcademique: ['', Validators.required] });
  semForm     = this.fb.group({ numero: [1, Validators.required], anneeAcademique: ['', Validators.required] });
  ueForm      = this.fb.group({ code: ['', Validators.required], intitule: ['', Validators.required], creditsEcts: [3, Validators.required] });
  matiereForm = this.fb.group({ code: ['', Validators.required], intitule: ['', Validators.required], coefficient: [1, [Validators.required, Validators.min(0.1)]], enseignantId: [''] });

  ngOnInit(): void {
    this.refSvc.getFilieres().subscribe(f => this.filieres.set(f));
    this.userSvc.getEnseignants().subscribe(e => this.enseignants.set(e));
  }

  selectFiliere(f: Filiere): void { this.selectedFiliere.set(f); this.selectedPromo.set(null); this.selectedSem.set(null); this.promotions.set([]); this.semestres.set([]); this.ues.set([]); this.refSvc.getPromotions(f.id).subscribe(p => this.promotions.set(p)); }
  selectPromo(p: Promotion): void { this.selectedPromo.set(p); this.selectedSem.set(null); this.semestres.set([]); this.ues.set([]); this.refSvc.getSemestres(p.id).subscribe(s => this.semestres.set(s)); }
  selectSem(s: Semestre): void { this.selectedSem.set(s); this.ues.set([]); this.refSvc.getUEs(s.id).subscribe(u => this.ues.set(u)); }
  toggleUE(id: string): void { this.openUE.update(v => v === id ? null : id); }
  openMatiereForm(ueId: string): void { this.matiereFormUE.set(ueId); this.openUE.set(ueId); }

  toggleSemestre(s: Semestre): void {
    const obs = s.statut === 'OUVERT' ? this.refSvc.cloturerSemestre(s.id) : this.refSvc.rouvrirSemestre(s.id);
    obs.subscribe({ next: updated => { this.semestres.update(list => list.map(x => x.id === updated.id ? updated : x)); this.snack.open(`Semestre ${updated.statut === 'OUVERT' ? 'rouvert' : 'clôturé'}`, 'OK', { duration: 2000, panelClass: 'success-snack' }); } });
  }

  createFiliere(): void {
    if (this.filiereForm.invalid) return;
    this.refSvc.createFiliere(this.filiereForm.value).subscribe({ next: f => { this.filieres.update(l => [...l, f]); this.filiereForm.reset({ niveau:'LICENCE', duree:3 }); this.showFiliereForm.set(false); this.snack.open('Filière créée', 'OK', { duration: 2000, panelClass: 'success-snack' }); }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
  }
  createPromotion(): void {
    if (this.promoForm.invalid || !this.selectedFiliere()) return;
    const data = { ...this.promoForm.value, filiereId: this.selectedFiliere()!.id };
    this.refSvc.createPromotion(data).subscribe({ next: p => { this.promotions.update(l => [...l, p]); this.promoForm.reset(); this.showPromoForm.set(false); this.snack.open('Promotion créée', 'OK', { duration: 2000, panelClass: 'success-snack' }); }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
  }
  createSemestre(): void {
    if (this.semForm.invalid || !this.selectedPromo()) return;
    const data = { ...this.semForm.value, promotionId: this.selectedPromo()!.id };
    this.refSvc.createSemestre(data).subscribe({ next: s => { this.semestres.update(l => [...l, s]); this.semForm.reset(); this.showSemForm.set(false); this.snack.open('Semestre créé', 'OK', { duration: 2000, panelClass: 'success-snack' }); }, error: e => this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }) });
  }
  createUE(): void {
    if (this.ueForm.invalid || !this.selectedSem()) return;
    const data = { ...this.ueForm.value, semestreId: this.selectedSem()!.id };
    this.refSvc.createUE(data).subscribe({ next: ue => { this.ues.update(l => [...l, { ...ue, matieres: [] }]); this.ueForm.reset({ creditsEcts: 3 }); this.showUEForm.set(false); this.snack.open('UE créée', 'OK', { duration: 2000, panelClass: 'success-snack' }); } });
  }
  createMatiere(ueId: string): void {
    if (this.matiereForm.invalid) return;
    const data = { ...this.matiereForm.value, ueId };
    this.refSvc.createMatiere(data).subscribe({ next: m => {
      this.ues.update(ues => ues.map(ue => ue.id === ueId ? { ...ue, matieres: [...ue.matieres, m] } : ue));
      this.matiereForm.reset({ coefficient: 1 }); this.matiereFormUE.set(null);
      this.snack.open('Matière créée', 'OK', { duration: 2000, panelClass: 'success-snack' });
    } });
  }
}
