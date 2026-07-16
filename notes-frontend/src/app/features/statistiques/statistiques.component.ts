import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CacheService } from '../../core/services/cache.service';
import { AutoRefreshComponent } from '../../shared/components/auto-refresh/auto-refresh.component';
import { switchMap, tap } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatTooltipModule, BaseChartDirective,
            AutoRefreshComponent],
  template: `
    <div class="fade-in">
      <app-auto-refresh [autoRefresh]="true" (onRefresh)="loadData()"></app-auto-refresh>
      <div class="page-header">
        <div><h1>Statistiques globales</h1><p>Vue d'ensemble des données académiques</p></div>
      </div>

      @if (loading()) {
        <div class="loading-center" style="padding:60px"><mat-spinner /></div>
      }

      @if (data()) {
        @if (data()!.totaux) {
          <!-- KPIs globaux -->
          <div class="kpi-grid" style="margin-bottom:24px">
            <div class="kpi-card">
              <div class="kpi-icon purple"><i class="fas fa-graduation-cap"></i></div>
              <div><div class="kpi-value">{{data()!.totaux.totalEtudiants}}</div><div class="kpi-label">Étudiants</div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon blue"><i class="fas fa-layer-group"></i></div>
              <div><div class="kpi-value">{{data()!.totaux.totalPromotions}}</div><div class="kpi-label">Promotions</div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon green"><i class="fas fa-book"></i></div>
              <div><div class="kpi-value">{{data()!.totaux.totalFilieres}}</div><div class="kpi-label">Filières</div></div>
            </div>
          </div>
        }

        <!-- Row 1: Étudiants par filière + par promotion -->
        <div class="charts-row" style="margin-bottom:24px">
          <div class="card">
            <div class="card-header"><h2><i class="fas fa-chart-pie" style="margin-right:8px;color:#3B82F6"></i> Étudiants par filière</h2></div>
            @if (filierePieData.datasets[0].data.length > 0) {
              <canvas baseChart [data]="filierePieData" type="doughnut" [options]="doughnutOpts" style="max-height:250px"></canvas>
              <div class="pie-legend">
                @for (item of filiereLegend(); track item.label) {
                  <div class="legend-item"><span class="legend-dot" [style.background]="item.color"></span><span>{{item.label}}</span><strong>{{item.count}}</strong></div>
                }
              </div>
            } @else { <div class="empty-state"><p>Aucune donnée</p></div> }
          </div>
          <div class="card">
            <div class="card-header"><h2><i class="fas fa-chart-bar" style="margin-right:8px;color:#8B5CF6"></i> Étudiants par promotion</h2></div>
            @if (promoBarData.datasets[0].data.length > 0) {
              <canvas baseChart [data]="promoBarData" type="bar" [options]="barChartOpts" style="max-height:250px"></canvas>
            } @else { <div class="empty-state"><p>Aucune donnée</p></div> }
          </div>
        </div>

        <!-- Row 2: Taux réussite/échec -->
        <div class="charts-row" style="margin-bottom:24px">
          <div class="card">
            <div class="card-header"><h2><i class="fas fa-chart-simple" style="margin-right:8px;color:#10B981"></i> Taux de réussite par promotion</h2></div>
            @if (reussiteBarData.datasets[0].data.length > 0) {
              <canvas baseChart [data]="reussiteBarData" type="bar" [options]="reussiteBarOpts" style="max-height:250px"></canvas>
            } @else { <div class="empty-state"><p>Aucune donnée (clôturez un semestre pour voir les taux)</p></div> }
          </div>
          <div class="card">
            <div class="card-header"><h2><i class="fas fa-circle-check" style="margin-right:8px;color:#059669"></i> Répartition réussite/échec</h2></div>
            @if (totalReussiteEchec().labels.length > 0) {
              <canvas baseChart [data]="reussiteEchecData" type="doughnut" [options]="doughnutOpts" style="max-height:250px"></canvas>
              <div class="pie-legend">
                <div class="legend-item"><span class="legend-dot" style="background:#10B981"></span><span>Réussite</span><strong>{{totalReussite()}}</strong></div>
                <div class="legend-item"><span class="legend-dot" style="background:#EF4444"></span><span>Échec</span><strong>{{totalEchec()}}</strong></div>
              </div>
            } @else { <div class="empty-state"><p>Aucune donnée</p></div> }
          </div>
        </div>

        <!-- Row 3: Par année académique -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header"><h2><i class="fas fa-calendar" style="margin-right:8px;color:#F59E0B"></i> Promotions par année académique</h2></div>
          @if (anneeBarData.datasets[0].data.length > 0) {
            <canvas baseChart [data]="anneeBarData" type="bar" [options]="anneeBarOpts" style="max-height:250px"></canvas>
          } @else { <div class="empty-state"><p>Aucune donnée</p></div> }
        </div>

        <!-- Tableau détaillé par promotion -->
        <div class="card">
          <div class="card-header"><h2><i class="fas fa-table" style="margin-right:8px;color:#6B7280"></i> Détail par promotion</h2></div>
          <div class="table-container">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Promotion</th>
                  <th>Filière</th>
                  <th>Année</th>
                  <th style="text-align:center">Étudiants</th>
                  <th style="text-align:center">Réussite</th>
                  <th style="text-align:center">Échec</th>
                  <th style="text-align:center">Taux réussite</th>
                </tr>
              </thead>
              <tbody>
                @for (item of data()!.tauxParPromotion; track item.promotion) {
                  <tr>
                    <td><strong>{{item.promotion}}</strong></td>
                    <td>{{item.filiere}}</td>
                    <td>{{item.annee}}</td>
                    <td style="text-align:center">{{item.total}}</td>
                    <td style="text-align:center"><span class="badge active">{{item.reussite}}</span></td>
                    <td style="text-align:center"><span class="badge inactive">{{item.echec}}</span></td>
                    <td style="text-align:center">
                      <span class="taux-badge" [style.color]="item.tauxReussite >= 50 ? '#059669' : '#DC2626'">
                        {{item.tauxReussite}}%
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="7" style="text-align:center;padding:24px;color:var(--muted)">Aucune donnée disponible</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .charts-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .pie-legend { display:flex; flex-direction:column; gap:6px; margin-top:12px; }
    .legend-item { display:flex; align-items:center; gap:8px; font-size:13px; }
    .legend-item strong { margin-left:auto; }
    .legend-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
    .stats-table { width:100%; border-collapse:collapse; font-size:13px;
      th { text-align:left; padding:10px 12px; font-weight:600; color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.5px; background:var(--bg); border-bottom:1px solid var(--border); }
      td { padding:10px 12px; border-bottom:1px solid var(--border); color:var(--text); }
      tr:last-child td { border:none; }
      tr:hover td { background:var(--bg); } }
    .taux-badge { font-weight:700; font-size:14px; }
    @media(max-width:900px) { .charts-row { grid-template-columns:1fr; } }
  `]
})
export class StatistiquesComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private cacheSvc = inject(CacheService);
  loading = signal(false);
  data = signal<any>(null);
  colors = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6','#F97316'];

  filierePieData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] };
  promoBarData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], backgroundColor: '#8B5CF6', borderRadius: 8, borderSkipped: false }] };
  reussiteBarData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], backgroundColor: '#10B981', borderRadius: 8, borderSkipped: false }] };
  reussiteEchecData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [], backgroundColor: ['#10B981','#EF4444'], borderWidth: 0 }] };
  anneeBarData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], backgroundColor: '#F59E0B', borderRadius: 8, borderSkipped: false }] };

  doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,.9)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
        displayColors: true
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  barChartOpts: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,.9)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: ctx => `Étudiants: ${ctx.raw}` }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 }, stepSize: 1 }, grid: { color: 'rgba(0,0,0,.06)' } },
      x: { ticks: { font: { size: 9 }, maxRotation: 45 }, grid: { display: false } }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    }
  };
  reussiteBarOpts: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,.9)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: ctx => `Taux: ${ctx.raw}%` }
      }
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { font: { size: 10 }, callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,.06)' } },
      x: { ticks: { font: { size: 9 }, maxRotation: 45 }, grid: { display: false } }
    },
    animation: {
      duration: 800,
      easing: 'easeOutBounce'
    }
  };
  anneeBarOpts: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,.9)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 }, stepSize: 1 }, grid: { color: 'rgba(0,0,0,.06)' } },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    }
  };

  filiereLegend = computed(() => {
    const d = this.data();
    if (!d?.etudiantsParFiliere) return [];
    return d.etudiantsParFiliere.map((item: any, i: number) => ({
      label: item.filiere,
      count: item.total,
      color: this.colors[i % this.colors.length]
    }));
  });

  totalReussite = computed(() => {
    const d = this.data();
    if (!d?.tauxParPromotion) return 0;
    return d.tauxParPromotion.reduce((s: number, item: any) => s + item.reussite, 0);
  });
  totalEchec = computed(() => {
    const d = this.data();
    if (!d?.tauxParPromotion) return 0;
    return d.tauxParPromotion.reduce((s: number, item: any) => s + item.echec, 0);
  });
  totalReussiteEchec = computed(() => {
    const t = this.totalReussite();
    const e = this.totalEchec();
    return { labels: t + e > 0 ? ['Réussite','Échec'] : [], total: t + e };
  });

  ngOnInit(): void {
    this.loadData();
    this.cacheSvc.stopAutoRefresh('stats');
    this.cacheSvc.startAutoRefresh('stats', () =>
      this.http.get<any>(`${environment.apiUrl}/stats/globales`).pipe(
        tap(d => { this.data.set(d); this.buildCharts(d); })
      )
    );
  }

  ngOnDestroy(): void {
    this.cacheSvc.stopAutoRefresh('stats');
  }

  loadData(): void {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/stats/globales`).subscribe({
      next: d => {
        this.data.set(d);
        this.buildCharts(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private buildCharts(d: any): void {
    // Filière pie chart
    if (d.etudiantsParFiliere?.length) {
      this.filierePieData = {
        labels: d.etudiantsParFiliere.map((i: any) => i.filiere),
        datasets: [{
          data: d.etudiantsParFiliere.map((i: any) => i.total),
          backgroundColor: d.etudiantsParFiliere.map((_: any, i: number) => this.colors[i % this.colors.length]),
          borderWidth: 2, borderColor: '#fff'
        }]
      };
    }

    // Promotion bar chart
    if (d.etudiantsParPromotion?.length) {
      const items = d.etudiantsParPromotion.slice(0, 15);
      this.promoBarData = {
        labels: items.map((i: any) => i.promotion + ' (' + i.annee + ')'),
        datasets: [{
          data: items.map((i: any) => i.total),
          backgroundColor: items.map((_: any, i: number) => this.colors[i % this.colors.length].replace('#','').match(/^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i) ? this.colors[i % this.colors.length] : '#8B5CF6'),
          borderRadius: 6
        }]
      };
    }

    // Taux réussite par promotion
    if (d.tauxParPromotion?.length) {
      const items = d.tauxParPromotion.slice(0, 15);
      this.reussiteBarData = {
        labels: items.map((i: any) => i.promotion),
        datasets: [{
          data: items.map((i: any) => i.tauxReussite),
          backgroundColor: items.map((i: any) => i.tauxReussite >= 50 ? '#10B981' : '#EF4444'),
          borderRadius: 6
        }]
      };
    }

    // Réussite/échec cumulés
    const reussite = d.tauxParPromotion?.reduce((s: number, i: any) => s + i.reussite, 0) ?? 0;
    const echec = d.tauxParPromotion?.reduce((s: number, i: any) => s + i.echec, 0) ?? 0;
    if (reussite + echec > 0) {
      this.reussiteEchecData = {
        labels: ['Réussite', 'Échec'],
        datasets: [{ data: [reussite, echec], backgroundColor: ['#10B981','#EF4444'], borderWidth: 2, borderColor: '#fff' }]
      };
    }

    // Par année académique
    if (d.parAnneeAcademique?.length) {
      this.anneeBarData = {
        labels: d.parAnneeAcademique.map((i: any) => i.annee),
        datasets: [{
          data: d.parAnneeAcademique.map((i: any) => i.totalPromotions),
          backgroundColor: d.parAnneeAcademique.map((_: any, i: number) => this.colors[i % this.colors.length]),
          borderRadius: 6
        }]
      };
    }
  }
}
