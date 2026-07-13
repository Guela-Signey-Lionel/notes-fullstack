import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ReferentielService } from '../../core/services/referentiel.service';
import { NoteService } from '../../core/services/note.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { MoyenneService } from '../../core/services/moyenne.service';
import { Promotion, Semestre, Matiere, Note, Utilisateur, CsvImportResponse, StatsResponse } from '../../core/models';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule,
            MatExpansionModule, MatTableModule, MatTooltipModule, MatDividerModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <div><h1>Saisie des notes</h1><p>Saisie individuelle, par lot ou import CSV</p></div>
      </div>

      <!-- Sélecteur filière → semestre → matière -->
      <div class="card" style="margin-bottom:20px;padding:16px">
        <div class="form-grid cols-3">
          <mat-form-field appearance="outline">
            <mat-label>Promotion</mat-label>
            <mat-select [(value)]="selectedPromo" (selectionChange)="onPromoChange($event.value)">
              @for (p of promotions(); track p.id) {
                <mat-option [value]="p">{{p.nom}} ({{p.anneeAcademique}})</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Semestre</mat-label>
            <mat-select [(value)]="selectedSem" (selectionChange)="onSemChange($event.value)" [disabled]="!selectedPromo">
              @for (s of semestres(); track s.id) {
                <mat-option [value]="s">
                  Sem. {{s.numero}} — {{s.anneeAcademique}}
                  <span class="badge" [class]="s.statut === 'OUVERT' ? 'ouvert' : 'cloture'" style="margin-left:8px;font-size:10px">{{s.statut}}</span>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Matière</mat-label>
            <mat-select [(value)]="selectedMatiere" (selectionChange)="onMatiereChange($event.value)" [disabled]="!selectedSem">
              @for (m of matieres(); track m.id) {
                <mat-option [value]="m">{{m.code}} — {{m.intitule}} (Coeff: {{m.coefficient}})</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      @if (selectedMatiere && selectedSem) {
        <!-- Onglets actions -->
        <div class="actions-tabs">
          <button [class.active]="activeTab() === 'batch'" (click)="activeTab.set('batch')">
            <mat-icon>table_rows</mat-icon> Saisie par lot
          </button>
          <button [class.active]="activeTab() === 'csv'" (click)="activeTab.set('csv')">
            <mat-icon>upload_file</mat-icon> Import CSV
          </button>
          <button [class.active]="activeTab() === 'notes'" (click)="activeTab.set('notes'); loadNotes()">
            <mat-icon>list</mat-icon> Notes saisies
          </button>
          <button [class.active]="activeTab() === 'stats'" (click)="activeTab.set('stats'); loadStats()">
            <mat-icon>bar_chart</mat-icon> Statistiques
          </button>
        </div>

        <!-- TAB 1 : Saisie par lot -->
        @if (activeTab() === 'batch') {
          <div class="card">
            <div class="card-header">
              <h2>Saisie groupée — {{selectedMatiere.intitule}}</h2>
              <div style="display:flex;gap:8px">
                <mat-form-field appearance="outline" style="width:160px">
                  <mat-label>Type de note</mat-label>
                  <mat-select [(value)]="typeNoteBatch">
                    <mat-option value="UNIQUE">Note unique</mat-option>
                    <mat-option value="CC">CC (40%)</mat-option>
                    <mat-option value="EXAMEN">Examen (60%)</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="submitBatch()" [disabled]="savingBatch()">
                  @if (savingBatch()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner> }
                  <mat-icon>save</mat-icon> Enregistrer tout
                </button>
                <button mat-stroked-button color="warn" (click)="verrouillerMatiere()" [disabled]="selectedSem.statut === 'CLOTURE'">
                  <mat-icon>lock</mat-icon> Verrouiller
                </button>
                <button mat-stroked-button (click)="exportNotesExcel()">
                  <mat-icon>download</mat-icon> Excel
                </button>
              </div>
            </div>

            @if (loadingEtudiants()) {
              <div class="loading-center"><mat-spinner /></div>
            } @else {
              <form [formGroup]="batchForm">
                <table mat-table [dataSource]="batchRows" style="width:100%">
                  <ng-container matColumnDef="numero">
                    <th mat-header-cell *matHeaderCellDef>N° Étudiant</th>
                    <td mat-cell *matCellDef="let row">{{row.etudiant.numeroEtudiant}}</td>
                  </ng-container>
                  <ng-container matColumnDef="nom">
                    <th mat-header-cell *matHeaderCellDef>Nom complet</th>
                    <td mat-cell *matCellDef="let row; let i = index">
                      <div style="display:flex;align-items:center;gap:8px">
                        <div class="e-avatar">{{row.etudiant.prenom?.[0]}}{{row.etudiant.nom?.[0]}}</div>
                        {{row.etudiant.prenom}} {{row.etudiant.nom}}
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="statut">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let row; let i = index">
                      <mat-select [formControl]="getStatutCtrl(i)" style="font-size:13px">
                        <mat-option value="PRESENT">Présent</mat-option>
                        <mat-option value="ABSENT">Absent</mat-option>
                        <mat-option value="DISPENSE">Dispensé</mat-option>
                      </mat-select>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="note">
                    <th mat-header-cell *matHeaderCellDef>Note /20</th>
                    <td mat-cell *matCellDef="let row; let i = index">
                      <input type="number" class="note-input" [formControl]="getNoteCtrl(i)"
                             min="0" max="20" step="0.25" placeholder="—"
                             [disabled]="getStatutCtrl(i).value !== 'PRESENT'">
                      <span class="note-mention" [class]="getMentionClass(getNoteCtrl(i).value)">
                        {{getMentionLabel(getNoteCtrl(i).value)}}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="commentaire">
                    <th mat-header-cell *matHeaderCellDef>Commentaire</th>
                    <td mat-cell *matCellDef="let row; let i = index">
                      <input type="text" class="comment-input" [formControl]="getCommentCtrl(i)" placeholder="Facultatif">
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="batchCols"></tr>
                  <tr mat-row *matRowDef="let row; columns: batchCols;"
                      [class.absent-row]="getStatutCtrl(batchRows.indexOf(row)).value !== 'PRESENT'"></tr>
                  <tr *matNoDataRow>
                    <td [attr.colspan]="batchCols.length">
                      <div class="empty-state"><span class="empty-icon">👥</span><p>Aucun étudiant dans cette promotion</p></div>
                    </td>
                  </tr>
                </table>
              </form>
            }
          </div>
        }

        <!-- TAB 2 : Import CSV -->
        @if (activeTab() === 'csv') {
          <div class="card">
            <div class="card-header"><h2>Import CSV — {{selectedMatiere.intitule}}</h2></div>
            <div class="csv-zone">
              <div class="csv-info">
                <mat-icon style="font-size:36px;color:var(--muted)">upload_file</mat-icon>
                <h3>Format attendu</h3>
                <code>numero_etudiant;note;commentaire</code>
                <p style="color:var(--muted);font-size:12px">La première ligne (en-tête) sera ignorée</p>
              </div>
              <div class="csv-actions">
                <input type="file" #csvInput accept=".csv" style="display:none" (change)="onCsvSelected($event)">
                <button mat-raised-button color="primary" (click)="csvInput.click()">
                  <mat-icon>attach_file</mat-icon> Choisir un fichier CSV
                </button>
                @if (csvFile()) {
                  <div class="csv-file-info">
                    <mat-icon>description</mat-icon> {{csvFile()!.name}}
                    <button mat-stroked-button color="primary" (click)="importCSV()" [disabled]="importingCSV()">
                      @if (importingCSV()) { <mat-spinner diameter="16" style="display:inline-block;margin-right:6px"></mat-spinner> }
                      Importer
                    </button>
                  </div>
                }
              </div>
            </div>
            @if (csvResult()) {
              <div class="csv-result" [class.has-errors]="csvResult()!.erreurs > 0">
                <div class="csv-result-header">
                  <span>✅ {{csvResult()!.importees}} importées</span>
                  <span>❌ {{csvResult()!.erreurs}} erreurs</span>
                  <span>📊 {{csvResult()!.totalLignes}} lignes au total</span>
                </div>
                @if (csvResult()!.rapportErreurs.length) {
                  <div class="error-list">
                    @for (err of csvResult()!.rapportErreurs; track $index) {
                      <div class="error-item">⚠️ {{err}}</div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- TAB 3 : Statistiques -->
        @if (activeTab() === 'stats') {
          <div class="card">
            <div class="card-header">
              <h2>📊 Statistiques — {{selectedMatiere.intitule}}</h2>
              <button mat-stroked-button routerLink="/moyennes">
                <mat-icon>open_in_new</mat-icon> Voir le classement
              </button>
            </div>
            @if (loadingStats()) {
              <div class="loading-center"><mat-spinner /></div>
            } @else if (statsData()) {
              <div class="kpi-grid">
                <div class="kpi-card">
                  <div class="kpi-icon blue">📊</div>
                  <div><div class="kpi-value">{{statsData()!.moyenne | number:'1.2-2'}}</div><div class="kpi-label">Moyenne /20</div></div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-icon green">📈</div>
                  <div><div class="kpi-value">{{statsData()!.max | number:'1.2-2'}}</div><div class="kpi-label">Note max</div></div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-icon orange">📉</div>
                  <div><div class="kpi-value">{{statsData()!.min | number:'1.2-2'}}</div><div class="kpi-label">Note min</div></div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-icon red">⚖️</div>
                  <div><div class="kpi-value">{{statsData()!.ecartType | number:'1.2-2'}}</div><div class="kpi-label">Écart-type</div></div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-icon purple">👥</div>
                  <div><div class="kpi-value">{{statsData()!.totalEtudiants}}</div><div class="kpi-label">Étudiants</div></div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-icon teal">🎯</div>
                  <div><div class="kpi-value">{{statsData()!.tauxReussite | number:'1.0-0'}}%</div><div class="kpi-label">Taux réussite</div></div>
                </div>
              </div>

              <!-- Distribution des mentions -->
              @if (statsData()!.distributionMentions) {
                <h3 style="font-size:14px;font-weight:600;margin:16px 0 8px;color:var(--text)">Distribution des mentions</h3>
                <div class="stats-distrib">
                  @for (item of mentionDistribution(); track item.label) {
                    <div class="distrib-item">
                      <span class="badge" [class]="item.css">{{item.label}}</span>
                      <div class="distrib-bar-wrap">
                        <div class="distrib-bar" [style.width.%]="item.pct" [style.background]="item.color"></div>
                      </div>
                      <span class="distrib-count">{{item.count}}</span>
                    </div>
                  }
                </div>
              }
            } @else {
              <div class="empty-state" style="padding:32px">
                <span class="empty-icon">📊</span>
                <h3>Aucune statistique disponible</h3>
                <p>Saisissez d'abord des notes pour cette matière</p>
              </div>
            }
          </div>
        }

        <!-- TAB 4 : Notes saisies -->
        @if (activeTab() === 'notes') {
          <div class="card">
            <div class="card-header">
              <h2>Notes saisies — {{selectedMatiere.intitule}}</h2>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:12px;color:var(--muted)">{{notes().length}} note(s)</span>
                <button mat-stroked-button (click)="exportNotesExcel()">
                  <mat-icon>download</mat-icon> Excel
                </button>
              </div>
            </div>
            @if (loadingNotes()) {
              <div class="loading-center"><mat-spinner /></div>
            } @else {
              <table mat-table [dataSource]="notes()" style="width:100%">
                <ng-container matColumnDef="numero">
                  <th mat-header-cell *matHeaderCellDef>N° Étudiant</th>
                  <td mat-cell *matCellDef="let n">{{n.numeroEtudiant}}</td>
                </ng-container>
                <ng-container matColumnDef="nom">
                  <th mat-header-cell *matHeaderCellDef>Étudiant</th>
                  <td mat-cell *matCellDef="let n">{{n.etudiantNom}}</td>
                </ng-container>
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let n">
                    <span class="badge" [class]="n.typeNote === 'CC' ? 'passable' : n.typeNote === 'EXAMEN' ? 'bien' : 'active'">
                      {{n.typeNote}}
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="valeur">
                  <th mat-header-cell *matHeaderCellDef>Note /20</th>
                  <td mat-cell *matCellDef="let n">
                    <span [style.fontWeight]="'700'" [style.color]="getColor(n.valeur)">
                      {{n.valeur != null ? (n.valeur | number:'1.2-2') : '—'}}
                    </span>
                    @if (n.statut !== 'PRESENT') {
                      <span class="badge inactive" style="margin-left:6px;font-size:10px">{{n.statut}}</span>
                    }
                  </td>
                </ng-container>
                <ng-container matColumnDef="verrou">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let n">
                    <span class="badge" [class]="n.verrouille ? 'inactive' : 'ouvert'">
                      {{n.verrouille ? '🔒 Verrouillée' : '🔓 Modifiable'}}
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date saisie</th>
                  <td mat-cell *matCellDef="let n" style="font-size:12px;color:var(--muted)">{{n.dateSaisie | date:'dd/MM/yy HH:mm'}}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="notesCols"></tr>
                <tr mat-row *matRowDef="let row; columns: notesCols;"></tr>
                <tr *matNoDataRow><td [attr.colspan]="notesCols.length"><div class="empty-state"><p>Aucune note saisie</p></div></td></tr>
              </table>
            }
          </div>
        }
      }

      @if (!selectedMatiere) {
        <div class="empty-state card">
          <span class="empty-icon">✏️</span>
          <h3>Sélectionnez une promotion, un semestre et une matière</h3>
          <p>Pour commencer la saisie des notes</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .actions-tabs { display:flex; gap:0; margin-bottom:20px; background:white; border-radius:var(--radius); border:1px solid var(--border); overflow:hidden; box-shadow:var(--shadow);
      button { flex:1; padding:12px; border:none; background:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; font-size:13px; font-weight:500; color:var(--muted); border-right:1px solid var(--border); transition:.15s;
        &:last-child { border-right:none; } &:hover { background:var(--bg); } &.active { background:var(--primary); color:white; } mat-icon { font-size:18px; width:18px; height:18px; } } }
    .note-input { width:70px; padding:6px 8px; border:1px solid var(--border); border-radius:6px; font-size:14px; font-weight:600; text-align:center; &:focus { outline:none; border-color:var(--primary-light); } &:disabled { background:var(--bg); color:var(--muted); } }
    .note-mention { margin-left:6px; font-size:10px; font-weight:600; }
    .comment-input { width:120px; padding:4px 8px; border:1px solid var(--border); border-radius:6px; font-size:12px; &:focus { outline:none; } }
    .absent-row { opacity:.6; background:#FEF2F2 !important; }
    .e-avatar { width:28px; height:28px; border-radius:50%; background:var(--primary-pale); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
    .csv-zone { display:flex; align-items:center; gap:32px; padding:24px; background:var(--bg); border-radius:8px; margin-bottom:16px; }
    .csv-info { display:flex; flex-direction:column; align-items:center; gap:6px; text-align:center; h3 { font-size:14px; } code { background:#E2E8F0; padding:4px 12px; border-radius:4px; font-size:12px; } }
    .csv-actions { display:flex; flex-direction:column; gap:12px; }
    .csv-file-info { display:flex; align-items:center; gap:10px; font-size:13px; mat-icon { color:var(--success); } }
    .csv-result { background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:16px; &.has-errors { background:#FFF7ED; border-color:#FDE68A; } }
    .csv-result-header { display:flex; gap:20px; font-weight:600; font-size:14px; margin-bottom:8px; }
    .error-list { max-height:150px; overflow-y:auto; }
    .error-item { font-size:12px; color:#D97706; padding:3px 0; }
    .stats-distrib { display:flex; flex-direction:column; gap:8px; }
    .distrib-item { display:flex; align-items:center; gap:10px; }
    .distrib-bar-wrap { flex:1; height:20px; background:var(--border); border-radius:99px; overflow:hidden; }
    .distrib-bar { height:100%; border-radius:99px; transition:width .5s ease; min-width:4px; }
    .distrib-count { font-weight:700; font-size:13px; color:var(--text); min-width:30px; text-align:right; }
  `]
})
export class NotesComponent implements OnInit {
  private fb         = inject(FormBuilder);
  private refSvc     = inject(ReferentielService);
  private noteSvc    = inject(NoteService);
  private userSvc    = inject(UtilisateurService);
  private exportSvc  = inject(ExportService);
  private auth       = inject(AuthService);
  private moyenneSvc = inject(MoyenneService);
  private snack      = inject(MatSnackBar);

  promotions       = signal<Promotion[]>([]);
  semestres        = signal<Semestre[]>([]);
  matieres         = signal<Matiere[]>([]);
  notes            = signal<Note[]>([]);
  batchRows: { etudiant: Utilisateur }[] = [];

  selectedPromo: Promotion | null = null;
  selectedSem:   Semestre  | null = null;
  selectedMatiere: Matiere | null = null;
  typeNoteBatch = 'UNIQUE';

  activeTab       = signal<'batch'|'csv'|'notes'|'stats'>('batch');
  loadingEtudiants = signal(false);
  loadingNotes    = signal(false);
  savingBatch     = signal(false);
  importingCSV    = signal(false);
  statsData       = signal<StatsResponse | null>(null);
  loadingStats    = signal(false);
  csvFile         = signal<File | null>(null);
  csvResult       = signal<CsvImportResponse | null>(null);

  batchCols = ['numero','nom','statut','note','commentaire'];
  notesCols = ['numero','nom','type','valeur','verrou','date'];

  batchForm = this.fb.group({ rows: this.fb.array([]) });
  get rowsArray() { return this.batchForm.get('rows') as FormArray; }

  getStatutCtrl(i: number) { return (this.rowsArray.at(i) as FormGroup).get('statut') as any; }
  getNoteCtrl(i: number)   { return (this.rowsArray.at(i) as FormGroup).get('valeur')  as any; }
  getCommentCtrl(i: number){ return (this.rowsArray.at(i) as FormGroup).get('commentaire') as any; }

  ngOnInit(): void { this.refSvc.getPromotions().subscribe(p => this.promotions.set(p)); }

  onPromoChange(p: Promotion): void {
    this.selectedSem = null; this.selectedMatiere = null;
    this.semestres.set([]); this.matieres.set([]);
    this.refSvc.getSemestres(p.id).subscribe(s => this.semestres.set(s));
  }

  onSemChange(s: Semestre): void {
    this.selectedMatiere = null; this.matieres.set([]);
    const eid = this.auth.hasRole('ENSEIGNANT') ? this.auth.currentUser()?.id : undefined;
    this.refSvc.getMatieres(s.id, eid).subscribe(m => this.matieres.set(m));
  }

  onMatiereChange(m: Matiere): void {
    this.csvResult.set(null);
    if (!this.selectedPromo) return;
    this.loadingEtudiants.set(true);
    this.userSvc.getEtudiants(0, 200).subscribe(r => {
      this.batchRows = r.content.map(e => ({ etudiant: e }));
      const arr = this.batchForm.get('rows') as FormArray;
      arr.clear();
      this.batchRows.forEach(() => arr.push(this.fb.group({
        statut:      ['PRESENT'],
        valeur:      [null, [Validators.min(0), Validators.max(20)]],
        commentaire: ['']
      })));
      this.loadingEtudiants.set(false);
    });
  }

  submitBatch(): void {
    if (!this.selectedMatiere) return;
    this.savingBatch.set(true);
    const notes = this.batchRows.map((row, i) => ({
      etudiantId:  row.etudiant.id,
      matiereId:   this.selectedMatiere!.id,
      valeur:      parseFloat(this.getNoteCtrl(i).value) || null,
      typeNote:    this.typeNoteBatch,
      statut:      this.getStatutCtrl(i).value,
      commentaire: this.getCommentCtrl(i).value
    })).filter(n => n.valeur !== null || n.statut !== 'PRESENT');

    this.noteSvc.batch({ matiereId: this.selectedMatiere.id, notes: notes as any }).subscribe({
      next: () => { this.snack.open(`${notes.length} note(s) enregistrée(s)`, 'OK', { duration: 3000, panelClass: 'success-snack' }); this.savingBatch.set(false); },
      error: (e) => { this.snack.open(e.error?.message || 'Erreur', 'OK', { duration: 3000, panelClass: 'error-snack' }); this.savingBatch.set(false); }
    });
  }

  loadNotes(): void {
    if (!this.selectedMatiere) return;
    this.loadingNotes.set(true);
    this.noteSvc.byMatiere(this.selectedMatiere.id).subscribe({
      next: n => { this.notes.set(n); this.loadingNotes.set(false); }
    });
  }

  verrouillerMatiere(): void {
    if (!this.selectedMatiere) return;
    this.noteSvc.verrouiller(this.selectedMatiere.id).subscribe({
      next: () => this.snack.open('Notes verrouillées', 'OK', { duration: 2000, panelClass: 'info-snack' })
    });
  }

  onCsvSelected(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) { this.csvFile.set(f); this.csvResult.set(null); }
  }

  importCSV(): void {
    if (!this.csvFile() || !this.selectedMatiere) return;
    this.importingCSV.set(true);
    this.noteSvc.importCSV(this.csvFile()!, this.selectedMatiere.id).subscribe({
      next: r => { this.csvResult.set(r); this.importingCSV.set(false); this.snack.open(`${r.importees} notes importées`, 'OK', { duration: 3000, panelClass: r.erreurs > 0 ? 'info-snack' : 'success-snack' }); },
      error: () => this.importingCSV.set(false)
    });
  }

  exportNotesExcel(): void {
    if (!this.selectedMatiere) return;
    this.exportSvc.notesMatiere(this.selectedMatiere.id).subscribe(blob =>
      this.exportSvc.download(blob, 'notes-' + this.selectedMatiere!.code + '.xlsx'));
  }

  loadStats(): void {
    if (!this.selectedMatiere) return;
    this.loadingStats.set(true);
    this.statsData.set(null);
    this.moyenneSvc.getStatsMatiere(this.selectedMatiere.id).subscribe({
      next: s => { this.statsData.set(s); this.loadingStats.set(false); },
      error: () => { this.loadingStats.set(false); }
    });
  }

  mentionDistribution = computed(() => {
    const stats = this.statsData();
    if (!stats?.distributionMentions) return [];
    const total = stats.totalEtudiants || 1;
    const colors: Record<string, string> = {
      TRES_BIEN: '#059669', BIEN: '#2563EB', ASSEZ_BIEN: '#7C3AED',
      PASSABLE: '#D97706', AJOURNE: '#DC2626'
    };
    const css: Record<string, string> = {
      TRES_BIEN: 'tres-bien', BIEN: 'bien', ASSEZ_BIEN: 'assez-bien',
      PASSABLE: 'passable', AJOURNE: 'ajourne'
    };
    return Object.entries(stats.distributionMentions).map(([key, count]) => ({
      label: key.replace('_', ' '),
      count,
      pct: Math.round((count / total) * 100),
      color: colors[key] || '#94A3B8',
      css: css[key] || ''
    }));
  });

  getMentionLabel(v: number): string {
    if (!v && v !== 0) return '';
    if (v >= 16) return '✨TB'; if (v >= 14) return '✓ B'; if (v >= 12) return '✓ AB';
    if (v >= 10) return '✓ P'; return '✗ AJ';
  }
  getMentionClass(v: number): string {
    if (!v && v !== 0) return '';
    if (v >= 16) return 'tres-bien'; if (v >= 14) return 'bien'; if (v >= 12) return 'assez-bien';
    if (v >= 10) return 'passable'; return 'ajourne';
  }
  getColor(v: number): string {
    if (!v && v !== 0) return 'var(--muted)';
    if (v >= 10) return 'var(--success)'; return 'var(--danger)';
  }
}
