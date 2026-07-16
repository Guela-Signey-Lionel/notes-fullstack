import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { ReferentielService } from '../../core/services/referentiel.service';
import { MoyenneService } from '../../core/services/moyenne.service';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { Utilisateur, Promotion, Semestre, MoyenneResponse } from '../../core/models';

@Component({
  selector: 'app-etudiants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
            MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
            MatProgressSpinnerModule, MatTooltipModule, MatSelectModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <div><h1>Étudiants</h1><p>{{totalElements()}} étudiant(s) enregistré(s)</p></div>
        <div class="page-actions">
          @if (isAdmin()) {
            <label mat-stroked-button style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid currentColor;border-radius:4px;font-size:14px">
              <i class="fas fa-upload"></i> Import CSV
              <input type="file" accept=".csv" style="display:none" (change)="onImportCSV($event)">
            </label>
          }
        </div>
      </div>

      <!-- Recherche + filtre semestre pour relevé -->
      <div class="card" style="padding:16px;margin-bottom:20px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <mat-form-field appearance="outline" style="flex:1;min-width:240px">
            <mat-label>Rechercher</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [formControl]="searchCtrl" placeholder="Nom, prénom, numéro étudiant...">
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:220px">
            <mat-label>Promotion</mat-label>
            <mat-select [(value)]="filterPromo" (selectionChange)="onPromoFilter($event.value)">
              <mat-option [value]="null">Toutes les promotions</mat-option>
              @for (p of promotions(); track p.id) {
                <mat-option [value]="p">{{p.nom}}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Tableau étudiants -->
      <div class="table-container">
        @if (loading()) { <div class="loading-center"><mat-spinner /></div> }
        <table mat-table [dataSource]="etudiants()">

          <ng-container matColumnDef="numero">
            <th mat-header-cell *matHeaderCellDef>N° Étudiant</th>
            <td mat-cell *matCellDef="let e">
              <code style="background:var(--primary-pale);color:var(--primary);padding:2px 6px;border-radius:4px;font-size:12px">
                {{e.numeroEtudiant}}
              </code>
            </td>
          </ng-container>

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Étudiant</th>
            <td mat-cell *matCellDef="let e">
              <div style="display:flex;align-items:center;gap:10px">
                <div class="e-avatar">{{e.prenom?.[0]}}{{e.nom?.[0]}}</div>
                <div>
                  <div style="font-weight:600;font-size:13px">{{e.prenom}} {{e.nom}}</div>
                  <div style="font-size:11px;color:var(--muted)">{{e.email}}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let e">
              <span class="badge" [class]="e.actif ? 'active' : 'inactive'">
                {{e.actif ? 'Actif' : 'Inactif'}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let e">
              <button mat-icon-button matTooltip="Voir l'historique des moyennes"
                      (click)="loadHistorique(e)">
                <i class="fas fa-chart-bar"></i>
              </button>
              @if (selectedEtudiant()?.id === e.id && semestres().length > 0) {
                <mat-select style="width:160px;font-size:12px;margin:0 6px" placeholder="Semestre"
                            [(value)]="selectedSemForReleve" (selectionChange)="selectedSemForReleve = $event.value">
                  @for (s of semestres(); track s.id) {
                    <mat-option [value]="s">S{{s.numero}} — {{s.anneeAcademique}}</mat-option>
                  }
                </mat-select>
                @if (selectedSemForReleve) {
                  <button mat-icon-button color="primary" matTooltip="Télécharger relevé PDF"
                          (click)="downloadReleve(e)">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                }
              }
              @if (isAdmin()) {
                <button mat-icon-button [color]="e.actif ? 'warn' : 'primary'"
                        [matTooltip]="e.actif ? 'Désactiver' : 'Activer'"
                        (click)="toggleActif(e)">
                  <i class="fas" [class.fa-user-slash]="e.actif" [class.fa-user]="!e.actif"></i>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"
              [class.selected-row]="selectedEtudiant()?.id === row.id"></tr>
          <tr *matNoDataRow>
            <td [attr.colspan]="cols.length">
              <div class="empty-state"><span class="empty-icon">🎓</span>
                <h3>Aucun étudiant</h3><p>Aucun résultat pour cette recherche</p></div>
            </td>
          </tr>
        </table>
        <mat-paginator [length]="totalElements()" [pageSize]="20"
                       [pageSizeOptions]="[10,20,50]" (page)="onPage($event)" showFirstLastButtons />
      </div>

      <!-- Panel historique -->
      @if (selectedEtudiant() && historique().length > 0) {
        <div class="card" style="margin-top:20px">
          <div class="card-header">
            <h2>📈 Historique — {{selectedEtudiant()!.prenom}} {{selectedEtudiant()!.nom}}</h2>
            <button mat-icon-button (click)="selectedEtudiant.set(null)"><i class="fas fa-times"></i></button>
          </div>
          <div class="historique-grid">
            @for (h of historique(); track h.semestreId) {
              <div class="histo-card" [class.valide]="h.valide" [class.ajourne]="!h.valide">
                <div class="histo-sem">Semestre {{h.semestreNumero}}</div>
                <div class="histo-moy">{{h.moyenne != null ? (h.moyenne | number:'1.2-2') : '—'}}/20</div>
                <span class="badge" [class]="mentionCss(h.mention)">{{h.mention?.replace('_',' ') ?? '—'}}</span>
                <div class="histo-credits">{{h.creditsObtenus}} ECTS</div>
                <span class="badge" [class]="h.valide ? 'active' : 'inactive'" style="font-size:10px">
                  {{h.valide ? 'Admis' : 'Ajourné'}}
                </span>
              </div>
            }
          </div>
        </div>
      }
      @if (loadingHisto()) { <div class="loading-center" style="margin-top:20px"><mat-spinner /></div> }
    </div>
  `,
  styles: [`
    .e-avatar { width:34px; height:34px; border-radius:50%; background:var(--primary-pale); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0; }
    .selected-row { background:var(--primary-pale) !important; }
    .historique-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }
    .histo-card { background:var(--bg); border-radius:8px; border:1px solid var(--border); padding:14px; display:flex; flex-direction:column; align-items:center; gap:6px; text-align:center;
      &.valide { border-color:#BBF7D0; background:#F0FDF4; } &.ajourne { border-color:#FCA5A5; background:#FEF2F2; } }
    .histo-sem { font-size:11px; font-weight:700; text-transform:uppercase; color:var(--muted); }
    .histo-moy { font-size:22px; font-weight:800; color:var(--primary); }
    .histo-credits { font-size:11px; color:var(--muted); }
  `]
})
export class EtudiantsComponent implements OnInit {
  private userSvc    = inject(UtilisateurService);
  private refSvc     = inject(ReferentielService);
  private moyenneSvc = inject(MoyenneService);
  private exportSvc  = inject(ExportService);
  private authSvc    = inject(AuthService);
  private snack      = inject(MatSnackBar);

  etudiants       = signal<Utilisateur[]>([]);
  totalElements   = signal(0);
  promotions      = signal<Promotion[]>([]);
  semestres       = signal<Semestre[]>([]);
  historique      = signal<MoyenneResponse[]>([]);
  selectedEtudiant = signal<Utilisateur | null>(null);
  loading         = signal(false);
  loadingHisto    = signal(false);

  filterPromo: Promotion | null = null;
  selectedSemForReleve: Semestre | null = null;
  searchCtrl = new FormControl('');
  cols = ['numero','nom','statut','actions'];
  isAdmin = () => this.authSvc.hasRole('ADMIN');

  ngOnInit(): void {
    this.load();
    this.refSvc.getPromotions().subscribe(p => this.promotions.set(p));
    this.searchCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.load());
  }

  load(page = 0): void {
    this.loading.set(true);
    this.userSvc.getEtudiants(page, 20, this.searchCtrl.value ?? '').subscribe({
      next: r => { this.etudiants.set(r.content); this.totalElements.set(r.totalElements); this.loading.set(false); }
    });
  }

  onPage(e: PageEvent): void { this.load(e.pageIndex); }

  onPromoFilter(p: Promotion | null): void {
    this.filterPromo = p;
    if (p) { this.refSvc.getSemestres(p.id).subscribe(s => this.semestres.set(s)); }
    else     { this.semestres.set([]); }
  }

  loadHistorique(e: Utilisateur): void {
    if (this.selectedEtudiant()?.id === e.id) { this.selectedEtudiant.set(null); return; }
    this.selectedEtudiant.set(e);
    this.selectedSemForReleve = null;
    this.loadingHisto.set(true);
    this.moyenneSvc.getHistorique(e.id).subscribe({
      next: h => { this.historique.set(h); this.loadingHisto.set(false); },
      error: () => { this.historique.set([]); this.loadingHisto.set(false); }
    });
  }

  downloadReleve(e: Utilisateur): void {
    if (!this.selectedSemForReleve) return;
    this.exportSvc.releve(e.id, this.selectedSemForReleve.id).subscribe({
      next: blob => this.exportSvc.download(blob, `releve-${e.numeroEtudiant}-S${this.selectedSemForReleve!.numero}.pdf`),
      error: () => this.snack.open('Erreur génération relevé', 'OK', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  toggleActif(e: Utilisateur): void {
    this.userSvc.toggleActif(e.id).subscribe({
      next: () => { this.snack.open(e.actif ? 'Compte désactivé' : 'Compte activé', 'OK', { duration: 2000, panelClass: 'success-snack' }); this.load(); }
    });
  }

  onImportCSV(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const promo = this.filterPromo;
    if (!file || !promo) { this.snack.open('Sélectionnez une promotion d\'abord', 'OK', { duration: 3000 }); return; }
    this.userSvc.importCSV(file, promo.id).subscribe({
      next: () => { this.snack.open('Import réussi', 'OK', { duration: 3000, panelClass: 'success-snack' }); this.load(); },
      error: e => this.snack.open(e.error?.message || 'Erreur import', 'OK', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  mentionCss(m?: string): string {
    return { TRES_BIEN:'tres-bien', BIEN:'bien', ASSEZ_BIEN:'assez-bien', PASSABLE:'passable', AJOURNE:'ajourne' }[m ?? ''] ?? '';
  }
}
