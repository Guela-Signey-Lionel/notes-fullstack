import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ReferentielService } from '../../core/services/referentiel.service';
import { MoyenneService } from '../../core/services/moyenne.service';
import { ExportService } from '../../core/services/export.service';
import { Promotion, Semestre, ClassementResponse, MoyenneResponse } from '../../core/models';

@Component({
  selector: 'app-moyennes',
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatButtonModule, MatIconModule, MatFormFieldModule,
            MatSelectModule, MatTableModule, MatProgressSpinnerModule,
            MatExpansionModule, MatTooltipModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <div><h1>Moyennes & Classements</h1><p>Résultats semestriels et classements par promotion</p></div>
      </div>

      <!-- Sélecteurs -->
      <div class="card" style="padding:16px;margin-bottom:20px">
        <div class="form-grid cols-3">
          <mat-form-field appearance="outline">
            <mat-label>Promotion</mat-label>
            <mat-select [(value)]="selectedPromo" (selectionChange)="onPromoChange($event.value)">
              @for (p of promotions(); track p.id) {
                <mat-option [value]="p">{{p.nom}} — {{p.anneeAcademique}}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Semestre</mat-label>
            <mat-select [(value)]="selectedSem" [disabled]="!selectedPromo"
                        (selectionChange)="selectedSem = $event.value">
              @for (s of semestres(); track s.id) {
                <mat-option [value]="s">Semestre {{s.numero}} — {{s.anneeAcademique}}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <div style="display:flex;gap:8px;align-items:center">
            <button mat-raised-button color="primary" (click)="loadClassement()"
                    [disabled]="!selectedPromo || !selectedSem || loading()">
              @if (loading()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner> }
              <mat-icon>calculate</mat-icon> Calculer
            </button>
            @if (classement()) {
              <button mat-stroked-button (click)="exportExcel()">
                <mat-icon>download</mat-icon> Excel
              </button>
            }
          </div>
        </div>
      </div>

      @if (classement()) {
        <!-- Résumé rapide -->
        <div class="kpi-grid kpi-grid-4cols" style="margin-bottom:20px">
          <div class="kpi-card">
            <div class="kpi-icon purple">👥</div>
            <div><div class="kpi-value">{{classement()!.totalEtudiants}}</div><div class="kpi-label">Étudiants</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon green">✅</div>
            <div><div class="kpi-value">{{admis()}}</div><div class="kpi-label">Admis</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon red">❌</div>
            <div><div class="kpi-value">{{ajournes()}}</div><div class="kpi-label">Ajournés</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon orange">📊</div>
            <div><div class="kpi-value">{{tauxReussite() | number:'1.0-1'}}%</div><div class="kpi-label">Taux réussite</div></div>
          </div>
        </div>

        <!-- Tableau classement -->
        <div class="table-container">
          <table mat-table [dataSource]="classement()!.classement" style="width:100%">
            <ng-container matColumnDef="rang">
              <th mat-header-cell *matHeaderCellDef style="width:60px;text-align:center">Rang</th>
              <td mat-cell *matCellDef="let m" style="text-align:center">
                <span class="rang-badge" [class.gold]="m.rang===1" [class.silver]="m.rang===2" [class.bronze]="m.rang===3">
                  {{m.rang===1?'🥇':m.rang===2?'🥈':m.rang===3?'🥉':m.rang}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="etudiant">
              <th mat-header-cell *matHeaderCellDef>Étudiant</th>
              <td mat-cell *matCellDef="let m">
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="e-avatar">{{m.etudiantNom?.split(' ')[0]?.[0]}}{{m.etudiantNom?.split(' ')[1]?.[0]}}</div>
                  <div>
                    <div style="font-weight:600;font-size:13px">{{m.etudiantNom}}</div>
                    <div style="font-size:11px;color:var(--muted)">{{m.numeroEtudiant}}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="moyenne">
              <th mat-header-cell *matHeaderCellDef>Moyenne /20</th>
              <td mat-cell *matCellDef="let m">
                <span class="moy-val" [style.color]="moyColor(m.moyenne)">
                  {{m.moyenne != null ? (m.moyenne | number:'1.2-2') : '—'}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="mention">
              <th mat-header-cell *matHeaderCellDef>Mention</th>
              <td mat-cell *matCellDef="let m">
                <span class="badge" [class]="mentionCss(m.mention)">
                  {{m.mention?.replace('_',' ') ?? '—'}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="credits">
              <th mat-header-cell *matHeaderCellDef>Crédits</th>
              <td mat-cell *matCellDef="let m">{{m.creditsObtenus}} ECTS</td>
            </ng-container>

            <ng-container matColumnDef="resultat">
              <th mat-header-cell *matHeaderCellDef>Résultat</th>
              <td mat-cell *matCellDef="let m">
                <span class="badge" [class]="m.valide ? 'active' : 'inactive'">
                  {{m.valide ? 'ADMIS(E)' : 'AJOURNÉ(E)'}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let m">
                <button mat-icon-button matTooltip="Voir le détail" (click)="toggleDetail(m)">
                  <mat-icon>{{openDetail() === m.etudiantId ? 'expand_less' : 'expand_more'}}</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Télécharger relevé PDF" color="primary"
                        (click)="downloadReleve(m)">
                  <mat-icon>picture_as_pdf</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"
                [class.admis-row]="row.valide" [class.ajourne-row]="!row.valide"></tr>

            <!-- Détail expandable -->
            <ng-container matColumnDef="detail">
              <td mat-cell *matCellDef="let m" [attr.colspan]="cols.length">
                @if (openDetail() === m.etudiantId && m.moyennesUE?.length) {
                  <div class="detail-panel">
                    @for (ue of m.moyennesUE; track ue.ueId) {
                      <div class="ue-section">
                        <div class="ue-header">
                          <span class="ue-code">{{ue.ueCode}}</span>
                          <span class="ue-title">{{ue.ueIntitule}}</span>
                          <span class="badge" [class]="ue.validee ? 'active' : 'inactive'" style="font-size:10px">
                            {{ue.validee ? '✓' : '✗'}} {{ue.moyenneUE | number:'1.2-2'}}/20
                          </span>
                          <span style="font-size:11px;color:var(--muted)">{{ue.creditsEcts}} ECTS</span>
                        </div>
                        <div class="matieres-grid">
                          @for (nd of ue.notes; track nd.matiereId) {
                            <div class="matiere-row">
                              <span>{{nd.matiereCode}} — {{nd.matiereIntitule}}</span>
                              <span style="color:var(--muted);font-size:11px">Coeff {{nd.coefficient}}</span>
                              @if (nd.noteCC != null) { <span class="note-chip cc">CC: {{nd.noteCC}}</span> }
                              @if (nd.noteExamen != null) { <span class="note-chip exam">Exam: {{nd.noteExamen}}</span> }
                              <span class="note-chip finale" [class.passing]="nd.notefinale != null && nd.notefinale >= 10" [class.failing]="nd.notefinale != null && nd.notefinale < 10">
                                {{nd.notefinale != null ? (nd.notefinale | number:'1.2-2') : '—'}}/20
                              </span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </td>
            </ng-container>
            <tr mat-row *matRowDef="let row; columns: ['detail'];"
                [class.detail-row]="true" [hidden]="openDetail() !== row.etudiantId"></tr>
          </table>
        </div>
      }

      @if (!classement() && !loading()) {
        <div class="empty-state card">
          <span class="empty-icon">🧮</span>
          <h3>Sélectionnez une promotion et un semestre</h3>
          <p>Les classements et moyennes seront calculés et affichés ici</p>
        </div>
      }
      @if (loading()) { <div class="loading-center"><mat-spinner /></div> }
    </div>
  `,
  styles: [`
    .e-avatar { width:34px; height:34px; border-radius:50%; background:var(--primary-pale); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0; }
    .rang-badge { font-size:15px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; width:28px; &.gold { color:#F59E0B; } &.silver { color:#94A3B8; } &.bronze { color:#D97706; } }
    .moy-val { font-size:16px; font-weight:700; }
    .admis-row { background:#F0FDF4 !important; }
    .ajourne-row { background:#FEF2F2 !important; }
    .detail-row td { padding:0 !important; }
    .detail-panel { padding:16px; background:#F8FAFC; border-top:1px solid var(--border); }
    .ue-section { margin-bottom:12px; }
    .ue-header { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
    .ue-code { background:var(--primary); color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; }
    .ue-title { font-weight:600; font-size:13px; }
    .matieres-grid { display:flex; flex-direction:column; gap:4px; padding-left:16px; }
    .matiere-row { display:flex; align-items:center; gap:10px; font-size:12px; }
    .note-chip { padding:2px 8px; border-radius:4px; font-weight:600; font-size:11px; &.cc { background:#EFF6FF; color:#3B82F6; } &.exam { background:#F5F3FF; color:#7C3AED; } &.finale { border-radius:4px; &.passing { background:var(--tres-bien-bg, #D1FAE5); color:var(--tres-bien, #059669); } &.failing { background:var(--ajourne-bg, #FEE2E2); color:var(--ajourne, #DC2626); } } }
  `]
})
export class MoyennesComponent implements OnInit {
  private auth      = inject(AuthService);
  private refSvc    = inject(ReferentielService);
  private moyenneSvc= inject(MoyenneService);
  private exportSvc = inject(ExportService);
  private snack     = inject(MatSnackBar);

  promotions  = signal<Promotion[]>([]);
  semestres   = signal<Semestre[]>([]);
  classement  = signal<ClassementResponse | null>(null);
  loading     = signal(false);
  openDetail  = signal<string | null>(null);

  selectedPromo: Promotion | null = null;
  selectedSem:   Semestre  | null = null;
  cols = ['rang','etudiant','moyenne','mention','credits','resultat','actions'];

  admis        = () => this.classement()?.classement.filter(m => m.valide).length ?? 0;
  ajournes     = () => (this.classement()?.totalEtudiants ?? 0) - this.admis();
  tauxReussite = () => {
    const t = this.classement()?.totalEtudiants ?? 0;
    return t > 0 ? (this.admis() / t) * 100 : 0;
  };

  ngOnInit(): void {
    this.refSvc.getPromotions().subscribe(p => this.promotions.set(p));
    // Si étudiant → charger directement son historique
    if (this.auth.hasRole('ETUDIANT')) {
      const uid = this.auth.currentUser()?.id;
      if (uid) this.moyenneSvc.getHistorique(uid).subscribe(h => {
        // Afficher l'historique étudiant si disponible
      });
    }
  }

  onPromoChange(p: Promotion): void {
    this.selectedSem = null; this.semestres.set([]); this.classement.set(null);
    this.refSvc.getSemestres(p.id).subscribe(s => this.semestres.set(s));
  }

  loadClassement(): void {
    if (!this.selectedPromo || !this.selectedSem) return;
    this.loading.set(true); this.classement.set(null);
    this.moyenneSvc.getClassement(this.selectedPromo.id, this.selectedSem.id).subscribe({
      next: c => { this.classement.set(c); this.loading.set(false); },
      error: e => { this.snack.open(e.error?.message || 'Erreur calcul', 'OK', { duration: 3000, panelClass: 'error-snack' }); this.loading.set(false); }
    });
  }

  toggleDetail(m: MoyenneResponse): void {
    if (this.openDetail() === m.etudiantId) { this.openDetail.set(null); return; }
    // Charger le détail complet si besoin
    if (!m.moyennesUE && this.selectedSem) {
      this.moyenneSvc.getMoyenne(m.etudiantId, this.selectedSem.id).subscribe(full => {
        const list = this.classement()!.classement;
        const idx = list.findIndex(x => x.etudiantId === m.etudiantId);
        if (idx >= 0) { list[idx] = full; this.classement.update(c => c ? { ...c, classement: [...list] } : c); }
        this.openDetail.set(m.etudiantId);
      });
    } else {
      this.openDetail.set(m.etudiantId);
    }
  }

  downloadReleve(m: MoyenneResponse): void {
    if (!this.selectedSem) return;
    this.exportSvc.releve(m.etudiantId, this.selectedSem.id).subscribe({
      next: blob => this.exportSvc.download(blob, `releve-${m.numeroEtudiant}-S${this.selectedSem!.numero}.pdf`),
      error: () => this.snack.open('Erreur génération PDF', 'OK', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  exportExcel(): void {
    if (!this.selectedPromo || !this.selectedSem) return;
    this.exportSvc.classementExcel(this.selectedPromo.id, this.selectedSem.id).subscribe(blob =>
      this.exportSvc.download(blob, `classement-${this.selectedPromo!.nom}-S${this.selectedSem!.numero}.xlsx`));
  }

  mentionCss(m?: string): string {
    return { TRES_BIEN:'tres-bien', BIEN:'bien', ASSEZ_BIEN:'assez-bien', PASSABLE:'passable', AJOURNE:'ajourne' }[m ?? ''] ?? '';
  }
  moyColor(v?: number): string {
    if (v == null) return 'var(--muted)';
    if (v >= 14) return 'var(--success)'; if (v >= 10) return 'var(--primary-light)'; return 'var(--danger)';
  }
}
