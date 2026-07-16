import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ReferentielService } from '../../core/services/referentiel.service';
import { MoyenneService } from '../../core/services/moyenne.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { NoteService } from '../../core/services/note.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserEditDialogComponent } from '../../shared/components/user-edit-dialog/user-edit-dialog.component';
import { Promotion, Semestre, ClassementResponse, Note, MoyenneResponse, MoyenneAnnuelle, ClassementAnnuelResponse } from '../../core/models';
import { ExportService } from '../../core/services/export.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule,
            MatProgressSpinnerModule, MatProgressBarModule, MatTooltipModule, BaseChartDirective],
  template: `
    <div class="fade-in">
      <!-- Section Profil -->
      <div id="section-profil" class="profil-card">
        <div class="profil-header">
          <div class="profil-avatar-wrapper">
            <div class="profil-avatar">
              @if (photoUrl()) {
                <img [src]="photoUrl()" alt="Photo profil" class="profil-photo">
              } @else {
                <span class="profil-initials">{{initials()}}</span>
              }
            </div>
            <button class="upload-btn" (click)="fileInput.click()" matTooltip="Changer la photo">
              <i class="fas fa-camera"></i>
            </button>
            <input #fileInput type="file" accept="image/*" hidden (change)="onPhotoSelected($event)">
            @if (uploading()) {
              <div class="upload-progress">
                <mat-progress-bar mode="determinate" [value]="uploadProgress()"></mat-progress-bar>
                <span>{{uploadProgress()}}%</span>
              </div>
            }
          </div>
          <div class="profil-info">
            <h2>{{user()?.prenom}} {{user()?.nom}}</h2>
            <span class="badge" [class]="roleBadgeClass()">{{roleLabel()}}</span>
            <p class="profil-email"><i class="fas fa-envelope"></i> {{user()?.email}}</p>
            @if (user()?.role === 'ETUDIANT') {
              <p class="profil-detail"><i class="fas fa-id-card"></i> {{user()?.numeroEtudiant}}</p>
            }
            @if (user()?.role === 'ENSEIGNANT') {
              <p class="profil-detail"><i class="fas fa-chalkboard"></i> {{user()?.specialite}} — {{user()?.grade}}</p>
            }
            @if (user()?.role === 'ADMIN') {
              <p class="profil-detail"><i class="fas fa-shield-alt"></i> <strong>Signey Lionel Guela</strong> — Administrateur système</p>
            }
          </div>
          @if (photoUrl()) {
            <button class="remove-photo-btn" mat-icon-button (click)="removePhoto()" matTooltip="Supprimer la photo">
              <i class="fas fa-trash-alt"></i>
            </button>
          }
          <button class="edit-profil-btn" mat-icon-button (click)="editProfile()" matTooltip="Modifier mon profil">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </div>

      <div class="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bienvenue, {{user()?.prenom}} — {{roleLabel()}}</p>
        </div>
        @if (isAdmin()) {
          <div class="page-actions">
            <button mat-stroked-button routerLink="/referentiel"><i class="fas fa-cog"></i> Référentiel</button>
            <button mat-raised-button color="primary" routerLink="/utilisateurs"><i class="fas fa-user-plus"></i> Nouveau compte</button>
          </div>
        }
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon purple">🎓</div>
          <div><div class="kpi-value">{{nbEtudiants()}}</div><div class="kpi-label">Étudiants</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue">👨‍🏫</div>
          <div><div class="kpi-value">{{nbEnseignants()}}</div><div class="kpi-label">Enseignants</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">🏫</div>
          <div><div class="kpi-value">{{promotions().length}}</div><div class="kpi-label">Promotions actives</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange">📘</div>
          <div><div class="kpi-value">{{semestresOuverts()}}</div><div class="kpi-label">Semestres ouverts</div></div>
        </div>
      </div>

      <!-- Stats Enseignant -->
      @if (isEnseignant()) {
        <div class="card" style="margin-bottom:20px">
          <div class="card-header"><h2>📊 Mes statistiques</h2></div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-icon blue">📚</div>
              <div><div class="kpi-value">{{matieresEnseignant()}}</div><div class="kpi-label">Mes matières</div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon green">✏️</div>
              <div><div class="kpi-value">{{notesSaisies()}}</div><div class="kpi-label">Notes saisies</div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon orange">📊</div>
              <div><div class="kpi-value">{{moyenneNotes() | number:'1.1-1'}}</div><div class="kpi-label">Moy. des notes</div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon purple">📈</div>
              <div><div class="kpi-value">{{tauxReussiteEnseignant() | number:'1.0-0'}}%</div><div class="kpi-label">Taux réussite</div></div>
            </div>
          </div>
        </div>
      }

      <!-- Dashboard Étudiant -->
      @if (user()?.role === 'ETUDIANT') {
        <div class="card" style="margin-bottom:20px">
          <div class="card-header" id="student-filter">
            <h2>📊 Mes notes par matière</h2>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <select class="select-ctrl" (change)="onStudentSemChange($event)">
                <option value="">-- Sélectionner un semestre --</option>
                @for (s of studentSemestres(); track s.id) {
                  <option [value]="s.id" [selected]="s.id === selectedStudentSemId()">
                    Semestre {{s.numero}} — {{s.anneeAcademique}}
                  </option>
                }
              </select>
              <button mat-stroked-button (click)="downloadReleve()" [disabled]="!selectedStudentSemId()">
                <i class="fas fa-download"></i> Relevé PDF
              </button>
            </div>
          </div>

          @if (studentNotes().length > 0) {
            <div class="kpi-grid" style="margin-bottom:16px">
              <div class="kpi-card">
                <div class="kpi-icon blue">📚</div>
                <div><div class="kpi-value">{{studentNotes().length}}</div><div class="kpi-label">Notes</div></div>
              </div>
              <div class="kpi-card">
                <div class="kpi-icon green">📊</div>
                <div><div class="kpi-value">{{studentAverage() | number:'1.2-2'}}</div><div class="kpi-label">Moy. simple /20</div></div>
              </div>
              <div class="kpi-card">
                <div class="kpi-icon purple">🏆</div>
                <div><div class="kpi-value">{{studentMoyenne()?.creditsObtenus ?? 0}}</div><div class="kpi-label">Crédits</div></div>
              </div>
              <div class="kpi-card">
                <div class="kpi-icon orange">📈</div>
                <div><div class="kpi-value">#{{studentMoyenne()?.rang ?? '-'}}</div><div class="kpi-label">Rang</div></div>
              </div>
              <div class="kpi-card">
                <div class="kpi-icon teal">⚖️</div>
                <div><div class="kpi-value">{{studentWeightedAverage() | number:'1.2-2'}}</div><div class="kpi-label">Moy. pondérée /20</div></div>
              </div>
            </div>

            <div id="student-charts">
              <div class="charts-row" style="margin-bottom:16px">
                <div class="card">
                  <div class="card-header"><h2>📊 Notes par matière</h2></div>
                  @if (studentBarChart.datasets[0].data.length > 0) {
                    <canvas baseChart [data]="studentBarChart" type="bar"
                            [options]="barChartOpts" style="max-height:220px"></canvas>
                  } @else {
                    <div class="empty-state" style="padding:24px">
                      <span class="empty-icon">📊</span>
                      <p>Aucune donnée pour ce semestre</p>
                    </div>
                  }
                </div>
                <div class="card">
                  <div class="card-header"><h2>🎯 Mention</h2></div>
                  @if (studentDoughnutChart.datasets[0].data.length > 0) {
                    <canvas baseChart [data]="studentDoughnutChart" type="doughnut"
                            [options]="doughnutStudentOpts" style="max-height:220px"></canvas>
                    <div style="text-align:center;margin-top:8px">
                      <span class="badge" [class]="mentionCss(studentMoyenne()?.mention)" style="font-size:13px">
                        {{studentMoyenne()?.mention?.replace('_',' ') || 'N/A'}}
                      </span>
                    </div>
                  } @else {
                    <div class="empty-state" style="padding:24px">
                      <span class="empty-icon">🎯</span>
                      <p>Sélectionnez un semestre</p>
                    </div>
                  }
                </div>
                <div class="card">
                  <div class="card-header"><h2>📈 Évolution par semestre</h2></div>
                  @if (evolutionData().length > 1) {
                    <canvas baseChart [data]="evolutionChart" type="line"
                            [options]="evolutionChartOpts" style="max-height:220px"></canvas>
                  } @else if (evolutionData().length === 1) {
                    <div style="padding:24px;text-align:center;color:var(--muted)">
                      <span style="font-size:32px">📈</span>
                      <p style="margin-top:8px">Données disponibles pour 1 semestre</p>
                      <p style="font-size:12px">L'évolution sera visible avec plusieurs semestres</p>
                    </div>
                  } @else {
                    <div class="empty-state" style="padding:24px">
                      <span class="empty-icon">📈</span>
                      <p>Pas assez de données</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <h3 style="font-size:14px;font-weight:600;margin-bottom:8px;color:var(--text)">
              Détail des notes
            </h3>
            <div class="table-container">
              <table class="student-notes-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Type</th>
                    <th style="text-align:center">Coefficient</th>
                    <th style="text-align:center">Note /20</th>
                    <th style="text-align:center">Mention</th>
                  </tr>
                </thead>
                <tbody>
                  @for (n of studentNotes(); track n.id) {
                    <tr>
                      <td>{{n.matiereIntitule}}</td>
                      <td><span class="badge ouvert" style="font-size:10px">{{n.typeNote}}</span></td>
                      <td style="text-align:center">{{getNoteCoefficient(n.matiereId)}}</td>
                      <td style="text-align:center">
                        <span class="note-value" [class.passing]="n.valeur >= 10" [class.failing]="n.valeur < 10">
                          {{n.valeur | number:'1.1-1'}}
                        </span>
                      </td>
                      <td style="text-align:center">
                        <span class="badge" [class]="getNoteMentionCss(n.valeur)">
                          {{getNoteMention(n.valeur)}}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state" style="padding:32px">
              <span class="empty-icon">📚</span>
              <h3>Aucune note disponible</h3>
              <p>Sélectionnez un semestre pour afficher vos notes</p>
            </div>
          }
        </div>
      }

      <!-- Section Classements pour Admin & Enseignant -->
      @if (isAdmin() || isEnseignant()) {
        <div class="card" style="margin-bottom:20px;padding:16px">
          <div class="card-header" style="margin-bottom:12px">
            <h2>📊 Classements et Statistiques</h2>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
            <span style="font-size:13px;font-weight:600;color:var(--muted)">Promotion :</span>
            <select class="select-ctrl" (change)="onPromoChange($event)">
              <option value="">-- Sélectionner --</option>
              @for (p of promotions(); track p.id) {
                <option [value]="p.id">{{p.nom}} ({{p.anneeAcademique}})</option>
              }
            </select>

            @if (selectedPromoId() && semestres().length > 0) {
              <span style="font-size:13px;font-weight:600;color:var(--muted)">Période :</span>
              <select class="select-ctrl" (change)="onPeriodTypeChange($event)">
                <option value="semestre">Par semestre</option>
                <option value="annuel">Annuel (S1 + S2)</option>
              </select>

              @if (periodType() === 'semestre') {
                <select class="select-ctrl" (change)="onSemChange($event)">
                  <option value="">-- Semestre --</option>
                  @for (s of semestres(); track s.id) {
                    <option [value]="s.id">Semestre {{s.numero}} — {{s.anneeAcademique}}</option>
                  }
                </select>
              } @else {
                <select class="select-ctrl" (change)="onSem1Change($event)">
                  <option value="">-- Semestre 1 --</option>
                  @for (s of semestres(); track s.id) {
                    <option [value]="s.id" [selected]="s.id === selectedSem1Id()">Semestre {{s.numero}} — {{s.anneeAcademique}}</option>
                  }
                </select>
                <select class="select-ctrl" (change)="onSem2Change($event)">
                  <option value="">-- Semestre 2 --</option>
                  @for (s of semestres(); track s.id) {
                    <option [value]="s.id" [selected]="s.id === selectedSem2Id()">Semestre {{s.numero}} — {{s.anneeAcademique}}</option>
                  }
                </select>
              }

              <button mat-raised-button color="primary" (click)="loadClassement()"
                      [disabled]="!canLoadClassement() || loadingChart()">
                <i class="fas fa-chart-bar"></i> Afficher
              </button>
            }
          </div>
        </div>

        <!-- Résultats du classement -->
        @if (classement()) {
          <div class="charts-row" style="margin-bottom:20px">
            <!-- Distribution mentions -->
            <div class="card">
              <div class="card-header"><h2>Distribution des mentions</h2></div>
              <canvas baseChart [data]="mentionsChart" type="doughnut"
                      [options]="doughnutOpts" style="max-height:220px"></canvas>
              <div class="legend-grid">
                @for (item of mentionLegend(); track item.label) {
                  <div class="legend-item">
                    <span class="legend-dot" [style.background]="item.color"></span>
                    <span class="badge" [class]="item.css">{{item.label}}</span>
                    <strong>{{item.count}}</strong>
                  </div>
                }
              </div>
            </div>

            <!-- Top 5 classement -->
            <div class="card">
              <div class="card-header">
                <h2>🏆 Top 5 — {{classementTitle()}}</h2>
                <button mat-stroked-button routerLink="/moyennes" style="font-size:12px">Voir tout</button>
              </div>
              @for (m of top5(); track m.etudiantId; let i = $index) {
                <div class="top-row">
                  <span class="rank" [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">
                    {{i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)}}
                  </span>
                  <div class="top-info">
                    <span>{{m.etudiantNom}}</span>
                    <span class="top-num">{{m.numeroEtudiant}}</span>
                  </div>
                  <div style="text-align:right">
                    <div style="font-weight:700;font-size:16px;color:var(--primary)">{{getMoyenneDisplay(m) | number:'1.2-2'}}/20</div>
                    <span class="badge" [class]="mentionCss(m.mention)">{{m.mention?.replace('_',' ')}}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Statistiques globales -->
            <div class="card">
              <div class="card-header"><h2>Statistiques globales</h2></div>
              <div class="stat-block">
                <div class="stat-item">
                  <div class="stat-val admis">{{nbAdmis()}}</div>
                  <div class="stat-lbl">Admis</div>
                </div>
                <div class="stat-item">
                  <div class="stat-val ajourne">{{nbAjournes()}}</div>
                  <div class="stat-lbl">Ajournés</div>
                </div>
                <div class="stat-item">
                  <div class="stat-val">{{tauxReussite() | number:'1.0-1'}}%</div>
                  <div class="stat-lbl">Taux réussite</div>
                </div>
                <div class="stat-item">
                  <div class="stat-val">{{moyenneGenerale() | number:'1.2-2'}}</div>
                  <div class="stat-lbl">Moy. générale</div>
                </div>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="tauxReussite()"></div>
                </div>
                <span>{{tauxReussite() | number:'1.0-1'}}% de réussite</span>
              </div>
            </div>
          </div>

          <!-- Distribution des moyennes (bar chart) -->
          @if (classement() && !isAnnuelClassement()) {
            <div class="card" style="margin-bottom:20px">
              <div class="card-header"><h2>📊 Répartition des moyennes</h2></div>
              <canvas baseChart [data]="moyennesBarChart" type="bar"
                      [options]="moyennesBarOpts" style="max-height:250px"></canvas>
            </div>
          }

          <!-- Classement détaillé (tableau) -->
          <div class="card" style="margin-bottom:20px">
            <div class="card-header">
              <h2>📋 Classement détaillé — {{classementTitle()}}</h2>
              <div style="display:flex;gap:8px;align-items:center">
                <span style="font-size:12px;color:var(--muted)">{{totalEtudiants()}} étudiant(s)</span>
                @if (selectedPromoId() && selectedSemId()) {
                  <button mat-stroked-button (click)="exportClassement()">
                    <i class="fas fa-download"></i> Excel
                  </button>
                }
              </div>
            </div>
            <div class="table-container">
              <table class="student-notes-table">
                <thead>
                  <tr>
                    <th style="text-align:center;width:50px">Rang</th>
                    <th>Étudiant</th>
                    <th>N° Étudiant</th>
                    @if (isAnnuelClassement()) {
                      <th style="text-align:center">Moy. S1</th>
                      <th style="text-align:center">Moy. S2</th>
                    }
                    <th style="text-align:center">Moyenne</th>
                    <th style="text-align:center">Mention</th>
                    <th style="text-align:center">Crédits</th>
                    <th style="text-align:center">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of classementTable(); track m.etudiantId; let i = $index) {
                    <tr [class.admis-row]="isValide(m)" [class.ajourne-row]="!isValide(m)">
                      <td style="text-align:center;font-weight:700">
                        <span class="rang-badge" [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">
                          {{i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)}}
                        </span>
                      </td>
                      <td>{{m.etudiantNom}}</td>
                      <td style="color:var(--muted);font-size:12px">{{m.numeroEtudiant}}</td>
                      @if (isAnnuelClassement()) {
                        <td style="text-align:center">{{m.moyenneS1 != null ? (m.moyenneS1 | number:'1.2-2') : '—'}}</td>
                        <td style="text-align:center">{{m.moyenneS2 != null ? (m.moyenneS2 | number:'1.2-2') : '—'}}</td>
                      }
                      <td style="text-align:center">
                        <span class="moy-val" [style.color]="getMoyColor(getMoyenneValue(m))">
                          {{getMoyenneDisplay(m) | number:'1.2-2'}}
                        </span>
                      </td>
                      <td style="text-align:center">
                        <span class="badge" [class]="mentionCss(m.mention)">
                          {{m.mention?.replace('_',' ') || '—'}}
                        </span>
                      </td>
                      <td style="text-align:center">{{m.creditsObtenus}} ECTS</td>
                      <td style="text-align:center">
                        <span class="badge" [class]="isValide(m) ? 'active' : 'inactive'">
                          {{isValide(m) ? 'ADMIS(E)' : 'AJOURNÉ(E)'}}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (!classement() && !loadingChart()) {
          <div class="empty-state card">
            <span class="empty-icon">📊</span>
            <h3>Sélectionnez une promotion et une période</h3>
            <p>Le classement et les statistiques s'afficheront ici</p>
          </div>
        }
        @if (loadingChart()) {
          <div class="loading-center"><mat-spinner /></div>
        }
      }
    </div>
  `,
  styles: [`
    .profil-card { background:linear-gradient(135deg, #1B3A6B 0%, #2563EB 100%); color:white; padding:28px 32px; border:none; border-radius:16px; margin-bottom:24px; position:relative; overflow:hidden; }
    .profil-card::before { content:''; position:absolute; top:-50%; right:-20%; width:300px; height:300px; border-radius:50%; background:rgba(255,255,255,.05); }
    .profil-card::after { content:''; position:absolute; bottom:-30%; left:10%; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,.03); }
    .profil-header { display:flex; align-items:center; gap:20px; position:relative; z-index:1; }
    .profil-avatar-wrapper { position:relative; flex-shrink:0; }
    .profil-avatar { width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,.2); border:3px solid rgba(255,255,255,.4); display:flex; align-items:center; justify-content:center; overflow:hidden; transition:border-color .2s; &:hover { border-color:rgba(255,255,255,.7); } }
    .profil-photo { width:100%; height:100%; object-fit:cover; }
    .profil-initials { font-size:28px; font-weight:700; color:white; }
    .upload-btn { position:absolute; bottom:-2px; right:-2px; width:32px; height:32px; border-radius:50%; background:#0EA5E9; border:2px solid white; color:white; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; box-shadow:0 2px 8px rgba(0,0,0,.2);
      i { font-size:16px; }
      &:hover { background:#0284C7; transform:scale(1.1); } }
    .remove-photo-btn { position:absolute; top:-4px; right:-4px; width:28px; height:28px; background:rgba(220,38,38,.9); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,.3); transition:all .2s;
      i { font-size:14px; }
      &:hover { background:#DC2626; transform:scale(1.1); } }
    .edit-profil-btn { position:absolute; bottom:-2px; left:-2px; width:32px; height:32px; background:rgba(16,185,129,.9); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,.3); transition:all .2s;
      i { font-size:14px; }
      &:hover { background:#059669; transform:scale(1.1); } }
    .upload-progress { display:flex; align-items:center; gap:6px; position:absolute; bottom:-20px; left:50%; transform:translateX(-50%); width:80px; mat-progress-bar { height:4px; border-radius:2px; } span { font-size:10px; font-weight:600; color:rgba(255,255,255,.8); white-space:nowrap; } }
    .profil-info { flex:1;
      h2 { margin:0 0 4px; font-size:22px; font-weight:700; }
      .badge { display:inline-block; font-size:11px; padding:2px 10px; border-radius:99px; font-weight:600; margin-bottom:6px; }
      .badge.admin { background:rgba(251,191,36,.2); color:#FBBF24; }
      .badge.enseignant { background:rgba(52,211,153,.2); color:#34D399; }
      .badge.etudiant { background:rgba(96,165,250,.2); color:#60A5FA; }
    }
    .profil-email, .profil-detail { margin:2px 0; font-size:13px; opacity:.85; display:flex; align-items:center; gap:6px;
      i { font-size:16px; } }

    .charts-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
    .select-ctrl { padding:8px 12px; border:1px solid var(--border); border-radius:8px; font-size:13px; color:var(--text); background:var(--card); outline:none; cursor:pointer; &:disabled { opacity:.5; cursor:not-allowed; } }
    .legend-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:12px; }
    .legend-item { display:flex; align-items:center; gap:6px; }
    .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .top-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); &:last-child { border:none; } }
    .rank { font-size:18px; min-width:28px; text-align:center; font-weight:700; &.gold { color:#F59E0B; } &.silver { color:#94A3B8; } &.bronze { color:#D97706; } }
    .top-info { flex:1; display:flex; flex-direction:column; span { font-weight:600; font-size:13px; } }
    .top-num { font-size:11px; color:var(--muted); font-weight:400 !important; }
    .stat-block { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
    .stat-item { text-align:center; background:var(--bg); border-radius:8px; padding:12px; }
    .stat-val { font-size:28px; font-weight:700; color:var(--primary); &.admis { color:var(--success); } &.ajourne { color:var(--danger); } }
    .stat-lbl { font-size:12px; color:var(--muted); margin-top:3px; }
    .progress-bar-wrap { display:flex; flex-direction:column; gap:6px; span { font-size:12px; color:var(--muted); text-align:right; } }
    .progress-bar { background:#E2E8F0; border-radius:99px; height:10px; overflow:hidden; }
    .progress-fill { height:100%; background:linear-gradient(90deg,#10B981,#34D399); border-radius:99px; transition:width .5s ease; }
    .student-notes-table { width:100%; border-collapse:collapse; font-size:13px;
      th { text-align:left; padding:10px 12px; font-weight:600; color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.5px; background:var(--bg); border-bottom:1px solid var(--border); }
      td { padding:10px 12px; border-bottom:1px solid var(--border); color:var(--text); }
      tr:last-child td { border:none; }
      tr:hover td { background:var(--bg); } }
    .note-value { font-weight:700; font-size:15px; &.passing { color:var(--success); } &.failing { color:var(--danger); } }
    .admis-row { background:#F0FDF4 !important; }
    .ajourne-row { background:#FEF2F2 !important; }
    .rang-badge { font-size:14px; font-weight:700; &.gold { color:#F59E0B; } &.silver { color:#94A3B8; } &.bronze { color:#D97706; } }
    .moy-val { font-weight:700; font-size:14px; }
    @media(max-width:1100px) { .charts-row { grid-template-columns:1fr 1fr; } }
    @media(max-width:768px) { .charts-row { grid-template-columns:1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  private auth    = inject(AuthService);
  private refSvc  = inject(ReferentielService);
  private moyenneS= inject(MoyenneService);
  private userSvc = inject(UtilisateurService);
  private noteSvc = inject(NoteService);
  private exportSvc = inject(ExportService);
  private dialog  = inject(MatDialog);

  user          = this.auth.currentUser;
  isAdmin       = () => this.auth.hasRole('ADMIN');
  isEnseignant  = () => this.auth.hasRole('ENSEIGNANT');

  // Profil
  initials = computed(() => {
    const u = this.user();
    return u ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase() : '?';
  });

  roleLabel = computed(() => {
    const labels: Record<string, string> = { ADMIN:'Administrateur', ENSEIGNANT:'Enseignant', ETUDIANT:'Étudiant' };
    return labels[this.user()?.role ?? ''] ?? '';
  });

  roleBadgeClass = computed(() => {
    const r = this.user()?.role;
    if (r === 'ADMIN') return 'admin';
    if (r === 'ENSEIGNANT') return 'enseignant';
    return 'etudiant';
  });

  photoUrl = computed(() => {
    const u = this.user();
    return u?.photoUrl || null;
  });

  private snack = inject(MatSnackBar);

  removePhoto(): void {
    const u = this.user();
    if (!u) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        titre: 'Supprimer la photo',
        message: 'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
        btnConfirmer: 'Supprimer'
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userSvc.uploadPhoto('').subscribe(updated => {
          this.auth.currentUser.set(updated);
        });
      }
    });
  }

  editProfile(): void {
    const u = this.user();
    if (!u) return;
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '520px',
      data: { user: u }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.userSvc.updateProfile(result).subscribe({
        next: updated => {
          this.auth.currentUser.set(updated);
          this.snack.open('Profil mis à jour avec succès', 'OK', { duration: 3000, panelClass: 'success-snack' });
        },
        error: err => {
          this.snack.open(err.error?.message || 'Erreur lors de la mise à jour', 'OK', { duration: 3000, panelClass: 'error-snack' });
        }
      });
    });
  }

  uploading = signal(false);
  uploadProgress = signal(0);

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    this.uploading.set(true);
    this.uploadProgress.set(0);

    const reader = new FileReader();
    const interval = setInterval(() => {
      this.uploadProgress.update(v => Math.min(v + 10, 90));
    }, 200);

    reader.onload = () => {
      clearInterval(interval);
      this.uploadProgress.set(100);
      setTimeout(() => {
        const dataUrl = reader.result as string;
        this.userSvc.uploadPhoto(dataUrl).subscribe({
          next: (updated) => {
            this.auth.currentUser.set(updated);
            this.uploading.set(false);
            this.uploadProgress.set(0);
          },
          error: () => {
            this.uploading.set(false);
            this.uploadProgress.set(0);
          }
        });
      }, 300);
    };

    reader.onerror = () => {
      clearInterval(interval);
      this.uploading.set(false);
      this.uploadProgress.set(0);
    };

    reader.readAsDataURL(file);
  }

  nbEtudiants   = signal(0);
  nbEnseignants = signal(0);
  promotions    = signal<Promotion[]>([]);
  semestres     = signal<Semestre[]>([]);
  selectedPromoId = signal('');
  selectedSemId   = signal('');
  periodType      = signal<'semestre' | 'annuel'>('semestre');
  selectedSem1Id  = signal('');
  selectedSem2Id  = signal('');
  classement    = signal<ClassementResponse | ClassementAnnuelResponse | null>(null);
  loadingChart  = signal(false);
  semestresOuverts = computed(() => this.semestres().filter(s => s.statut === 'OUVERT').length);

  isAnnuelClassement = () => this.periodType() === 'annuel';

  canLoadClassement = computed(() => {
    if (this.periodType() === 'semestre') return !!this.selectedPromoId() && !!this.selectedSemId();
    return !!this.selectedPromoId() && !!this.selectedSem1Id() && !!this.selectedSem2Id();
  });

  classementTitle = computed(() => {
    const c = this.classement();
    if (!c) return '';
    if ('semestreNom' in c) return c.semestreNom;
    if ('anneeAcademique' in c) return `Année ${c.anneeAcademique} (${c.semestre1Info} + ${c.semestre2Info})`;
    return '';
  });

  totalEtudiants = computed(() => this.classement()?.totalEtudiants ?? 0);

  // Chart
  mentionsChart: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
  moyennesBarChart: ChartData<'bar'> = { labels: [], datasets: [{ data: [], backgroundColor: '#3B82F6', borderRadius: 6 }] };
  moyennesBarOpts: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } }
    }
  };
  doughnutOpts: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  // Computed helpers for classement data - works for both ClassementResponse and ClassementAnnuelResponse
  classementTable = computed<any[]>(() => {
    const c = this.classement();
    if (!c) return [];
    if ('classement' in c) return c.classement as any[];
    return [];
  });

  top5 = computed(() => this.classementTable().slice(0, 5));

  nbAdmis = computed(() => {
    const list = this.classementTable();
    return list.filter((m: any) => this.isValide(m)).length;
  });

  nbAjournes = computed(() => this.totalEtudiants() - this.nbAdmis());

  tauxReussite = computed(() => {
    const total = this.totalEtudiants();
    return total > 0 ? (this.nbAdmis() / total) * 100 : 0;
  });

  moyenneGenerale = computed(() => {
    const list = this.classementTable();
    if (!list.length) return 0;
    const sum = list.reduce((acc: number, m: any) => acc + (this.getMoyenneValue(m) ?? 0), 0);
    return sum / list.length;
  });

  mentionLegend = computed(() => {
    const map = new Map<string, number>();
    this.classementTable().forEach((m: any) => {
      const k = m.mention ?? 'AJOURNE';
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    const colors: Record<string, string> = { TRES_BIEN:'#059669', BIEN:'#2563EB', ASSEZ_BIEN:'#7C3AED', PASSABLE:'#D97706', AJOURNE:'#DC2626' };
    const css: Record<string, string>    = { TRES_BIEN:'tres-bien', BIEN:'bien', ASSEZ_BIEN:'assez-bien', PASSABLE:'passable', AJOURNE:'ajourne' };
    return Array.from(map.entries()).map(([label, count]) => ({ label: label.replace('_',' '), count, color: colors[label] ?? '#94A3B8', css: css[label] ?? '' }));
  });

  ngOnInit(): void {
    this.userSvc.getEtudiants(0, 1).subscribe(r => this.nbEtudiants.set(r.totalElements));
    this.userSvc.getEnseignants().subscribe(l => this.nbEnseignants.set(l.length));
    this.refSvc.getPromotions().subscribe(p => {
      this.promotions.set(p);
      // Load semestres for student dashboard (first promotion)
      if (p.length > 0 && this.user()?.role === 'ETUDIANT') {
        this.refSvc.getSemestres(p[0].id).subscribe(s => {
          this.studentSemestres.set(s);
          if (s.length > 0) {
            this.selectedStudentSemId.set(s[0].id);
            this.loadStudentData(s[0].id);
          }
          this.loadEvolutionData(s);
        });
      }
    });
    this.loadEnseignantStats();
  }

  onPromoChange(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    this.selectedPromoId.set(id);
    this.selectedSemId.set('');
    this.selectedSem1Id.set('');
    this.selectedSem2Id.set('');
    this.semestres.set([]);
    this.classement.set(null);
    if (id) this.refSvc.getSemestres(id).subscribe(s => this.semestres.set(s));
  }

  onPeriodTypeChange(e: Event): void {
    this.periodType.set((e.target as HTMLSelectElement).value as 'semestre' | 'annuel');
    this.classement.set(null);
  }

  onSemChange(e: Event): void {
    this.selectedSemId.set((e.target as HTMLSelectElement).value);
    this.classement.set(null);
  }

  onSem1Change(e: Event): void {
    this.selectedSem1Id.set((e.target as HTMLSelectElement).value);
    this.classement.set(null);
  }

  onSem2Change(e: Event): void {
    this.selectedSem2Id.set((e.target as HTMLSelectElement).value);
    this.classement.set(null);
  }

  getMoyenneValue(m: any): number {
    if ('moyenneAnnuelle' in m) return m.moyenneAnnuelle ?? 0;
    if ('moyenne' in m) return m.moyenne ?? 0;
    return 0;
  }

  getMoyenneDisplay(m: any): number {
    return this.getMoyenneValue(m);
  }

  isValide(m: any): boolean {
    return m.valide === true;
  }

  // ── Dashboard Étudiant ────────────────────────────────────────────────
  studentSemestres     = signal<Semestre[]>([]);
  selectedStudentSemId = signal('');
  studentNotes         = signal<Note[]>([]);
  studentMoyenne       = signal<MoyenneResponse | null>(null);
  matieresMap          = signal<Map<string,number>>(new Map());
  evolutionData        = signal<{ semestreLabel: string; moyenne: number }[]>([]);

  studentAverage = computed(() => {
    const notes = this.studentNotes();
    if (!notes.length) return 0;
    const sum = notes.reduce((acc, n) => acc + (n.valeur ?? 0), 0);
    return +(sum / notes.length).toFixed(2);
  });

  studentWeightedAverage = computed(() => {
    const notes = this.studentNotes();
    const coefMap = this.matieresMap();
    if (!notes.length) return 0;
    let weightedSum = 0;
    let totalCoef = 0;
    notes.forEach(n => {
      const coef = coefMap.get(n.matiereId) ?? 1;
      weightedSum += (n.valeur ?? 0) * coef;
      totalCoef += coef;
    });
    return totalCoef > 0 ? +(weightedSum / totalCoef).toFixed(2) : 0;
  });

  barChartOpts: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `Note: ${ctx.raw}/20` } }
    },
    scales: {
      y: { min:0, max:20, ticks: { stepSize:5, font: { size:10 } } },
      x: { ticks: { font: { size:9 }, maxRotation:45 } }
    }
  };

  doughnutStudentOpts: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  studentBarChart: ChartData<'bar'> = { labels:[], datasets:[{ data:[], backgroundColor:'#3B82F6', borderRadius:6 }] };
  studentDoughnutChart: ChartData<'doughnut'> = { labels:[], datasets:[{ data:[], backgroundColor:[] }] };

  // ── Évolution par semestre ────────────────────────────────────────────
  evolutionChart: ChartData<'line'> = { labels:[], datasets:[] };
  evolutionChartOpts: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `Moyenne: ${ctx.raw}/20` } }
    },
    scales: {
      y: { min:0, max:20, ticks: { stepSize:5, font: { size:10 } } },
      x: { ticks: { font: { size:10 } } }
    },
    elements: {
      line: { tension: .35, borderWidth: 3, borderColor: '#3B82F6', fill: true, backgroundColor: 'rgba(59,130,246,.1)' },
      point: { radius: 5, hoverRadius: 7, backgroundColor: '#3B82F6', borderColor: '#fff', borderWidth: 2 }
    }
  };

  private loadEvolutionData(semestres: Semestre[]): void {
    const u = this.user();
    if (!u || u.role !== 'ETUDIANT') return;

    const requests = semestres.map(s =>
      this.noteSvc.byEtudiantSemestre(u.id, s.id).pipe(
        catchError(() => of([]))
      )
    );

    forkJoin(requests).subscribe(results => {
      const data: { semestreLabel: string; moyenne: number }[] = [];
      results.forEach((notes, i) => {
        if (notes.length > 0) {
          const sum = notes.reduce((acc, n) => acc + (n.valeur ?? 0), 0);
          const avg = +(sum / notes.length).toFixed(2);
          data.push({
            semestreLabel: `Semestre ${semestres[i].numero}`,
            moyenne: avg
          });
        }
      });
      this.evolutionData.set(data);

      if (data.length > 0) {
        const colors = data.map(d =>
          d.moyenne >= 10 ? '#10B981' : '#EF4444'
        );
        this.evolutionChart = {
          labels: data.map(d => d.semestreLabel),
          datasets: [{
            data: data.map(d => d.moyenne),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,.1)',
            pointBackgroundColor: colors,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: .35,
            fill: true,
            borderWidth: 3
          }]
        };
      }
    });
  }

  onStudentSemChange(e: Event): void {
    const semId = (e.target as HTMLSelectElement).value;
    this.selectedStudentSemId.set(semId);
    if (semId) this.loadStudentData(semId);
  }

  private loadStudentData(semId: string): void {
    const u = this.user();
    if (!u) return;

    this.noteSvc.byEtudiantSemestre(u.id, semId).subscribe(notes => {
      this.studentNotes.set(notes);
      this.buildStudentCharts(notes);
    });

    this.moyenneS.getMoyenne(u.id, semId).subscribe({
      next: m => this.studentMoyenne.set(m),
      error: () => this.studentMoyenne.set(null)
    });

    this.refSvc.getUEs(semId).subscribe(ues => {
      const map = new Map<string, number>();
      ues.forEach(ue => ue.matieres.forEach(m => map.set(m.id, m.coefficient)));
      this.matieresMap.set(map);
    });
  }

  private buildStudentCharts(notes: Note[]): void {
    const grouped = new Map<string, { intitule: string; valeur: number; color: string }>();
    notes.forEach(n => {
      if (!grouped.has(n.matiereId)) {
        grouped.set(n.matiereId, {
          intitule: n.matiereIntitule,
          valeur: n.valeur,
          color: n.valeur >= 10 ? '#10B981' : '#EF4444'
        });
      }
    });

    const entries = Array.from(grouped.values());
    this.studentBarChart = {
      labels: entries.map(e => e.intitule.length > 15 ? e.intitule.slice(0,15)+'…' : e.intitule),
      datasets: [{
        data: entries.map(e => e.valeur),
        backgroundColor: entries.map(e => e.color),
        borderRadius: 6
      }]
    };

    const passing = notes.filter(n => n.valeur >= 10).length;
    const failing = notes.filter(n => n.valeur < 10).length;
    this.studentDoughnutChart = {
      labels: ['Réussi (≥10)', 'Échoué (<10)'],
      datasets: [{
        data: [passing, failing],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 2, borderColor: '#fff'
      }]
    };
  }

  downloadReleve(): void {
    const u = this.user();
    const semId = this.selectedStudentSemId();
    if (!u || !semId) return;
    this.exportSvc.releve(u.id, semId).subscribe({
      next: blob => {
        this.exportSvc.download(blob, `Releve_${u.nom}_${u.prenom}_Semestre.pdf`);
      },
      error: () => {
        const content = `RELEVÉ DE NOTES\nÉtudiant: ${u.prenom} ${u.nom}\nSemestre: ${semId}\n\nNotes:\n${this.studentNotes().map(n => `- ${n.matiereIntitule}: ${n.valeur}/20`).join('\n')}\n\nMoyenne simple: ${this.studentAverage()}/20\nMoyenne pondérée: ${this.studentWeightedAverage()}/20`;
        const blob = new Blob([content], { type: 'text/plain' });
        this.exportSvc.download(blob, `Releve_${u.nom}_${u.prenom}.txt`);
      }
    });
  }

  getNoteMention(note: number): string {
    if (note >= 16) return 'Très Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Ajourné';
  }

  getNoteMentionCss(note: number): string {
    if (note >= 16) return 'tres-bien';
    if (note >= 14) return 'bien';
    if (note >= 12) return 'assez-bien';
    if (note >= 10) return 'passable';
    return 'ajourne';
  }

  getNoteCoefficient(matiereId: string): number {
    return this.matieresMap().get(matiereId) ?? 0;
  }

  loadClassement(): void {
    if (!this.canLoadClassement()) return;
    this.loadingChart.set(true);

    if (this.periodType() === 'semestre') {
      this.moyenneS.getClassement(this.selectedPromoId(), this.selectedSemId()).subscribe({
        next: data => {
          this.classement.set(data);
          this.buildCharts(data);
          this.loadingChart.set(false);
        },
        error: () => this.loadingChart.set(false)
      });
    } else {
      this.moyenneS.getClassementAnnuel(this.selectedPromoId(), this.selectedSem1Id(), this.selectedSem2Id()).subscribe({
        next: data => {
          this.classement.set(data);
          this.buildCharts(data);
          this.loadingChart.set(false);
        },
        error: () => this.loadingChart.set(false)
      });
    }
  }

  buildCharts(data: ClassementResponse | ClassementAnnuelResponse): void {
    const list = 'classement' in data ? data.classement as any[] : [];

    // Mentions doughnut
    const counts: Record<string, number> = { TRES_BIEN:0, BIEN:0, ASSEZ_BIEN:0, PASSABLE:0, AJOURNE:0 };
    list.forEach((m: any) => { const mention = m.mention; if (mention) counts[mention] = (counts[mention] ?? 0) + 1; });
    this.mentionsChart = {
      labels: Object.keys(counts).map(k => k.replace('_',' ')),
      datasets: [{ data: Object.values(counts),
        backgroundColor: ['#059669','#2563EB','#7C3AED','#D97706','#DC2626'],
        borderWidth: 2, borderColor: '#fff' }]
    };

    // Moyennes bar chart (distribution par tranches)
    if (!this.isAnnuelClassement()) {
      const tranches = [
        { label: '0-5', min: 0, max: 5 },
        { label: '5-8', min: 5, max: 8 },
        { label: '8-10', min: 8, max: 10 },
        { label: '10-12', min: 10, max: 12 },
        { label: '12-14', min: 12, max: 14 },
        { label: '14-16', min: 14, max: 16 },
        { label: '16-20', min: 16, max: 20 }
      ];
      const moyennes = list.map((m: any) => this.getMoyenneValue(m));
      const distrib = tranches.map(t => ({
        label: t.label,
        count: moyennes.filter((v: number) => v >= t.min && v < t.max).length
      }));
      this.moyennesBarChart = {
        labels: distrib.map(d => d.label),
        datasets: [{
          data: distrib.map(d => d.count),
          backgroundColor: ['#DC2626','#F97316','#EAB308','#10B981','#3B82F6','#7C3AED','#059669'],
          borderRadius: 6
        }]
      };
    }
  }

  mentionCss(m?: string): string {
    return { TRES_BIEN:'tres-bien', BIEN:'bien', ASSEZ_BIEN:'assez-bien', PASSABLE:'passable', AJOURNE:'ajourne' }[m ?? ''] ?? '';
  }

  getMoyColor(v?: number): string {
    if (v == null) return 'var(--muted)';
    if (v >= 14) return '#059669'; if (v >= 10) return '#3B82F6'; return '#DC2626';
  }

  exportClassement(): void {
    if (!this.selectedPromoId() || (!this.selectedSemId() && !this.selectedSem1Id())) return;
    if (this.periodType() === 'semestre') {
      this.exportSvc.classementExcel(this.selectedPromoId(), this.selectedSemId()).subscribe(blob =>
        this.exportSvc.download(blob, 'classement-semestre.xlsx'));
    }
  }

  // ── Stats Enseignant ─────────────────────────────────────────────────
  matieresEnseignant = signal(0);
  notesSaisies       = signal(0);
  moyenneNotes       = signal(0);
  tauxReussiteEnseignant = signal(0);

  private loadEnseignantStats(): void {
    const u = this.user();
    if (!u || u.role !== 'ENSEIGNANT') return;
    this.refSvc.getPromotions().subscribe(promos => {
      if (promos.length > 0) {
        this.refSvc.getSemestres(promos[0].id).subscribe(sems => {
          if (sems.length > 0) {
            this.refSvc.getMatieres(sems[0].id, u.id).subscribe(matieres => {
              this.matieresEnseignant.set(matieres.length);
              let totalNotes = 0;
              let sumNotes = 0;
              let countReussite = 0;
              let countTotal = 0;
              matieres.forEach(m => {
                this.noteSvc.byMatiere(m.id).subscribe(notes => {
                  totalNotes += notes.length;
                  this.notesSaisies.set(totalNotes);
                  notes.forEach(n => {
                    if (n.valeur != null) {
                      sumNotes += n.valeur;
                      countTotal++;
                      if (n.valeur >= 10) countReussite++;
                    }
                  });
                  if (countTotal > 0) {
                    this.moyenneNotes.set(+(sumNotes / countTotal).toFixed(1));
                    this.tauxReussiteEnseignant.set(Math.round((countReussite / countTotal) * 100));
                  }
                });
              });
            });
          }
        });
      }
    });
  }
}
